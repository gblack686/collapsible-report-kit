import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = 'examples/catalog.json';
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const textBytes = bytes => Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'));
const fail = message => { throw new Error(message); };
const escapeHTML = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function localFile(root, relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.startsWith('/') || relative.includes(':')) fail(`Expected a repository-relative path: ${relative}`);
  const absolute = path.resolve(root, relative);
  const rel = path.relative(fs.realpathSync(root), fs.realpathSync(absolute));
  if (rel.startsWith('..') || path.isAbsolute(rel) || !fs.statSync(absolute).isFile()) fail(`Path is outside the repository or not a file: ${relative}`);
  return absolute;
}

export function readCatalog(root = ROOT) {
  return JSON.parse(fs.readFileSync(path.join(root, CATALOG), 'utf8'));
}

export function validateCatalog(catalog, root = ROOT) {
  if (catalog.schema !== 'crk-examples.v1' || !Array.isArray(catalog.examples) || !catalog.examples.length) fail('Expected a non-empty crk-examples.v1 catalog');
  if (!Array.isArray(catalog.formats) || !catalog.formats.length) fail('Catalog needs explicit format definitions');
  const formats = new Set();
  for (const format of catalog.formats) {
    if (!slug.test(format.id) || formats.has(format.id)) fail(`Invalid or duplicate format ID: ${format.id}`);
    formats.add(format.id);
    for (const key of ['title', 'description', 'representative']) if (typeof format[key] !== 'string' || !format[key].trim()) fail(`${format.id}: missing ${key}`);
    if (format.scope !== undefined && !['page', 'visual'].includes(format.scope)) fail(`${format.id}: scope must be page or visual`);
    if (format.native_style_guide_entry !== undefined && typeof format.native_style_guide_entry !== 'boolean') fail(`${format.id}: native_style_guide_entry must be boolean`);
    if (!['pending', 'approved', 'revise'].includes(format.approval)) fail(`${format.id}: unknown approval state`);
    if (format.approval === 'approved' && !format.review?.fingerprint) fail(`${format.id}: approval requires a format review receipt`);
  }
  const ids = new Set();
  const paths = new Set();
  for (const item of catalog.examples) {
    if (!slug.test(item.id) || ids.has(item.id)) fail(`Invalid or duplicate example ID: ${item.id}`);
    ids.add(item.id);
    for (const key of ['title', 'description', 'source']) if (typeof item[key] !== 'string' || !item[key].trim()) fail(`${item.id}: missing ${key}`);
    if (!['starter', 'tac', 'reference'].includes(item.kind)) fail(`${item.id}: unknown kind`);
    if (!formats.has(item.format)) fail(`${item.id}: unknown format`);
    if (typeof item.showcase !== 'boolean') fail(`${item.id}: showcase must be boolean`);
    if (item.source_url && !/^https:\/\/[^\s]+$/.test(item.source_url)) fail(`${item.id}: source_url must use HTTPS`);
    if (item.path) {
      if (!item.path.startsWith('examples/') || !item.path.endsWith('.html') || paths.has(item.path)) fail(`${item.id}: invalid or duplicate HTML path`);
      paths.add(item.path);
      const html = fs.readFileSync(localFile(root, item.path), 'utf8');
      if (!/<details\b/i.test(html) || !/<title>/i.test(html)) fail(`${item.id}: report needs a title and native details`);
    } else if (item.kind !== 'reference' || !item.source_url) fail(`${item.id}: a local page or reference URL is required`);
    if (item.preview) {
      if (!/\.(png|jpe?g|webp)$/i.test(item.preview)) fail(`${item.id}: preview must be PNG, JPEG, or WebP`);
      localFile(root, item.preview);
    }
  }
  for (const format of catalog.formats) if (!catalog.examples.some(item => item.id === format.representative && item.format === format.id)) fail(`${format.id}: representative must belong to this format`);
  // All shipped report examples must be discoverable, including new files.
  for (const file of fs.readdirSync(path.join(root, 'examples'), { recursive: true })) {
    const relative = `examples/${file.replaceAll('\\', '/')}`;
    if (relative.endsWith('.html') && relative !== 'examples/index.html' && !paths.has(relative)) fail(`Uncataloged example: ${relative}`);
  }
  return catalog;
}

export function fingerprint(item, root = ROOT) {
  const { approval, review, ...metadata } = item;
  const digest = crypto.createHash('sha256').update(JSON.stringify(metadata));
  if (item.path) digest.update(textBytes(fs.readFileSync(localFile(root, item.path))));
  if (item.preview) digest.update(fs.readFileSync(localFile(root, item.preview)));
  // Report behavior and branding changes also require a fresh review.
  for (const file of ['src/report-style.css', 'src/report-style.js']) digest.update(textBytes(fs.readFileSync(localFile(root, file))));
  return digest.digest('hex');
}

export function reviewData(catalog, root = ROOT) {
  return { schema: 'crk-review-gallery.v1', formats: catalog.formats.map(format => {
    const examples = catalog.examples.filter(item => item.format === format.id);
    const current = formatFingerprint(format, catalog, root);
    return { ...format, fingerprint: current, approval: format.review?.fingerprint === current ? format.approval : 'pending', examples };
  }) };
}

export function formatFingerprint(format, catalog, root = ROOT) {
  const { approval, review, ...metadata } = format;
  return hash(JSON.stringify(metadata) + catalog.examples.filter(item => item.format === format.id).map(item => fingerprint(item, root)).join(''));
}

function resetFormatReview(catalog, id) {
  const format = catalog.formats.find(entry => entry.id === id);
  format.approval = 'pending';
  delete format.review;
}

function save(catalog, root) {
  validateCatalog(catalog, root);
  const target = path.join(root, CATALOG);
  fs.writeFileSync(`${target}.tmp`, JSON.stringify(catalog, null, 2) + '\n');
  fs.renameSync(`${target}.tmp`, target);
}

export function cloneExample(base, id, root = ROOT) {
  const catalog = validateCatalog(readCatalog(root), root);
  const original = catalog.examples.find(item => item.id === base);
  if (!slug.test(id) || catalog.examples.some(item => item.id === id)) fail('Choose a new lowercase-hyphen ID');
  if (!original?.path || path.posix.dirname(original.path) !== 'examples') fail('Clone a root-level starter; TAC authority files stay unchanged');
  const title = id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
  const relative = `examples/${id}.html`;
  const html = fs.readFileSync(localFile(root, original.path), 'utf8')
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHTML(title)}</title>`)
    .replace(/<h1>[\s\S]*?<\/h1>/i, `<h1>${escapeHTML(title)}</h1>`);
  fs.writeFileSync(path.join(root, relative), html, { flag: 'wx' });
  try {
    catalog.examples.push({ id, title, description: `Content variation of ${original.title}; the same standard collapsible format.`, source: 'CRK', kind: 'starter', format: original.format, path: relative, showcase: false });
    resetFormatReview(catalog, original.format);
    save(catalog, root);
  } catch (error) { fs.unlinkSync(path.join(root, relative)); throw error; }
  return relative;
}

export function updateExample(id, field, value, root = ROOT) {
  const catalog = validateCatalog(readCatalog(root), root);
  const item = catalog.examples.find(entry => entry.id === id);
  if (!item) fail(`Unknown example: ${id}`);
  if (!['title', 'description', 'source', 'source_url', 'showcase'].includes(field)) fail('Editable fields: title, description, source, source_url, showcase');
  if (field === 'showcase' && !['true', 'false'].includes(value)) fail('showcase expects true or false');
  item[field] = field === 'showcase' ? value === 'true' : value;
  resetFormatReview(catalog, item.format);
  save(catalog, root);
}

export function setRepresentative(formatId, exampleId, root = ROOT) {
  const catalog = validateCatalog(readCatalog(root), root);
  const format = catalog.formats.find(entry => entry.id === formatId);
  if (!format || !catalog.examples.some(item => item.id === exampleId && item.format === formatId)) fail('Choose a content example belonging to that format');
  format.representative = exampleId;
  resetFormatReview(catalog, formatId);
  save(catalog, root);
}

export function replacePreview(id, image, root = ROOT) {
  const catalog = validateCatalog(readCatalog(root), root);
  const item = catalog.examples.find(entry => entry.id === id);
  if (!item) fail(`Unknown example: ${id}`);
  const bytes = fs.readFileSync(path.resolve(image));
  const ext = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'png'
    : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'jpg'
    : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : fail('Expected a PNG, JPEG, or WebP image');
  const relative = `examples/previews/${id}.${ext}`;
  fs.mkdirSync(path.join(root, 'examples/previews'), { recursive: true });
  fs.writeFileSync(path.join(root, relative), bytes);
  item.preview = relative;
  resetFormatReview(catalog, item.format);
  save(catalog, root);
  return relative;
}

export function applyReview(receipt, root = ROOT) {
  const catalog = validateCatalog(readCatalog(root), root);
  if (receipt.schema !== 'crk-format-review.v1' || !Array.isArray(receipt.decisions) || !receipt.decisions.length) fail('Expected a non-empty crk-format-review.v1 receipt');
  const seen = new Set();
  for (const decision of receipt.decisions) {
    const item = catalog.formats.find(entry => entry.id === decision.id);
    if (!item || seen.has(decision.id) || !['approved', 'revise'].includes(decision.decision)) fail(`Invalid review decision: ${decision.id}`);
    seen.add(decision.id);
    if (formatFingerprint(item, catalog, root) !== decision.fingerprint) fail(`Stale review for ${decision.id}; refresh the gallery and review the changed format`);
    if (decision.note !== undefined && typeof decision.note !== 'string') fail(`Invalid review note: ${decision.id}`);
    item.approval = decision.decision;
    item.review = { fingerprint: decision.fingerprint, note: decision.note || '', recorded_at: new Date().toISOString() };
  }
  save(catalog, root);
  return seen.size;
}

export function exportGallery(destination, root = ROOT) {
  const catalog = validateCatalog(readCatalog(root), root);
  const dest = path.resolve(root, destination);
  if (dest === root || root.startsWith(dest + path.sep)) fail('Export into a dedicated bundle directory');
  const relativeDest = path.relative(root, dest);
  if (!relativeDest.startsWith('..') && !path.isAbsolute(relativeDest) && !relativeDest.startsWith(`dist${path.sep}`)) fail('Export outside the repository or into dist/');
  const marker = path.join(dest, 'crk-export.json');
  if (fs.existsSync(dest) && fs.readdirSync(dest).length && !fs.existsSync(marker)) fail('Destination is not an existing CRK export; choose an empty directory');
  const previous = fs.existsSync(marker) ? JSON.parse(fs.readFileSync(marker, 'utf8')) : null;
  if (previous && previous.schema !== 'crk-style-guide-export.v1') fail('Unrecognized export receipt');
  const files = new Set(['examples/index.html', 'examples/gallery.js', 'examples/gallery.css', 'examples/catalog.json', 'src/report-style.css', 'src/report-style.js', 'LICENSE']);
  for (const item of catalog.examples) for (const file of [item.path, item.preview]) if (file) files.add(file);
  const obsolete = [];
  for (const old of previous?.files || []) {
    if (files.has(old.path)) continue;
    const target = localFile(dest, old.path);
    if (hash(fs.readFileSync(target)) !== old.sha256) fail(`Obsolete exported file was edited: ${old.path}. Preserve it before re-exporting.`);
    obsolete.push(target);
  }
  const exportedBytes = new Map();
  for (const file of files) {
    const target = path.join(dest, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const source = fs.readFileSync(localFile(root, file));
    const bytes = /\.(html|css|js|json)$/.test(file) || file === 'LICENSE' ? textBytes(source) : source;
    fs.writeFileSync(target, bytes);
    exportedBytes.set(file, bytes);
  }
  const data = reviewData(catalog, root);
  fs.writeFileSync(path.join(dest, 'examples/review-data.json'), JSON.stringify(data, null, 2) + '\n');
  // Existing guide examples and visual panels already have their own entries.
  // Keep new source references in the review catalog without duplicating them.
  const atlas = data.formats.filter(format => format.native_style_guide_entry !== false && format.scope !== 'visual').map(format => {
    const item = format.examples.find(entry => entry.id === format.representative);
    return { slug: `crk-${format.id}`, title: format.title, category: 'crk', label: 'CRK format',
      file: `crk/${item.path || `examples/index.html#format=${format.id}`}`,
      preview_file: item.preview ? `crk/${item.preview}` : null,
      review_file: `crk/examples/index.html#format=${format.id}`,
      description: format.description,
      tags: [format.examples.length > 1 ? `${format.examples.length} content examples` : 'Selected style reference', format.approval],
    };
  });
  fs.writeFileSync(path.join(dest, 'atlas-style-library.js'), `// Generated from CRK examples/catalog.json; refresh with just export-style-guide.\nwindow.CRK_STYLE_LIBRARY = ${JSON.stringify(atlas, null, 2)};\n`);
  fs.writeFileSync(path.join(dest, 'index.html'), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=examples/index.html"><title>CRK examples</title><a href="examples/index.html">Open CRK example gallery</a>\n');
  fs.writeFileSync(marker, JSON.stringify({ schema: 'crk-style-guide-export.v1', source: 'https://github.com/gblack686/collapsible-report-kit', text_line_endings: 'LF', files: [...files].map(file => ({ path: file, sha256: hash(exportedBytes.get(file)) })) }, null, 2) + '\n');
  for (const target of obsolete) fs.unlinkSync(target);
  return dest;
}

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
export function createPreviewServer(root = ROOT) {
  return http.createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    try {
      const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (requestPath === '/examples/review-data.json') {
        const body = JSON.stringify(reviewData(validateCatalog(readCatalog(root), root), root));
        res.writeHead(200, { 'Content-Type': mime['.json'], 'Cache-Control': 'no-store' });
        res.end(req.method === 'HEAD' ? undefined : body); return;
      }
      const relative = requestPath === '/' ? 'examples/index.html' : requestPath.slice(1);
      if (!/^(examples|src)\//.test(relative)) fail('Not a preview asset');
      const file = localFile(root, relative);
      const type = mime[path.extname(file).toLowerCase()];
      if (!type) fail('Unsupported preview asset');
      const bytes = fs.readFileSync(file);
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { res.writeHead(404); res.end('Preview file not found'); }
  });
}

function openBrowser(url) {
  const [command, args] = process.platform === 'win32' ? ['rundll32.exe', ['url.dll,FileProtocolHandler', url]]
    : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.on('error', error => console.error(`Browser opening failed: ${error.message}. Open ${url}`));
  child.unref();
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  const value = (index, name, fallback) => args[index] ?? process.env[name] ?? fallback;
  const catalog = validateCatalog(readCatalog(), ROOT);
  const id = value(0, 'CRK_ID');
  if (command === 'check') console.log(`Catalog passed: ${catalog.formats.length} formats, ${catalog.examples.length} example pages; all report HTML cataloged.`);
  else if (command === 'list') console.table(catalog.examples.map(({ id, title, format, kind }) => ({ id, title, format, kind })));
  else if (command === 'formats') console.table(reviewData(catalog).formats.map(({ id, title, scope, examples, approval }) => ({ id, title, scope: scope || 'page', examples: examples.length, approval })));
  else if (command === 'new') console.log(cloneExample(value(0, 'CRK_BASE'), value(1, 'CRK_ID')));
  else if (command === 'set') { updateExample(id, value(1, 'CRK_FIELD'), value(2, 'CRK_VALUE')); console.log(`Updated ${id}; review reset to pending.`); }
  else if (command === 'representative') { setRepresentative(value(0, 'CRK_FORMAT'), value(1, 'CRK_ID')); console.log('Format preview example updated; format review reset to pending.'); }
  else if (command === 'image') console.log(replacePreview(id, value(1, 'CRK_IMAGE')));
  else if (command === 'export') console.log(exportGallery(value(0, 'CRK_DEST', 'dist/style-guide/crk')));
  else if (command === 'review') console.log(`Recorded ${applyReview(JSON.parse(fs.readFileSync(value(0, 'CRK_REVIEW'), 'utf8')))} explicit decisions.`);
  else if (['serve', 'preview', 'gallery'].includes(command)) {
    const requested = id || 'basic-report';
    const format = catalog.formats.find(entry => entry.id === requested);
    const item = command === 'preview' ? catalog.examples.find(entry => entry.id === (format?.representative || requested)) : null;
    if (command === 'preview' && !item) fail(`Unknown example: ${id}`);
    const port = Number(value(command === 'preview' ? 1 : 0, 'CRK_PORT', '4173'));
    if (!Number.isInteger(port) || port < 1 || port > 65535) fail('Port must be an integer from 1 to 65535');
    const server = createPreviewServer();
    server.on('error', error => { console.error(`Preview server: ${error.message}. Choose another port with just gallery 4174.`); process.exitCode = 1; });
    server.listen(port, '127.0.0.1', () => {
      const url = item?.source_url && !item.path ? item.source_url : `http://127.0.0.1:${port}/${item?.path || 'examples/index.html'}`;
      console.log(`CRK preview: ${url}\nRefresh after edits. Ctrl+C stops the server.`);
      if (command !== 'serve') openBrowser(url);
    });
    process.on('SIGINT', () => server.close());
    process.on('SIGTERM', () => server.close());
  } else fail('Commands: check, list, formats, gallery, preview, serve, new, set, representative, image, export, review');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}

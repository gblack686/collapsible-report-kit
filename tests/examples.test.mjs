import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import crypto from 'node:crypto';
import { ROOT, readCatalog, validateCatalog, cloneExample, updateExample, setRepresentative, replacePreview, fingerprint, formatFingerprint, applyReview, reviewData, exportGallery, createPreviewServer } from '../scripts/examples.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crk-examples-test-'));
  for (const directory of ['examples', 'src']) fs.cpSync(path.join(ROOT, directory), path.join(root, directory), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'LICENSE'), path.join(root, 'LICENSE'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test('clone leaves the source unchanged, keeps relative assets, and refuses overwrite', t => {
  const root = fixture(t);
  const original = fs.readFileSync(path.join(root, 'examples/basic-report.html'), 'utf8');
  const initialFormatCount = readCatalog(root).formats.length;
  assert.equal(cloneExample('basic-report', 'quarterly-review', root), 'examples/quarterly-review.html');
  const copy = fs.readFileSync(path.join(root, 'examples/quarterly-review.html'), 'utf8');
  assert.match(copy, /<h1>Quarterly Review<\/h1>/);
  assert.match(copy, /\.\.\/src\/report-style.css/);
  assert.equal(fs.readFileSync(path.join(root, 'examples/basic-report.html'), 'utf8'), original);
  assert.equal(readCatalog(root).examples.at(-1).format, 'standard-report');
  const gallery = reviewData(readCatalog(root), root);
  assert.equal(gallery.formats.length, initialFormatCount);
  assert.equal(gallery.formats[0].examples.length, 8);
  assert.equal(gallery.formats[0].approval, 'pending');
  setRepresentative('standard-report', 'quarterly-review', root);
  assert.equal(readCatalog(root).formats[0].representative, 'quarterly-review');
  assert.throws(() => setRepresentative('standard-report', 'atlas-landing-gallery', root), /belonging to that format/);
  assert.throws(() => cloneExample('basic-report', 'quarterly-review', root), /new lowercase-hyphen/);
  assert.throws(() => cloneExample('basic-report', '../escape', root), /new lowercase-hyphen/);
  assert.throws(() => cloneExample('official-gbauto-tac-plan-template', 'new-tac', root), /root-level starter/);
});

test('preview swaps validate image bytes, clear approval, and change review fingerprint', t => {
  const root = fixture(t);
  let item = readCatalog(root).examples[0];
  const before = fingerprint(item, root);
  const catalog = readCatalog(root);
  const format = catalog.formats[0];
  applyReview({ schema: 'crk-format-review.v1', decisions: [{ id: format.id, decision: 'approved', fingerprint: formatFingerprint(format, catalog, root) }] }, root);
  const image = path.join(root, 'replacement image.png');
  fs.writeFileSync(image, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', 'base64'));
  const copied = replacePreview(item.id, image, root);
  assert.equal(copied, 'examples/previews/basic-report.png');
  item = readCatalog(root).examples[0];
  assert.equal(readCatalog(root).formats[0].approval, 'pending');
  assert.equal(readCatalog(root).formats[0].review, undefined);
  assert.notEqual(fingerprint(item, root), before);
  const bad = path.join(root, 'not-a-preview.png');
  fs.writeFileSync(bad, 'not an image');
  assert.throws(() => replacePreview(item.id, bad, root), /Expected a PNG/);
});

test('review import binds exact content, rejects stale mixed receipts without partial save', t => {
  const root = fixture(t);
  const catalog = readCatalog(root);
  const [a, b] = catalog.formats;
  const beforeEOL = formatFingerprint(a, catalog, root);
  for (const file of [catalog.examples[0].path, 'src/report-style.css', 'src/report-style.js']) {
    const text = fs.readFileSync(path.join(root, file), 'utf8').replaceAll('\r\n', '\n');
    fs.writeFileSync(path.join(root, file), text.replaceAll('\n', '\r\n'));
  }
  assert.equal(formatFingerprint(a, catalog, root), beforeEOL);
  const receipt = { schema: 'crk-format-review.v1', decisions: [a, b].map(format => ({ id: format.id, decision: 'approved', fingerprint: formatFingerprint(format, catalog, root), note: 'Operator reviewed' })) };
  const bExample = catalog.examples.find(item => item.format === b.id);
  fs.appendFileSync(path.join(root, bExample.preview), 'changed preview');
  assert.throws(() => applyReview(receipt, root), /Stale review/);
  assert.equal(readCatalog(root).formats[0].approval, 'pending');
  receipt.decisions.pop();
  assert.equal(applyReview(receipt, root), 1);
  assert.equal(reviewData(readCatalog(root), root).formats[0].approval, 'approved');
  fs.appendFileSync(path.join(root, 'src/report-style.css'), '\n/* revised theme */');
  assert.equal(reviewData(readCatalog(root), root).formats[0].approval, 'pending');
  assert.throws(() => applyReview(receipt, root), /Stale review/);
});

test('catalog covers every report and metadata edits reset the review', t => {
  const root = fixture(t);
  updateExample('basic-report', 'title', 'Review A; $literal', root);
  assert.equal(readCatalog(root).examples[0].title, 'Review A; $literal');
  assert.throws(() => updateExample('basic-report', 'showcase', 'yes', root), /true or false/);
  fs.writeFileSync(path.join(root, 'examples/forgotten.html'), '<title>Lost</title><details></details>');
  assert.throws(() => validateCatalog(readCatalog(root), root), /Uncataloged example/);
});

test('export preserves complete examples, supports refresh, and refuses unrelated destinations', t => {
  const root = fixture(t);
  const destination = path.join(root, 'dist/guide');
  exportGallery(destination, root);
  const snapshot = JSON.parse(fs.readFileSync(path.join(destination, 'examples/review-data.json'), 'utf8'));
  assert.equal(snapshot.formats.length, readCatalog(root).formats.length);
  assert.equal(snapshot.formats[0].examples.length, 7);
  const exported = JSON.parse(fs.readFileSync(path.join(destination, 'crk-export.json'), 'utf8'));
  assert.equal(exported.text_line_endings, 'LF');
  for (const file of exported.files) {
    const bytes = fs.readFileSync(path.join(destination, file.path));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), file.sha256);
    if (/\.(html|css|js|json)$/.test(file.path)) assert.equal(bytes.includes(Buffer.from('\r\n')), false);
  }
  assert.equal(fs.existsSync(path.join(destination, 'src/report-style.js')), true);
  assert.match(fs.readFileSync(path.join(destination, 'atlas-style-library.js'), 'utf8'), /window.CRK_STYLE_LIBRARY/);
  const native = JSON.parse(fs.readFileSync(path.join(destination, 'atlas-style-library.js'), 'utf8').match(/window.CRK_STYLE_LIBRARY = ([\s\S]*);/)[1]);
  assert.equal(native.some(item => item.slug === 'crk-standard-report'), true);
  assert.equal(native.some(item => item.slug === 'crk-visual-chart-pack'), false);
  assert.equal(native.some(item => item.slug === 'crk-landing-page'), false);
  cloneExample('basic-report', 'variant-b', root);
  exportGallery(destination, root);
  assert.equal(fs.existsSync(path.join(destination, 'examples/variant-b.html')), true);
  const catalog = readCatalog(root);
  catalog.examples = catalog.examples.filter(item => item.id !== 'variant-b');
  fs.writeFileSync(path.join(root, 'examples/catalog.json'), JSON.stringify(catalog));
  fs.unlinkSync(path.join(root, 'examples/variant-b.html'));
  exportGallery(destination, root);
  assert.equal(fs.existsSync(path.join(destination, 'examples/variant-b.html')), false);
  assert.throws(() => exportGallery(root, root), /dedicated bundle/);
  const unrelated = path.join(root, 'dist/unrelated');
  fs.mkdirSync(unrelated); fs.writeFileSync(path.join(unrelated, 'keep.txt'), 'keep');
  assert.throws(() => exportGallery(unrelated, root), /not an existing CRK export/);
  assert.equal(fs.readFileSync(path.join(unrelated, 'keep.txt'), 'utf8'), 'keep');
});

test('HTTP preview serves live review data and modules, rejects writes and out-of-scope files', async t => {
  const root = fixture(t);
  const server = createPreviewServer(root);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const data = await (await fetch(`${origin}/examples/review-data.json`)).json();
  assert.equal(data.schema, 'crk-review-gallery.v1');
  assert.equal(data.formats.length, readCatalog(root).formats.length);
  assert.equal(data.formats[0].examples.length, 7);
  const css = await fetch(`${origin}/src/report-style.css`);
  assert.match(css.headers.get('content-type'), /text\/css/);
  assert.equal(css.headers.get('cache-control'), 'no-store');
  assert.equal((await fetch(`${origin}/examples/catalog.json`, { method: 'POST', body: '{}' })).status, 405);
  assert.equal((await fetch(`${origin}/LICENSE`)).status, 404);
  assert.equal((await fetch(`${origin}/examples/%2e%2e%2fLICENSE`)).status, 404);
  assert.equal((await fetch(`${origin}/examples/index.html`, { method: 'HEAD' })).status, 200);
  assert.equal((await fetch(`${origin}/examples/missing.html`)).status, 404);
});

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT, localFile, readCatalog, validateCatalog } from './examples.mjs';

const inventory = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/style-guide-inventory.json'), 'utf8'));
const catalog = validateCatalog(readCatalog());
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
check(inventory.schema === 'crk-style-guide-sweep.v1', 'Unknown inventory schema');
const formats = new Set(catalog.formats.map(item => item.id));
const sourcePaths = new Set(inventory.source_files.map(item => item.path));
check(sourcePaths.size === inventory.source_files.length, 'Duplicate source-file records');
for (const group of ['atlas_surfaces', 'template_contracts', 'canonical_pages', 'visual_formats', 'canonical_svgs', 'svg_catalog', 'components']) {
  const rows = inventory[group];
  check(Array.isArray(rows) && rows.length > 0, `Missing source group: ${group}`);
  const ids = new Set();
  for (const row of rows || []) {
    check(!ids.has(row.id), `${group}: duplicate ${row.id}`); ids.add(row.id);
    check(Boolean(row.classification && row.reuse), `${row.id}: missing classification/reuse decision`);
    if (row.format_id) check(formats.has(row.format_id), `${row.id}: unknown CRK format ${row.format_id}`);
    if (row.source_path) check(sourcePaths.has(row.source_path), `${row.id}: source file absent from audit inputs`);
  }
}
check(catalog.formats.filter(item => item.scope === 'page').length === inventory.counts.page_formats, 'Page format count drift');
check(catalog.formats.filter(item => item.scope === 'visual').length === inventory.counts.visual_formats, 'Visual format count drift');
for (const format of catalog.formats) check(inventory.format_coverage.some(row => row.id === format.id), `${format.id}: absent from format coverage`);

const sourceRoot = process.argv[2] || process.env.CRK_STYLE_GUIDE_ROOT;
if (sourceRoot) {
  for (const file of inventory.source_files) {
    try {
      const bytes = fs.readFileSync(localFile(sourceRoot, file.path), 'utf8').replaceAll('\r\n', '\n');
      const digest = crypto.createHash('sha256').update(bytes).digest('hex');
      check(digest === file.sha256_lf, `Source changed: ${file.path}`);
    } catch { failures.push(`Source missing or outside supplied root: ${file.path}`); }
  }
  const groups = [
    ['artifacts/expert-atlas-netlify/style-guide/library', 'atlas_surfaces', false, '.html'],
    ['resources/skills/get-gbauto-theme/examples', 'canonical_pages', false, '.html'],
    ['resources/skills/get-gbauto-theme/examples/svg', 'canonical_svgs', false, '.svg'],
    ['second-brain/intelligence/reports/experiments/2026-06-10-svg-template-approval-catalog/svgs', 'svg_catalog', true, '.svg'],
  ];
  for (const [directory, group, recursive, extension] of groups) {
    try {
      const actual = fs.readdirSync(path.join(sourceRoot, directory), { recursive }).filter(file => file.endsWith(extension)).map(file => `${directory}/${file.replaceAll('\\', '/')}`);
      const expected = new Set(inventory[group].map(row => row.source_path));
      for (const file of actual) check(expected.has(file), `Uninventoried source: ${file}`);
      check(actual.length === expected.size, `${group}: source membership drift`);
    } catch { failures.push(`Cannot inspect source group: ${directory}`); }
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Style-guide sweep passed: ${inventory.counts.page_formats} page formats, ${inventory.counts.visual_formats} visual formats; ${inventory.atlas_surfaces.length} Atlas surfaces, ${inventory.template_contracts.length} template contracts, ${inventory.canonical_svgs.length} canonical SVGs, ${inventory.svg_catalog.length} catalog SVGs, ${inventory.components.length} component records.${sourceRoot ? ` ${inventory.source_files.length} source hashes and file membership checked.` : ''}`);

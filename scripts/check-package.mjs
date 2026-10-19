import fs from 'node:fs';
import path from 'node:path';

const required = [
  'src/report-style.css',
  'src/report-style.js',
  'justfile',
  'scripts/examples.mjs',
  'examples/index.html',
  'examples/gallery.js',
  'examples/gallery.css',
  'examples/catalog.json',
  'docs/example-workflow.md',
  'docs/style-guide-coverage.md',
  'docs/style-guide-inventory.json',
  'scripts/style-guide-audit.mjs',
  'examples/basic-report.html',
  'examples/custom-brand.html',
  'examples/bundle-report.html',
  'docs/bundle-pattern.md',
  'docs/report-sections.md',
  'docs/planning-separation.md',
  'docs/tac-plan-style-conformance.md',
  'examples/tac-plan-html/manifest.json',
  'examples/tac-plan-html/official-gbauto-tac-plan-template.html',
  'examples/tac-plan-html/tac-exemplar-library.html',
  'skills/collapsible-report-kit/SKILL.md',
  'README.md',
  'LICENSE'
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}
const css = fs.readFileSync('src/report-style.css', 'utf8');
for (const token of ['--crk-accent-warm', '.crk-section', '.crk-bundle-grid', '.crk-flow-steps', '@media print', 'prefers-reduced-motion']) {
  if (!css.includes(token)) throw new Error(`CSS missing ${token}`);
}
for (const htmlFile of ['examples/basic-report.html', 'examples/custom-brand.html', 'examples/bundle-report.html']) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  for (const marker of ['class="crk-document"', 'data-crk-nav', 'crk-section']) {
    if (!html.includes(marker)) throw new Error(`${htmlFile} missing ${marker}`);
  }
}

const manifest = JSON.parse(fs.readFileSync('examples/tac-plan-html/manifest.json', 'utf8'));
if (!manifest.examples || manifest.examples.length < 3) {
  throw new Error('TAC plan manifest needs multiple examples');
}
for (const example of manifest.examples) {
  const html = fs.readFileSync(example.html_file, 'utf8');
  for (const token of ['#F3F1E7', '#D97757', '#191919', '<details']) {
    if (!html.includes(token)) throw new Error(`${example.html_file} missing TAC style marker ${token}`);
  }
}

console.log('package check passed');

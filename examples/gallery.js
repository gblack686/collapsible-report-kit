// Card anatomy and preview flow adapted from Expert Atlas renderStyleLibrary /
// openStyleExample. Formats are distinct from the content examples inside them.
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const q = id => document.getElementById(id);
const asset = file => new URL(`../${file}`, import.meta.url).href;
const storageKey = 'crk-format-review.v1';
let formats = [];
let decisions = {};
let current = null;
let example = null;
const labels = { pending: 'Pending review', approved: 'Approved', revise: 'Changes requested' };
try { decisions = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { /* Export works without local storage. */ }
if (!decisions || Array.isArray(decisions) || typeof decisions !== 'object') decisions = {};
const decisionFor = format => decisions[format.id]?.fingerprint === format.fingerprint && ['approved', 'revise'].includes(decisions[format.id].decision) ? decisions[format.id] : null;
const statusFor = format => decisionFor(format)?.decision || format.approval;
const sourceFor = item => item.path ? asset(item.path) : item.source_url;
const representative = format => format.examples.find(item => item.id === format.representative);

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(decisions)); } catch { q('gallery-summary').textContent = 'Browser storage unavailable. Export your decisions before closing this page.'; }
}

function render() {
  const search = q('example-search').value.trim().toLowerCase();
  const selected = q('example-format').value;
  const status = q('example-status').value;
  const visible = formats.filter(format => (!selected || format.id === selected) && (!status || statusFor(format) === status) &&
    (!search || [format.title, format.description, ...format.examples.flatMap(item => [item.title, item.description, item.source])].join(' ').toLowerCase().includes(search)));
  q('example-grid').innerHTML = visible.map(format => {
    const item = representative(format);
    const state = statusFor(format);
    const preview = item.preview
      ? `<img src="${escapeHTML(asset(item.preview))}" alt="${escapeHTML(format.title)} preview" loading="lazy">`
      : `<iframe src="${escapeHTML(sourceFor(item))}" title="${escapeHTML(item.title)} live preview" loading="lazy" sandbox="allow-scripts allow-same-origin" tabindex="-1" aria-hidden="true"></iframe>`;
    return `<article class="style-library-card" data-format-id="${format.id}">
      <button class="style-library-preview" type="button" data-inspect="${format.id}" aria-label="Preview ${escapeHTML(format.title)}">${preview}<span class="preview-label">${item.kind === 'reference' ? 'Selected style reference' : 'Working report format'}</span></button>
      <div class="style-library-card-body"><p class="crk-eyebrow">${item.kind === 'reference' ? 'Gallery format' : 'Report format'}</p><h3>${escapeHTML(format.title)}</h3><p>${escapeHTML(format.description)}</p>
      <p class="format-example-count">${format.examples.length > 1 ? `${format.examples.length} content examples · one format` : 'One selected Atlas reference'}</p>
      <p class="review-state" data-state="${state}">${labels[state]}${decisionFor(format) ? ' · browser decision' : ''}</p>
      <div class="style-library-card-actions"><button type="button" data-inspect="${format.id}">${format.examples.length > 1 ? 'Browse examples & review' : 'Preview & review'}</button><a href="${escapeHTML(sourceFor(item))}" target="_blank" rel="noreferrer">Open page ↗</a></div></div></article>`;
  }).join('');
  q('example-total').textContent = `${formats.length} unique formats`;
  q('variant-count').textContent = `${formats.reduce((sum, format) => sum + format.examples.length, 0)} example pages`;
  const count = formats.filter(format => decisionFor(format)).length;
  q('review-count').textContent = `${count} format decision${count === 1 ? '' : 's'}`;
  q('gallery-summary').textContent = `${visible.length} of ${formats.length} formats · ${formats.filter(format => statusFor(format) === 'pending').length} pending review`;
  q('gallery-empty').hidden = visible.length !== 0;
}

function showExample(id) {
  example = current.examples.find(item => item.id === id) || representative(current);
  q('example-variant').value = example.id;
  q('selected-example-description').textContent = example.description;
  q('inspector-source').href = sourceFor(example);
  q('inspector-preview').innerHTML = example.path
    ? `<iframe src="${escapeHTML(sourceFor(example))}" title="${escapeHTML(example.title)} content example" sandbox="allow-scripts allow-same-origin"></iframe>`
    : `<img src="${escapeHTML(asset(example.preview))}" alt="${escapeHTML(example.title)} source screenshot"><p>Selected style reference. Open the source page for the interactive version.</p>`;
  history.replaceState(null, '', `#format=${current.id}&example=${example.id}`);
}

function inspect(id, exampleId) {
  current = formats.find(format => format.id === id);
  if (!current) return;
  q('inspector-title').textContent = current.title;
  q('inspector-description').textContent = current.description;
  q('example-variant').innerHTML = current.examples.map(item => `<option value="${item.id}">${escapeHTML(item.title)}${item.kind === 'tac' ? ' · TAC reference' : ''}</option>`).join('');
  q('variant-selector').hidden = current.examples.length === 1;
  q('review-note').value = decisionFor(current)?.note || current.review?.note || '';
  q('inspector-status').textContent = labels[statusFor(current)];
  showExample(exampleId || current.representative);
  if (!q('example-inspector').open) q('example-inspector').showModal();
}

function decide(decision) {
  if (!current) return;
  decisions[current.id] = { id: current.id, decision, note: q('review-note').value, fingerprint: current.fingerprint };
  save();
  q('inspector-status').textContent = `${labels[decision]} format in this browser. Export to record in CRK.`;
  render();
}

q('example-grid').addEventListener('click', event => { const button = event.target.closest('[data-inspect]'); if (button) inspect(button.dataset.inspect); });
for (const id of ['example-search', 'example-format', 'example-status']) q(id).addEventListener(id === 'example-search' ? 'input' : 'change', render);
q('example-variant').addEventListener('change', event => showExample(event.target.value));
q('approve-example').addEventListener('click', () => decide('approved'));
q('revise-example').addEventListener('click', () => decide('revise'));
q('review-note').addEventListener('input', () => { const decision = current && decisionFor(current); if (decision) { decision.note = q('review-note').value; save(); } });
q('clear-decision').addEventListener('click', () => { if (!current) return; delete decisions[current.id]; save(); render(); q('inspector-status').textContent = labels[current.approval]; });
q('inspector-close').addEventListener('click', () => q('example-inspector').close());
q('example-inspector').addEventListener('close', () => { q('inspector-preview').replaceChildren(); history.replaceState(null, '', location.pathname + location.search); });
q('export-review').addEventListener('click', () => {
  const selected = formats.flatMap(format => decisionFor(format) ? [decisionFor(format)] : []);
  if (!selected.length) { q('gallery-summary').textContent = 'Review at least one format before exporting decisions.'; return; }
  const blob = new Blob([JSON.stringify({ schema: 'crk-format-review.v1', exported_at: new Date().toISOString(), decisions: selected }, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'crk-format-review.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

try {
  const response = await fetch(new URL('review-data.json', import.meta.url), { cache: 'no-store' });
  if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
  const data = await response.json();
  if (data.schema !== 'crk-review-gallery.v1') throw new Error('Unknown gallery data schema');
  formats = data.formats;
  q('example-format').innerHTML = '<option value="">All formats</option>' + formats.map(format => `<option value="${format.id}">${escapeHTML(format.title)}</option>`).join('');
  render();
  const route = new URLSearchParams(location.hash.slice(1));
  const id = route.get('format');
  if (id) inspect(id, route.get('example'));
} catch (error) {
  q('gallery-summary').textContent = `${error.message}. Run just gallery, or serve the complete export over HTTP.`;
}

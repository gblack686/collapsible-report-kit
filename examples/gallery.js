// Card anatomy and preview flow adapted from Expert Atlas renderStyleLibrary /
// openStyleExample. See docs/example-workflow.md for provenance and integration.
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const q = id => document.getElementById(id);
const asset = file => new URL(`../${file}`, import.meta.url).href;
const storageKey = 'crk-example-review.v1';
let records = [];
let decisions = {};
let current = null;
const labels = { pending: 'Pending review', approved: 'Approved', revise: 'Changes requested' };
try { decisions = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { /* Export remains available without local storage. */ }
if (!decisions || Array.isArray(decisions) || typeof decisions !== 'object') decisions = {};
const decisionFor = item => decisions[item.id]?.fingerprint === item.fingerprint ? decisions[item.id] : null;
const statusFor = item => decisionFor(item)?.decision || item.approval;
const sourceFor = item => item.path ? asset(item.path) : item.source_url;

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(decisions)); } catch { q('gallery-summary').textContent = 'Browser storage unavailable. Export your decisions before closing this page.'; }
}

function render() {
  const search = q('example-search').value.trim().toLowerCase();
  const kind = q('example-kind').value;
  const status = q('example-status').value;
  const visible = records.filter(item => (!kind || item.kind === kind) && (!status || statusFor(item) === status) &&
    (!search || [item.id, item.title, item.description, item.source].join(' ').toLowerCase().includes(search)));
  q('example-grid').innerHTML = visible.map(item => {
    const state = statusFor(item);
    const preview = item.preview
      ? `<img src="${escapeHTML(asset(item.preview))}" alt="${escapeHTML(item.title)} preview" loading="lazy">`
      : `<iframe src="${escapeHTML(sourceFor(item))}" title="${escapeHTML(item.title)} live preview" loading="lazy" sandbox="allow-scripts allow-same-origin" tabindex="-1" aria-hidden="true"></iframe>`;
    return `<article class="style-library-card" data-example-id="${item.id}">
      <button class="style-library-preview" type="button" data-inspect="${item.id}" aria-label="Preview ${escapeHTML(item.title)}">${preview}<span class="preview-label">${item.kind === 'reference' ? 'Selected style reference' : 'Open preview'}</span></button>
      <div class="style-library-card-body"><p class="crk-eyebrow">${escapeHTML(item.source)} · ${item.kind === 'tac' ? 'Visual authority' : escapeHTML(item.kind)}</p><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p>
      <p class="review-state" data-state="${state}">${labels[state]}${decisionFor(item) ? ' · browser decision' : ''}</p>
      <div class="style-library-card-actions"><button type="button" data-inspect="${item.id}">Preview & review</button><a href="${escapeHTML(sourceFor(item))}" target="_blank" rel="noreferrer">Open page ↗</a></div></div></article>`;
  }).join('');
  q('example-total').textContent = `${records.length} examples`;
  const count = records.filter(item => decisionFor(item)).length;
  q('review-count').textContent = `${count} browser decision${count === 1 ? '' : 's'}`;
  q('gallery-summary').textContent = `${visible.length} of ${records.length} examples · ${records.filter(item => statusFor(item) === 'pending').length} pending review`;
  q('gallery-empty').hidden = visible.length !== 0;
}

function inspect(id, route = true) {
  current = records.find(item => item.id === id);
  if (!current) return;
  q('inspector-title').textContent = current.title;
  q('inspector-description').textContent = current.description;
  q('inspector-source').href = sourceFor(current);
  q('inspector-preview').innerHTML = current.path
    ? `<iframe src="${escapeHTML(sourceFor(current))}" title="${escapeHTML(current.title)} full preview" sandbox="allow-scripts allow-same-origin"></iframe>`
    : `<img src="${escapeHTML(asset(current.preview))}" alt="${escapeHTML(current.title)} source screenshot"><p>Selected external style reference. Open the source page for the interactive version.</p>`;
  q('review-note').value = decisionFor(current)?.note || current.review?.note || '';
  q('inspector-status').textContent = labels[statusFor(current)];
  if (!q('example-inspector').open) q('example-inspector').showModal();
  if (route) history.replaceState(null, '', `#example=${encodeURIComponent(id)}`);
}

function decide(decision) {
  if (!current) return;
  decisions[current.id] = { id: current.id, decision, note: q('review-note').value, fingerprint: current.fingerprint };
  save();
  q('inspector-status').textContent = `${labels[decision]} in this browser. Export to record in CRK.`;
  render();
}

q('example-grid').addEventListener('click', event => { const button = event.target.closest('[data-inspect]'); if (button) inspect(button.dataset.inspect); });
for (const id of ['example-search', 'example-kind', 'example-status']) q(id).addEventListener(id === 'example-search' ? 'input' : 'change', render);
q('approve-example').addEventListener('click', () => decide('approved'));
q('revise-example').addEventListener('click', () => decide('revise'));
q('clear-decision').addEventListener('click', () => { if (!current) return; delete decisions[current.id]; save(); render(); q('inspector-status').textContent = labels[current.approval]; });
q('inspector-close').addEventListener('click', () => q('example-inspector').close());
q('example-inspector').addEventListener('close', () => {
  q('inspector-preview').replaceChildren();
  history.replaceState(null, '', location.pathname + location.search);
});
q('export-review').addEventListener('click', () => {
  const selected = records.flatMap(item => decisionFor(item) ? [decisionFor(item)] : []);
  if (!selected.length) { q('gallery-summary').textContent = 'Review at least one example before exporting decisions.'; return; }
  const blob = new Blob([JSON.stringify({ schema: 'crk-example-review.v1', exported_at: new Date().toISOString(), decisions: selected }, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'crk-example-review.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

try {
  const response = await fetch(new URL('review-data.json', import.meta.url), { cache: 'no-store' });
  if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
  const data = await response.json();
  if (data.schema !== 'crk-review-gallery.v1') throw new Error('Unknown gallery data schema');
  records = data.examples;
  render();
  const id = new URLSearchParams(location.hash.slice(1)).get('example');
  if (id) inspect(id, false);
} catch (error) {
  q('gallery-summary').textContent = `${error.message}. Run just gallery, or serve the complete export over HTTP.`;
}

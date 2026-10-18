# Collapsible Report Kit

A lightweight, logo-free CSS and JavaScript kit for polished collapsible HTML reports: sticky top bar, report hero, taxonomy/status pills, side navigation, `<details>` sections, metric cards, print styles, and reduced-motion support.

It packages the reusable look and feel of a high-signal internal report format without shipping company logos, SVG diagrams, private data, build tooling, or external service dependencies. For TAC-style output, the full HTML examples in `examples/tac-plan-html/` are the visual authority.

## What is included

- `src/report-style.css` — design tokens, layout, typography, pills, cards, collapsible sections, print/mobile rules.
- `src/report-style.js` — optional progressive enhancement for section nav, open/close all, active nav state.
- `examples/basic-report.html` — copy-paste starter report.
- `examples/custom-brand.html` — shows how another company can override colors, brand text, and source label.
- `examples/bundle-report.html` — shows bundle contents, approval status, reuse/provenance, and implemented-report anatomy.
- `docs/report-sections.md` — default sections for implemented reports.
- `docs/planning-separation.md` — how to keep planning libraries separate from the report surface.
- `examples/tac-plan-html/` — full HTML TAC plan examples from recent commits; these are the style conformance authority for TAC-like outputs.
- `docs/tac-plan-style-conformance.md` — palette, typography, interaction, and conformance rules extracted from those examples.
- `skills/collapsible-report-kit/references/modular-design-system.md` - optional Modular Design System (MDS) guidance adapted to CRK's report tokens, native HTML, and TAC style contract.

## Quick start

```html
<link rel="stylesheet" href="src/report-style.css" />
<script type="module" src="src/report-style.js"></script>
```

Use normal HTML `<details class="crk-section">` blocks:

```html
<details class="crk-section" open>
  <summary>
    <span class="crk-section-index">01</span>
    <span class="crk-section-title">Executive summary</span>
    <span class="crk-section-count">summary - 120 words</span>
  </summary>
  <div class="crk-section-body">
    <p>Your report content goes here.</p>
  </div>
</details>
```

## Brand overrides

Set CSS variables on `:root` or a wrapper class. No logo is required.

```css
:root {
  --crk-accent: #3D6EA8;
  --crk-accent-warm: #D97757;
  --crk-ink: #191919;
  --crk-bg: #F3F1E7;
  --crk-panel: #E6E4D9;
  --crk-line: #D6D4C8;
  --crk-font-sans: Inter, system-ui, sans-serif;
  --crk-font-serif: Newsreader, Georgia, serif;
}
```

## Minimal document structure

```html
<body class="crk-document">
  <div class="crk-topbar">
    <div class="crk-topbar-inner">
      <div class="crk-brand-lockup"><span class="crk-brand-mark">AC</span><span>Acme Reports</span></div>
      <div class="crk-source-name">Quarterly Operations Review</div>
    </div>
  </div>

  <header class="crk-hero">
    <div>
      <p class="crk-eyebrow">Report Brief</p>
      <h1>Quarterly Operations Review</h1>
      <p class="crk-subtitle">A concise, collapsible report surface for leadership review.</p>
      <div class="crk-pills">
        <span class="crk-pill crk-pill-status"><span>Status</span><strong>Ready</strong></span>
      </div>
    </div>
  </header>

  <main class="crk-layout">
    <aside class="crk-section-menu" data-crk-nav></aside>
    <div class="crk-sections">
      <!-- details.crk-section blocks -->
    </div>
  </main>
</body>
```

## Bundle pattern

Sometimes the deliverable is a bundle rather than a single report. Use `examples/bundle-report.html` and `docs/bundle-pattern.md` when you need to package:

- the approved plan or scope brief,
- the implemented collapsible report,
- optional PDF export,
- sanitized screenshots/test receipts/source links, and
- an optional `manifest.json` index.

The common lifecycle is: scope request → scope approval → implementation → implemented report. That lifecycle is optional integration guidance, not a required planning framework. The report should make approval state explicit, include reuse/provenance when relevant, and separate claims from evidence.

## Hermes skill

This repo also includes `skills/collapsible-report-kit/SKILL.md`, a portable skill-style runbook for agents that need to create reports or bundles with this kit.

## Modular Design System compatibility

[Modular Design System (MDS) on Aura](https://www.aura.build/skills/8d9fe99f-a605-443f-9c32-98a84ed27f0f/modular-design-system-mds) fits CRK's token-based branding and reusable report structure. The [CRK adaptation](skills/collapsible-report-kit/references/modular-design-system.md) explains how to use its configuration and accessibility guidance while preserving the report shell.

MDS is optional authoring guidance, not a runtime dependency or an automatic theme switcher. CRK keeps vanilla HTML/CSS/JavaScript, native `<details>`, and its existing visual defaults. TAC-style reports still follow `examples/tac-plan-html/`; MDS's general style bans and application presets do not override those examples. The adaptation includes pinned upstream provenance and the upstream MIT license.

## Notes

- Works without JavaScript: native `<details>` still open and close.
- JavaScript only builds the side nav and open/close buttons.
- Print mode hides navigation and preserves readable content.
- The kit is intentionally logo-free; use text or your own image asset in `.crk-brand-lockup`.

## License

MIT

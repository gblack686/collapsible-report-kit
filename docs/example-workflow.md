# Swap examples, iterate, and review

Use one editable catalog, `examples/catalog.json`, for the CRK gallery and the
collection exported into the existing GBAuto Style Guide. Report HTML remains
the source for each example's content. Preview images are local files, not a
second copy of the report.

## Open the gallery

Prerequisites: Node.js 20.11+ and [just](https://just.systems/). No npm install,
Python, API credentials, or runtime backend is needed.

```sh
just examples
just check
just gallery
```

The gallery opens at `http://127.0.0.1:4173/examples/index.html`. It includes all
seven shipped report examples and two selected Atlas gallery references. Search
by title or source; filter Starters, TAC visual authority, or Gallery references.
Each card has a preview, source page, and explicit review state. New examples
automatically appear when their catalog entries are added.

Keep the terminal running. Edit, save, refresh the browser. Stop with Ctrl+C.
If port 4173 is busy, use `just gallery 4174`. For headless use,
`just serve 4173` starts the same loopback-only HTTP server without opening a
window. HTTP lets the existing JavaScript modules and navigation work correctly;
opening individual source files with `file://` can block those modules.

Without just, use `npm run gallery`, `npm run examples`, `npm run check`, or
`node scripts/examples.mjs COMMAND ARGUMENTS`.

## Example 1: change report content

Create a variation alongside the original:

```sh
just example-new basic-report quarterly-review
just example-set quarterly-review description "Quarterly results, findings, and next steps."
just preview quarterly-review
```

Edit `examples/quarterly-review.html`: replace the report copy, metric values,
section labels, summary metadata, and hero pills. The clone updates the document
title and H1; the other sample text deliberately remains for you to edit. For
brand variants, override CSS variables in the example rather than changing
`src/report-style.css` for every report.

Cloning keeps root-level relative CSS/JS links intact, adds the catalog entry,
clears approval, and leaves the original unchanged. IDs use lowercase words
separated by hyphens. Existing IDs and files cannot be overwritten. Clone
`basic-report`, `custom-brand`, `bundle-report`, or another root-level variation;
the TAC authority files are preserved as comparison references.

After editing:

```sh
just check
```

Refresh the preview. Check desktop and a narrow mobile viewport, native section
disclosure, navigation, and print. Automated catalog checks verify file coverage
and paths; they do not replace visual review.

## Example 2: replace a card's screenshot

Capture the updated page, then import your local PNG, JPEG, or WebP:

```sh
just preview-image quarterly-review "C:/Users/you/Pictures/quarterly-review.png"
just check
```

The command copies the image to `examples/previews/quarterly-review.png`, updates
the catalog pointer, and clears the earlier review. It checks the image signature,
so renaming a text file to `.png` is rejected. Refresh the gallery to see the new
image. The underlying HTML remains independent of the screenshot. Recapture the
preview after a visual change; otherwise a card can show an older screenshot.

For a quick title or selection change:

```sh
just example-set quarterly-review title "Quarterly review / version B"
just example-set quarterly-review showcase true
```

Titles, descriptions, source names, source URLs, and showcase flags can be changed
with `example-set`. `title` changes the catalog card; edit the HTML title/H1
separately when the page should match. `showcase` is selection metadata for gallery
consumers; it does not imply approval or turn on a 3D renderer.

## Example 3: compare two alternatives

```sh
just example-new basic-report quarterly-review-b
just example-set quarterly-review-b description "Alternative metric density for comparison with quarterly-review."
just gallery
```

Search `quarterly`. Open both full pages in separate tabs, or preview them one at
a time in the gallery. Review the two stable IDs separately. To retire a variation,
remove its catalog record and HTML together, and remove an unused preview if
appropriate. `just check` catches uncataloged report HTML and missing paths.
Keep shared CSS changes deliberate because they affect all starter reports.

## Approve examples and record the result

1. Select **Preview & review**, inspect the actual HTML, and add a note if useful.
2. Select **Approve** or **Request changes**. These are browser-local decisions;
   the cards label them that way. **Clear decision** discards a browser override.
3. Select **Export review decisions** to download `crk-example-review.json`.
4. Import the operator's exported decisions from the CRK repository:

   ```sh
   just review-apply "C:/Users/you/Downloads/crk-example-review.json"
   just check
   ```

Only explicitly reviewed IDs are updated. Import validates the whole receipt
before saving. Each decision is bound to a SHA-256 fingerprint of the example
metadata, local HTML, preview bytes, and shared CSS/JS. Changed content makes the
decision stale; refresh and review again. The gallery shows stale approvals as
pending. This is a local review receipt, not identity authentication or a
cryptographic signature. Keep browser review state and exported receipts private
until you intend to share them.

No example ships approved. A canonical TAC style reference can still be pending
review for this collection. Approving an Atlas reference selects that visual
direction; it does not approve the unbuilt CRK gallery recipe or changes to the
live Atlas application.

## Integrate with the existing Style Guide

The gallery reuses the Expert Atlas Style Guide's `renderStyleLibrary` card
anatomy, three-column layout, live/full-page preview flow, and typography. It
uses the existing CRK report shell and tokens. Additions are local screenshots,
type/review filters, review decisions, and export. Do not maintain a second
hand-edited list in the style guide.

```sh
just export-style-guide
# Bundle: dist/style-guide/crk/

# From a separate gbautomation checkout, put the collection beside the
# guide's existing example library. Use your checkout's actual absolute path:
just export-style-guide "C:/work/gbautomation/artifacts/expert-atlas-netlify/style-guide/library/crk"
```

The export contains the gallery, catalog, all local example HTML, previews,
shared report assets, `atlas-style-library.js`, a review-data snapshot, and
`crk-export.json` with source-file hashes. It works with any static HTTP host;
serve the whole bundle, not just its `index.html`. Example full-page links remain
inside the bundle. Exporting does not publish or deploy anything.

The Atlas integration loads `style-guide/library/crk/atlas-style-library.js`
before `app.js`, spreads `window.CRK_STYLE_LIBRARY` into its existing library,
and adds a **CRK examples** category and **Review CRK examples** link. Each CRK
card's Review link opens the same exported collection at `#example=ID`. The
standalone GBAuto Style Guide links to that collection too.

After an edit or imported review, run the export again in the same directory,
validate the consumer, and refresh it. Existing CRK export directories are
recognized by `crk-export.json`. Non-empty unrelated directories are rejected.
The exporter removes only obsolete files listed in its previous receipt.
Do not edit exported copies; changes belong in CRK and are re-exported.

The two operator-selected gallery bodies stay visible as reference cards:

- [Artifact library](https://expert-atlas--gbautoxyz.netlify.app/#view=artifacts):
  editorial heading, count tiles, unified search/filter toolbar, lifecycle chips,
  preview grid, and inspector.
- [Landing showcase](https://expert-atlas--gbautoxyz.netlify.app/#view=gallery):
  isolated dark stage, floating labels, Grid/Globe, pan/orbit/zoom, and focus then
  inspect. Its optional renderer stays outside ordinary report examples.

Their screenshots are captured from the first-party Atlas pages. No live Atlas
data or API actions are copied. The earlier self-contained working gallery demo
remains a prototype; this workflow does not claim those recipes have been released.

## Files and checks

| Change | Source file | Review step |
|---|---|---|
| Report copy or metrics | `examples/ID.html` | Refresh actual HTML preview |
| Gallery card metadata | `examples/catalog.json` | Refresh both galleries after export |
| Preview image | `examples/previews/ID.ext` | Run `preview-image`, inspect the card |
| Gallery layout/review flow | `examples/gallery.css`, `examples/gallery.js` | Desktop/mobile, keyboard, export/import |
| Core report appearance | `src/report-style.css` | Compare starters and TAC visual authority |
| Consumer copy | Generated style-guide bundle | Re-export from CRK |

`just check` validates the package, catalog schema, unique IDs, source/preview
paths, native report details, and coverage of every example HTML file.
`just test` exercises the authoring, review, export, and read-only preview server
with temporary fixtures. Node has no third-party package dependencies.

Reuse provenance: first-party `artifacts/expert-atlas-netlify/app.js`
`renderStyleLibrary` / `openStyleExample`, its `styles.css` style-library rules,
and the two linked Atlas body references, captured 2026-10-18. Existing TAC
provenance stays in `examples/tac-plan-html/manifest.json`. The optional MDS
reference supports token choices; TAC files remain the visual authority.

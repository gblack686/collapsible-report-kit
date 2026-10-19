# Swap examples, iterate, and review

Use one editable catalog, `examples/catalog.json`, for the CRK gallery and the
collection exported into the existing GBAuto Style Guide. Report HTML remains
the source for each example's content. Preview images are local files, not a
second copy of the report.

## Formats versus content examples

The original collection had **three page formats**:

| Format | Examples inside it |
|---|---|
| Standard collapsible report | Seven pages with different content, branding, and TAC depth |
| Artifact library | The selected Expert Atlas artifact-library reference |
| Landing gallery | The selected Expert Atlas Grid/Globe reference |

The [style-guide sweep](style-guide-coverage.md) extends the catalog to eight
page-format families and seven embedded visual formats, using existing source
references. Use the Collection filter to choose Pages or Visuals. The standard
report card's Content example selector still browses its seven pages. A new
quarterly report adds a content example to that format; it does not add another
format. Approval applies to a format.
`catalog.formats` defines those choices; every record in `catalog.examples`
has an explicit `format` ID. Starter/TAC/reference labels describe an example's
role, not a different format.

Swap the example shown on a format's main card without adding another format:

```sh
just format-example standard-report bundle-report
# Or select your own variation after creating it:
just format-example standard-report quarterly-review
```

The selected example must already belong to that format. Its preview image and
source page become the card's default; all of the other content examples remain
available in the inspector. The command resets that format's review to pending.

## Open the gallery

Prerequisites: Node.js 20.11+ and [just](https://just.systems/). No npm install,
Python, API credentials, or runtime backend is needed.

```sh
just examples
just formats
just check
just gallery
```

The gallery opens at `http://127.0.0.1:4173/examples/index.html`. It groups
source/content examples inside their respective page or visual formats. Search
matches format names and their content examples. Each format has a preview,
source page, and explicit review state. New content examples automatically appear
in their owning format's selector when their catalog entries are added.

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

Cloning keeps root-level relative CSS/JS links intact, adds a content example to
the original's format, clears that format's review, and leaves the original
unchanged. IDs use lowercase words
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
the catalog pointer, and clears the owning format's earlier review. It checks the image signature,
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

Search `quarterly`. Open the Standard collapsible report card and select each
quarterly content example. Open their full pages in separate tabs if useful.
Review the common format after comparing them. To retire a variation,
remove its catalog record and HTML together, and remove an unused preview if
appropriate. `just check` catches uncataloged report HTML and missing paths.
Keep shared CSS changes deliberate because they affect all starter reports.

## Approve formats and record the result

1. Open a format card, inspect its actual examples, and add a note if useful.
   For Standard collapsible report, the Content example selector exposes all
   seven pages, including the TAC visual authority references.
2. Select **Approve format** or **Request changes**. These are browser-local decisions;
   the cards label them that way. **Clear decision** discards a browser override.
3. Select **Export review decisions** to download `crk-format-review.json`.
4. Import the operator's exported decisions from the CRK repository:

   ```sh
   just review-apply "C:/Users/you/Downloads/crk-format-review.json"
   just check
   ```

Only explicitly reviewed format IDs are updated. Import validates the whole receipt
before saving. Each decision is bound to a SHA-256 fingerprint of the format
metadata, all of its example metadata/HTML/previews, and shared CSS/JS. Changed
content makes the decision stale; refresh and review again. Text fingerprints
normalize LF/CRLF so moving between Windows and macOS does not invalidate an
otherwise identical review. The gallery shows stale approvals as
pending. This is a local review receipt, not identity authentication or a
cryptographic signature. Keep browser review state and exported receipts private
until you intend to share them.

No format ships approved. TAC references remain content examples of the standard
report format. A format approval selects that reusable presentation; it is not
approval of the sample report's factual claims or its original plan. Approving an Atlas reference selects that visual
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
`crk-export.json` with exported-file hashes. Text is emitted with LF line endings
for consistent hashes across machines. It works with any static HTTP host;
serve the whole bundle, not just its `index.html`. Example full-page links remain
inside the bundle. Exporting does not publish or deploy anything.

The Atlas integration loads `style-guide/library/crk/atlas-style-library.js`
before `app.js`, spreads `window.CRK_STYLE_LIBRARY` into its existing library,
and adds a **CRK formats** category and **Review CRK formats** link. Each
format card's Review link opens the same collection at `#format=ID`.
`#format=standard-report&example=basic-report` selects a particular content example. The
standalone GBAuto Style Guide links to that collection too.

The sweep marks references to existing guide pages and visual panels with
`native_style_guide_entry: false`. They remain available in the full CRK review
catalog but are not added back as duplicate cards in the guide's own library.
The shipped report and two operator-selected Atlas gallery bodies retain their
native collection entries. The guide remains the source for its other pages,
components, and visual samples.

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

To add a genuinely different format, create a new `formats` record with a stable
ID, title, description, representative example ID, and `approval: "pending"`.
Assign its examples that `format` ID and run `just check`. The representative
must belong to the format. Adding another report with different subject matter
belongs under `standard-report` instead.

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

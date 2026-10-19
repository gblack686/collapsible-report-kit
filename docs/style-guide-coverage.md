# Style-guide coverage sweep

Audited 2026-10-18. The existing GBAuto / Expert Atlas Style Guide owns the designs. CRK supplies the portable report shell, catalog, review workflow, and references to those sources. This branch does not build another style guide.

The guide keeps its existing sample library and seven visual panels. New references are available in CRK review, while `native_style_guide_entry: false` prevents adding those same sources back as duplicate cards in the guide.

## What the sweep adds

**8 page formats and 7 embedded visual formats**, with 28 source/content examples. Only the standard report is shipped as a CRK report recipe; the additional entries are clearly labeled existing-source references. Operator approval stays pending.

| Page format | Source/content examples | Availability |
|---|---:|---|
| Standard collapsible report | 7 | shipped CRK report format |
| Artifact library | 2 | existing-source reference; portable CRK recipe/renderer not claimed |
| Landing gallery | 1 | existing-source reference; portable CRK recipe/renderer not claimed |
| Landing / campaign page | 6 | existing-source reference; portable CRK recipe/renderer not claimed |
| Interactive workspace | 2 | existing-source reference; portable CRK recipe/renderer not claimed |
| Onboarding / form page | 1 | existing-source reference; portable CRK recipe/renderer not claimed |
| Editorial profile / resume | 1 | existing-source reference; portable CRK recipe/renderer not claimed |
| Carousel story | 1 | existing-source reference; portable CRK recipe/renderer not claimed |

The seven report examples remain one standard collapsible format. Different landing subjects, graph/workspace examples, and gallery densities are grouped as variations rather than presented as new formats.

## Embedded visual formats

| Visual | Live source maturity | Local snapshot | CRK status |
|---|---|---|---|
| Chart Pack | CANONICAL | Canonical | Reference only |
| Interactive Kanban | CANONICAL | Canonical | Reference only |
| Gantt Timeline | PROVEN PROTOTYPE | Proven prototype | Reference only |
| Manim / Motion | CANONICAL LANE | Canonical lane | Reference only |
| Mermaid DAG | CANONICAL | Canonical | Reference only |
| Sankey / 3D Flow | CANONICAL LANE | Canonical lane | Reference only |
| Bokeh Crossfilter | PRIVATE PATTERN | Private pattern | Reference only |

Use the gallery Collection filter to switch between page and visual formats. A chart, board, timeline, or DAG can be embedded in a report without creating a new report format. The live source and local snapshot differ on Gantt maturity; neither label is an operator approval of a CRK renderer.

## All 21 indexed surfaces

| Existing source | Actual role | CRK reuse / grouping |
|---|---|---|
| [Social Productivity Carousel](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/social-productivity-carousel.html) | page-format | Existing swipe-based narrative; one story format. |
| [Portfolio Draft Carousel](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/portfolio-carousel-draft-cards.html) | section | Reusable portfolio card carousel inside a page; do not count as another whole-page format. |
| [Nexus Capital Landing](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/nexus-capital-landing.html) | page-variant | Reuse the existing landing/campaign structure; subject and visual treatment are variations. |
| [Nexus Analytics Landing](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/nexus-analytics-landing.html) | page-variant | Reuse the existing landing/campaign structure; subject and visual treatment are variations. |
| [Axisform Studio Landing](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/axisform-studio-landing.html) | page-variant | Reuse the existing landing/campaign structure; subject and visual treatment are variations. |
| [Neon Oiran Campaign](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/neon-oiran-landing.html) | page-variant | Reuse the existing landing/campaign structure; subject and visual treatment are variations. |
| [Aura VR Agency](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/aura-vr-landing.html) | page-variant | Reuse the existing landing/campaign structure; subject and visual treatment are variations. |
| [Nexus Analytics](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/nexus-analytics-dashboard.html) | alias | Its main HTML body is identical to nexus-analytics-landing. The index label is not proof of a separate dashboard format. |
| [Nexora Analytics](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/nexora-analytics.html) | page-variant | Reuse the existing landing/campaign structure; subject and visual treatment are variations. The full page is a product landing page with dashboard illustrations, not a standalone analytics workspace. |
| [AI Workflow Interface](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/ai-workflow-interface.html) | page-format | Reuse the existing node workflow canvas and tool rail; reference only. |
| [Nexus Forge Workspace](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/nexus-forge-workspace.html) | page-variant | Control panels and render canvas are another workspace example, not another report subject. |
| [Wall of Love](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/testimonials-wall-of-love.html) | section | Reusable testimonial wall / social proof section. |
| [Motion Asset Sync](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/motion-asset-sync.html) | visual-element | Motion/asset sequence reference with a static and reduced-motion fallback; do not imply a Manim engine implementation. |
| [Logic of Operation](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/operation-principles-section.html) | section | Operating-principles section body for a landing page or report section. |
| [Headphone Product Grid](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/headphone-product-grid.html) | section | Product-card grid is a gallery layout variant; keep commerce actions consumer-owned. |
| [Expanding Feature Cards](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/expanding-feature-cards.html) | section | Expandable feature-card layout; retain keyboard and non-hover access. |
| [Master Strategy Infographic](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/master-strategy-infographic.html) | visual-element | Full-canvas infographic presentation reference; an embedded visual rather than another report format. |
| [Initialize Account](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/initialize-account.html) | page-format | Existing form page, despite its placement under modals in the old index. No account backend is copied. |
| [Technical Brand Geometry](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/technical-brand-geometry.html) | visual-element | Brand geometry illustration / SVG reference; consumer branding stays optional. |
| [Imaginova Image Gallery](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/imaginova-image-gallery.html) | page-variant | Image-led catalog variation within the gallery family, not a new format for each card density. |
| [Strategic Roadmap](https://expert-atlas--gbautoxyz.netlify.app/style-guide/library/strategic-roadmap.html) | visual-element | Roadmap illustration reference. Its canvas is not proof of a working scheduling or Gantt engine. |

The Nexus analytics landing/dashboard main bodies were compared directly and are identical. Their distinct index names do not establish two formats. Nexora includes dashboard illustrations within a landing page; this sweep does not relabel it as a working analytics workspace.

## Approved template contracts and house examples

| Source | Classification | Reuse |
|---|---|---|
| `artifacts/gbauto-style-guide/templates/home-chat-gallery.html` | candidate-page-format | Approved parameter contract. Keep the existing source; extract/verify a portable body before claiming a CRK recipe. Composer plus discovery is an additional candidate page format; no live Atlas template URL was found. |
| `artifacts/gbauto-style-guide/templates/gallery-5-columns-image-cards.html` | gallery-layout-variant | Approved parameter contract. Keep the existing source; extract/verify a portable body before claiming a CRK recipe. Four versus five columns are variants within the gallery family. |
| `artifacts/gbauto-style-guide/templates/gallery-4-columns-text-detail-cards.html` | gallery-layout-variant | Approved parameter contract. Keep the existing source; extract/verify a portable body before claiming a CRK recipe. Four versus five columns are variants within the gallery family. |
| `resources/skills/get-gbauto-theme/examples/resume.html` | canonical-page-example | Use as the existing house visual reference. Report variants do not create new formats. |
| `resources/skills/get-gbauto-theme/examples/landing-page.html` | canonical-page-example | Use as the existing house visual reference. Report variants do not create new formats. |
| `resources/skills/get-gbauto-theme/examples/collapsible-report-template.html` | canonical-page-example | Use as the existing house visual reference. Report variants do not create new formats. |
| `resources/skills/get-gbauto-theme/examples/collapsible-report-mall.html` | canonical-page-example | Use as the existing house visual reference. Report variants do not create new formats. |

## Components and assets

The inventory covers 41 component/foundation records, all 10 canonical SVG template files, and all 83 files in the existing SVG approval catalog, including its nested imported folder. These are source inventories and overlap; they are not 93 newly created drawings.

| Component / foundation | CRK mapping |
|---|---|
| Ambient glow | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Watermark | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Fixed nav | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Status pill | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Hero title | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Contact card | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Button | CRK: Existing report controls; broader form/button states remain consumer references |
| Highlight metric | CRK: .crk-metric / .crk-grid-* |
| Section heading | CRK: .crk-section-index / .crk-section-title |
| Skill card | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Tag chip | CRK: .crk-chip-* / token overrides |
| Experience card | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Education card | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Footer lockup | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Report topbar | CRK: .crk-topbar / .crk-brand-lockup |
| Header | CRK: .crk-hero / .crk-pills |
| Side menu | CRK: [data-crk-nav] / report-style.js |
| Collapsible section | CRK: details.crk-section |
| Ops accordion | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Status chip | CRK: .crk-chip-* |
| Metadata footer | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Hypeframe package | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Hero | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Pricing card | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Pricing icon badge | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Artifact filter | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Artifact card | Existing source component; optional consumer/profile/landing integration. No new runtime component is claimed. |
| Shell | Preserve the existing host navigation and CRK report shell. |
| Panels | CRK sections/metric cards share tokens; glass/RGB edge variants stay optional. |
| Tables | Dedicated core table styling is a gap; TAC fixtures contain richer examples. |
| Buttons and form controls | Core report actions exist; full input/validation language remains a source reference. |
| Charts | Seven visual-format samples are linked; renderer adapters remain separate. |
| Dashboard skin | Keep the existing native app navigation; CSS skin alone is not a tested dashboard page fixture. |
| Command drawer and keyboard access | Reuse the existing Atlas drawer contract; feedback endpoints stay consumer-configured. |
| Preview and inspector | CRK gallery reuses the existing guide preview flow and adds local review receipts. |
| Shimmer, RGB edge, and reduced motion | Preserve the style-guide source; keep effects optional and motion-safe. |
| GBR prompt fingerprints | Reference the existing GBR-CORE/SHELL/PANEL/PILLS/CHART/SHINE/FOOTER/BLACKLIST guidance; current operator choices take priority. |
| Typography | Inter UI, Newsreader editorial headings, and mono metadata map to the existing CRK font tokens. |
| Palette and semantic status | Cream, stone, ink, terracotta, and semantic status colors map to existing CRK tokens and TAC fixtures. |
| Layout, density, and responsiveness | Existing shell/card/spacing rules are sources for report and consumer layouts; page families keep their own interaction grammar. |
| Brand identity and logo suite | Keep the existing logo suite as consumer branding authority; CRK stays logo-free by default. |

Every SVG path and normalized source hash is recorded in [style-guide-inventory.json](style-guide-inventory.json). Keep the existing SVG catalog as its authority rather than copying the artwork into a second library. Brand/logo/motion effects remain optional consumer choices; CRK retains its logo-free core.

## Gaps retained explicitly

- An approved composer/discovery landing contract exists locally, but its public Atlas template URL returns 404. It is tracked as an additional candidate, not fabricated as a working CRK recipe.
- The analytics-dashboard index item shares its main body with a landing page. Nexora is also a product landing page. The dashboard CSS skin exists, but a dedicated portable analytics/control-plane fixture is still needed.
- The four-column text and five-column image contracts are gallery layout variants. Keep their parameter contracts; do not inflate the unique page-format count.
- All seven visual lanes now have source references and previews. CRK does not acquire ECharts, Kanban persistence, a scheduling engine, Manim, Mermaid, Three.js, or a Bokeh backend through this sweep.
- The live Gantt sample says PROVEN PROTOTYPE while the local snapshot says Historical. Bokeh remains a PRIVATE PATTERN; motion and Sankey are canonical lanes. Source maturity is separate from CRK operator approval.
- Tables, full forms/validation, command drawer, motion/brand effects, richer metadata, and visual adapters are mapped to existing sources; they are not all standalone CRK core components.

## Repeat the sweep and iterate

```sh
just style-guide-check
just style-guide-audit "C:/work/gbautomation"
just formats
just gallery
```

`style-guide-check` validates the public inventory against the CRK catalog. `style-guide-audit` is read-only: it checks the recorded source hashes and verifies membership of the indexed HTML and SVG source groups against the supplied GBAutomation checkout. It reports new, missing, or changed files instead of silently replacing curation decisions. No private backend or credentials are needed.

When the guide changes, inspect the changed source, classify it as page format, content/layout variation, section/component, visual, or source gap; update its inventory record and source hash. Add a catalog format only for a distinct page structure/main interaction or embedded visualization grammar. Keep source maturity separate from operator approval.

For an existing format, add another example and use `just format-example FORMAT EXAMPLE` to change its representative. For a new reference, add its HTTPS source URL and captured preview. Run `just check` and `just test`, refresh the gallery, and review desktop/mobile. See [example-workflow.md](example-workflow.md) for image swaps, comparison, and review receipts.

This branch is `feat/style-guide-format-sweep`. It is pushed for review and is not automatically merged or deployed.

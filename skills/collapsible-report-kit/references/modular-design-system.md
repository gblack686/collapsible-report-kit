# Modular Design System guidance for CRK

Use this reference when adapting an MDS brief to a collapsible report or choosing
a custom report theme. This is a report-specific adaptation of
[Modular Design System (MDS) on Aura](https://www.aura.build/skills/8d9fe99f-a605-443f-9c32-98a84ed27f0f/modular-design-system-mds),
not a second skill to apply to every web interface.

## Fit and boundaries

MDS's useful contribution is separating theme tokens, layout, and content, then
checking the result for accessibility and responsive behavior. CRK already does
this through `src/report-style.css`, report sections, and optional JavaScript.
Use the existing implementation rather than introducing a parallel design system.

| MDS concept | CRK adaptation |
| --- | --- |
| Theme configuration | Record the report's confirmed brand choices; override existing `--crk-*` variables. |
| Category/layout presets | Use CRK's report or bundle structure and change content by report type. |
| Modular mounting | Load CRK's stylesheet, then scoped brand overrides; keep report content separate. |
| Component behavior | Review section controls, navigation, links, tables, and any added dialogs. |
| Design critique | Check real content at mobile, tablet, and desktop widths, with keyboard and print review. |

Do not bring MDS's landing-page, commerce, or application shells into a report.
Its React provider, Tailwind mapping, package installation commands, onboarding
gate, and mandatory build process are not CRK requirements. Use the user's
existing brief and approval context; do not restart intake or add an approval gate.

For TAC-style reports, `examples/tac-plan-html/` and
`docs/tac-plan-style-conformance.md` remain the visual authority. In particular:

- Keep cream, terracotta, Inter + Newsreader, compact pills, and section indexes.
  MDS's generic bans on these treatments do not apply to CRK's chosen style.
- Keep the established spacing, font weights, surfaces, and section geometry.
  A broad MDS preset must not silently replace them.
- Keep native `<details>` and progressive enhancement, including no-JavaScript
  reading, print styles, and reduced-motion support.
- Use MDS color-mode advice only for an explicitly requested custom theme. The
  current kit does not include a dark-mode switcher.

## Report-specific configuration example

This YAML is an authoring brief compatible with MDS terminology. CRK does not
parse it or ship a provider, preset registry, or automatic category switching.
Apply selected values manually through existing CSS overrides. `custom:collapsible-report`
is a descriptive category here, not an upstream built-in preset.

```yaml
status: configured
category: custom:collapsible-report
look: editorial
mode: light
primary: "#D97757"
font_sans: Inter
font_display: Newsreader
radius: rounded
density: compact
motion: subtle
framework: html
css: vanilla
ui_library: none
animation_lib: css-only
extra_notes: "Preserve CRK's report shell, native details, section nav, print styles, and TAC visual authority."
```

Reuse confirmed values instead of asking MDS's default onboarding questions.
When a requested preset conflicts with TAC conformance, explain the conflict and
resolve that specific choice before restyling. Generic custom-brand reports may
use the brand supplied by the user; do not claim a restyled report conforms to
the TAC visual reference if it no longer does.

## Existing token mapping

Place overrides after the CRK stylesheet, using `:root` for a single-brand report
or `.crk-document` / a report-specific wrapper for scoped branding.

| MDS concept | Existing CRK token(s) | Default |
| --- | --- | --- |
| Primary brand / hover | `--crk-accent-warm`, `--crk-accent-warm-hover` | `#D97757`, `#B75F43` |
| Supporting status accent | `--crk-accent` | `#3D6EA8` |
| Background / surface / paper | `--crk-bg`, `--crk-panel`, `--crk-paper` | `#F3F1E7`, `#E6E4D9`, `#FFFFFF` |
| Text / muted text | `--crk-ink`, `--crk-muted`, `--crk-text-mute` | `#191919`, `#5C5C5C`, `#8C8A84` |
| Border | `--crk-line` | `#D6D4C8` |
| Success / warning / danger | `--crk-green`, `--crk-amber`, `--crk-red` | `#4F9D69`, `#C08A3E`, `#B94A48` |
| Sans / display families | `--crk-font-sans`, `--crk-font-serif` | Inter, Newsreader, with fallbacks |
| Base radius / container | `--crk-radius`, `--crk-max-width` | `8px`, `1360px` |

These are existing defaults, not a claim that every possible color pairing
passes contrast checks. Density, motion, shadows, and control-specific radii do
not have a complete MDS-style token API in CRK. Preserve the current CSS for those
choices; do not imply that setting MDS data attributes implements them.

## Report-specific review

- Check keyboard operation of summaries and nav controls, visible focus, and a
  logical tab order. If adding a modal, test Escape, focus containment, and focus
  return. Static reports do not need application loading or toast states.
- Check text contrast at 4.5:1 for normal text and 3:1 for large text; interactive
  boundaries and focus indicators need 3:1 where applicable. Include labels or
  other cues alongside status colors. Test actual foreground/background pairs.
- Check 390px, 768px, and 1440px viewports where available. Verify wrapping,
  readable tables, and no page-level horizontal overflow. Aim for 44px touch
  targets on actionable controls; static pills need no enlarged hit area.
- Verify one page heading, meaningful links, semantic tables, image alternatives,
  native section toggling without JavaScript, print output, and reduced motion.
- Use real report evidence and meaningful empty states. Avoid invented metrics,
  fake approvals, decorative repeated cards, and unnecessary animation.
- Run `npm run check` in the kit repository. It checks package structure and
  known style markers; browser, contrast, and accessibility checks are separate.
  Record which checks actually ran rather than claiming the whole checklist passed.

## Source and license

- Aura listing: [Modular Design System (MDS)](https://www.aura.build/skills/8d9fe99f-a605-443f-9c32-98a84ed27f0f/modular-design-system-mds).
- Author/source: [BYE_SHUVO / Modular-Design-System](https://github.com/bye-shuvo/Modular-Design-System).
- Reviewed upstream: [`SKILL.md` at `f8604d2bba4842f939ef65f527e467f8be8b1061`](https://github.com/bye-shuvo/Modular-Design-System/blob/f8604d2bba4842f939ef65f527e467f8be8b1061/SKILL.md), retrieved 2026-10-18. Aura's copy differs only by an added `keywords` frontmatter field.
- Adapted configuration, token concepts, and review guidance are MIT-licensed;
  retain the [upstream copyright and license notice](licenses/modular-design-system.txt)
  when redistributing this adaptation. The upstream skill remains at its source;
  no upstream code is executed or installed by CRK.

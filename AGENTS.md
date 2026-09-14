# AGENTS.md

## Premise

Mobile-first Serbian cheat sheets. Legible at any resolution; no tiny elements.

## Brand

- Write the name lowercase: **serbian.fyi**.
- Wordmark: full `serbian.fyi` in Source Serif 4 at every width. `serbian` uses ink; `.fyi` uses marker orange (`.brand-tld`), the masthead's only brand-orange.
- No mascot, tagline, or wordmark monogram. The `s.` glyph is favicon-only (`favicon.svg`).
- Every `<title>` includes "Serbian"; the domain satisfies this.
- Attribution: `© serbian.fyi · CC BY 4.0`, linked home (`foot.copy` in `src/i18n/en.ts`).

## Content

- Use labels. No narrative framing, eyebrows, chapter headlines, or intro paragraphs.
- Show each fact once per page.
- Put abstract patterns (`-a`, `-e`) in grids; concrete words in separate tables.
- Keep plain-language explanations inside `?` reveals. Essential information stays visible.

## Layout

- One layout per chart, fitting 320px. Desktop scales the same sheet.
- `body`: centered column, `max-width: var(--max-w)` (28rem), hairline side rules. `html`: desk background (`--paper-deep`). No sheet wrapper.
- The root `font-size` clamp on `html` is the only viewport-responsive declaration. Use rem units; preserve the user's default size on phones.
- No width media queries. Allowed queries: `hover`, `prefers-reduced-motion`, `forced-colors`.
- No per-rule clamps or `vw` outside the root clamp, except viewport-safety caps on fixed overlays (`calc(100vw - …)`).
- Put genuinely two-dimensional data in a horizontal-scroll pane inside the column.

### Card

The universal chart block (`.card`: cases, numbers, verbs). New charts adopt it instead of inventing a shell.

- Anatomy: `.card-head` (`.card-title` h3 + optional `.case-tag`, optional `.card-q`), then `.card-section`s. Cards stack in a `.card-list`.
- A card's only boundary is its opening 3px tone bar (`.card::before`); it draws no closing rule. The next bar or the footer closes it. Card lists and `.num-layout` use gap 0.
- Every section opens with a solid hairline above its `.card-section-label` (h4). Band and text sections share this one style.
- Repeated items (`.card-items` > `.card-item`) part with a dashed `--hairline` rule; the first has no top padding, the last no bottom rule. Data that needs its own grid nests inside `.card-items`.

## Typography

Tokens live in `src/styles/styles.css` `:root`.

| Token | Role |
| --- | --- |
| `--fs-label` | ALL-CAPS labels, tags, axes |
| `--fs-caption` | Translations, glosses, footer, fine print |
| `--fs-body` | Prose, popover body |
| `--fs-lead` | Example sentences, data cells |
| `--fs-title` | `h3`, panel/card titles |
| `--fs-head` | `h2`, case names |

- Every `font-size` uses a token. No bare rem sizes or em-relative inline sizes. Decorative background glyphs are exempt.
- Source Serif 4 (`--ff-display`): Serbian specimens, `h1`–`h5`, oversized brand/letter glyphs. Source Sans 3 (`--ff-body`): labels, captions, translations, glosses, prose, controls.
- Serif weights: 300 for headings and oversized glyphs; 400 for specimens, 500 for emphasis. Sans: 400; 500 for ALL-CAPS labels and emphasis.
- Tracking: `--track-label` (`.075em`) for ALL-CAPS labels; `--track-display` (`-.02em`) for headings.
- New Serbian-bearing selectors must set `font-family: var(--ff-display)`. Do not repeat the base family or weight reset on `h1`–`h5`.
- Mark inline Serbian in foreign prose with `<i>`. `srGrammarHTML()` (`src/lib/html.ts`) dual-emits these runs with `lang="sr"`; unmarked translation text never switches script.
- `<i>` wraps only Serbian, never translation emphasis. `validateSerbianMarkers()` requires a token beside an `sr` specimen to occur in that specimen and differ from its own gloss. Standalone prose tokens must be glossary lemmas. Abstract shapes (`-a`, `-ov-`, `-∅`) and bare letters (`k, g, h`) are exempt.
- Preserve Serbian Cyrillic `locl` support in both fonts. `font-language-override: "SRB"` applies only to Serbian carriers (`[lang="sr"]`, `.s`), never to `body`: translation text must keep the reader's letterforms. Test replacement fonts for Serbian italic alternates.
- Keep `font-optical-sizing: auto` on `body`. No manual `opsz` settings except `h1, h2`: `"opsz" 60`. Source Serif 4 supports 8–60.
- Line-heights: `1` for single-line labels; `var(--lh-snug)` (1.3) for titles; `var(--lh-prose)` (1.55) for prose. `h1`–`h5` retain the `1.05` reset; decorative glyphs may differ.
- Data cells containing digits use `font-feature-settings: "tnum"`.

## Colors

Flexoki palette in `styles.css` `:root`: `--fx-*` → `--tone-*` / `--facet-*`.
Chroma distinguishes axes; hue identifies values within each tier.

| Tier | Chroma | Use | Mechanism |
| --- | --- | --- | --- |
| 1 — accents | C .085–.165 | Cases; brand/marker orange | `[data-tone]` → `--tone-*` |
| 2 — facets | C .050 | Gender; future cross-chart axes | `[data-gender]` → `--facet-*` |
| 0 — ink | C 0 | Prose, structure, unmarked categories | `--ink-*` |

| Tier | Hue | Meaning |
| --- | --- | --- |
| 1 | orange | Brand, selection, focus, hover, present-verb marker |
| 1 | red | VOK |
| 1 | yellow | DAT |
| 1 | green | LOK |
| 1 | cyan | AKU |
| 1 | blue | INS |
| 1 | purple | GEN |
| 1 | magenta | Reserved for an eighth case |
| 2 | green 150° | M |
| 2 | violet 285° | N |
| 2 | amber 55° | F |
| 0 | ink-tones | NOM, prose, alphabet stripes, other categories |

- Preserve the chroma gap: facet maximum .0511, accent minimum .0849. Match lightness across tiers. `validateFacets()` measures the gap on each ground.
- Keep one meaning per hue within a tier. New cross-chart axes use tier 2 at C .050; no new tier-1 categories. Orange remains brand/marker ink.
- Pronoun, number, and aspect categories use ink. Case references may use case colors: resolve abbreviations from `CASES` by tone, as noun-count bands do with `.case-tag`.
- Alphabet categories use solid/dashed ink stripes.
- Number uses `band.sg` / `band.pl` headings, never color or an ending-unit field.

### Case tones

- Set `data-tone="nom|gen|dat|aku|vok|ins|lok"`; descendants use `color: var(--tone, var(--accent))`.
- NOM uses ink. Unknown tones fall to `--ink-soft` via `:where([data-tone])`; absent tones use brand-orange `--accent`.
- Present-verb tones `im|am|em|jem|irr` share marker orange. Past and future use the ink-soft baseline.
- Split combined labels on `/`; give each case its own `data-tone` span (`colHeader()` in `src/render/pronouns.ts`).
- Use three-letter case abbreviations. Single-letter `N` conflicts with neuter gender.
- `.case-tag`: abbreviation knocked out of a solid `--tone` fill, with ≥4.5:1 contrast on both grounds. No tone-on-tint labels.

### Ending units

- Render through `endingUnit()` in `src/render/chart.ts`; no handwritten unit markup.
- Keep gender, form, and source as sibling fields in one segmented flex container. A merged unit has multiple gender fields. No nested badges or detached sources.
- Use uniform `--rad` corners and a neutral `--ink-muted` border. No gender-specific shapes or `--facet-r`.
- Fields use `align-items: stretch`; no baseline alignment inside units. `.gender-run` stretch supplies equal unit heights, not field padding.
- Set `data-gender="m|n|f"` on `.eu-gender`, never the unit. This field uses only `--facet-*`; `.eu-form` and `.eu-source` use only ink.
- Every gender field displays its localized abbreviation from `t()`, never `sr()` or a `.s` wrapper. `validateFacets()` checks rendered letters per locale.
- Gender fields use solid facet fills with knockout letters, maintaining ≥4.5:1 contrast on both grounds. No colored letters on tints.
- Only the form field may shrink. Unit overflow must never clip gender letters.
- `mergeBand()` in `src/render/cases.ts` merges contiguous genders only when value, note, and provenance match. Rendered field markup is the signature; matching endings alone are insufficient.
- Preserve `GENDERS` order M-N-F for M+N merges. Do not reorder to merge M+F.
- Preserve branch distinctions: `GEN pl -a` has N→NOM provenance; `VOK sg -o` has N→NOM versus F's `vok-f-name`; `INS sg -om` has `soft-em` for M/N only.
- Under forced colors, retain system fill/text/border colors. Separate merged gender fields with `border-left`, never box-shadow; retain the `sr-only` comma. Only decorative case bars opt out of forced colors.

## Architecture

`bun run build` renders 19 static documents into `dist/`: 10 charts × 2 locales,
minus EN false-friends. Bun handles bundling; `typescript` is the only devDependency.

```text
src/
  content/   *.ts        chart data; satisfies types in lib/types.ts
  i18n/      en.ts ru.ts EN source of truth; RU is Record<Key, string>
  glossary/  glossary.ts
  lib/       script, html, negotiate, routes, triggers, types
  render/    one pure (lang) => markup module per chart
  layout/    page shell, nav, footer, per-chart body
  client/    theme-init (blocking), app (behavior only)
  styles/    styles.css
public/      copied verbatim to dist/ (fonts, favicon, _headers, _redirects)
```

### Script

- Dual-emit every Serbian string; switch visibility with `data-script` on `<html>`. Never rewrite text.
- Inline markup: `<span class="s"><i data-s="lat">žena</i><i data-s="cyr">жена</i></span>`. Reserve `.sr` for block specimens.
- Default to Latin when `data-script` is absent; `[data-script="cyr"]` reverses visibility.
- `src/client/theme-init.ts` sets `data-script` before paint.
- The `?` trigger's Latin `aria-label` is the sole attribute exception. Add no other Serbian-bearing attributes; attributes cannot dual-emit.

### Language

- EN uses original URLs; RU mirrors under `/ru/`.
- False-friends exists only in RU; its EN path returns 301.
- `theme-init` may redirect EN to RU before paint. Never redirect an explicit `/ru/` URL through language negotiation. Keep negotiation to one hop; no termination test needed.
- Language controls are real links that write `as_lang` before navigation.

### Validation and assets

- `satisfies` checks presence, shape, and unions. `tools/validate.mjs` checks values: lengths, tone-map order, cross-chart references, script roundtrips, Serbian markers, and glossary coverage.
- `tests/fixtures/` stores normalized rendered HTML across locales and scripts, including page markup and popovers. Preserve attributes. `bun tests/snapshot.ts` updates baselines; review the diff before committing.
- Keep `styles.css` as one authored global file, copied without minification. The tone audit scans it line by line. No scoped stylesheets.
- Build fonts with `bun tools/fonts/build.mjs` from the pinned Google Fonts source. `extend-source-serif.py` assembles missing pitch marks (U+030F, U+0311, U+0200–0217) from the font's grave and breve before cutting six `source-serif-4-sr-*` subsets.
- Font unicode-ranges come from `styles.css`. Validation shapes every pitch-table string against shipped fonts with HarfBuzz.
- `/assets/fonts/*` is immutable: new font bytes require new filenames.

## Development

- `bun run dev`: serve `dist/` on :3000 and rebuild on change.
- Run `bun run validate` before committing: build, validate, test, typecheck.
- One logical change per commit; use Conventional Commits.

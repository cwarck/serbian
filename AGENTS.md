# AGENTS.md

## Premise

Mobile-first cheat sheets. Replace pinch-zoom PDFs, not write a textbook.

## Brand

- Name = domain: **serbian.fyi**. Written identity is lowercase `serbian.fyi` everywhere.
- Wordmark: full `serbian.fyi` set in Source Serif 4. `serbian` in ink, the `.fyi` TLD in marker orange (`.brand-tld`) — the only brand-orange in the masthead. Same wordmark at every width; no monogram. The favicon stays the `s.` glyph (`favicon.svg`) — the only place the monogram survives.
- Minimal kit by design: domain wordmark only. No mascot, no taglines.
- Every `<title>` carries the word "Serbian" — the domain itself doubles as the keyword.
- CC BY attribution is the URL: `© serbian.fyi · CC BY 4.0` — the credit links home (`foot.copy` in `src/i18n/en.ts`).

## Content

- Show WHAT, not WHY. Labels over story arcs.
- No narrative framing: no eyebrows, no chapter headlines, no intro paragraphs.
- One view per fact — don't repeat the same data sliced two ways on one page.
- Abstract patterns in grids (`-a`, `-e`); concrete words live in their own table.
- Feynman tone only inside `?` click-reveals. Additive, never load-bearing.

## Design

- Mobile-first.
- Legible at any resolution.
- No tiny elements.
- Less is more.

## Layout

One layout per chart — the mobile layout is THE layout. Desktop gets the same sheet, scaled up, never a different design.

- **The sheet.** `body` is the canonical column: `max-width: var(--max-w)` (28rem), centered, hairline side rules. `html` is the desk behind it (`--paper-deep`). No wrapper elements, no media query — the desk simply appears when the viewport outgrows the sheet.
- **One fluid rule.** The root `font-size` clamp on `html` is the ONLY viewport-responsive declaration on the site. It scales type, spacing, and column width together (everything is rem-based). Phones stay at the user's default size.
- **Width media queries are banned.** Allowed queries: `hover`, `prefers-reduced-motion`, `forced-colors` — capability, never width. If a chart "needs" a wider variant, the chart is showing too much at once; redesign the one layout instead.
- **No vw units** outside the root clamp (viewport-safety `calc(100vw - …)` caps on fixed overlays are fine). Spacing is fixed rem — fluidity comes from the root, not from per-rule clamps.
- **Every layout must fit 320px.** That's the narrow end of the one layout, not a breakpoint tier.
- **Truly 2D data** (a paradigm that genuinely needs both axes at once) gets a horizontal-scroll pane inside the column — never a wide page variant.

## Typography

The scale is the rulebook. Pick a role; the token decides the size.

**Tokens** (defined in `src/styles/styles.css` `:root`):

| Token          | Role                                          |
| -------------- | --------------------------------------------- |
| `--fs-label`   | ALL-CAPS labels: eyebrows, tags, axis labels  |
| `--fs-caption` | Translations, glosses, footer, fine print     |
| `--fs-body`    | Default prose, popover body                   |
| `--fs-lead`    | Example sentences, data cells, lead paragraph |
| `--fs-title`   | `h3`, panel/card title                        |
| `--fs-head`    | `h2`, case name                               |

`--track-label` (`.075em`) for ALL-CAPS labels. `--track-display` (`-.02em`) for headings.

**Rules:**

- Every `font-size` resolves to a token. No ad-hoc `clamp()`, no bare rem values, no em-relative sizes on inline tags. Exceptions: decorative background glyphs.
- Two families, two voices. Source Serif 4 (`--ff-display`) carries the language: Serbian specimens (data cells, example sentences, endings, declined forms), `h1`–`h5`, oversized brand/letter glyphs. Source Sans 3 (`--ff-body`) carries the apparatus: ALL-CAPS labels, captions, translations, glosses, prose, UI controls.
- Weights: serif 300 only for `h1`–`h5` and oversized glyphs; Serbian data cells use serif 400 (500 for emphasis). Sans apparatus is 400 (500 for ALL-CAPS labels and emphasis). ALL-CAPS labels (`--fs-label`) use sans 500 with `--track-label` tracking.
- `<i>` marks inline Serbian tokens in foreign prose; base CSS renders them in the serif voice automatically. The marker is now **structural**: `srGrammarHTML()` in `src/lib/html.ts` dual-emits exactly the runs it wraps and tags them `lang="sr"`. Nothing else in a translation flips script, so an unmarked Serbian token silently stays in one alphabet forever. Any new Serbian-bearing selector must pin `font-family: var(--ff-display)` — specimens must never fall to the sans default.
- `<i>` may only wrap Serbian. Everything inside it flips Latin↔Cyrillic, so wrapping a translation's own word transliterates it — an English gloss sprouts a Russian-looking token. `validateSerbianMarkers()` enforces this: in a translation next to an `sr` specimen the token must be a word that specimen contains (and must not be spelled identically to its own gloss); in standalone prose it must be a glossary lemma. Abstract shapes (`-a`, `-ov-`, `-∅`) and bare letters (`k, g, h`) are exempt. Don't reach for `<i>` to emphasise a translation — translations carry no emphasis.
- Both families must keep Serbian Cyrillic `locl` support — `font-language-override: "SRB"` on `body` renders Serbian italic alternates (п → ū-form, т → ш̄-form). Source Serif 4 and Source Sans 3 pass; test any replacement face before swapping.
- Source Serif 4 is variable on the `opsz` axis (8–60). `font-optical-sizing: auto` is enabled on `body`, so the browser maps `font-size` to the right optical cut automatically. Don't set `font-variation-settings: "opsz"` by hand — except `h1, h2`, which are pinned to `"opsz" 60` (Display cut) to recover editorial contrast at head sizes.
- Three line-heights: `1` for single-line labels (bare value), `var(--lh-snug)` (1.3) for titles, `var(--lh-prose)` (1.55) for prose. Exception: `h1`–`h5` keep the tighter heading reset (`1.05`); decorative glyphs set their own.
- Don't restate `font-family: var(--ff-display)` or `font-weight: 300` on `h1`–`h5` — the base reset already applies them.
- Data cells get `font-feature-settings: "tnum"` (tabular numerals) when they contain digits.
- If a place "needs" a size off the scale, the role is wrong, not the size.

## Colors

Flexoki accents, one hue per meaning. Orange is the brand's marker ink and carries zero grammatical meaning; the six inflected cases each own one of the remaining accents. The full palette and semantic aliases live in `src/styles/styles.css` `:root` (`--fx-*` scale → `--tone-*` semantic).

**Semantic map** (site-wide, single meaning per hue):

| Hue       | Meaning                                                                                     |
| --------- | ------------------------------------------------------------------------------------------- |
| orange    | brand/marker ink — brand mark, `::selection`, focus rings, hovers, verb present family. Never a grammatical category |
| red       | VOK                                                                                         |
| yellow    | DAT                                                                                         |
| green     | LOK                                                                                         |
| cyan      | GEN                                                                                         |
| blue      | INS                                                                                         |
| purple    | AKU                                                                                         |
| magenta   | unassigned — reserved for a future cross-chart axis                                         |
| ink-tones | NOM, genders (M/N/F), body text, alphabet stripes, non-grammatical categories               |

**Mechanisms:**

- **Case tone.** Set `data-tone="nom|gen|dat|aku|vok|ins|lok"` on the element. The `[data-tone]` block in `styles.css` resolves `--tone` to the right Flexoki accent; descendant elements pull through `color: var(--tone, var(--accent))`. A `:where([data-tone])` baseline maps any other tone value to `--ink-soft`, so legacy chart-internal categories quietly fall to neutral. The `var(--accent)` fallback paints tone-less elements brand orange by design — that is the marker ink, not a case.
- **Combined case labels** (e.g., "Acc / Gen" in pronouns). Split the label on `/` and wrap each half in its own `data-tone` span. See `colHeader()` in `src/render/pronouns.ts`.
- **Gender labels.** Set `data-gender="m|n|f"` on the labelled element. Genders carry no hue — scoped CSS renders the labels in full ink (`--ink`), one step above the muted apparatus labels around them. Position + label carry the axis.
- **Verb present forms.** All four present-tense conjugation buckets plus irregulars share the brand orange via `[data-tone]` values `im|am|em|jem|irr` — marker ink ("here's the live paradigm"), not a grammatical hue. Past and future fall to the ink-soft baseline.

**Rules:**

- NOM is unmarked — it takes an ink-tone, not an accent. NOM is the dictionary form; the other six cases inflect from it.
- Orange is brand-only. No grammatical category may claim it — a case mapped to `--tone-orange` would read as chrome, and chrome would read as grammar.
- One hue, one meaning. If a new chart needs a categorical color, check first whether the category genuinely is a case. If it isn't, prefer ink-tones or typographic differentiation (line style, weight, position) over a fresh hue. Magenta stays in reserve — don't spend it casually.
- Pronouns, numbers, and aspect charts carry no per-category color. Only the case axis gets hues; genders and chart-internal categories use ink.
- Alphabet uses line-style differentiation (solid vs dashed ink stripe), not color. The "unique to Serbian" and "looks Latin, sounds different" categories sit outside the grammatical color system.

## Architecture

The site is built. `bun run build` renders 19 static documents into `dist/` —
10 charts x 2 locales, minus the EN false-friends page. One devDependency
(`typescript`); everything else is Bun's own bundler.

```
src/
  content/   *.ts        chart data, typed via `satisfies` against lib/types.ts
  i18n/      en.ts ru.ts en is the source of truth; ru is Record<Key, string>
  glossary/  glossary.ts
  lib/       script, html, negotiate, routes, triggers, types
  render/    one pure (lang) => markup module per chart
  layout/    the page shell, nav, footer, per-chart body
  client/    theme-init (blocking) + app (behaviour only)
  styles/    styles.css — ONE authored global file
public/      copied to dist/ root verbatim (fonts, favicon, _headers, _redirects)
```

**Two mechanisms carry the design. Neither is a runtime.**

- **Script (lat/cyr) — dual-emit, CSS-switched.** Every Serbian string ships in
  both alphabets: `<span class="s"><i data-s="lat">žena</i><i data-s="cyr">жена</i></span>`.
  Toggling is one attribute on `<html>`; nothing rewrites text, so copy/paste
  and screen readers stay correct. Three details are load-bearing:
  - It is `class="s"`, **not** `class="sr"` — `.sr` is a live block-level
    specimen class and these wrappers nest inside translations.
  - The rules are **asymmetric on purpose**. A symmetric pair would render
    `žena жена` on a document with no `data-script`. Latin wins by default; the
    `[data-script="cyr"]` block flips it.
  - `src/client/theme-init.ts` sets `data-script` **pre-paint**, or a returning Cyrillic
    reader watches the text repaint on every load.
  - An attribute value cannot dual-emit — you cannot hide half an `aria-label`.
    The one such site (the `?` note trigger) bakes Latin and the toggle does not
    reach it. Keep it the only one.

- **Language (en/ru) — routes.** EN keeps the original URLs; RU mirrors under
  `/ru/`. `false-friends` exists only under `/ru/`, and the EN path is a 301.
  **The asymmetry is the design:** EN is the negotiable tree, so `theme-init`
  may redirect an EN path to its RU twin pre-paint; a `/ru/` URL is an explicit
  statement and is never bounced. Termination is structural — one hop, no test
  required. The language chips are real links that write `as_lang` before
  navigating, so arrival always agrees with the redirect.

**What the build guarantees, and what still needs a check.** `satisfies` gives
presence, shape and every union. It does not give values, so `tools/validate.mjs`
keeps lengths, ordering against the tone map, cross-chart references, the script
roundtrip, the `<i>` marker attestation, and the glossary lemma coverage.
`tests/fixtures/` pins the rendered HTML of all nine charts across
2 languages x 2 scripts, page markup and popover fragments alike — normalized
HTML, never text, because the meaning lives in attributes (`data-tone` is the
entire colour system). `bun tests/snapshot.ts` rewrites the baselines; read the
diff before committing it.

`styles.css` stays ONE authored global file and is copied, never minified — the
tone audit scans it line by line. Reorganize it internally; do not split it into
scoped component styles.

## Development

- Run `bun run validate` before committing changes — it builds, validates,
  tests, and typechecks.
- `bun run dev` serves `dist/` on :3000 and rebuilds on change.
- Commit per logical change.
- Conventional commits.

# AGENTS.md

## Premise

Mobile-first cheat sheets. Replace pinch-zoom PDFs, not write a textbook.
Reference: Levithan's A4 Serbian charts — every block is a labeled grid of facts.

## Brand

- Name = domain: **serbian.fyi**. Written identity is lowercase `serbian.fyi` everywhere.
- Wordmark: full `serbian.fyi` set in Source Serif 4. `serbian` in ink, the `.fyi` TLD in marker orange (`.brand-tld`) — the only brand-orange in the masthead. Same wordmark at every width; no monogram. The favicon stays the `s.` glyph (`favicon.svg`) — the only place the monogram survives.
- Minimal kit by design: domain wordmark only. No mascot, no taglines.
- Every `<title>` carries the word "Serbian" — the domain itself doubles as the keyword.
- CC BY attribution is the URL: `© serbian.fyi · CC BY 4.0` — the credit links home (`foot.copy` in `assets/i18n.js`).
- The site JS namespace is `window.SerbianFyi`.

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

## Typography

The scale is the rulebook. Pick a role; the token decides the size.

**Tokens** (defined in `assets/styles.css` `:root`):

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
- `<i>` marks inline Serbian tokens in foreign prose (the script-converter hook); base CSS renders them in the serif voice automatically. Any new Serbian-bearing selector must pin `font-family: var(--ff-display)` — specimens must never fall to the sans default.
- Both families must keep Serbian Cyrillic `locl` support — `font-language-override: "SRB"` on `body` renders Serbian italic alternates (п → ū-form, т → ш̄-form). Source Serif 4 and Source Sans 3 pass; test any replacement face before swapping.
- Source Serif 4 is variable on the `opsz` axis (8–60). `font-optical-sizing: auto` is enabled on `body`, so the browser maps `font-size` to the right optical cut automatically. Don't set `font-variation-settings: "opsz"` by hand — except `h1, h2`, which are pinned to `"opsz" 60` (Display cut) to recover editorial contrast at head sizes.
- Three line-heights: `1` for single-line labels (bare value), `var(--lh-snug)` (1.3) for titles, `var(--lh-prose)` (1.55) for prose. Exception: `h1`–`h5` keep the tighter heading reset (`1.05`); decorative glyphs set their own.
- Don't restate `font-family: var(--ff-display)` or `font-weight: 300` on `h1`–`h5` — the base reset already applies them.
- Data cells get `font-feature-settings: "tnum"` (tabular numerals) when they contain digits.
- If a place "needs" a size off the scale, the role is wrong, not the size.

## Colors

Flexoki accents, one hue per meaning. Orange is the brand's marker ink and carries zero grammatical meaning; the six inflected cases each own one of the remaining accents. The full palette and semantic aliases live in `assets/styles.css` `:root` (`--fx-*` scale → `--tone-*` semantic).

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
- **Combined case labels** (e.g., "Acc / Gen" in pronouns). Split the label on `/` and wrap each half in its own `data-tone` span. See `colHeader()` in `assets/charts/pronouns.js`.
- **Gender labels.** Set `data-gender="m|n|f"` on the labelled element. Genders carry no hue — scoped CSS renders the labels in full ink (`--ink`), one step above the muted apparatus labels around them. Position + label carry the axis.
- **Verb present forms.** All four present-tense conjugation buckets plus irregulars share the brand orange via `[data-tone]` values `im|am|em|jem|irr` — marker ink ("here's the live paradigm"), not a grammatical hue. Past and future fall to the ink-soft baseline.

**Rules:**

- NOM is unmarked — it takes an ink-tone, not an accent. NOM is the dictionary form; the other six cases inflect from it.
- Orange is brand-only. No grammatical category may claim it — a case mapped to `--tone-orange` would read as chrome, and chrome would read as grammar.
- One hue, one meaning. If a new chart needs a categorical color, check first whether the category genuinely is a case. If it isn't, prefer ink-tones or typographic differentiation (line style, weight, position) over a fresh hue. Magenta stays in reserve — don't spend it casually.
- Pronouns, numbers, and aspect charts carry no per-category color. Only the case axis gets hues; genders and chart-internal categories use ink.
- Alphabet uses line-style differentiation (solid vs dashed ink stripe), not color. The "unique to Serbian" and "looks Latin, sounds different" categories sit outside the grammatical color system.

## Development

- Run `bun run validate` before committing changes.
- Commit per logical change.
- Conventional commits.

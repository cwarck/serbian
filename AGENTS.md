# CLAUDE.md

## Premise

Mobile-first cheat sheets. Replace pinch-zoom PDFs, not write a textbook.
Reference: Levithan's A4 Serbian charts — every block is a labeled grid of facts.

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
| `--fs-hero`    | Home page hero only                           |

`--track-label` (`.075em`) for ALL-CAPS labels. `--track-display` (`-.02em`) for headings. `--track-hero` (`-.035em`) for `--fs-hero` only.

**Rules:**

- Every `font-size` resolves to a token. No ad-hoc `clamp()`, no bare rem values, no em-relative sizes on inline tags. Exceptions: decorative background glyphs.
- One family, three weights: Source Serif 4 display (300), Source Serif 4 body (400, 500 for emphasis). Weight 200 is reserved for `--fs-hero` only. Data cells at `--fs-lead` use body weight (400), not display — display weight is reserved for `h1`–`h5` and oversized brand/letter glyphs. ALL-CAPS labels (`--fs-label`) use body weight 500 with `--track-label` tracking.
- Source Serif 4 is variable on the `opsz` axis (8–60). `font-optical-sizing: auto` is enabled on `body`, so the browser maps `font-size` to the right optical cut automatically. Don't set `font-variation-settings: "opsz"` by hand — except `h1, h2`, which are pinned to `"opsz" 60` (Display cut) to recover editorial contrast at head sizes.
- Three line-heights: `1` for single-line labels (bare value), `var(--lh-snug)` (1.3) for titles, `var(--lh-prose)` (1.55) for prose.
- Don't restate `font-family: var(--ff-display)` or `font-weight: 300` on `h1`–`h5` — the base reset already applies them.
- Data cells get `font-feature-settings: "tnum"` (tabular numerals) when they contain digits.
- If a place "needs" a size off the scale, the role is wrong, not the size.

## Colors

Flexoki accents, one hue per grammatical meaning. The full palette and semantic aliases live in `assets/styles.css` `:root` (`--fx-*` scale → `--tone-*` semantic).

**Semantic map** (site-wide, single meaning per hue):

| Hue       | Meaning                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| red       | VOK                                                                                      |
| orange    | INS — also brand mark, paradigm-letter highlights, verb present family ("active default") |
| yellow    | DAT                                                                                      |
| green     | LOK                                                                                      |
| cyan      | GEN                                                                                      |
| blue      | M (masculine)                                                                            |
| purple    | AKU                                                                                      |
| magenta   | F (feminine)                                                                             |
| ink-tones | NOM, N (neuter), body text, alphabet stripes, non-grammatical categories                 |

**Mechanisms:**

- **Case tone.** Set `data-tone="nom|gen|dat|aku|vok|ins|lok"` on the element. The `[data-tone]` block in `styles.css` resolves `--tone` to the right Flexoki accent; descendant elements pull through `color: var(--tone, var(--accent))`. A `:where([data-tone])` baseline maps any other tone value to `--ink-soft`, so legacy chart-internal categories quietly fall to neutral.
- **Combined case labels** (e.g., "Acc / Gen" in pronouns). Split the label on `/` and wrap each half in its own `data-tone` span. See `colHeader()` in `assets/charts/pronouns.js`.
- **Gender tone.** Set `data-gender="m|n|f"` on the labelled element. Scoped CSS in `.pron-mini-head` and `.num-table-head` picks up `--gender-m/n/f`.
- **Verb present forms.** All four present-tense conjugation buckets plus irregulars share orange via `[data-tone]` values `im|am|em|jem|irr`. Past and future fall to the ink-soft baseline.

**Rules:**

- NOM is unmarked — it takes an ink-tone, not an accent. NOM is the dictionary form; the other six cases inflect from it.
- A case hue must not collide with M (blue) or F (magenta). The eight Flexoki accents partition cleanly: 6 inflected cases + 2 genders.
- One hue, one meaning. If a new chart needs a categorical color, check first whether the category genuinely is a case or gender. If it isn't, prefer ink-tones or typographic differentiation (line style, weight, position) over a fresh hue.
- Pronouns, numbers, and aspect charts carry no per-category color. Only the cross-chart axes (case, gender) get hues; chart-internal categories use ink.
- Alphabet uses line-style differentiation (solid vs dashed ink stripe), not color. The "unique to Serbian" and "looks Latin, sounds different" categories sit outside the grammatical color system.

## Development

- Commit per logical change.
- Conventional commits.

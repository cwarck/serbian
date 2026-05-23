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
| `--fs-label`   | Mono ALL-CAPS: eyebrows, tags, axis labels    |
| `--fs-caption` | Translations, glosses, footer, fine print     |
| `--fs-body`    | Default prose, popover body                   |
| `--fs-lead`    | Example sentences, data cells, lead paragraph |
| `--fs-title`   | `h3`, panel/card title                        |
| `--fs-head`    | `h2`, case name                               |
| `--fs-hero`    | Home page hero only                           |

`--track-label` (`.14em`) for mono ALL-CAPS. `--track-display` (`-.02em`) for headings. `--track-hero` (`-.035em`) for `--fs-hero` only.

**Rules:**

- Every `font-size` resolves to a token. No ad-hoc `clamp()`, no bare rem values, no em-relative sizes on inline tags. Exceptions: decorative background glyphs.
- Three families, three weights: Source Serif 4 display (300), Source Serif 4 body (400, 500 for emphasis), JetBrains Mono (500). Weight 200 is reserved for `--fs-hero` only. Data cells at `--fs-lead` use body weight (400), not display — display weight is reserved for `h1`–`h5` and oversized brand/letter glyphs.
- Source Serif 4 is variable on the `opsz` axis (8–60). `font-optical-sizing: auto` is enabled on `body`, so the browser maps `font-size` to the right optical cut automatically. Don't set `font-variation-settings: "opsz"` by hand — except `h1, h2`, which are pinned to `"opsz" 60` (Display cut) to recover editorial contrast at head sizes.
- Three line-heights: `1` for single-line labels (bare value), `var(--lh-snug)` (1.3) for titles, `var(--lh-prose)` (1.55) for prose.
- Don't restate `font-family: var(--ff-display)` or `font-weight: 300` on `h1`–`h5` — the base reset already applies them.
- Data cells get `font-feature-settings: "tnum"` (tabular numerals) when they contain digits.
- If a place "needs" a size off the scale, the role is wrong, not the size.

## Development

- Commit per logical change.
- Conventional commits.

## Planned charts

- Pitch & stress
- False friends

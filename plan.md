# serbian.fyi — the facet tier

Status: proposed, not started. Supersedes the build-rewrite plan, which shipped in `d9cb689`.

Gender stops being a column and becomes a chip that leads its word. The chip needs a colour;
the case axis owns every accent; so the colour system grows a second rank instead of a
seventh hue.

Cut a branch from `main`, land it in the phase order below, `bun run validate` per phase.

## Decision

Colour encodes **two things at once** by splitting the channel: chroma names the *axis*,
hue names the *value within* it.

| Tier | Chroma | Owns | Mechanism |
| ---- | ------ | ---- | --------- |
| 1 — accents | C 0.085–0.165 | the case axis, alone | `[data-tone]` → `--tone-*` |
| 2 — facets | C 0.050 | gender (and later axes) | `[data-gender]` → `--facet-*` |
| 0 — ink | C 0 | prose, structure, the unmarked | `--ink-*` |

The gap between the bands is the encoding. Tier 2 tops out at C 0.0511 against the lowest
accent at C 0.0849 (cyan, light) — 0.034 of separation, far enough that a facet never reads
as a faded case. Lightness is matched across
tiers — a facet is quieter, never dimmer.

Pinned, after review on device:

| | |
| --- | --- |
| Facet chroma | **C 0.050**, OKLCH, lightness fitted to ≥ 4.6:1 on both grounds |
| Facet hues | green 150° / violet 285° / amber 55° — rotated deliberately off the blue-pink cliché |
| Chip shape | **corner family**, `--facet-r: 11px` |
| M / N / F | **square `0` / diagonal pair `11px 0 11px 0` / pill `999px`** |
| Unit | **split** — one bounded object, solid letter cell, specimen on paper |
| Letter | **knockout in `--paper`** on a solid facet fill. Never a facet letter on a facet tint. |
| Number | a SINGULAR / PLURAL band. **Never inside the chip.** |

Tier 1 is untouched. Orange stays brand-only. NOM stays unmarked.

### Why not the alternatives

- **A bigger palette** (Radix, Tailwind, Open Color) buys swatches, not readable categories.
  Twelve `data-tone` values already fall to `--ink-soft`; the latent axes in `types.ts`
  (`pos`, `animate`, `level`, `tags`) push the real demand past twenty-five. Categorical hue
  is reliable to about eight — for *one* axis. With two axes on hue, nothing tells the reader
  which question a colour is answering.
- **Regrouping the cases** into hue families frees two or three accents, and breaks the
  strongest thing on the site: one-hue-one-case identity, which the syncretism chips
  (`.cell-share`, `src/render/cases.ts:88`) resolve against and which travels across charts.
- **Sex glyphs (♂ ♀)** teach the wrong rule — `stolica` is feminine, `sto` is masculine —
  neuter has no accepted mark, and both risk emoji presentation.

### What the shape is for

The letter identifies a chip in every channel already. The silhouette is not for reading one
chip; it is for **not having to** — letters need fixation, silhouette groups pre-attentively,
so a reader finds every feminine in a paradigm without decoding a single mark. Judge any
future change to it on grouping across a grid, not on legibility of one chip.

The corollary is a hard rule: **colour is the fast path, the letter is the guarantee.** Under
deuteranopia the tier-1 accents already collapse (VOK / DAT / LOK → three olives) and tier-2
M and F converge. Every facet-coloured mark prints its abbreviation, permanently.

## Phase 1 — tokens

`src/styles/styles.css` `:root`, after the `--tone-*` block.

```css
--facet-m: light-dark(#5D7A63, #66846B);
--facet-n: light-dark(#717091, #7A7A9A);
--facet-f: light-dark(#8B6D58, #967661);
--facet-r: 11px;
```

Values solved in OKLCH at C 0.050, L fitted per hue and per ground. Measured: C 0.0486–0.0511
across the six, contrast 4.61–4.63:1 on both `--fx-paper` and `--fx-black`. Do not hand-edit
these — if a hue moves, re-solve L for the same target, or the band stops being a band.

`light-dark()` is safe here: `color-scheme: light dark` is set at :110 and pinned per
`data-theme` at :195-196.

`--facet-r` is a real token, not a literal: three selectors read it and the validator asserts
the corner family is driven from one place.

## Phase 2 — the chip primitive

New block in `styles.css`, adjacent to `.case-tag` (currently :1208) so the two tiers read
together in source.

```css
/* Tier 2. The pair is ONE object: proximity alone loses the pairing the
   moment a row wraps. The letter is knocked out of a solid fill — a facet
   letter on a facet tint tops out below the house 4.5:1 bar (see below). */
.gender-unit {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--facet, var(--ink-muted));
}
.gender-tag {
  align-self: stretch;
  display: inline-flex;
  align-items: center;
  font-family: var(--ff-body);
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: var(--track-label);
  text-transform: uppercase;
  line-height: 1;
  padding: .26rem .46rem;
  color: var(--paper);
  background: var(--facet, var(--ink-muted));
}
.gender-unit > .chart-form,
.gender-unit > .end { padding: .12rem .5rem .16rem; }

.gender-unit[data-gender="m"] { --facet: var(--facet-m); border-radius: 0; }
.gender-unit[data-gender="n"] { --facet: var(--facet-n); border-radius: var(--facet-r) 0 var(--facet-r) 0; }
.gender-unit[data-gender="f"] { --facet: var(--facet-f); border-radius: 999px; }
```

**The letter is knocked out, never tinted.** A facet-coloured letter on a 16% facet tint
measures 4.03:1 light and 2.92:1 dark against its own cell. That is not a fitting error and
re-solving L will not save it: on a 16% tint the *ceiling* is 4.90:1 on dark ground, and only
for a pure-white letter. Every `--tone-*` token (:157-164) carries a hand-fit comment proving
4.5:1 is the house bar, so the tint recipe is a regression against the project's own standard.
Inverting costs nothing — knockout-on-fill is the same colour pair as fill-on-ground, so the
solved lightnesses apply unchanged at **4.61-4.63:1 on both grounds**.

**The border runs at full facet**, not a tint. It is the carrier for the silhouette argument,
and a 38% tint measures 1.42:1 in light — below even the 3:1 non-text floor, let alone what
pre-attentive grouping needs. At full facet it is 4.61-4.63:1.

Selectors are scoped to `.gender-unit`. Bare `[data-gender="m"]` would leak: `numbers.ts:117`
puts `data-gender` on the specimen span itself, and `.num-word` would inherit a radius and a
`--facet` it has no use for. `var(--facet, var(--ink-muted))` mirrors the house
`var(--tone, var(--accent))` idiom (:541, :1029, :2422) so a unit without a gender degrades
rather than dropping its border to an invalid `color-mix`.

Two details to verify on device, both consequences of `overflow: hidden` against the F pill:
a one- or two-character specimen (`to`, `ta`, `-a`) needs enough inline padding not to be
clipped by the radius; and the pill's left cap now cuts into a filled swatch, which should
read as intentional rather than lopsided.

Render helper in `src/render/chart.ts` beside `gloss()`:

```ts
export function genderUnit(g: Gender, label: Raw, inner: Raw): Raw
```

Every call site goes through it. No renderer hand-writes the markup — that is what makes the
letter-attestation check in phase 6 enforceable. **`label` comes from `t()`, never `sr()`:**
the chip label is apparatus, not a specimen, so it must not dual-emit. A `class="s"` wrapper
inside a `.gender-tag` would let the script toggle transliterate the gender letters.

## Phase 3 — pronouns

The payoff phase: three real gender columns disappear.

Delete from `styles.css`: `.pron-mini-head` (:1771), `.pron-poss-head` / `.pron-gender-row`
(:1786-1791), the three-track `grid-template-columns` on `.pron-matrix-row` (:1802), and
`.pron-mini-head [data-gender]` (:1071). The comment at :1786 — recording that the possessives
head had to drop its label column at 320px — goes with them; the constraint it documents is
what the chip removes.

`src/render/pronouns.ts`:

- Delete `genderHead()` (:49) and its three call sites (:106, :128, and the inline head at :89).
- Possessives (:87-99): owner label, then a wrapping `.forms` run of three `genderUnit()`s.
- Demonstratives (:106) and *whose* (:128): keep the row label as the card heading, same
  wrapping run beneath it.

**The pronoun blocks stop being ARIA tables.** Deleting the head row without deleting the
table semantics leaves a table whose column headers are gone, which is worse than no table.
Remove the `mountAttrs` entry (`pronouns.ts:59`), `role="table"` on `.pron-subtable` (:105,
:127), `role="row"` on the head rows (:88) and `.pron-gender-row` (:94) with its
`aria-labelledby`, and every `role="columnheader"` (:51, :89), `role="rowgroup"`,
`role="rowheader"` and `role="cell"` in the affected blocks. The gender that `columnheader`
carried now sits inside each cell, so a screen reader reads "M njihov" — the semantics move
from structure into content, which is the redesign. The owner `<h4>` stays as the group
heading. Fixtures pin attributes, so skipping this surfaces in phase 8 as unexplainable churn.

The honest cost, already reviewed: on the longest owners (`njihov / njihovo / njihova`) the
run takes two lines where the grid took one. Accepted — the grid's single line was bought by
deleting the label column.

## Phase 4 — cases

`src/content/cases.ts:267` — `ENDING_AXES` stays as the data. The renderer groups it by `n`.

`src/render/cases.ts`:

- Delete `axisLabel()` (:197). The `M.SG` string is what phase 4 exists to kill.
- `endCells` (:230): emit two bands, each a label plus three `genderUnit()`s in M-N-F order
  (`GENDERS`, `src/lib/types.ts:24`).

`styles.css` — `.case-row` grid (:1156):

```
"head  head  head"
"sg-l  sg-l  sg-l"
"m-sg  n-sg  f-sg"
"pl-l  pl-l  pl-l"
"m-pl  n-pl  f-pl"
"ex    ex    ex"
"preps preps preps"
```

Drop the six `.case-cell-end[data-axis]` rules (:1186-1191) for the new areas, and
`.case-cell-end[data-gender] .cell-axis` (:1274) with the label it styled. The cell's own
frame comes off where a `.gender-unit` fills it — a box inside a box.

**Display order changes, M-F-N → M-N-F.** Today's grid areas (:1186-1191) and `ENDING_AXES`
(`cases.ts:267`) run M-F-N; the bands run M-N-F per `GENDERS` (`types.ts:24`). The right
choice — one order site-wide — but it is a visible change nobody asked for, so it belongs in
the commit message rather than being discovered in the fixture diff.

**Verify at 320px.** Three tracks is one more than today. The endings are short (`-ima` is the
worst case) so it should hold, but this is the single riskiest layout change in the plan; if it
fails, the fallback is two bands of three that wrap, not a width query.

Band labels need new i18n keys — `cases.number.sg` / `.pl` are `Sg` / `Pl`, sized for an inline
axis label, not a band heading. Add `band.sg` / `band.pl`: EN `Singular` / `Plural`, RU wording
to settle in review (`pron.sg` is already `Ед.`, which is too clipped for a heading).

## Phase 5 — numbers and verbs

Both already print gender above the word; they inherit the primitive.

- `src/render/numbers.ts:117` — ordinals: the `data-label` stack becomes an inline
  `genderUnit()`. The row stops being three columns of wildly unequal length. Check
  `.chart-cell[data-label]::before` (:649) is still earning its keep elsewhere before touching it.
- `src/render/verbs.ts:138` — past participle: two bands, three units each, from
  `PAST.endings` (`src/content/verbs.ts:121-128`). This is the only site with no `data-gender`
  today; the axis becomes structural here for the first time.
  `past.mpl` is *M / mixed*, not plain M — that caveat cannot live in a one-letter chip and
  needs a note beside the band.

## Phase 6 — validator

`tools/validate.mjs`, `validateTones()`. The current rule bans gender colour outright
(:239-240); it becomes a routing rule.

Replace:

```js
expect(!css.includes('--gender-'), …)
expect(!/\[data-gender="[mnf]"\][^{]*\{[^}]*color:/.test(css), …)
```

With:

1. `--facet-m|n|f` all defined, and `[data-gender="m|n|f"]` maps each to its own facet token —
   the mirror of the existing `[data-tone]` map assertion (:209-231).
2. No `--tone-*` on any `[data-gender]` selector. A case hue on a gender is the failure this
   whole model exists to prevent.
3. No `--facet-*` outside the `data-gender` map, mirroring the case-hue sweep at :242-248.
4. **Band separation.** Parse both token sets, convert to OKLCH, assert
   `max(facet C) + 0.02 < min(tone C)`, asserted per ground. The gap *is* the encoding, so
   this is the check that actually guards the design. Currently passes with 0.014 of headroom
   (0.0511 + 0.02 = 0.0711 against 0.0849). No dependency, but more than a bare sRGB→OKLab
   converter: the tone tokens are `light-dark(var(--fx-*), …)`, so it needs an `--fx-*`
   flattening pass and `light-dark()` unwrapping before it can convert anything.
8. **A comment recording why the tint recipe is banned**, so it cannot come back on the next
   pass as an apparently-reasonable simplification.
5. **Letter attestation, per locale.** Every `.gender-unit[data-gender="g"]` in the rendered
   `dist/` HTML must contain `t('cases.gender.' + g)` **for that document's language**,
   NFC-normalized and compared exactly. A naive `includes('M')` is wrong: `ru.ts:218-220` is
   М / Ж / С, so `n`→С and `f`→Ж, and RU М is Cyrillic U+041C — a homoglyph that passes a
   Latin check on the wrong string. Guard the dictionaries too, so the check cannot be
   satisfied by a homoglyph: EN labels match `/^[A-Z]$/`, RU labels match
   `/^\p{Script=Cyrillic}$/u`.
6. **No dual-emit inside a chip.** No `.gender-tag` contains a `class="s"` wrapper — the label
   is apparatus and must not transliterate with the script toggle.
7. `--facet-r` is read by exactly the three `.gender-unit`-scoped corner rules and defined
   once. Assert the scoping, not just the token: the leaky bare-attribute form would pass a
   naive version of this rule.

Keep unchanged: the `data-tone` map, the case-hue sweep, the orange-brand assertions, the
present-verb-family check.

## Phase 7 — AGENTS.md

The **Colors** section is the rulebook and must change with the code.

- *One hue, one meaning* → **one tier, one axis; one hue, one meaning within a tier.** A
  sharpening, not an abandonment.
- Semantic map gains a tier column. Gender moves out of the ink-tones row.
- *Genders carry no hue — ink typography only* → genders resolve to `--facet-*`, never
  `--tone-*`; and every facet-coloured mark prints its abbreviation.
- Magenta: *unassigned, reserved for a future cross-chart axis* → an empty **tier-1** seat,
  spent only if Serbian grows an eighth case. Cross-chart axes live in tier 2.
- New rule: number is never encoded in colour or in a chip. It is a band.
- New rule: a facet-coloured mark is a solid fill with a knockout letter, never a tint with a
  coloured letter — with the measured reason, so it survives a later "simplification".
- **Record the one place two tiers meet.** Inside an ending cell the chip is facet-filled
  while the ending it holds is case-hued (`.cell .end`, :1293). This is deliberate: the row's
  subject is the case, and C 0.050 against C 0.085+ reads as two registers rather than one
  faded one. Write it down — the phase-2 rationale says colours should not collide on one
  object, and the next reader will otherwise "fix" it. The alternative, if it ever fails on
  device, is `.gender-unit .end { color: var(--ink) }`.
- **Forced colours.** The existing block (:2537-2559) reasons about why case tones need
  `forced-color-adjust: none` on decorative bars. Facets need the parallel note: `border-radius`
  survives HCM untouched, so the shape family holds; fill and border are overridden; and
  because the letter is knocked out, fill and text both take system colours and stay legible.
  No opt-out needed — say so where the next reader will look.

Unchanged and worth restating: orange is brand-only, NOM is unmarked, case hues route through
`data-tone` alone, `styles.css` stays one authored file.

## Phase 8 — fixtures

`bun tests/snapshot.ts` rewrites all of `tests/fixtures/` — nine charts × 2 languages × 2
scripts, pages and popover fragments. Every gender-bearing chart churns.

Read the diff, do not wave it through: `data-gender` and the unit markup *are* the meaning
here, which is why the fixtures pin normalized HTML rather than text.

## Out of scope

- **The twelve mute tones.** `aspect-core`, `aspect-pairs`, `aspect-prefix`, `aspect-time`,
  `aspect-pattern`, `num-build`, `num-noun`, `num-agreement`, `num-ordinal`, `past`, `future`,
  `clitic` all still fall to `--ink-soft`. Tier 2 is where they belong and the model is not
  paid off until they move, but that is a far larger diff and a separate branch.
- **Glossary gender.** `GLOSSARY` carries `gender` on every noun
  (`src/glossary/glossary.ts:105+`) and renders it nowhere. The chip makes it renderable on
  lemma heads and in prep cards. Not v1 — but it is the reason to build the primitive shared.
- `pos`, `animate`, `level`, `tags` — same tier, later.

## Open

- RU wording for the SINGULAR / PLURAL band labels.
- 320px behaviour of the three-track cases band (phase 4).
- Whether `.chart-cell[data-label]::before` survives once numbers and verbs stop using it.
- Device check on the one pair the numbers cannot settle: a solid facet chip sitting beside a
  `.case-tag` in the same viewport. A filled block is the one thing that could out-shout
  tier 1, even at a third of its chroma.

## Found while measuring — pre-existing, out of scope, needs its own branch

`.case-tag` (:1208) paints tone-coloured text on a 10% tint **of that same tone**. The
hand-fit comments at :157-164 fit each hue against *paper* and *black* — not against the tint
the chip actually paints. Every value below is measured twice, independently, in this session
and by the reviewing session.

Tone text vs its own 10% tint, `paper-fit → actual on tint`:

| | light | dark |
| --- | --- | --- |
| red | 6.23 → 5.71 | 4.59 → **3.38** |
| yellow | 4.61 → **4.24** | 8.08 → 4.70 |
| green | 4.62 → **4.26** | 6.12 → **4.04** |
| cyan | 4.61 → **4.25** | 6.70 → **4.27** |
| blue | 6.36 → 5.83 | 4.86 → **3.52** |
| purple | 7.58 → 6.91 | 5.39 → **3.75** |
| orange | 4.69 → **4.33** | 5.77 → **3.92** |
| NOM (`--ink-soft`) | 7.14 → 6.54 | 15.00 → 6.23 |

Four of seven tones fail in light; six of seven fail in dark. Only yellow-dark and NOM clear
the bar on both grounds.

### Why this one differs from the phase-2 defect

Both recipes paint text in a token over a tint **of that same token**, so the achievable
contrast is bounded by one free colour. Solved over that constraint:

| tint | light ground | dark ground |
| --- | --- | --- |
| 10% (`.case-tag`) | 18.49:1 | **6.80:1** |
| 16% (the rejected chip) | 17.32:1 | **4.90:1** |

The dark column is what decides it, and the ceilings are reached only at the extreme — text
luminance 1.0, i.e. pure white. At 16% that puts the ceiling at 4.90 against a 4.6 target: the
headroom exists only for a colour that is not a hue at all, so a C 0.050 facet (measured 2.92)
cannot be re-solved into passing and inverting was forced. At 10% the ceiling is 6.80, and the
failing tones sit at 3.4–4.7 — genuinely re-solvable by lifting L.

But re-fitting `--tone-*` moves every other place those tokens are spent (`.cell .end` at
:1293, the `.case-row::before` and `.case-strip-cell::before` bars), and lifting L far enough
would wash the accents everywhere else. The cheaper fix is probably to give `.case-tag` a
neutral ground — `--paper-mark` instead of a tone tint — which leaves every token's
paper-fitted value valid. Not decided here.

Do not fold this into the facet-tier branch. It touches tier 1 across four call sites and
would make the fixture diff unreadable.

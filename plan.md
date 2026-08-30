# serbian.fyi — the ending unit

Status: proposed, not started. Supersedes the facet-tier plan, which shipped in
`a0734b1`..`6f67b21`.

Two rendering bugs in the shipped gender chip turn out to share one cause, and fixing that
cause properly forces a decision the facet tier deferred: the per-gender silhouette blocks the
chart from saying the most useful thing it knows.

Cut a branch from `main`, land it in the phase order below, `bun run validate` per phase.

## Decision

| | |
| --- | --- |
| The widget | **One segmented unit**, up to three fields: gender · form · source. Not a chip inside a chip. |
| Silhouette | **Retired.** One uniform `--rad` (2px) corner. `--facet-r` goes with it. |
| Gender merge | **On**, keyed on the whole branch signature — value + note + provenance. 42 units become 35. |
| Facet hue | **Kept**, on the gender fields. The unit's border is neutral. |
| Case abbreviation | **Three letters.** One letter is rejected — see below. |

Unchanged: solid facet fill, knockout letter in `--paper`, endings in ink (`6f67b21`), number
as a band, M-N-F order, three-letter case abbreviations everywhere.

### Why the silhouette goes

It was always the weakest of the three carriers, and it is the one blocking a structural gain.

A merged unit leads with two genders. A square-for-M / diagonal-for-N / pill-for-F silhouette
has to pick one, and whichever it picks the shape misdescribes half its own contents. The two
are mutually exclusive; this is the trade, not a rendering limitation.

The silhouette's stated job was pre-attentive grouping — finding every feminine without
reading one. The merge replaces it with something strictly more useful: **seeing where gender
stops mattering.** Colour and letter, the two carriers actually doing the work, are untouched.

It is also the carrier that keeps costing: the pill's `overflow: hidden` clips short
specimens, it cannot hold a two-gender label, and it is what makes the N unit visibly taller
than its neighbours.

### Why the merge key is the whole branch signature

The obvious key — merge cells that show the same ending — is wrong, and wrong in a way that
prints falsehoods. Three groups in `CASES` share an ending value while disagreeing about what
that ending *is*:

| group | conflict |
| --- | --- |
| `GEN pl -a` | M novel, **N echoes NOM**, F novel |
| `VOK sg -o` | **N echoes NOM**, F novel and carries note `vok-f-name` |
| `INS sg -om` | M and N carry note `soft-em`, **F does not** |

A single form field cannot hold both states. `[M N F \| -a \| NOM]` asserts that all three
repeat the nominative when only neuter does; `.eu-form.is-echo` would have to be ink for M/F
and ink-faint for N at once. `INS sg` is worse, because the soft-stem `-em` alternation is
real for M and N and false for F — and that band was the flagship example of the merge.

So the key is `(value, note, source)`. Two cells merge only when they are the same statement,
not merely the same string.

### Why one-letter case abbreviations are rejected

The seven initials are **N G D A V I L** — all distinct, so shortening is unambiguous *within*
the case axis. It is not unambiguous across axes: the gender alphabet is **M N F**, and `N` is
in both. Five of the nineteen echo cells put them adjacent — `GEN n-pl`, `AKU n-sg`,
`AKU n-pl`, `VOK n-sg`, `VOK n-pl` — each rendering `[N] -a [N]`: neuter, ending,
same-as-nominative. NOM sources 9 of the 19 echoes, so this is the highest-traffic pairing on
the map. Three letters stay.

## Phase 1 — the segmented unit

Both bugs come from one construction: the source chip is an `inline-flex` box in an
`align-items: baseline` row beside a serif ending (`.cell`, `styles.css:1400`).

- **Baseline.** An `inline-flex` box aligns on the baseline of its own first line, which its
  own top padding has already displaced. The gender letter is centred, the ending sits on the
  text baseline, and the source chip sits on a third line.
- **Height.** `.cell-share` (:1429) carries `.3rem` padding on a `--fs-label` line — about
  `1.36rem` — against the ending's `1.28rem`, so a cell with a source chip stands taller.

The two fixes live in different places, and it matters which:

- The **baseline** fix is the unit. Deleting the baseline row and making the fields centred
  siblings of one flex container leaves nothing to disagree.
- The **height** fix is the **run**, not the unit. Inside a unit `.eu-form` is simply the
  tallest field, which is a padding-dependent accident. What makes equal height structural is
  that the run is a flex container at the default `align-items: stretch`, so every unit on a
  wrap line matches regardless of which fields it has.

Replace `.gender-unit` / `.gender-tag` / nested `.cell-share` with one unit whose fields are
siblings, in `styles.css` at the current `.gender-unit` block (:1276-1333):

```css
/* Gender, form and provenance are three FIELDS of one object, not a chip
   inside a chip: gender does not contain case. Detaching the source instead
   is worse — it loses which ending it annotates the moment a run wraps.
   align-items: stretch is what puts every field on one vertical rule; equal
   height BETWEEN units comes from the run, not from these paddings. */
.ending-unit {
  display: inline-flex;
  align-items: stretch;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--ink-muted);
  border-radius: var(--rad);
}
.ending-unit > * { display: inline-flex; align-items: center; line-height: 1; }
.eu-gender {
  font-family: var(--ff-body);
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: var(--track-label);
  padding: .3rem .46rem;
  color: var(--paper);
  background: var(--facet, var(--ink-muted));
}
/* The knockout is measured, not stylistic: a facet letter on a 16% facet tint
   tops out at 4.90:1 on dark ground and only for a pure-white letter, so the
   tint recipe cannot be re-solved. Fill + knockout is the same colour pair as
   fill-on-ground and holds at 4.61-4.63:1 on both. */
.eu-gender[data-gender="m"] { --facet: var(--facet-m); }
.eu-gender[data-gender="n"] { --facet: var(--facet-n); }
.eu-gender[data-gender="f"] { --facet: var(--facet-f); }
/* A merged unit's second gender field: divided by a knockout hairline, never
   a gap — a gap would read as two units. */
.eu-gender + .eu-gender {
  box-shadow: inset 1px 0 0 color-mix(in oklab, var(--paper) 55%, transparent);
}
.eu-form {
  font-family: var(--ff-display);
  font-size: var(--fs-lead);
  color: var(--ink);
  padding: .24rem .55rem;
  white-space: nowrap;
}
.eu-form.is-echo { color: var(--ink-faint); }
.eu-source {
  font-family: var(--ff-body);
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: var(--track-label);
  padding: .3rem .5rem;
  color: var(--ink-soft);
  background: var(--paper-mark);
  border-left: 1px solid var(--hairline);
}
```

Three things in that block are decisions, not formatting:

- **The facet map keeps its `[data-gender=…]` assignment form**, moved from `.gender-unit` to
  `.eu-gender`. `--facet` is assigned nowhere else site-wide; deleting :1331-1333 outright
  would drop every unit to the `--ink-muted` fallback and turn tier 2 grey *silently*, since
  the fallback is a valid value. It is also what keeps validator sweep #3 (`validate.mjs:344`)
  passing — that sweep requires every `var(--facet-*)` line to carry a `[data-gender=`.
- **`data-gender` belongs on the field, not the unit.** One attribute on `.ending-unit` cannot
  feed two differently-coloured gender fields in a merged unit.
- **The unit's border is `--ink-muted`, not a facet.** The border draws the object; the fields
  carry the axes. This is what makes a merged unit expressible at all — there is no
  "first gender" to pick — and it retires the open question about which facet it should take.
  Check `--ink-muted` on `--paper` clears the 3:1 non-text floor on both grounds before
  landing; if it does not, `--hairline` is wrong too and that is a separate finding.

**`.eu-source` is deliberately neutral.** The obvious recipe — tone text on a 12% tint of the
same tone — is exactly the one recorded under *Out of scope* as failing, 4/7 tones in light
and 6/7 in dark at 10%. Writing new code in a recipe already known to be broken just creates a
second site for that branch to migrate. The source field names its case in text, so the hue
was redundant there anyway. Re-tone it, if at all, on the `.case-tag` branch.

Delete `--facet-r` (:178) and the three `border-radius` declarations at :1331-1333 (keeping
the `--facet` assignments, above). Delete `.cell-shares` / `.cell-share` / `.share-label`
(:1422-1445) and the `.cell` / `.cell .end` / `.end.is-echo` block (:1400-1420, :1483) once
nothing renders them.

**The alternation split moves inside `.eu-form`.** `.cell-alt` (:1451) is
`display: flex; align-items: baseline` — the exact construction this phase exists to delete,
and it is live: `VOK sg M` is `-e¹ / -u²`. Render the split as inline text inside `.eu-form`,
keeping `.cell-sep`, so no baseline row survives inside the new unit. `.cell-alt-stack`
(:1469-1476) also survives as a column of `.ending-unit`s: `AKU m-sg` stacks two branches with
their own source fields.

`.cell-note` (:1446) sets `transform: translateY(-.2em)`, a constant tuned for a baseline row.
Re-check it inside a centred `.eu-form`; it is the one element that differs between otherwise
identical units.

**Accessibility.** `.cell-shares` carries `aria-label="same as"` (`cases.ts:99`); `.eu-source`
must keep an equivalent or a screen reader gets a bare "NOM" next to an ending with no stated
relation. A merged unit reads "M N -a" — give the gender fields a separator or a label so the
two letters do not run together.

## Phase 2 — merge

`src/render/cases.ts`. Group the three genders of a band by full branch signature
(value + note + source), keeping only **contiguous** runs in `GENDERS` order
(`src/lib/types.ts:24`), then emit one unit per group.

Measured over `CASES`: **42 units become 35.** Seven of the fourteen bands merge.

| band | merges to |
| --- | --- |
| GEN sg | `[M N \| -a]` `[F \| -e]` |
| DAT sg | `[M N \| -u]` `[F \| -i]` |
| DAT pl | `[M N \| -ima]` `[F \| -ama]` |
| INS sg | `[M N \| -om¹]` `[F \| -om]` |
| INS pl | `[M N \| -ima DAT]` `[F \| -ama DAT]` |
| LOK sg | `[M N \| -u DAT]` `[F \| -i DAT]` |
| LOK pl | `[M N \| -ima DAT]` `[F \| -ama DAT]` |

**Every merge in the chart is M + N.** That is the result worth having: the masculine/neuter
syncretism is the largest regularity in the paradigm, it is the *only* one that ever collapses
a cell, and today a reader can find it only by noticing that two adjacent cells happen to read
alike. Seven bands state it outright.

Three bands look mergeable and are not, for the reasons in the Decision section: `GEN pl`
(N echoes NOM, M and F do not), `VOK sg` (N echoes NOM, F carries a note), `INS sg` across all
three (F has no `soft-em`). `GEN pl` M and F do have identical signatures but are not
contiguous — and reordering would break the M+N contiguity all seven merges depend on, so the
gender order is settled, not open.

The `.case-row` grid (`styles.css:1166-1176`) stops being a fixed three-column matrix. A band
becomes a wrapping run of two or three units. Keep the `ex` and `preps` rows:

```
"head  head  head"
"sg-l  sg-l  sg-l"
"sg    sg    sg"
"pl-l  pl-l  pl-l"
"pl    pl    pl"
"ex    ex    ex"
"preps preps preps"
```

Delete the six `.case-cell-end[data-axis="…"]` grid-area rules (:1203-1208); `data-axis` is
per-gender and undefined on a merged cell, so it goes from the markup too — expect it in the
Phase 6 diff. Reuse `.gender-run` (:1308-1313) for the run rather than defining a second
`flex-wrap` container at a different gap.

**Verify at 320px:** `[M N | -ima | DAT]` is the widest unit in the chart and must not
overflow the column.

## Phase 3 — the other three call sites

`genderUnit()` (`src/render/chart.ts:45`) is shared. Renaming it and dropping the silhouette
touches every caller. **None of them merge** — verified: 10 ordinal rows, 18 three-form
pronoun rows, and the past participle (`sg` -o / -lo / -la, `pl` -li / -la / -le) give 28 rows
and zero contiguous merges.

- `src/render/pronouns.ts:56` — possessives, demonstratives, *whose*
- `src/render/numbers.ts:115` — ordinals
- `src/render/verbs.ts:151` — past participle

One real change beyond the corner: `.gender-unit > .chart-form` is
`color: var(--tone, var(--ink-soft))` (:1305) while `.eu-form` is `var(--ink)`. Those
specimens change colour. Take it deliberately — it generalises the ending-is-ink rule from
`6f67b21` to every unit, so the facet fill stays the only coloured thing in the widget — and
record it, rather than letting it land as a side effect.

## Phase 4 — validator

`tools/validate.mjs`, `validateFacets()` (:435 and the checks it calls).

Three existing checks break on the new CSS and must be handled, not just noticed:

- Sweep #3 (:344) — every `var(--facet-*)` line must carry `[data-gender=`. Satisfied by
  keeping the assignment-map form in Phase 1; verify, don't assume.
- Check #6 (:385) — asserts the literal string `16% facet tint` survives in `styles.css`. The
  Phase 1 comment keeps it verbatim.
- `validateFacetLetters()` (:427) matches the literal
  `<span class="gender-unit" data-gender="…"><span class="gender-tag">`. That is a **rewrite**,
  not an extension: new selectors, and a unit may now carry two letters, each matching
  `t('cases.gender.' + g)` for that document's language.

Then:

- Delete the `--facet-r` checks (:366-371) and the silhouette assertion (:375).
- Re-point the facet map check (:311-325) at `.eu-gender[data-gender=…]`.
- New: `.eu-gender` may only carry a `--facet-*`, `.eu-source` only a `--tone-*` (or ink). The
  unit is where the two tiers physically meet, so it is where the routing rule needs asserting.
- New: no `.ending-unit` nests another `.ending-unit`. That is the bug class this phase exists
  to remove.
- New: no `align-items: baseline` inside `.ending-unit`. Both original bugs came from one, and
  `.cell-alt` is exactly the tempting way to bring it back.

## Phase 5 — AGENTS.md

Write this **after** Phase 2 lands, so the prose describes what shipped.

- **The chip silhouette** bullet in *Mechanisms* goes, along with its "judge a change on
  grouping across a grid" line. Replace with the segmented unit: three fields, one border, one
  radius, neutral border, and the rule that the two tiers meet only inside it.
- Add the merge rule and its key: cells merge when they are the same *statement* — value, note
  and provenance — not when they show the same string. State why the chart merges at all: its
  job is to show where gender stops mattering, not to fill a matrix.
- Record that every merge in the paradigm is M+N, so the gender order is load-bearing.
- Record that a one-letter case abbreviation is rejected, with the `N`/neuter collision and the
  five cells, so it does not come back as an obvious space saving.

## Phase 6 — fixtures

`bun tests/snapshot.ts`. Every gender-bearing chart churns: cases most (35 units where there
were 42, plus `data-axis` disappearing from merged cells), pronouns/numbers/verbs by class,
corner and specimen colour. Read the diff — the merge is a content-shape change, not a
restyle, and a wrong grouping will look like a rendering bug.

## Out of scope

- **The case hue rotation.** A solved seven-hue assignment exists (NOM ← cyan ← GEN ← purple ←
  AKU ← yellow ← DAT ← green ← LOK ← magenta; VOK and INS unchanged), which drops CVD
  collision exposure from 65.2 to 22.0 and moves NOM out of ink. It is tier-1-wide, touches
  four call sites, and must not ride along with this branch. Undecided.
- **`.case-tag` contrast.** Tone text on a 10% tint of the same tone: four of seven tones fail
  in light, six of seven in dark. Its own branch; likely fix is a neutral `--paper-mark`
  ground — which is why `.eu-source` is specified neutral here rather than joining the defect.
- The twelve mute `data-tone` values, and glossary gender.

## Open

- `--ink-muted` on `--paper` at 1px: confirm ≥3:1 on both grounds before the unit border lands.
- `.cell-note`'s `translateY(-.2em)` inside a centred form field.
- 320px behaviour of `[M N | -ima | DAT]`.

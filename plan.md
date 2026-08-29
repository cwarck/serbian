# serbian.fyi — rewrite plan

Status: proposed, not started. Every `file:line` below was re-verified against `3ec6fec`
(after the Simple/Detailed and shared-endings toggles were retired).

Cut a branch from `redesign/mobile-canonical`, build the whole thing, test it, merge back.

## Decision

Rewrite onto a **custom bun build script**. No dependency graph: one devDependency
(`typescript`), no native binaries — `lightningcss` below means Bun's built-in engine reached
through `bun build`, not an install. Static output to `dist/`, Cloudflare deploy unchanged.

Astro was evaluated and rejected. Three candidate wins, all of which collapse here:

- **Content collections.** Replace roughly a third of `tools/validate.mjs`, not most of it.
  The valuable checks (tone map, marker attestation, roundtrip, lemma coverage) stay custom
  either way. TypeScript `satisfies` on TS data literals gives the typing with no framework
  and no runtime.
- **Scoped styles.** Nothing to gain — we would decline them under any tool. `validateTones()`
  (`tools/validate.mjs:277-328`) regex-parses one authored stylesheet line by line, and the
  design leans on long-range selectors — `:where([data-tone])` (`assets/styles.css:965`),
  `body.is-syncretism .end.is-echo` (1285), `:root:not([lang="ru"])` (425). Scoping and
  bundling kill the color-rulebook validator, which is the more valuable artifact. The same
  constraint binds our own build (see phase 6).
- **Route matrix.** 19 outputs (10 pages × 2 locales, minus the EN false-friends redirect).
  A `flatMap` over two arrays.

What remains is a dev server, asset hashing, and `transition:persist` — the first two are
one-line opt-ins (`bun build`, `lightningcss`), and native
`@view-transition { navigation: auto; }` covers the transition without a client router.

**What we knowingly give up:** HMR, automatic asset hashing until we add it, and
`transition:persist`.

**What would flip this later:** 50+ pages, Markdown authored by non-developers, locales
beyond en/ru, multiple contributors, or a shared component library. None are on the roadmap.
Migrating bun-script → Astro later costs about what it costs today.

## Why rewrite at all

The current architecture's costs are measured, not assumed:

- `charts/cases.html` ships three empty divs and **94,673 bytes of synchronous JS**
  (28,113 gz) to fill them. Only `theme-init.js` (1,459 B) is render-blocking in the strict
  sense — the rest sits at end of body — but because the containers are empty, first
  contentful paint of the chart is gated on all of it. `index.html` ships 42,140 bytes to
  relabel nine cards.
- The served document carries an English `<title>` regardless of the reader. `applyI18n()`
  (`assets/app.js:333`, selector passes at 338 and 346) swaps it from `data-i18n`, but a
  runtime swap lands only after `DOMContentLoaded`: too late for crawlers, share previews, and
  the tab flash. A Russian visitor gets `<html lang="ru">`, an English title in the served
  bytes, and an empty body.
- `tools/validate.mjs` is 978 lines, including four `vm.createContext` fake-browser shims
  (71-116) and a check that string-matches the source text of a function definition
  (145-152), silently skipping when it misses.
- CSP is written but not shipped (`_headers:36-46`), blocked by an inline script. The
  comment's other stated blocker — inline `style=` attributes — is stale; there are none left
  in the repo.

What none of this reaches — and what the rewrite is actually for — is **prerendered Serbian
text on a per-language URL**, plus hashed immutable assets. That is the case, not the byte
count.

## Architecture

```
src/
  content/        *.ts          chart data, typed via `satisfies`
  i18n/           en.ts ru.ts   UI strings; ru typed as Record<keyof typeof en, string>
  glossary/       glossary.ts
  lib/
    script.ts     toCyrillic / toLatin / fold / stripDiacritics  (build + client share)
    html.ts       escape, html`` tag, sr() dual-emit helper
    types.ts      content model
  render/         one pure module per chart: (data, lang) => string
  layout/         page shell, nav, footer, chart primitives
  client/         theme-init, settings, popover, cases-toggles, case-strip, search
  styles/         styles.css — stays ONE authored global file
build.mjs
tools/validate.mjs
public/           assets/fonts/ favicon.svg _headers _redirects
dist/
```

`public/` is copied to `dist/` root verbatim. **Fonts must land at `dist/assets/fonts/`, not
`dist/fonts/`** — three things hard-code that prefix and none of them should move:
`_headers:20` (`immutable`), 20 absolute `<link rel="preload">` tags (two per page), and the
12 `src: url('fonts/…woff2')` declarations in `styles.css`, which resolve relative to the
stylesheet's own directory. `_headers` and `_redirects` must likewise end up at `dist/` root,
not `dist/public/`, or Workers ignores them. `_redirects` does not exist yet — phase 0
creates it.

### Two mechanisms carry the design

**Script (lat/cyr) — dual-emit, CSS-switched.** The build wraps every Serbian string as
`<span class="s"><i data-s="lat">žena</i><i data-s="cyr">жена</i></span>`. Toggling is one
attribute on `<html>`; the client never rewrites text (deleting `applyScript`'s loop at
`assets/app.js:55-174`). `display: none` keeps copy/paste and screen readers correct. Nested
markup (`<mark>` inside examples) lives inside each variant.

Three details are load-bearing and must not drift:

- **Not `class="sr"`.** `.sr` is already a live block-level specimen class —
  `styles.css:290` (`overflow-wrap`), `:599` `.chart-example .sr`, `:1414` `.ex .sr`, `:1423`
  `.ex .sr mark` — and `.sr-only` sits at `:2455`. It matters because `<i>` markers appear
  *inside translations* (`cases-data.js:104`, `:191`), so a wrapper nested in `.ex` would be
  caught by `.ex .sr` and jump from caption/sans/muted to `--fs-lead`/serif/full-ink. Use
  `.s`. Reusing `<i>` for the variants is deliberate: it inherits the existing serif base
  rule at `styles.css:283`, needs no weight reset (unlike `<b>`), and preserves the
  `<i>`-means-Serbian invariant that `validateSerbianMarkers()` already enforces. Add a
  validator assert that `sr()` never emits `class="sr"`.
- **The no-attribute case must pick one script, not both.** Symmetric rules would render
  `žena жена` on any document without `data-script`. Baseline `[data-s="cyr"] { display: none }`
  (Latin wins by default, matching `app.js:48-51`), then under `[data-script="cyr"]` flip the
  pair. Assert in the validator that the attribute-less rendering hides exactly one variant.
- **`theme-init.js` must set `data-script` pre-paint.** It does not today — `theme-init.js:44-47`
  writes `lang`, `data-lang-source`, `data-theme`, `data-theme-source` and nothing else. Under
  CSS switching, a returning Cyrillic user would paint Latin and watch it swap, on every page
  load, on text. This lands in phase 4 with the baking, not phase 5.

**Language (en/ru) — routes.** EN keeps today's exact URLs (`/charts/cases.html`); RU mirrors
under `/ru/`. No inbound link *string* breaks. `false-friends` exists only under `/ru/`; the
old EN path becomes a `_redirects` entry, which also deletes the inline redirect script at
`charts/false-friends.html:11` and unblocks the CSP.

**Negotiation — decided: a client redirect, EN tree only, no Worker.** Today
`theme-init.js:18-30` resolves `localStorage.as_lang` → `navigator.languages` pre-paint and
stamps `root.lang`, so one URL serves everyone their language. Static routes cannot:
`wrangler.jsonc` declares no `main`, so no Worker reads `Accept-Language`, and `_redirects`
matches paths only. A `main` + `run_worker_first` on `/` would give a real 302 — rejected on
two grounds, not one: it makes something other than `bun run build` able to fail, and it
*harms* the search shape, because negotiating at `/` collapses two independently indexable
trees into one and forces `Vary: Accept-Language` fragmentation on the CDN. A JS redirect
being invisible to crawlers is the feature here — both trees get indexed and phase 8's
`hreflang` alternates do the routing.

Negotiation stays in `theme-init.js` — an external `<script src>` on every page, permitted by
`script-src 'self'`, so no CSP conflict — as one pre-paint `location.replace`:

```ts
// src/lib/negotiate.ts — inlined into theme-init at build
export function resolveRedirect(path, stored, navLangs) {
  if (path.startsWith('/ru/')) return null;        // explicit — never bounce
  const want = stored ?? firstSupported(navLangs) ?? 'en';
  return want === 'ru' ? '/ru' + path : null;      // '/' → '/ru/'
}
```

**The asymmetry is the design.** EN is the negotiable tree; a `/ru/` URL is an explicit
statement and is never redirected. Redirects fire only on EN paths and only target RU paths,
which never redirect — termination is structural, one hop maximum, not something a test has to
establish.

**No escape hatch is needed.** The switcher writes `as_lang` synchronously *then* navigates,
so the redirect on arrival already agrees with the destination:

| Start | Action | Arrive | Redirect? |
| --- | --- | --- | --- |
| `/x`, nav=ru, nothing stored | — | `/ru/x` | yes, one hop |
| `/ru/x` | EN chip: `as_lang='en'`, → `/x` | `/x` | no (stored=en) |
| `/x` | RU chip: `as_lang='ru'`, → `/ru/x` | `/ru/x` | no (`/ru/` branch) |
| `/ru/x` shared to a stored-EN reader | — | `/ru/x` | no — the URL wins |

That last row is the deliberate trade: `/ru/` links are shareable and never bounced.

Three consequences phase 3 carries:

- **`as_lang` changes meaning** — from a render input to a redirect input. Nothing else reads
  it afterwards.
- **`data-lang-source` is write-only — delete it, don't port it.** `theme-init.js:45` and
  `app.js:336` set it; nothing in the repo reads it. `html[lang]` *is* read
  (`styles.css:425`, `:root:not([lang="ru"]) [data-lang-only="ru"]`), and the build bakes it.
- **false-friends.** `_redirects`: `/charts/false-friends.html /ru/charts/false-friends.html
  301` — permanent is right, since no EN counterpart will ever exist. The EN chip on that page
  has no mirror, so it points at `/` (today's inline-script behaviour) and must still write
  `as_lang='en'` before navigating. Generally the chip's href comes from the route table per
  page, falling back to the locale root.

**This piece now has a test**, which is what made it the plan's silent-failure risk.
`resolveRedirect` is pure, so `bun test` covers 19 routes × {stored en, ru, none} × {nav
ru-first, en-first} = 114 cases as one table. Land it in phase 0 beside `script.ts` and
`html.ts` — same class of thing: wrong once, wrong everywhere.

**Modes become baked state — and there are none left to bake.** Both cases toggles were
retired (`11a9627` Simple/Detailed, `3ec6fec` shared-endings), taking `body.is-syncretism`
with them; `rg 'body\.is-'` now matches nothing. `.end.is-echo` (`styles.css:1283`) is
unconditional styling emitted by `cellHTML`, never toggled. The mode dimension therefore drops
out of the snapshot matrix and out of the phase-5 client bundle rather than being
reimplemented. Should a mode ever return, that is the shape it takes: both states in the HTML,
one class on `body`.

## Content fixes

A Serbian reviewer's findings live in `issues.md`. They are not part of this rewrite, but
their *ordering* is, because **the phase-2 snapshot diff is the rewrite's only safety net and
it compares today's renderer output against the new build's.** A content change made inside
that window is indistinguishable from a regression.

**The rule: before phase 0, or after phase 2 — never between.**

The site has never launched, so none of these are live-reader problems — they are launch
blockers, which is how the review itself frames its second list. Nothing below is urgent; the
ordering is only about which tree each fix is cheapest and safest to land on.

### Before phase 0 — land on the current tree, as ordinary commits

Every *value* edit: data strings, i18n strings, CSS declarations. Phase 1 ports content
verbatim, so these carry over free, and they land in the phase-0 baselines — the fixtures then
encode correct Serbian, and a later content regression is caught by the gate instead of
smuggled through it.

- **The genitive feminine plural** (`cases-data.js:45`). `pl: '-∅'` is contradicted by
  `numbers-data.js:90` (`šest žena`) and `cases-data.js:216` (`sestra → sestara`). Wrong
  grammar on the flagship chart, and the reason nobody caught it is that the GEN card carries
  no feminine-plural example among its three sentences. Add one, so the grid is falsifiable by
  a reader.
- **The five Croatisms and non-words** — `potres`, `počekati`, `uho` (`cases-data.js:235`),
  the reflexive dative `si`, lowercase `европа`.
- **The false-friends corrections** — cut `struka`/стук, resolve `brusnica`, add `nedelja`,
  `skupo`, `ljubiti`.
- **The two ungrammatical aspect specimens** (`aspect-data.js:29` and `:21`).
- **The `toCyrillic` digraph exception set** (`app.js:94`) — and only that half of the finding.
  Blind `dž|lj|nj` mapping corrupts `nadživeti` / `injekcija` / `konjugacija` permanently after
  one toggle. The other half — capturing `data-sr-source` once — is *not* worth fixing; phase 4
  deletes `applyScript` outright.
- **All ten smaller items**, including the `Ilya`/`Ilia` drift.
- **The two CSS items** — `.chip` to 44px (`styles.css:357`) and `.settings-btn`
  `:focus-visible` with a 2px solid ring (the house ring at `:379` is 1px dashed).
  `styles.css` survives the rewrite unchanged, so these are order-free; they go first because
  they are accessibility and cost two lines.

*The decisive reason this group goes first is the validator.* It is green and battle-tested
today, and it already gates this exact class of change — glossary lemma coverage catches
`potres` → `zemljotres` needing an entry, `ALPHABET.length === 30` (`validate.mjs:611`) guards
the alphabet swap. Phase 1 warns that moving content before porting the validator's hard-coded
paths leaves it crashing or silently validating an abandoned copy. Land content fixes while it
is at full strength.

### After — folded into the phase that already does the work

| Finding | Lands in | Why not sooner |
| --- | --- | --- |
| `<main>`, skip link, chart-to-chart nav, `<noscript>` | phase 2 | Hand-editing ten copy-pasted shells is the drift the review itself reports. One layout module, ten outputs. |
| "generate the shell" | phase 2 | It *is* phase 2. |
| false-friends teleports you home | phase 3 | Routes delete the inline script, and under the negotiation rules a `/ru/` URL is never bounced — the page simply serves. The reviewer's banner answers the open question of what the EN chip points at from `/ru/charts/false-friends.html`. Solved *by* the phase, not before it. |
| `data-sr-source` re-derived on every switch | phase 4 | Deleted, not repaired. |
| iz- series as the primary static prepositions; the verb stem column | after phase 1 | The only two findings that change data *shape* rather than values — one restructures `PREP_GROUPS`, one adds a field plus a renderer column. Safer against `types.ts` with `satisfies`, and since the port is verbatim, doing them first means doing them twice. |
| `.pron-table` scrolls at every viewport | **deferred — restructure later** | Confirmed real: `min-width: 28rem` (`styles.css:1607`) inside `overflow-x: auto` (`:1601`) against `--max-w: 28rem` (`:190`), so it can never *not* scroll. Decision taken: leave as-is this cycle; the table gets restructured on its own terms later, and the crammed `'nju / nje, je / ju'` cell is where to start. Because the data does not change, `types.ts` is written against the current shape and the eventual restructure becomes a typed change — so this no longer blocks phase 1. |
| numeral agreement (`dva grada su` / `pet gradova je`) | after | New content, new shape. |

*`issues.md` was written against the pre-`3ec6fec` tree, as this plan was.* Its content
references are mostly sound (`uho` is `:235`, the redirect is `false-friends.html:11`), but
every CSS reference has moved: `.chip` is `:357` not `:365`, the dashed ring `:379` not `:378`,
`.pron-table` `:1605-1607` not `:1612`. Re-verify before acting on those.

## Phases

Phases are commits, not releases. Three orderings matter and the rest is taste: baselines
before any refactor, 2→3→4 in that sequence because each strips a runtime mechanism the
previous one stopped depending on, and the settings menu's *construction* pulled forward into
phase 2 so phase 3 can delete `applyI18n` outright (see phase 3 — moving all of phase 5 ahead
of 3 instead would break popover script-baking).

**0 · Baselines and scaffold**

Before touching anything: **capture the regression baselines from the pristine tree** (the
matrix is specified under phase 2). They must predate phase 1 — a baseline taken after the
data is re-authored bakes the change in as "today" and measures nothing — and they must
*postdate* the content fixes above, because a baseline of wrong Serbian is a fixture that
defends wrong Serbian. Commit them as fixtures with their generator.

Then the scaffold: `build.mjs`, `tsconfig.json`, `bun run dev` (Bun.serve + watch),
`bun run build`, `dist/` gitignored, `public/` created with `assets/fonts/`, `favicon.svg`,
`_headers`, `_redirects`, and `wrangler.jsonc` pointed at `"./dist"`. Plus **`bun test`** with
unit tests for `script.ts` (port the 8 pairs + 5 accent roundtrips from
`validate.mjs:359-386`, plus the digraph exceptions `nadživeti` / `injekcija` /
`konjugacija` — that is where the `toCyrillic` fix has to survive the rewrite),
`html.ts` escaping — including `<mark>` inside examples — and `sr()`
dual-emit nesting. Those three functions, if wrong, are wrong on all 19 pages at once; it is
the cheapest insurance in the plan.

**The Cloudflare project is a git-connected build.** So `dist/` stays gitignored — add the
entry, `.gitignore` has none today — and the build command lives in the dashboard. Make it
`bun install && bun run validate && bun run build`, so a broken tree fails the deploy instead
of shipping a half-migrated site, with output directory `dist`. There is no lockfile today (no
deps); adding `typescript` creates `bun.lock`, which must be committed or Workers Builds will
not detect bun. The payoff is per-branch preview deploys, which phases 7 and 10 both need.

**1 · Content to TypeScript** — `assets/charts/*-data.js` → `src/content/*.ts` verbatim,
comments intact, plus `satisfies` against `types.ts`. The cell union documented in prose at
`cases-data.js:5-14` becomes a real discriminated union.

*Port the validator's path resolution in this phase, not phase 6.* `tools/validate.mjs`
hard-codes the nine data paths (`:9-19`), `assets/i18n.js` (`:74`), `data/glossary.js`
(`:116`) and `assets/styles.css` (`:263,286`). Moving content without moving those leaves the
only content checker either crashing or silently validating an abandoned copy, right through
the phases where regressions hide. Also give `walk()` (`:60-69`) a `dist` skip entry, and
point `validateLinks` (`:232-259`) at the built tree: today it resolves absolute hrefs against
`root`, so built pages would validate against the *old* tree's assets and pass until the old
tree is deleted. Rewrite the internals at phase 6; just keep it green now.

**2 · Renderers to pure functions** — per renderer: drop the two DOM lookups,
`list.innerHTML = x` → `return x`, drop the `langchange`/`scriptchange` listeners (19 across
the charts). Genuinely ~3 lines each.

*The layout module absorbs `charts/*.html` in this phase*, which is where the review's shell
findings land: `<main>`, a real skip link, a footer chart strip, one `<noscript>` line, and the
settings-menu markup (see phase 3). Ten copy-pasted shells become one module — which is also
the fix for the drift the review reports.

***There is a second script-switching mechanism, and it lives here.*** The nine chart pages
switch alphabet by re-rendering on `scriptchange`. `index.html` does not: its eight card
glyphs are hand-typed into the HTML and carry `data-sr-script`, and `applyScript`
(`app.js:166`) rewrites them in place. Nothing else in the repo emits that attribute. So the
glyphs never pass through `sr()` and the dual-emit story does not reach them by default — the
symptom would be Cyrillic working everywhere except the home page, invisible to a test matrix
generated from the data files. Six of the eight carry Serbian and must route through `sr()`
when the layout module absorbs them (`A a`, `Ko? Šta?`, `-am`, `ja, ti`, `u·na·o`, `Vid`);
`1·2·3` and `≠` are script-invariant and emit as plain text. **Assert in the validator that no
`data-sr-script` attribute survives into `dist/`** — that is the check that would have caught
this.

*The 67 `SerbianFyi.sr*` call sites are not one shape.* Budget accordingly:

- `sr()` on plain text — 51 sites. This is the case the dual-emit wrapper describes.
- `srHTML()` on strings that already carry markup — 6 sites, all in `cases.js`
  (`:8,78,80,236,304,306`). Payloads contain `<mark>` (`cases-data.js:34`) and
  `<span class="lit">` from `diffHL`. **`diffHL` (`cases.js:43-53`) computes a character-offset
  diff, and `lj→љ` / `nj→њ` / `dž→џ` change string length — so the Cyrillic variant's diff must
  be recomputed on the Cyrillic pair, not transliterated from the Latin-marked-up string.**
  That is a behavioural change, not a mechanical port.
- `srGrammarHTML()` — 10 sites (8 in `cases.js`, 2 in `verbs.js`); injects `lang="sr"` and
  tracks `<i>` nesting depth.
- **Serbian inside attributes**, which has no CSS solution — dual-emit cannot hide half an
  `aria-label`. Exactly one site: `cases.js:149`, the `?` note-trigger's accessible name,
  whose payload is the note *title* (`<i>k, g, h</i> soften before <i>-i</i>`) — exempt-class
  abstract shapes and bare letters. Stripping the Serbian would leave "soften before", so
  bake one script (Latin) into the label, accept that the toggle does not reach it, and assert
  that in the validator. (`data-prep` at `cases.js:30,448-450` is a Latin lookup key,
  correctly script-invariant.)

*Regression net:* run today's renderers under `vm` against a purpose-built fake DOM and diff
against the new build output. This works — it has been prototyped end to end on `cases.js`,
the hardest of the nine, in ~85 lines of harness with no dependency (a `CustomEvent` class,
`Object.assign(context, context.window)` so `SerbianFyi` lands as a global, and one generic
element factory for `getBoundingClientRect` / `getComputedStyle` / `classList` /
`style.setProperty` / `offsetWidth`). **Add a `localStorage` stub to that list** — `sr()`
resolves the current alphabet through `currentScript()`, which reads `as_script`, so the
harness must set it rather than inherit a default; it is also how the matrix drives the two
script variants. The existing `vm` shims are no head start:
`validate.mjs:78-109` runs `app.js` (deliberately inert at module scope) and pure data files,
and no renderer has ever run headless in this repo. The harness is new work, ~200 throwaway
lines; price it.

Two things the net must get right:

- **Diff normalized HTML, not normalized text.** This codebase encodes its meaning in
  attributes: `data-tone` on every case row (`cases.js:251`) and strip cell (`:59`) is the
  entire colour system, `data-gender`, `data-axis`, `role="table"` set imperatively at
  `pronouns.js:75`, the `is-echo` class that recedes a repeated ending to ink
  (`styles.css:1283`), the anchor ids the case strip and scroll-spy resolve against
  (`caseAnchor` at `cases.js:21`, emitted at `:59-60` and `:251`, consumed at `:396-425`), and
  `lang="sr"`. A build that dropped every `data-tone` would
  pass both `validate` and a text-only diff while all seven cases rendered in undifferentiated
  ink. Parse, sort attributes, collapse whitespace, then compare — and add three cheap
  emission asserts to the validator that outlive the port: every case row carries a
  `data-tone` from the seven-value set; every `CASES[i].key` anchor id exists in the built
  page; the count of `lang="sr"` nodes per page is non-decreasing.
- **Write down the matrix.** "Snapshot the rendered DOM" is singular; the real surface is 10
  documents × 2 langs × 2 scripts = 40 page baselines, plus **198** popover fragments that
  never appear in a page snapshot because they exist only after a click: 4 alphabet tips ×2,
  7 cases notes ×4, 27 prep lemmas ×4, 3 aspect notes ×2, 21 pitch notes ×2, 3 irregulars ×2.
  Those are reachable — every renderer is already a pure `(data, lang) => string`
  (`notePopoverHTML` at `cases.js:67`, `renderPrepCard` exported at
  `prepositions-shared.js:153`), so the same harness snapshots them in ten more lines. Commit
  them as fixtures under `tests/fixtures/` with their generator. Theme does not change markup —
  assert that rather than assume it, and the dimension legitimately drops. The mode dimension
  is already gone (see Architecture).

*Make the gate mechanical, not a note-to-self:* `bun run snapshot:check` in `package.json`,
called from `validate`, plus a checked-in `normalizers.ts` encoding each intended difference
(`data-i18n` stripped, dual-emit collapsed to `[data-s=lat]`). **Do not proceed past this
phase until the diff is clean.**

**3 · i18n as typed dicts** — `en.ts` is the source of truth; `type Key = keyof typeof en`;
`ru: Record<Key, string>`. Missing keys and call-site typos become compile errors. Deletes
`data-i18n` / `data-i18n-attr` from generated markup and `tools/validate.mjs:118-230` — the
three key-scrapers plus the symmetry check.

***Keep a value-level i18n check — types replace the key graph, not the content check.***
Phase 6 makes exactly this argument for chart data (`''` satisfies `string`), and it applies
harder here: today a thin RU dictionary degrades in the browser, but after routing, RU pages
are prerendered files with no runtime left to fall back. Two asserts, both cheap: **every RU
string non-empty**, and **RU ≠ EN** outside an allowlist. Measured against today's dictionary
(203 keys each side) that allowlist is exactly nine and every one is legitimate — `nav.brand`,
`foot.copy`, and `case.1.local` … `case.7.local`, the Latin case names (*Nominativ*,
*Genitiv*, …). Zero keys are empty on either side today, so both asserts start green. Page `<title>` becomes translatable in the served
bytes rather than after `DOMContentLoaded`. Routes and the negotiation redirect (see
Architecture) land here, and with them the false-friends fix: the page serves in EN behind a
one-line “written for Russian speakers — switch to RU” banner instead of teleporting home.

***The head is part of the deliverable, not phase-8 polish.*** "Prerendered text on a
per-language URL" is the whole case for this rewrite, and today ten `<meta name="description">`
tags are English-only — so without this, every RU page would introduce itself to search and to
anyone sharing the link in English. Three things emit per route: the description (becomes an
i18n key like the title), `<link rel="alternate" hreflang>` pairs pointing at the counterpart
route, and `<link rel="canonical">`. **Ten Russian descriptions have to be authored** — that is
content work, not build work; send it to the reviewer with the phase-0 content fixes.

*`applyI18n` has a consumer that outlives it — resolve it by splitting phase 5, not by
reordering.* The settings menu is built imperatively and depends on `applyI18n` entirely: row
labels get `label.setAttribute('data-i18n', key)` and **no text content** (`app.js:466-475`),
and theme chips get the literal `'system'/'dark'/'light'` (`:492-501`). The blast radius is
narrower than it looks — 3 blank row labels plus 3 untranslated English chips; lang chips are
already static endonyms (`app.js:481-484`) and both `data-i18n-attr` aria-labels have literal
`'Settings'` fallbacks — but the settings menu is how you toggle theme, language and script,
so you would be flying blind through 3 and 4.

**Doing phase 5 first does not work**, because it forces 5-before-4: phase 5 bakes popover
bodies as `<template>` nodes, and popover bodies are re-rendered on every open today
(`reg.render(trigger)` → `sr()` / `srGrammarHTML` at the current script). Bake them before
dual-emit exists and they freeze at whatever script the build ran in — the toggle silently
stops reaching popovers, failing only on click, in one script, which is precisely the shape the
snapshot gate cannot see.

**Split by concern instead:**

- **Phase 2 — construction moves to build.** When the layout module absorbs `charts/*.html`,
  emit the settings menu as markup with its `data-i18n` attributes intact. `applyI18n` still
  translates it, so behaviour is unchanged and EN-only. `buildSettingsMenu`
  (`app.js:441-507`) dies here; `wireSettingsMenu` (`:509`) is untouched.
- **Phase 3 — translation moves to build.** The attributes become baked per-locale text, and
  `applyI18n` deletes with no consumer left.
- **Phase 5 — behaviour stays client-side**, exactly as planned.

Three details make the phase-2 move cheap: the menu *relocates* existing nav controls rather
than recreating them, so build-time emission simply places them finally, and `init()`'s wiring
uses document-wide `querySelectorAll('[data-lang-chip]')` and friends, which does not care;
the menu is appended to `document.body`, so it emits at end of body; and the
`SerbianFyi.settingsExtras` slot has no consumer any more — `3ec6fec` removed cases' injected
row — so the extras plumbing goes with it.

*Concede what the gate cannot cover:* the settings menu will not go through the phase-2
snapshot diff. The harness runs chart renderers; the menu is built by `app.js`'s `init()` on
`DOMContentLoaded`, and running that headless needs a far fatter fake DOM than the ~200-line
harness. Cover it with a validator assert on the emitted markup (three rows with the expected
labels, three theme chips) plus one manual click-through.

*Re-home `applyI18n`'s four non-translation duties when it dies:*

| Duty | Disposition |
| --- | --- |
| `html[lang]` | baked by the build — `styles.css:425` depends on it |
| `data-lang-source` (`app.js:336`) | delete — write-only, no readers |
| lang chip `aria-pressed` (`app.js:360-362`) | baked; the build knows the locale |
| `[data-sr-script]` snapshot + `applyScript()` (`app.js:355-358`) | live on `index.html` only (8 card glyphs; no chart page emits the attribute) — call from `init()` directly between 3 and 4; dies in phase 4 |

**4 · Script baking** — `sr()` emits both variants at build; `toCyrillic` runs once per string
here instead of 67 times per pageview per user. Delete from the client: both transliteration
maps, three regex passes, `srGrammarHTML`'s depth tracker, and `applyScript`'s rewrite loop
(`assets/app.js:55-174`) — which disposes of the lossy `data-sr-source` re-derivation
(`app.js:355-358`) by deletion rather than repair. **Add `data-script` to `theme-init.js` in this phase** (see
Architecture) — the CSS switch is live from here, and without it every returning Cyrillic user
watches the page repaint.

*Acceptance criteria:* gzipped page sizes measured (below), and the attribute-less rendering
verified to show exactly one script.

**5 · Client trim** — surviving: `theme-init` (blocking, sets `data-theme`, `data-script` and
the language redirect pre-paint), settings-menu *behaviour* only (`wireSettingsMenu` — the
markup arrived at phase 2), popover registry, case-strip visibility and scroll-spy
(`cases.js:345-425`). No mode toggles remain. ~400 lines of vanilla, bundled with
`bun build --minify`. The case strip becomes build-time anchors.

*Popover bodies bake as inert `<template>` nodes; the shell clones instead of assigning
`innerHTML`* (`app.js:286`). This is cheaper than it sounds and cheaper than today: the full
prep-card set is 34,113 raw bytes but **2,719 B gzipped**, against the 5,782 B gz that
`prepositions-data.js` + `prepositions-shared.js` cost on the wire right now
(`cases.html:68-69`). All six registrations (`alphabet.js:38`, `verbs.js:204`,
`pitch-stress.js:163`, `aspect.js:142`, `cases.js:435` and `:447`) are static index lookups
into constant data, so the trigger set is build-time enumerable in every case.

**5.5 · Delete the old tree** — `charts/*.html`, `index.html`, `assets/app.js`,
`assets/i18n.js`, `assets/charts/*`, `data/glossary.js`. This cannot happen earlier: the
phase-2 harness runs the old renderers under `vm`. It can happen *here*, because
`snapshot:check` compares the build against committed fixtures, not against live old code — so
once the fixtures exist the old tree is dead weight.

It gets its own phase because the plan otherwise never schedules it, and phase 1 already names
what goes wrong if it lingers: `validateLinks` (`:232-259`) resolves absolute hrefs against
`root`, so built pages validate against the *old* tree's assets and pass even when the new ones
are missing. Two copies of the site, and the link checker silently inspecting the wrong one.
Point `validateLinks` at `dist/` in the same commit, and confirm `bun run validate` is still
green with the old tree gone — that is the assertion that the port is actually complete.

**6 · Validator rewrite** — delete the `expect*` helpers (33-58), the four `vm` shims
(71-116), and the i18n graph (118-230), dropping the matching entry points at `:961-970`. Note
the boundary: the per-chart shape checks end at `838`, and `840-947` is glossary POS shapes,
slug collisions and lemma coverage, which survives.

**Keep `validateDataShapes()` (`608-838` plus the aggregator at `949-959`).** `satisfies`
gives presence and shape; it does not give values. Not recoverable from types:
`ALPHABET.length === 30` (`:611`), `row.n === index + 1` (`:614`),
`row.abbr === caseAbbrs[index]` — case order matching the tone map (`:632`),
`CASES.length === 7` (`:628`), `IDECL.cases/sg/pl` all length 7 and aligned (`:653`),
`row.forms.length === 3` for ordinals (`:684`) and possessives (`:787`), the cross-referential
"every verb group conjugates every pronoun" (`:805`), and ~120 non-empty string checks — `''`
satisfies `string`. Types **plus** these, not instead of them. Deletions total ~200 lines.

The TypeScript case is narrow: across ~60
`fix(` commits the recurring classes are CSS/typography, colour-system, a11y, layout and
translation — none are the missing-field/wrong-primitive/typo'd-key class TS prevents, and the
two that did recur are already validator-caught (`validate.mjs:315` for the case→hue map,
`:597-606` for mis-wrapped `<i>`). Its real payoff is the i18n key graph in phase 3. If that
does not justify a language change, `checkJs` + JSDoc `@type` gives the same `satisfies`-grade
checking with zero syntax change to the data files.

Everything valuable survives and improves by importing real modules: `validateTones`
(277-328), fonts/unicode-range (261-275), link resolution (232-259), script roundtrip
(359-509), marker attestation (511-606), glossary POS shapes + slug collisions + lemma
coverage (840-947). Add the `class="sr"` and no-attribute-script asserts from Architecture.

`styles.css` stays one authored global file so the tone audit's line-by-line scan
(`tools/validate.mjs:323`) keeps working — no minifier may collapse it to one line.
Reorganize internally with `@layer`; do **not** split into scoped component styles.

**7 · Ship the CSP** — both blockers are gone: no inline `style=` remains anywhere, and the
false-friends inline redirect (`charts/false-friends.html:11`, the repo's only inline script)
dies with locale routing.

*Rewrite the draft policy, do not uncomment it.* `_headers:46` as written ships a literal
`'sha256-<HASH-OF-INLINE-SCRIPT>'` — not a valid source expression, so parsers discard it —
and `style-src 'unsafe-inline'`, which nothing needs. Ship
`script-src 'self'; style-src 'self'` with the rest unchanged, and verify on a preview deploy.

Add content-hashed CSS/JS filenames so `/assets/*.css` moves from `no-cache` to `immutable`.
The payoff is **one blocking revalidation round-trip before paint, per asset, per pageview** —
`no-cache` means store-then-revalidate, and an unchanged ETag returns a 304 with an empty
body, so the win is latency, not bytes. Hashed CSS must stay
in the same directory or the 12 relative `url('fonts/…')` declarations break. Fonts keep their
stable paths (`/assets/fonts/`, see Architecture), and note `/data/glossary.js` matches no
`Cache-Control` rule in `_headers` today — under the new tree it moves under `src/` and the
question disappears, but do not leave it stranded.

*Re-check `_headers` against the RU tree.* Every rule in it was written when HTML lived at the
root or one directory down; routing adds a whole second tree under `/ru/`. Rather than trust
that `/*.html` still matches `/ru/charts/cases.html`, write the `/ru/` rules explicitly —
`_headers` is fail-open, so a pattern that quietly stops matching costs a wrong `Cache-Control`
with no error anywhere. Confirm on the preview deploy alongside the CSP.

**8 · Sitemap and view transitions** — sitemap with `hreflang` alternates (~20 lines, the same
`flatMap` as the route matrix), and `@view-transition { navigation: auto; }` with an explicit
`prefers-reduced-motion` guard, which is one of the three queries AGENTS.md sanctions.

*The sitemap is launch-critical, not polish.* The site has never been indexed, so launch **is**
first indexing — the one moment where two parallel language trees are either understood as
alternates or filed as duplicates, and the one thing that is not cheap to redo. It pairs with
the per-route `hreflang` and canonical tags in the page head (phase 3); the sitemap alone is
the weaker half, since crawlers read the head first. View transitions are polish and may slip.

*Cut from this phase:*

- **Service worker + `manifest.json`.** A hand-written precache list is incompatible with
  phase 7's content hashing: hashed names change every edit, so a stale entry makes
  `cache.addAll()` reject, SW install fail, and the SW never activate — silently, with no
  error the user or the deploy sees. Unhashed entries throw away the `immutable` win instead.
  It is also the one artifact on a static site that can brick returning users from their own
  device, with no rollback except shipping another SW — which contradicts "`bun run build`
  becomes the only new thing that can fail, and it is ours." If it ever ships, generate the
  list from the build's emitted-file manifest, after hashing is proven in production.
- **`@media print`.** A second rendering at a second width. AGENTS.md:38 bans width queries
  ("Allowed queries: `hover`, `prefers-reduced-motion`, `forced-colors` — capability, never
  width"), AGENTS.md:34 says the mobile layout is *the* layout, and the Premise is literally
  "Replace pinch-zoom PDFs, not write a textbook" — a print sheet re-manufactures the PDF the
  product exists to replace. Meanwhile phase 9 promises Layout carries over unchanged. If
  print has real demand it is a product proposal with an AGENTS.md amendment, not a bullet in
  an infrastructure phase.
- **Jump-to search.** `fold()` is not a search primitive — it exists in one place,
  `validate.mjs:534-538`, normalising `<i>` marker payloads for glossary lookup, and there is
  no index. Shipping search means deciding what is indexed, a ranking function, a combobox
  with full keyboard and ARIA (`aria-activedescendant`, live region, escape/blur), result
  rendering, cross-page anchors that survive the case-strip ids, i18n for its own chrome, and
  a client bundle that partly reverses phases 4 and 5. A week on its own. For nine pages,
  Ctrl+F works, and "Less is more."

**9 · Rewrite AGENTS.md** — non-optional. The `<i>` marker section changes meaning (the marker
is now structural, enforced by the build, not by hand discipline); the script and language
mechanisms are new; the "no build" premise is gone. Layout, Typography, and Colors carry over
unchanged.

**10 · Merge** — deploy to a Cloudflare preview and click through it: both scripts × both
languages, the language redirect with `navigator.languages` set to `ru`, the settings menu,
the popovers, the CSP report in the console. Then merge back into
`redesign/mobile-canonical`.

## Risks

- **The `@font-face` blocks are load-bearing and hand-tuned.** The 12 rules at
  `assets/styles.css:8-103` carry `U+030F` / `U+0311` for the pitch marks — on 4 of the 12,
  the Cyrillic subsets (`:14` Sans normal, `:38` Sans italic, `:62` Serif normal, `:86` Serif
  italic); the 8 latin/latin-ext faces stop at `U+0304/0308/0329`. So the combining
  double-grave and inverted-breve resolve only over a Cyrillic base letter; a Latin specimen
  carrying them falls back to a system font. Copy the rules verbatim, keep `validateLocalFonts`
  asserting the ranges, keep the `/assets/fonts/` prefix, and let no tool near them.
- **HTML grows** by roughly one copy of the Serbian text. Measure gzipped after phase 4; if a
  chart exceeds ~40 KB gz, fall back to attribute-carried alternates for that chart only. The
  one prep-card measurement taken so far is reassuring — baked is 2,719 B gz against 5,782 B
  gz for today's runtime path — because the markup is repetitive and compresses ~12:1. Raw
  byte counts will look alarming and mean nothing.
- **Phase 2 is where regressions hide.** The snapshot diff is the gate, and it only works if
  it compares normalized *HTML* over the full matrix — text-only diffing is blind to
  `data-tone`, which is the entire colour system.
- **Language negotiation is now specified and testable** (see Architecture). `resolveRedirect`
  is pure, with a 114-case table test. What a unit test still cannot cover is that
  `theme-init.js` actually calls it pre-paint on all 19 routes — verify that on the phase-10
  preview with `navigator.languages` forced to `ru`.

## Cost

- **~1,700 lines of renderer are rewritten, not deleted.** `assets/charts/*.js` is 1,625
  lines. Eight of nine port at ~3 lines each, but all 67 `sr*` sites must be classified across
  four emit strategies (phase 2) and every template interpolation classified escaped-vs-raw —
  the data legitimately carries raw HTML (`<mark>` at `cases-data.js:34`, 86 `<i>`
  occurrences, `<strong>` at `cases.js:8`, `<span class="lit">` from `diffHL`), so `html.ts`
  needs a `raw()` escape hatch and every site needs a decision.
- **~740 lines of `charts/*.html` + `index.html` are absorbed into layout code**, not deleted.
- **~600-900 lines of new build and dev infrastructure**, once the dev server, the route
  emitter, `html.ts`, `sr()` and the hashing pass are real. Read that as a floor: hashing,
  the sitemap and the dev server each tend to cost more than their sketch.
- **~200 throwaway lines of snapshot harness.** It works; it is not free.
- **Against ~400 deleted**: ~150-235 lines of client logic and ~200 validator lines.
  `assets/i18n.js` (472 lines) does not count as deleted — phase 3 *ports* it.

Net LOC grows, the deleted lines are simple, and the added lines are a bespoke build system.
**Decide with that number, not a flattering one.** The returns are elsewhere and they are
real: Serbian text in the served document, a translatable `<title>` on a per-language URL,
immutable assets, a shippable CSP, and the 19,212-byte i18n dictionary off the wire. One
devDependency; `bun run build` becomes the only new thing that can fail, and it is ours.

Weigh this against it: the cheap payload wins are already spent, and what is left on the wire
is real renderer and real dictionary. If payload were the whole case for a build system, the
case would be weak. It isn't — prerendering and routes are.

/* The shared preposition layer.

   PREP_GROUPS stays the single authoritative source — it encodes the
   pedagogical grouping the chart renders. The per-lemma index and the
   surface-form resolver are DERIVED from it, so a card can answer "show
   everything `za` does" without a second hand-maintained source and can never
   drift from the chart. */

import { html, raw, sr, type Raw } from '../lib/html.ts';
import { stripDiacritics } from '../lib/script.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { CASE_KEYS, PREP_CASE_ABBR, PREP_GROUPS } from '../content/prepositions.ts';
import type { Localized, PrepUse } from '../lib/types.ts';

/* The case glyph vocabulary, shared by the chart and the card. */
export function prepIcon(kind: string | undefined): string {
  const object = '<rect class="prep-icon-object" x="30" y="18" width="28" height="28"></rect>';
  const dot = (x: number, y: number) => `<circle class="prep-icon-dot" cx="${x}" cy="${y}" r="9"></circle>`;
  const arrow = (d: string) => `<path class="prep-icon-arrow" d="${d}"></path>`;
  const head = (d: string) => `<path class="prep-icon-arrow" d="${d}"></path>`;
  const line = (d: string) => `<path class="prep-icon-line" d="${d}"></path>`;
  const dashed = (d: string) => `<path class="prep-icon-dash" d="${d}"></path>`;
  const icons: Record<string, string> = {
    in: `${object}${dot(44,32)}`,
    into: `${object}${dot(18,32)}${arrow('M26 32H45')}${head('M37 24L47 32L37 40')}`,
    on: `${object.replace('y="18"', 'y="28"')}${dot(44,24)}`,
    onto: `${object.replace('y="18"', 'y="28"')}${dot(19,18)}${arrow('M27 18C34 18 38 21 42 25')}${head('M31 26L44 26L40 14')}`,
    under: `${object.replace('y="18"', 'y="10"')}${dot(44,52)}`,
    'under-motion': `${object.replace('y="18"', 'y="10"')}${dot(18,52)}${arrow('M27 52H44')}${head('M36 44L46 52L36 60')}`,
    over: `${object.replace('y="18"', 'y="30"')}${dot(44,14)}`,
    'over-motion': `${object.replace('y="18"', 'y="30"')}${dot(18,14)}${arrow('M27 14H44')}${head('M36 6L46 14L36 22')}`,
    front: `${object}${dot(22,32)}`,
    'front-motion': `${object}${dot(14,32)}${arrow('M22 32H34')}${head('M26 24L36 32L26 40')}`,
    behind: `<rect class="prep-icon-object" x="28" y="18" width="28" height="28"></rect>${dot(58,36)}`,
    'behind-motion': `<rect class="prep-icon-object" x="28" y="18" width="28" height="28"></rect>${dot(70,36)}${arrow('M68 36H56')}${head('M64 28L54 36L64 44')}`,
    between: `${line('M25 10V54M63 10V54')}${dot(44,32)}`,
    'between-motion': `${line('M25 10V54M63 10V54')}${dot(14,32)}${arrow('M23 32H44')}${head('M36 24L46 32L36 40')}`,
    through: `${object}${arrow('M16 33H70')}${head('M62 25L72 33L62 41')}${dot(24,33)}`,
    up: `${dashed('M20 50L68 14')}${arrow('M28 44L60 20')}${head('M49 18L63 18L59 31')}${dot(24,48)}`,
    down: `${dashed('M20 14L68 50')}${arrow('M28 20L60 44')}${head('M59 33L63 47L49 44')}${dot(24,16)}`,
    out: `<rect class="prep-icon-object" x="20" y="26" width="26" height="26"></rect>${dot(28,39)}${arrow('M36 30C45 14 55 13 67 15')}${head('M58 8L71 15L58 22')}`,
    off: `${object.replace('y="18"', 'y="28"')}${dot(44,24)}${arrow('M39 23C31 22 24 26 19 35')}${head('M17 23L18 38L31 31')}`,
    from: `${object}${dot(56,32)}${arrow('M48 32H16')}${head('M24 24L14 32L24 40')}`,
    toward: `${object}${dot(18,32)}${arrow('M28 32H66')}${head('M58 24L68 32L58 40')}`,
    limit: `${line('M62 12V52')}${dot(22,32)}${arrow('M32 32H58')}${head('M50 24L60 32L50 40')}`,
    with: `${dot(34,32)}${dot(54,32)}`,
    for: `${dot(24,32)}${arrow('M34 32H64')}${head('M56 24L66 32L56 40')}`,
    about: `${object}${arrow('M27 21C35 8 58 9 65 23')}${head('M53 20L66 24L62 11')}`,
    around: `${object}${arrow('M22 32C22 12 66 12 66 32C66 52 22 52 22 32')}${head('M58 25L67 33L58 40')}`,
    near: `${object}${dot(20,32)}`,
    opposite: `${object}${dot(14,32)}${dot(74,32)}${dashed('M23 32H65')}`,
    without: `${object}${dot(44,32)}${line('M26 52L62 12')}`,
    before: `${line('M20 32H68')}${dot(30,32)}${line('M48 18V46')}`,
    after: `${line('M20 32H68')}${line('M40 18V46')}${dot(58,32)}`,
    future: `${line('M16 32H72')}${line('M40 18V46')}${dot(58,32)}${arrow('M45 32H70')}${head('M62 24L72 32L62 40')}`,
  };
  return `<svg class="prep-icon" viewBox="0 0 88 64" aria-hidden="true">${(kind && icons[kind]) || icons.in}</svg>`;
}
export interface PrepUseEntry {
  readonly case: string;
  readonly icon?: string;
  readonly meaning: Localized;
  readonly sr: string;
  readonly tr: Localized;
  readonly group: string;
}

export interface PrepEntity {
  readonly lemma: string;
  readonly display: string;
  readonly variants: readonly string[];
  readonly uses: PrepUseEntry[];
}

/* Canonical key: lowercase + strip diacritics, so 'među' and 'medju' collapse
   to one key. The index keys, the alias keys and normalizePrep() MUST all use
   this — otherwise a diacritic-bearing lemma indexes under one key, resolves
   to another, and its card silently goes missing. */
function prepCanon(s: string): string {
  return stripDiacritics(String(s).trim().toLowerCase());
}

/* Walk PREP_GROUPS once. A lemma is the first slash-variant of its key
   ('s/sa' -> 's'); every variant maps back to it. Repeated rows (za appears in
   position + time) merge their uses under one entity. The row-level icon
   fallback is baked into each use so the card needs no row context. There is
   no row-level tone: colour lives on each use's own case. */
const PREP_BY_LEMMA: Record<string, PrepEntity> = {};
const PREP_ALIAS: Record<string, string> = {};

for (const group of PREP_GROUPS) {
  for (const row of group.rows) {
    const variants = row.prep.split('/').map(prepCanon);
    const lemma = variants[0]!;
    for (const v of variants) PREP_ALIAS[v] = lemma;
    const entity = PREP_BY_LEMMA[lemma] ?? (PREP_BY_LEMMA[lemma] = {
      lemma, display: row.prep, variants, uses: [],
    });
    for (const use of row.uses as readonly PrepUse[]) {
      entity.uses.push({
        case: use.case,
        icon: use.icon ?? row.icon,
        meaning: use.meaning,
        sr: use.sr,
        tr: use.tr,
        group: group.key,
      });
    }
  }
}

/* Surface form (clicked token) -> lemma. Strips a trailing noun ("u grad" ->
   "u"), drops diacritics, then resolves slash-variants via the alias map. */
export function normalizePrep(token: string): string {
  const word = prepCanon(token).split(/[\s/]+/)[0]!;
  return PREP_ALIAS[word] ?? word;
}

export function lookupPrep(token: string): PrepEntity | null {
  return PREP_BY_LEMMA[normalizePrep(token)] ?? null;
}

export const PREP_LEMMAS = PREP_BY_LEMMA;

/* Reuses the chart's .prep-* classes; each use is tone-coloured by its own
   case via data-tone. */
export function renderPrepCard(token: string, lang: Lang): Raw | string {
  const entity = lookupPrep(token);
  if (!entity) return '';
  const t = translator(lang);
  /* The chip reads the long case name, not the PREP_CASE_ABBR short form the
     chart uses. Preserved verbatim through the port — the pre-rewrite card
     looked the table up as `window.PREP_CASE_ABBR`, which a top-level `const`
     never defines, so it always fell through to the name. Fixed separately,
     against the snapshot gate, rather than smuggled in with the port. */
  const abbr = (c: string) => t((CASE_KEYS as Record<string, string>)[c]!).value;
  const uses = entity.uses.map(use => html`
    <div class="prep-use" data-tone="${use.case}">
      <span class="prep-icon-cell">${raw(prepIcon(use.icon))}</span>
      <div class="prep-use-text">
        <div class="prep-use-head">
          <span class="chart-label prep-case">${raw(abbr(use.case))}</span>
          <span class="prep-meaning">${use.meaning[lang] || use.meaning.en}</span>
        </div>
        <div class="chart-example prep-example">
          <span class="sr" lang="sr">${sr(use.sr)}</span>
          <span class="tr">${use.tr[lang] || use.tr.en}</span>
        </div>
      </div>
    </div>`.value).join('');
  return html`
    <article class="prep-card">
      <header class="prep-card-head"><span class="prep-card-name" lang="sr">${sr(entity.display)}</span></header>
      <div class="prep-card-uses">${raw(uses)}</div>
    </article>`;
}

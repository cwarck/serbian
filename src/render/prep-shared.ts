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
import { CASE_KEYS, PREP_GROUPS } from '../content/prepositions.ts';
import type { CaseTone, Localized, PrepUse } from '../lib/types.ts';
import { caseTag } from './chart.ts';

/* The case glyph vocabulary, shared by the chart and the card.

   Open frames, not boxes: a cup (⊔) is a container, a table (⊓) a surface,
   a bar a boundary. The filled dot is the case-bearing referent and takes
   the case colour; a hollow circle is the other party (with, opposite,
   without). Depth is drawn as occlusion: `front` sets the dot over the
   frame's edge, `behind` hides half of it under a paper-filled frame. */
export function prepIcon(kind: string | undefined): string {
  const dot = (x: number, y: number) => `<circle class="prep-icon-dot" cx="${x}" cy="${y}" r="9"></circle>`;
  const hollow = (x: number, y: number) => `<circle class="prep-icon-hollow" cx="${x}" cy="${y}" r="9"></circle>`;
  const arrow = (d: string) => `<path class="prep-icon-arrow" d="${d}"></path>`;
  const head = arrow;
  const frame = (d: string) => `<path class="prep-icon-object" d="${d}"></path>`;
  const solid = (d: string) => `<path class="prep-icon-object prep-icon-solid" d="${d}"></path>`;
  const line = (d: string) => `<path class="prep-icon-line" d="${d}"></path>`;
  const dashed = (d: string) => `<path class="prep-icon-dash" d="${d}"></path>`;
  const cup = frame('M30 16V46H58V16');
  const table = frame('M30 54V30H58V54');
  const shelf = frame('M30 30V10H58V30');
  const bars = line('M25 10V54M63 10V54');
  const box = 'M30 18H58V46H30Z';
  const icons: Record<string, string> = {
    in: `${cup}${dot(44,34)}`,
    into: `${cup}${dot(14,10)}${arrow('M24 10H38C42 10 44 12 44 16V30')}${head('M37 24L44 32L51 24')}`,
    on: `${table}${dot(44,21)}`,
    onto: `${table}${dot(14,8)}${arrow('M24 8H38C42 8 44 10 44 14V24')}${head('M37 18L44 26L51 18')}`,
    under: `${shelf}${dot(44,46)}`,
    'under-motion': `${shelf}${dot(14,46)}${arrow('M23 46H42')}${head('M35 39L43 46L35 53')}`,
    over: `${table}${dot(44,12)}`,
    'over-motion': `${table}${dot(14,42)}${arrow('M14 30V16C14 12 16 10 20 10H40')}${head('M33 3L41 10L33 17')}`,
    front: `${solid(box)}${dot(30,42)}`,
    'front-motion': `${solid(box)}${dot(9,46)}${arrow('M19 46H37')}${head('M30 40L38 46L30 52')}`,
    behind: `${dot(58,24)}${solid(box)}`,
    'behind-motion': `${dot(80,30)}${arrow('M71 30H48')}${head('M66 24L59 30L66 36')}${solid(box)}`,
    between: `${bars}${dot(44,32)}`,
    'between-motion': `${bars}${dot(10,32)}${arrow('M19 32H40')}${head('M33 25L41 32L33 39')}`,
    through: `${frame('M30 46V18H58V46')}${dot(12,32)}${arrow('M21 32H76')}${head('M68 25L77 32L68 39')}`,
    up: `${dashed('M20 50L68 14')}${arrow('M28 44L60 20')}${head('M49 18L63 18L59 31')}${dot(24,48)}`,
    down: `${dashed('M20 14L68 50')}${arrow('M28 20L60 44')}${head('M59 33L63 47L49 44')}${dot(24,16)}`,
    out: `${cup}${dot(44,38)}${arrow('M44 28V14C44 11 46 10 50 10H70')}${head('M63 3L71 10L63 17')}`,
    off: `${table}${dot(44,21)}${arrow('M52 16H62C66 16 68 18 68 22V42')}${head('M61 35L68 43L75 35')}`,
    from: `${line('M70 12V52')}${dot(60,32)}${arrow('M50 32H18')}${head('M26 25L17 32L26 39')}`,
    toward: `${line('M70 12V52')}${dot(14,32)}${arrow('M24 32H52')}${head('M45 25L53 32L45 39')}`,
    limit: `${line('M68 12V52')}${dot(14,32)}${arrow('M24 32H64')}${head('M57 25L65 32L57 39')}`,
    with: `${dot(30,32)}${hollow(56,32)}`,
    for: `${frame('M50 16V46H78V16')}${dot(14,32)}${arrow('M24 32H44')}${head('M37 25L45 32L37 39')}`,
    about: `${frame('M30 18H70V46H30Z')}${line('M38 27H62M38 34H62M38 41H54')}${dot(16,32)}`,
    around: `${cup}${line('M58 12C66 16 72 24 72 32C72 46 60 56 44 56C28 56 16 46 16 32C16 22 22 14 32 10')}${head('M26 4L34 10L27 17')}${dot(16,32)}`,
    near: `${frame('M40 16V46H68V16')}${dot(16,32)}`,
    beside: `${frame('M40 16V46H68V16')}${dot(30,32)}`,
    opposite: `${dot(16,32)}${dashed('M44 12V52')}${hollow(70,32)}`,
    without: `${dot(20,32)}${hollow(58,32)}${line('M46 20L70 44M70 20L46 44')}`,
    before: `${dot(14,32)}${line('M30 14V50')}${frame('M42 20V44H70V20')}`,
    after: `${frame('M18 20V44H46V20')}${line('M58 14V50')}${dot(74,32)}`,
    future: `${line('M12 40H60')}${line('M32 26V54')}${dot(58,26)}${arrow('M52 40H76')}${head('M68 33L77 40L68 47')}`,
    during: `${line('M10 32H78')}${line('M28 20V44M60 20V44')}${dot(44,32)}`,
    fetch: `${frame('M52 16V46H80V16')}${dot(10,32)}${arrow('M22 26H42')}${head('M35 19L43 26L35 33')}${arrow('M42 38H22')}${head('M29 31L21 38L29 45')}`,
    across: `${frame('M36 50V34H56V50')}${dot(12,44)}${arrow('M20 40C28 10 62 10 72 38')}${head('M62 32L73 40L74 28')}`,
    against: `${dot(16,32)}${arrow('M26 32H42')}${head('M35 25L43 32L35 39')}${arrow('M76 32H52')}${head('M59 25L51 32L59 39')}`,
    because: `${frame('M14 16V46H42V16')}${arrow('M46 32H60')}${head('M53 25L61 32L53 39')}${dot(74,32)}`,
    instead: `${hollow(16,32)}${arrow('M28 32H56')}${head('M49 25L57 32L49 39')}${dot(70,32)}`,
    except: `${hollow(16,32)}${hollow(34,32)}${hollow(52,32)}${line('M63 14V50')}${dot(76,32)}`,
    despite: `${line('M46 12V52')}${dot(14,32)}${arrow('M24 32H70')}${head('M62 25L71 32L62 39')}`,
  };
  return `<svg class="prep-icon" viewBox="0 0 88 64" aria-hidden="true">${(kind && icons[kind]) || icons.in}</svg>`;
}
export interface PrepUseEntry {
  readonly case: CaseTone;
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

/* One use row, shared by the chart and the popover card: icon | chip +
   meaning + example. The chip is the universal case-tag, so abbreviation
   and hue resolve from CASES; the sr-only long name serves the icon. */
export function renderPrepUse(use: PrepUse, rowIcon: string | undefined, lang: Lang): Raw {
  const t = translator(lang);
  return html`
    <div class="prep-use" data-tone="${use.case}">
      <span class="prep-icon-cell">
        ${raw(prepIcon(use.icon || rowIcon))}
        <span class="sr-only">${t((CASE_KEYS as Record<string, string>)[use.case]!)}</span>
      </span>
      <div class="prep-use-text">
        <div class="prep-use-head">
          ${caseTag(use.case)}
          <span class="prep-meaning">${use.meaning[lang] || use.meaning.en}</span>
        </div>
        <div class="chart-example prep-example">
          <span class="sr" lang="sr">${sr(use.sr)}</span>
          <span class="tr">${use.tr[lang] || use.tr.en}</span>
        </div>
      </div>
    </div>`;
}

/* The popover card: every use of one lemma, stacked. */
export function renderPrepCard(token: string, lang: Lang): Raw | string {
  const entity = lookupPrep(token);
  if (!entity) return '';
  const uses = entity.uses.map(use => renderPrepUse(use, use.icon, lang).value).join('');
  return html`
    <article class="prep-card">
      <header class="prep-card-head"><span class="prep-card-name" lang="sr">${sr(entity.display)}</span></header>
      <div class="prep-card-uses">${raw(uses)}</div>
    </article>`;
}

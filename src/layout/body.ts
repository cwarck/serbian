/* Per-route page bodies: the section wrapper each chart sits in, plus the home
   index. Everything that used to be hand-typed into ten HTML files. */

import { html, raw, sr, type Raw } from '../lib/html.ts';
import { translator } from '../i18n/index.ts';
import { PAGES, routeFor, type Route } from '../lib/routes.ts';
import { cardKey } from './foot.ts';
import type { Chart } from '../render/chart.ts';

/* Home-card glyphs. SIX of the eight carry Serbian and must route through
   sr() — the pre-rewrite page hand-typed them into the HTML with
   `data-sr-script` and rewrote them in place, which is why they were the one
   place the alphabet toggle could silently stop reaching. `1·2·3` and `≠` are
   script-invariant and emit as plain text; the pitch row was never marked. */
interface Card {
  readonly page: string;
  readonly glyph: Raw;
  readonly chartAttr: string;
  readonly flagship?: boolean;
}

const dual = (before: string, bold: string, after = ''): Raw =>
  raw(`${before ? sr(before).value : ''}<b>${sr(bold).value}</b>${after ? sr(after).value : ''}`);

const CARDS: readonly Card[] = [
  { page: 'alphabet',      chartAttr: 'alphabet',     glyph: dual('A', 'a') },
  { page: 'cases',         chartAttr: 'cases',        glyph: dual('Ko? ', 'Šta?'), flagship: true },
  { page: 'numbers',       chartAttr: 'numbers',      glyph: raw('1·2·<b>3</b>') },
  { page: 'verbs',         chartAttr: 'verbs',        glyph: sr('-am') },
  { page: 'pronouns',      chartAttr: 'pronouns',     glyph: dual('', 'ja', ', ti') },
  { page: 'prepositions',  chartAttr: 'prepositions', glyph: dual('u·', 'na', '·o') },
  { page: 'aspect',        chartAttr: 'aspect',       glyph: sr('Vid') },
  { page: 'pitch-stress',  chartAttr: 'pitch',        glyph: raw('à&nbsp;á&nbsp;<b>ȁ</b>&nbsp;â') },
  { page: 'false-friends', chartAttr: 'false',        glyph: raw('≠') },
];

export function home(route: Route): Raw {
  const t = translator(route.lang);
  const cards = CARDS
    .filter(card => PAGES.find(p => p.name === card.page)!.langs.includes(route.lang))
    .map(card => {
      const target = routeFor(PAGES.find(p => p.name === card.page)!, route.lang);
      return html`
    <li${card.flagship ? raw(' class="flagship"') : ''}><a class="chart-card" href="${target.path}">
      <span class="chart-glyph" data-chart="${card.chartAttr}" aria-hidden="true">${card.glyph}</span>
      <span class="chart-meta">
        <h2>${t(cardKey(card.page))}</h2>
        <span class="chart-note">${t(noteKey(card.page))}</span>
      </span>
    </a></li>`;
    });

  return html`
  <h1 class="sr-only">${t('nav.brand')}</h1>
  <ol class="chart-grid" aria-label="${t('chart.index.label')}">
${cards}
  </ol>
`;
}

function noteKey(name: string): string {
  const key = name === 'pitch-stress' ? 'pitch'
    : name === 'false-friends' ? 'falseFriends'
    : name;
  return `card.${key}.note`;
}

/* Each chart's own wrapper, verbatim from the shell it replaces. */
export interface ChartLayout {
  /* Markup outside <main> (the cases strip is a sibling landmark). */
  readonly beforeMain?: (mounts: Record<string, string>, route: Route) => Raw;
  readonly section: (mounts: Record<string, string>, route: Route) => Raw;
  readonly mainClass?: string;
}

function mount(id: string, chart: Chart, mounts: Record<string, string>, attrs = ''): Raw {
  const extra = chart.mountAttrs?.[id];
  const rendered = extra
    ? Object.entries(extra).map(([k, v]) => ` ${k}="${v}"`).join('')
    : '';
  return raw(`<div id="${id}"${attrs}${rendered}>${mounts[id] ?? ''}</div>`);
}

export function chartBody(chart: Chart, mounts: Record<string, string>, route: Route): {
  main: Raw; beforeMain?: Raw; mainClass?: string;
} {
  const t = translator(route.lang);
  const h1 = (key: string) => html`<h1 class="sr-only">${t(key)}</h1>`;

  switch (chart.name) {
    case 'alphabet':
      return { main: html`
<section class="alph-section">
  <div class="shell">
    ${h1('page.alphabet.h1')}
    <div class="alph-legend">
      <span><span class="alph-mark unique">SR</span><span>${t('alph.legend.unique')}</span></span>
      <span><span class="alph-mark diff">!=</span><span>${t('alph.legend.diff')}</span></span>
    </div>

    ${raw(`<div class="alph-grid" id="alphGrid" aria-label="Serbian alphabet">${mounts['alphGrid'] ?? ''}</div>`)}
  </div>
</section>
` };

    case 'cases':
      return {
        beforeMain: raw(`
<nav class="case-strip" aria-label="Cases">
  <ol class="case-strip-list" id="caseStripList">${mounts['caseStripList'] ?? ''}</ol>
</nav>
`),
        main: html`
<section class="cases-section">
  <div class="shell">

    ${h1('page.cases.h1')}
    ${mount('caseList', chart, mounts)}

    <section class="case-extra" id="extra-pack" aria-label="Off-paradigm endings">
      ${raw(`<div class="extra-pack" id="extraPack">${mounts['extraPack'] ?? ''}</div>`)}
    </section>

  </div>
</section>
`,
      };

    case 'pronouns':
      return { main: html`
<section class="chart-section" aria-label="Serbian pronouns and their forms">
  <div class="shell">
    ${h1('page.pronouns.h1')}
    <div class="chart-panel-grid">
      <section class="chart-panel pron-personal" data-tone="pron-personal">
        <header class="chart-panel-head">
          <h3>${t('pron.personal.title')}</h3>
        </header>
        ${raw(`<div class="pron-table-wrap" id="personalPronouns">${mounts['personalPronouns'] ?? ''}</div>`)}
      </section>

      <section class="chart-panel" data-tone="pron-poss">
        <header class="chart-panel-head">
          <h3>${t('pron.possessive.title')}</h3>
        </header>
        ${mount('possessives', chart, mounts, ' class="pron-card-grid"')}
      </section>

      <section class="chart-panel" data-tone="pron-demo">
        <header class="chart-panel-head">
          <h3>${t('pron.demo.title')}</h3>
        </header>
        ${raw(`<div class="pron-demo-pack" id="demonstratives">${mounts['demonstratives'] ?? ''}</div>`)}
      </section>

      <section class="chart-panel" data-tone="pron-question">
        <header class="chart-panel-head">
          <h3>${t('pron.question.title')}</h3>
        </header>
        ${raw(`<div class="pron-question-pack" id="questions">${mounts['questions'] ?? ''}</div>`)}
      </section>
    </div>
  </div>
</section>
` };

    default: {
      const spec = SIMPLE[chart.name];
      if (!spec) throw new Error(`no layout for chart "${chart.name}"`);
      const [mountId, wrapperClass, ariaLabel, h1Key] = spec;
      return { main: html`
<section class="chart-section"${ariaLabel ? raw(` aria-label="${ariaLabel}"`) : ''}${chart.name === 'false-friends' ? raw(' data-lang-only="ru"') : ''}>
  <div class="shell">
    ${h1(h1Key)}
    ${raw(`<div class="${wrapperClass}" id="${mountId}">${mounts[mountId] ?? ''}</div>`)}
  </div>
</section>
` };
    }
  }
}

/* [mount id, wrapper class, section aria-label, h1 key] — verbatim from the
   shells these replace. */
const SIMPLE: Record<string, [string, string, string, string] | undefined> = {
  aspect: ['aspectChart', 'chart-layout aspect-layout', 'Serbian verb aspect pairs', 'page.aspect.h1'],
  'false-friends': ['falseFriendsChart', 'chart-layout false-layout', 'Serbian false friends for Russian speakers', 'page.falseFriends.h1'],
  numbers: ['numbersChart', 'chart-layout num-layout', 'Serbian numbers and counting', 'page.numbers.h1'],
  'pitch-stress': ['pitchChart', 'chart-layout pitch-layout', 'Serbian pitch and stress', 'page.pitch.h1'],
  prepositions: ['prepChart', 'chart-layout prep-layout', 'Serbian prepositions', 'page.prepositions.h1'],
  /* verbs is a panel grid, not a chart-layout. */
  verbs: ['verbGrid', 'chart-panel-grid', 'Serbian verbs and conjugation', 'page.verbs.h1'],
};

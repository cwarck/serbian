import { html, raw, sr, type Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { CONTRAST, TIME_ROWS, PATTERNS, PREFIXES, COMMON_PAIRS } from '../content/aspect.ts';
import { gloss, type Chart } from './chart.ts';

type Loc = { en: string; ru: string } | string;

function pick(value: Loc, lang: Lang): string {
  return typeof value === 'string' ? value : (value[lang] || value.en);
}

/* `imp -> perf` and `a / b` render with the separator in its own span so the
   arrow keeps the apparatus voice while the forms stay serif Serbian. */
function srPair(pair: string): Raw {
  return raw(String(pair).split(/( -> | \/ )/g).map(part => {
    if (part === ' -> ' || part === ' / ') return `<span class="chart-sep">${part.trim()}</span>`;
    return `<span>${sr(part).value}</span>`;
  }).join(' '));
}

function example(ex: { sr: string; en: string; ru: string }, lang: Lang): Raw {
  return html`
    <div class="chart-example">
      <span class="sr" lang="sr">${sr(ex.sr)}</span>
      <span class="tr">${pick(ex, lang)}</span>
    </div>
  `;
}

export const chart: Chart = {
  name: 'aspect',
  mounts: (lang: Lang) => {
    const t = translator(lang);
    const ui = (key: string) => t('aspect.' + key);
    const p = (v: Loc) => pick(v, lang);

    const contrast = html`
    <section class="chart-group aspect-contrast" data-tone="aspect-core">
      <header class="chart-group-head"><h3>${ui('contrast')}</h3></header>
      <div class="chart-table">
        ${CONTRAST.map(row => html`
          <article class="chart-row">
            <h4>${p(row.key)}</h4>
            <div class="chart-cell aspect-side" data-label="${ui('imperfective')}">
              <p>${p(row.imp)}</p>
              ${example(row.impEx, lang)}
            </div>
            <div class="chart-cell aspect-side" data-label="${ui('perfective')}">
              <p>${p(row.perf)}</p>
              ${example(row.perfEx, lang)}
            </div>
          </article>
        `)}
      </div>
    </section>
  `;

    const time = html`
    <section class="chart-group aspect-time" data-tone="aspect-time">
      <header class="chart-group-head"><h3>${ui('time')}</h3></header>
      <div class="chart-table">
        ${TIME_ROWS.map(row => html`
          <article class="chart-row">
            <h4>${p(row.tense)}</h4>
            <div class="chart-cell" data-label="${ui('imperfective')}">${example(row.imp, lang)}</div>
            <div class="chart-cell" data-label="${ui('perfective')}">${example(row.perf, lang)}</div>
          </article>
        `)}
      </div>
    </section>
  `;

    const patterns = html`
    <section class="chart-group aspect-patterns" data-tone="aspect-pattern">
      <header class="chart-group-head"><h3>${ui('patterns')}</h3></header>
      <div class="chart-table">
        ${PATTERNS.map(row => html`
          <article class="chart-row">
            <h4>${p(row.pattern)}</h4>
            <div class="chart-form aspect-form aspect-pair" lang="sr">${srPair(`${row.imp} -> ${row.perf}`)}</div>
            <p>${p(row.signal)}</p>
          </article>
        `)}
      </div>
    </section>
  `;

    let noteIdx = 0;
    const prefixRows = PREFIXES.map(row => {
      const idx = row.note ? noteIdx++ : null;
      return html`
      <article class="chart-tile aspect-prefix">
        <header class="aspect-prefix-head">
          <h4 class="chart-form" lang="sr">${sr(row.prefix)}</h4>
          ${row.note
            ? raw(`<button class="tip-chip" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${ui('note').value}" data-aspect-note="${idx}">?</button>`)
            : ''}
        </header>
        <p class="chart-label">${p(row.feel)}</p>
        <ul>
          ${row.pairs.map(pair => html`<li class="chart-form" lang="sr">${srPair(pair)}</li>`)}
        </ul>
      </article>
    `;
    });

    const prefixes = html`
    <section class="chart-group aspect-prefixes" data-tone="aspect-prefix">
      <header class="chart-group-head"><h3>${ui('prefixes')}</h3></header>
      <div class="chart-tiles aspect-prefix-grid">${prefixRows}</div>
    </section>
  `;

    const pairs = html`
    <section class="chart-group aspect-pairs" data-tone="aspect-pairs">
      <header class="chart-group-head"><h3>${ui('pairs')}</h3></header>
      <div class="chart-table">
        ${COMMON_PAIRS.map(row => html`
          <article class="chart-row">
            <h4>${gloss(row.imp, lang)}</h4>
            <div class="chart-form aspect-form aspect-pair" lang="sr">${srPair(`${row.imp} -> ${row.perf}`)}</div>
            ${example(row.ex, lang)}
          </article>
        `)}
      </div>
    </section>
  `;

    return { aspectChart: [contrast, time, patterns, prefixes, pairs].map(x => x.value).join('') };
  },

  popovers: [{
    match: '[data-aspect-note]',
    variant: 'chart-pop',
    render: (attrs, lang) => {
      const notes = PREFIXES.filter(item => item.note).map(item => item.note!);
      const note = notes[Number(attrs['data-aspect-note'])];
      return note ? html`
      <article class="chart-tip">
        <h4>${pick(note.title, lang)}</h4>
        <p>${pick(note.body, lang)}</p>
      </article>
    ` : '';
    },
  }],
};

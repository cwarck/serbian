import { html, raw, sr, type Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { AGREEMENT, CARDINALS, NUMBER_BUILDS, NOUN_COUNTS, ORDINALS } from '../content/numbers.ts';
import { GENDERS, type Cardinal } from '../lib/types.ts';
import { genderUnit, type Chart } from './chart.ts';

function srParts(parts: readonly string[]): Raw {
  return raw(parts.map(part => `<span>${sr(part).value}</span>`).join('<span class="chart-sep">+</span>'));
}

/* The inflecting tail of `hiljadu / dve hiljade` rides in its own <b>. */
function numWord(row: Cardinal): Raw {
  const stem = sr(row.sr);
  return row.end ? raw(`${stem.value}<b class="num-end">${sr(row.end).value}</b>`) : stem;
}

/* Order of magnitude -> background-shade band. Derived from the value so the
   data stays a plain list; the separator in "1 000" is stripped before parsing. */
function numBand(n: string): string {
  const v = parseInt(String(n).replace(/\D/g, ''), 10);
  if (v < 10) return 'ones';
  if (v < 20) return 'teens';
  if (v < 100) return 'tens';
  if (v < 1000) return 'hundreds';
  return 'thousands';
}

export const chart: Chart = {
  name: 'numbers',
  mounts: (lang: Lang) => {
    const t = translator(lang);
    const pick = (v: { en: string; ru: string }) => v[lang] || v.en;

    const cardinals = html`
    <section class="num-cardinals" aria-label="${t('numbers.cardinals')}">
      <div class="num-grid">
        ${CARDINALS.map(row => html`
    <article class="num-cell" data-band="${numBand(row.n)}">
      <span class="num-value">${row.n}</span>
      <span class="chart-form num-word" lang="sr">${numWord(row)}</span>
    </article>
  `)}
      </div>
    </section>
  `;

    const builds = html`
    <section class="chart-group num-builds" data-tone="num-build">
      <header class="chart-group-head">
        <h3>${t('numbers.build')}</h3>
      </header>
      <div class="chart-table">
        ${NUMBER_BUILDS.map(row => html`
          <article class="chart-row">
            <span class="chart-cell num-value" data-label="${t('numbers.number')}">${row.n}</span>
            <span class="chart-cell chart-form num-built" data-label="${t('numbers.parts')}" lang="sr">${srParts(row.parts)}</span>
          </article>
        `)}
      </div>
    </section>
  `;

    const nouns = html`
    <section class="chart-group num-nouns" data-tone="num-noun">
      <header class="chart-group-head">
        <h3>${t('numbers.nouns')}</h3>
      </header>
      <div class="chart-table">
        ${NOUN_COUNTS.map(row => html`
          <article class="chart-row">
            <span class="chart-cell num-value" data-label="${t('numbers.number')}">${row.n}</span>
            <span class="chart-cell num-pattern" data-label="${t('numbers.pattern')}">${pick(row.pattern)}</span>
            <div class="chart-cell num-examples" data-label="${t('numbers.examples')}" lang="sr">
              ${row.examples.map(example => html`<span class="chart-form">${sr(example)}</span>`)}
            </div>
          </article>
        `)}
      </div>
    </section>
  `;

    const agreement = html`
    <section class="chart-group num-agreement" data-tone="num-agreement">
      <header class="chart-group-head">
        <h3>${t('numbers.agreement')}</h3>
      </header>
      <div class="chart-table">
        ${AGREEMENT.map(row => html`
          <article class="chart-row">
            <span class="chart-cell num-value" data-label="${t('numbers.number')}">${row.n}</span>
            <span class="chart-cell num-pattern" data-label="${t('numbers.verb')}">${pick(row.form)}</span>
            <div class="chart-cell" data-label="${t('numbers.examples')}">
              <div class="chart-example">
                <span class="sr" lang="sr">${sr(row.sr)}</span>
                <span class="tr">${pick(row.tr)}</span>
              </div>
            </div>
          </article>
        `)}
      </div>
    </section>
  `;

    const ordinals = html`
    <section class="chart-group num-ordinals" data-tone="num-ordinal">
      <header class="chart-group-head">
        <h3>${t('numbers.ordinals')}</h3>
      </header>
      <div class="chart-table">
        ${ORDINALS.map(row => html`
          <article class="chart-row">
            <span class="chart-cell num-value" data-label="${t('numbers.number')}">${row.n}</span>
            <div class="gender-run">${GENDERS.map((g, idx) =>
              genderUnit(g, t('cases.gender.' + g), html`<span lang="sr">${sr(row.forms[idx] ?? '')}</span>`))}</div>
          </article>
        `)}
      </div>
    </section>
  `;

    return { numbersChart: [cardinals, builds, nouns, agreement, ordinals].map(x => x.value).join('') };
  },
};

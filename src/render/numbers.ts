import { escape, html, raw, sr, srGrammarHTML, srHTML, type Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { CARDINALS, NUMBER_BUILDS, NOUN_COUNTS, ORDINAL_ENDINGS, ORDINALS } from '../content/numbers.ts';
import { CASES } from '../content/cases.ts';
import { GENDERS, type Cardinal, type CaseRow, type CaseTone } from '../lib/types.ts';
import { genderUnit, type Chart } from './chart.ts';

function srParts(parts: readonly string[]): Raw {
  return raw(parts.map(part => `<span>${sr(part).value}</span>`).join('<span class="chart-sep">+</span>'));
}

/* The cases chart's own chip, and deliberately not a copy of it: the
   abbreviation is resolved out of the shared CASES table by tone, so the two
   charts cannot drift. A tone with no case is a build error, never an empty
   chip. */
function caseTag(tone: CaseTone): Raw {
  const row = (CASES as readonly CaseRow[]).find(c => c.tone === tone);
  if (!row) throw new Error(`numbers: no case carries tone ${tone}`);
  return html`<span class="case-tag" data-tone="${tone}">${row.abbr}</span>`;
}

/* The numbers that land in one noun-count band, read as alternatives. Digits,
   not Serbian: they never dual-emit. */
function srTriggers(triggers: readonly string[]): Raw {
  return raw(triggers.map(escape).join('<span class="chart-sep">\u00b7</span>'));
}

/* The inflecting tail of `hiljadu / dve hiljade` rides in its own <b>. */
function numWord(row: Cardinal): Raw {
  const stem = sr(row.sr);
  return row.end ? raw(`${stem.value}<b class="num-end">${sr(row.end).value}</b>`) : stem;
}

function cardHead(title: Raw | string): Raw {
  return html`
    <header class="card-head">
      <div class="card-title"><h3>${title}</h3></div>
    </header>`;
}

/* The six cards, as a PARTITION: each range runs from its own `min` up to
   the next one's, and the last is open. A per-range upper bound left gaps
   (91–99, 101–999, 10 000+), and a cardinal that fell in one rendered on
   no card at all — silently, because a row that simply never matched is
   invisible to the build. `label` is the strip's visible text and a prefix
   of `name`, its accessible one. */
const CARDINAL_RANGES = [
  { name: '0–9', label: '0', min: 0 },
  { name: '10–19', label: '10', min: 10 },
  { name: '20–29', label: '20', min: 20 },
  { name: '30–99', label: '30', min: 30 },
  { name: '100–999', label: '100', min: 100 },
  { name: '1 000+', label: '1 000', min: 1000 },
] as const;

/* Digits only — the separator in "1 000" is stripped before parsing. */
function cardinalValue(n: string): number {
  return Number(n.replace(/\D/g, ''));
}

export const chart: Chart = {
  name: 'numbers',
  mounts: (lang: Lang) => {
    const t = translator(lang);
    const pick = (v: { en: string; ru: string }) => v[lang] || v.en;

    const cardinals = html`
    <section class="num-cardinals card-list" id="cardinalList" aria-label="${t('numbers.cardinals')}">
      ${CARDINAL_RANGES.map((group, index) => html`
        <article class="card num-cardinal-card" id="numbers-${group.min}">
          ${cardHead(group.name)}
          <section class="card-section">
            <div class="card-items">${CARDINALS.filter(row => {
              const next = CARDINAL_RANGES[index + 1];
              const value = cardinalValue(row.n);
              return value >= group.min && (!next || value < next.min);
            }).map(row => html`
              <div class="card-item">
                <div class="sr">${row.n} · <span lang="sr">${numWord(row)}</span></div>
              </div>`)}
            </div>
          </section>
        </article>`)}
    </section>
  `;

    const builds = html`
    <article class="card num-build-card">
      ${cardHead(t('numbers.build'))}
      <section class="card-section">
        <div class="card-items">
          ${NUMBER_BUILDS.map(row => html`
            <div class="card-item">
              <span class="num-value">${row.n}</span>
              <span class="sr num-built" lang="sr">${srParts(row.parts)}</span>
            </div>`)}
        </div>
      </section>
    </article>
  `;

    const nouns = html`
    <article class="card num-agreement-card">
      ${cardHead(t('numbers.agreement'))}
      <section class="card-section num-agreement-nouns">
        <h4 class="card-section-label">${t('numbers.nouns')}</h4>
        <div class="chart-table">
          ${NOUN_COUNTS.map(row => html`
            <article class="chart-row num-band">
              <h5 class="num-band-head">
                <span class="num-value">${srTriggers(row.triggers)}</span>
                ${caseTag(row.case)}
                <span>${t('band.' + row.number)}</span>
              </h5>
              <div class="num-count-run">${GENDERS.map((g, idx) =>
                genderUnit(g, t('cases.gender.' + g), html`<span lang="sr">${sr(row.examples[idx] ?? '')}</span>`))}</div>
            </article>`)}
        </div>
      </section>
      <section class="card-section num-agreement-verbs">
        <h4 class="card-section-label">${t('numbers.verbs')}</h4>
        <div class="chart-table">
          ${NOUN_COUNTS.map(row => html`
            <article class="chart-row num-band">
              <h5 class="num-band-head"><span class="num-value">${srTriggers(row.triggers)}</span></h5>
              <div class="chart-example">
                <span class="sr" lang="sr">${srHTML(row.agreement.sr)}</span>
                <span class="tr">${pick(row.agreement.tr)}</span>
              </div>
            </article>`)}
        </div>
      </section>
    </article>
  `;

    const ordinals = html`
    <article class="card num-ordinal-card">
      ${cardHead(t('numbers.ordinals'))}
      <section class="card-section num-ord-rule">
        <div class="gender-run">${GENDERS.map((g, idx) =>
          genderUnit(g, t('cases.gender.' + g), html`<span lang="sr">${sr(ORDINAL_ENDINGS[idx] ?? '')}</span>`))}</div>
        <p class="gender-band-note">${srGrammarHTML(t('numbers.ordSoft').value)}</p>
      </section>
      <section class="card-section">
        <div class="card-items">
          ${ORDINALS.map(row => html`
            <div class="card-item">
              <div class="sr">${row.n} · <span lang="sr">${sr(row.forms[0])}</span></div>
            </div>`)}
        </div>
      </section>
    </article>
  `;

    const numberStripList = CARDINAL_RANGES.map(group => html`
      <li class="case-strip-cell">
        <a href="#numbers-${group.min}" aria-label="${group.name}"><span class="strip-abbr">${group.label}</span></a>
      </li>`.value).join('');
    return { numberStripList, numbersChart: [cardinals, builds, nouns, ordinals].map(x => x.value).join('') };
  },
};

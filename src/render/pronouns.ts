import { html, raw, sr, type Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { PERSONAL, POSSESSIVES, DEMOS, QUESTIONS } from '../content/pronouns.ts';
import { GENDERS, type PersonalPronoun } from '../lib/types.ts';
import { genderUnit, type Chart } from './chart.ts';

type T = (key: string) => Raw;

/* A combined label like "Acc / Gen" splits on the slash so each half carries
   its own case hue — one hue, one meaning, even inside one cell. */
function colHeader(t: T, key: string, tones: readonly string[]): Raw {
  if (!tones.length) return t(key);
  if (tones.length === 1) return raw(`<span data-tone="${tones[0]}">${t(key).value}</span>`);
  return raw(t(key).value.split('/').map((part, i) => {
    const tone = tones[i];
    return tone ? `<span data-tone="${tone}">${part.trim()}</span>` : part.trim();
  }).join('<span class="pron-slash">/</span>'));
}

/* who/what row-headers ARE the case axis, so they carry the case hues the
   personal table's column headers already use. NOM stays unmarked (ink). */
const KW_TONES: Record<string, readonly string[]> = {
  'case.1.name': ['nom'],
  'case.4.name': ['aku'],
  'case.2.name': ['gen'],
  'pron.datloc': ['dat', 'lok'],
  'case.6.name': ['ins'],
};

const COLUMNS = [
  ['pron.subject', 'subject', ['nom']],
  ['pron.accgen', 'object', ['aku', 'gen']],
  ['pron.datloc', 'datloc', ['dat', 'lok']],
  ['case.6.name', 'inst', ['ins']],
] as const satisfies readonly (readonly [string, keyof PersonalPronoun, readonly string[]])[];

function personalCell(value: string): Raw {
  if (value === '-') return raw('<span class="chart-form pron-dash">-</span>');
  const parts = value.split(',').map(part => part.trim());
  const forms = parts.map((part, idx) => {
    const cls = idx === 0 ? 'chart-form pron-long' : 'chart-form pron-short';
    const comma = idx < parts.length - 1 ? '<span class="pron-comma">,</span>' : '';
    return `<span class="${cls}">${sr(part).value}${comma}</span>`;
  });
  return raw(`<span class="pron-pair" lang="sr">${forms.join(' ')}</span>`);
}

/* The gender axis used to be three columns with a head row. It is three chips
   now: the axis moved from the structure into each cell, so a screen reader
   reads "M njihov" off the content instead of off a columnheader. That is why
   these blocks are no longer ARIA tables — a table whose column headers are
   gone is worse than no table. */
function genderRun(t: T, forms: readonly string[]): Raw {
  return raw(`<div class="gender-run">` + GENDERS.map((g, i) =>
    genderUnit(g, t('cases.gender.' + g), html`<span class="chart-form" lang="sr">${sr(forms[i] ?? '')}</span>`).value
  ).join('') + `</div>`);
}

export const chart: Chart = {
  name: 'pronouns',

  mounts: (lang: Lang) => {
    const t = translator(lang);

    const personalPronouns = html`
    <table class="pron-table">
      <thead>
        <tr>
          ${COLUMNS.map(([key, , tones]) => html`<th class="chart-label" scope="col">${colHeader(t, key, tones)}</th>`)}
        </tr>
      </thead>
      <tbody>${PERSONAL.map(row => html`
    <tr>
      <th scope="row">
        <span class="chart-label">${t(row.label)}</span>
        <span class="chart-form pron-subject" lang="sr">${sr(row.subject)}</span>
      </th>
      ${COLUMNS.slice(1).map(([, prop]) => html`<td>${personalCell(row[prop])}</td>`)}
    </tr>
  `)}</tbody>
    </table>
    <div class="pron-rule-row">
      <p><strong>${t('pron.long.short')}</strong> ${t('pron.long.short.rule')}</p>
      <p><strong><i lang="sr">${sr('svoj')}</i></strong> ${t('pron.svoj.rule')}</p>
    </div>
  `;

    const possessives = html`
    ${POSSESSIVES.map(item => html`
      <article class="pron-poss-card">
        <h4 class="chart-label">${t(item.owner)}</h4>
        ${genderRun(t, item.forms)}
        ${item.note ? html`<p>${t(item.note)}</p>` : ''}
      </article>
    `)}
  `;

    const demonstratives = raw(DEMOS.map(group => html`
    <section class="pron-demo-group">
      <h4 class="chart-label">${t(group.title)}</h4>
      <div class="pron-subtable">
        <div class="chart-pairs">
          ${group.rows.map(row => html`
            <div class="chart-pair pron-matrix-row">
              <span class="chart-label">${t(row.key)}</span>
              ${genderRun(t, row.forms)}
            </div>
          `)}
        </div>
      </div>
    </section>
  `.value).join('') + html`
    <div class="pron-rule-row">
      <p><strong><i lang="sr">${sr('Ovo je...')}</i></strong> ${t('pron.demo.predicate')}</p>
      <p><strong><i lang="sr">${sr('Ovaj pas')}</i></strong> ${t('pron.demo.noun.rule')}</p>
    </div>
  `.value);

    const questions = html`
    <section class="pron-question-block">
      <h4 class="chart-label">${t('pron.whose')}</h4>
      <div class="pron-subtable">
        <div class="chart-pairs">
          ${QUESTIONS.whose.map(row => html`
            <div class="chart-pair pron-matrix-row">
              <span class="chart-label">${t(row.label)}</span>
              ${genderRun(t, row.forms)}
            </div>
          `)}
        </div>
      </div>
    </section>
    <section class="pron-question-block">
      <h4 class="chart-label">${t('pron.who.what')}</h4>
      <div class="pron-kw-table" role="table">
        <div class="chart-label pron-kw-head" role="row"><span role="columnheader"></span><span role="columnheader">${t('pron.who')}</span><span role="columnheader">${t('pron.what')}</span></div>
        ${QUESTIONS.whoWhat.map(row => html`
          <div class="chart-pair pron-kw-row" role="row">
            <span class="chart-label" role="rowheader">${colHeader(t, row.key, KW_TONES[row.key] ?? [])}</span>
            <span class="chart-form" role="cell" lang="sr">${sr(row.who)}</span>
            <span class="chart-form" role="cell" lang="sr">${sr(row.what)}</span>
          </div>
        `)}
      </div>
    </section>
  `;

    return {
      personalPronouns: personalPronouns.value,
      possessives: possessives.value,
      demonstratives: demonstratives.value,
      questions: questions.value,
    };
  },
};

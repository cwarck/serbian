import { html, raw, sr, type Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import {
  PITCH_ACCENTS, PITCH_RULES, PITCH_PARADIGMS, PITCH_PRIORITY, PITCH_READING, PITCH_NOTES,
} from '../content/pitch-stress.ts';
import { gloss, type Chart } from './chart.ts';

type Loc = { en: string; ru: string } | string;

function pick(value: Loc, lang: Lang): string {
  return typeof value === 'string' ? value : (value[lang] || value.en);
}

/* Pitch marks are decoration over the lemma; strip them to look it up. An
   explicit map, NOT combining-mark removal: NFD would also strip the caron off
   č/š/ž and turn čokolada into cokolada, which matches no glossary entry. */
const PITCH_TO_PLAIN: Record<string, string> = {
  "à": "a",
  "á": "a",
  "ā": "a",
  "ȁ": "a",
  "ȃ": "a",
  "è": "e",
  "é": "e",
  "ē": "e",
  "ȅ": "e",
  "ȇ": "e",
  "ì": "i",
  "í": "i",
  "ī": "i",
  "ȉ": "i",
  "ȋ": "i",
  "ò": "o",
  "ó": "o",
  "ō": "o",
  "ȍ": "o",
  "ȏ": "o",
  "ù": "u",
  "ú": "u",
  "ū": "u",
  "ȕ": "u",
  "ȗ": "u",
  "ŕ": "r",
  "ȑ": "r",
  "ȓ": "r",
  "À": "A",
  "Á": "A",
  "Ā": "A",
  "Ȁ": "A",
  "Ȃ": "A",
  "È": "E",
  "É": "E",
  "Ē": "E",
  "Ȅ": "E",
  "Ȇ": "E",
  "Ì": "I",
  "Í": "I",
  "Ī": "I",
  "Ȉ": "I",
  "Ȋ": "I",
  "Ò": "O",
  "Ó": "O",
  "Ō": "O",
  "Ȍ": "O",
  "Ȏ": "O",
  "Ù": "U",
  "Ú": "U",
  "Ū": "U",
  "Ȕ": "U",
  "Ȗ": "U",
  "Ŕ": "R",
  "Ȑ": "R",
  "Ȓ": "R",
};

function stripPitch(text: string): string {
  return String(text).split('').map(ch => PITCH_TO_PLAIN[ch] || ch).join('');
}

export const chart: Chart = {
  name: 'pitch-stress',
  mounts: (lang: Lang) => {
    const t = translator(lang);
    const ui = (key: string) => t('pitch.' + key);
    const p = (v: Loc) => pick(v, lang);

    const noteButton = (id: string) =>
      raw(`<button class="tip-chip" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${ui('note').value}" data-pitch-note="${id}">?</button>`);

    const exampleGloss = (ex: { sr: string; tr?: Loc }) =>
      ex.tr ? p(ex.tr) : gloss(stripPitch(ex.sr), lang);

    const example = (ex: { sr: string; tr?: Loc }) => html`
    <span class="chart-example">
      <span class="sr" lang="sr">${sr(ex.sr)}</span>
      <span class="tr">${exampleGloss(ex)}</span>
    </span>
  `;

    const exampleList = (items: readonly { sr: string; tr?: Loc }[]) =>
      raw(`<div class="pitch-examples">${items.map(ex => example(ex).value).join('')}</div>`);

    const srList = (items: readonly string[]) =>
      raw(`<div class="pitch-sr-list" lang="sr">${items.map(item => `<span class="chart-form">${sr(item).value}</span>`).join('')}</div>`);

    const accents = html`
    <section class="chart-group pitch-accents">
      <header class="chart-group-head"><h3>${ui('accents')}</h3></header>
      <div class="chart-table">
        ${PITCH_ACCENTS.map(row => html`
          <article class="chart-row pitch-accent-card" data-contour="${row.contour.en}">
            <div class="pitch-mark" lang="sr">${row.mark}</div>
            <div class="pitch-accent-body">
              <div class="pitch-accent-meta">
                <span class="pitch-length">${p(row.length)}</span>
                <span class="chart-sep">·</span>
                <span class="chart-label pitch-contour">${p(row.contour)}</span>
                <span class="chart-sep">·</span>
                <span class="chart-label pitch-pattern">${row.pattern}</span>
                ${noteButton(row.note)}
              </div>
              ${exampleList(row.examples)}
            </div>
          </article>
        `)}
      </div>
    </section>
  `;

    const rules = html`
    <section class="chart-group pitch-rules">
      <header class="chart-group-head"><h3>${ui('rules')}</h3></header>
      <div class="chart-table">
        ${PITCH_RULES.map(row => html`
          <article class="chart-row">
            <h4>${p(row.label)} ${noteButton(row.note)}</h4>
            <p>${p(row.fact)}</p>
            <div class="chart-cell" data-label="${ui('examples')}">${srList(row.examples)}</div>
          </article>
        `)}
      </div>
    </section>
  `;

    const paradigms = html`
    <section class="chart-group pitch-paradigms">
      <header class="chart-group-head"><h3>${ui('paradigms')}</h3></header>
      <div class="chart-pairs pitch-paradigm-table">
        <div class="chart-pair pitch-paradigm-row pitch-paradigm-words">
          <span></span>
          ${PITCH_PARADIGMS.map(row => html`
            <span class="pitch-paradigm-head">
              <span class="chart-form" lang="sr">${sr(row.word.sr)}</span>
              ${noteButton(row.note)}
            </span>
          `)}
        </div>
        ${PITCH_PARADIGMS[0]!.cells.map((cell, i) => html`
          <div class="chart-pair pitch-paradigm-row">
            <span class="chart-label">${cell.label}</span>
            ${PITCH_PARADIGMS.map(row => html`<span class="chart-form" lang="sr">${sr(row.cells[i]!.sr)}</span>`)}
          </div>
        `)}
      </div>
    </section>
  `;

    const priority = html`
    <section class="chart-group pitch-priority">
      <header class="chart-group-head"><h3>${ui('priority')}</h3></header>
      <div class="chart-tiles">
        ${PITCH_PRIORITY.map(row => html`
          <article class="chart-tile pitch-advice-row">
            <span class="chart-label pitch-rank">${row.rank}</span>
            <h4 class="chart-label">${p(row.label)} ${row.note ? noteButton(row.note) : ''}</h4>
            <p>${p(row.fact)}</p>
          </article>
        `)}
      </div>
    </section>
  `;

    const reading = html`
    <section class="chart-group pitch-reading">
      <header class="chart-group-head"><h3>${ui('reading')}</h3></header>
      <ol class="chart-tiles pitch-advice-list">
        ${PITCH_READING.map(row => html`
          <li class="chart-tile pitch-advice-row">
            <span class="chart-label pitch-rank">${row.step}</span>
            <p>${p(row.text)}</p>
          </li>
        `)}
      </ol>
    </section>
  `;

    return { pitchChart: [accents, rules, paradigms, priority, reading].map(x => x.value).join('') };
  },

  popovers: [{
    match: '[data-pitch-note]',
    variant: 'chart-pop',
    render: (attrs, lang) => {
      const note = (PITCH_NOTES as Record<string, { title: Loc; body: Loc } | undefined>)[attrs['data-pitch-note']!];
      return note ? html`
      <article class="chart-tip">
        <h4>${pick(note.title, lang)}</h4>
        <p>${pick(note.body, lang)}</p>
      </article>
    ` : '';
    },
  }],
};

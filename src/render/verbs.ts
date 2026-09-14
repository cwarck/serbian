import { html, raw, sr, srHTML, srGrammarHTML, type Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { PRONOUNS, VERB_GROUPS, IRREGULARS, PAST, FUTURE, CLITICS } from '../content/verbs.ts';
import { GENDERS, type PersonForms, type VerbGroup, type Irregular, type Gender, type Number_ } from '../lib/types.ts';
import { gloss, genderUnit, type Chart } from './chart.ts';

const NUMBERS = ['sg', 'pl'] as const satisfies readonly Number_[];

/* PAST.endings is a flat six keyed past.<gender><number>; the bands regroup it
   without touching the data. The keys stay the data's own labels — the chip
   label must come from cases.gender.* so the letter attestation in
   tools/validate.mjs can check it against one dictionary entry per locale. */
function pastEnding(gender: Gender, number: Number_): string {
  return PAST.endings.find(e => e.key === `past.${gender}${number}`)?.ending ?? '';
}

type T = (key: string) => Raw;

/* Paradigm order: SG | PL side by side, three rows (ja|mi, ti|vi, on|oni). */
const PAIR_ORDER = [0, 3, 1, 4, 2, 5];

function personForms(values: PersonForms): readonly string[] {
  return PRONOUNS.map(p => values[p.key as keyof PersonForms]);
}

/* The one paradigm layout on the sheet: a two-column table, number in the
   column headers (never a chip), each cell stacking the pronoun over the
   form. `abstract` marks bare endings, which carry emphasis weight;
   irregular forms are specimens. */
function paradigm(forms: readonly string[], t: T, abstract = false): Raw {
  const cell = (i: number) => `<td><div class="verb-cell">
          <span class="verb-pron" lang="sr">${sr(PRONOUNS[i]!.label).value}</span>
          <span class="verb-form" lang="sr">${sr(forms[i]!).value}</span>
        </div></td>`;
  const rows = [0, 1, 2].map(r => `
        <tr>${cell(PAIR_ORDER[r * 2]!)}${cell(PAIR_ORDER[r * 2 + 1]!)}</tr>`).join('');
  return raw(`<table class="verb-paradigm${abstract ? ' is-abstract' : ''}">
      <thead>
        <tr><th scope="col">${t('band.sg').value}</th><th scope="col">${t('band.pl').value}</th></tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>`);
}

function tipChip(label: Raw, attr: string): Raw {
  return raw(`<button class="tip-chip" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${label.value}" ${attr}>?</button>`);
}

/* A group is named by its 1sg and 3pl endings: -im / -e. */
function groupName(group: VerbGroup): string {
  return `${group.endings.ja} / ${group.endings.oni}`;
}

export const chart: Chart = {
  name: 'verbs',
  mountAttrs: { verbGrid: { class: 'card-list' } },

  mounts: (lang: Lang) => {
    const t = translator(lang);

    const cardHead = (title: Raw, em: Raw, extra: Raw | string = '') => html`
      <header class="card-head">
        <div class="card-title">
          <h3><span lang="sr">${title}</span><em>${em}</em></h3>${raw(String(extra))}
        </div>
      </header>`;

    const examples = (items: readonly { sr: string; en: string; ru: string }[]) =>
      raw(items.map(ex => html`
          <div class="card-item">
            <div class="sr" lang="sr">${sr(ex.sr)}</div>
            <div class="tr">${srGrammarHTML(ex[lang] || ex.en)}</div>
          </div>`.value).join(''));

    /* Only the lang="sr" run is a specimen. The translated term ("past
       participle") is apparatus and the "+" a connector, so both speak sans. */
    const formula = (parts: readonly { sr?: string; key?: string; text?: string }[]) =>
      raw(parts.map(part => {
        if (part.sr) return `<span lang="sr">${sr(part.sr).value}</span>`;
        if (part.key) return `<span class="verb-term">${t(part.key).value}</span>`;
        return part.text ? `<span class="chart-sep">${part.text}</span>` : '';
      }).join(' '));

    const srList = (items: readonly string[]) => raw(items.map(item => sr(item).value).join(', '));

    const regular = (group: VerbGroup) => html`
    <article class="card" data-tone="${group.tone}">
      ${cardHead(sr(groupName(group)), t('verbs.present'))}
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.infinitive')}${group.note
          ? tipChip(t('verbs.note'), `data-verb-note="${group.note}"`) : ''}</h4>
        <p class="verb-cues" lang="sr">${srList(group.patterns)}</p>
      </section>
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.endings')}</h4>
        ${paradigm(personForms(group.endings), t, true)}
      </section>
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.common')}</h4>
        <div class="card-items">${group.verbs.map(verb => html`
          <div class="card-item">
            <div class="sr"><span lang="sr">${sr(verb.lemma)}</span> <span class="chart-sep" aria-hidden="true">→</span> <span lang="sr">${sr(verb.present)}</span></div>
            <div class="tr">${gloss(verb.lemma, lang)}</div>
          </div>`)}
        </div>
      </section>
    </article>
  `;

    const irregular = (item: Irregular, idx: number) => html`
    <article class="card" data-tone="irr">
      ${cardHead(sr(item.title), raw(gloss(item.title, lang)),
        item.full ? tipChip(t('verbs.full.forms'), `data-verb-tip="${idx}"`) : '')}
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.present')}</h4>
        ${paradigm(item.forms, t)}
      </section>
      ${item.negative && item.negative.length ? html`
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.negative')}</h4>
        ${paradigm(item.negative, t)}
      </section>` : ''}
    </article>
  `;

    const past = html`
    <article class="card" data-tone="past">
      ${cardHead(sr('Perfekat'), t('verbs.past'))}
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.formula')}</h4>
        <p class="verb-formula">${formula(PAST.formula)}</p>
      </section>
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.participle')}</h4>
        <div class="verb-bands">${NUMBERS.map(number => html`
          <div class="gender-band">
            <h5 class="chart-label">${t('band.' + number)}</h5>
            <div class="gender-run">${GENDERS.map(gender =>
              genderUnit(gender, t('cases.gender.' + gender),
                html`<span lang="sr">${sr(pastEnding(gender, number))}</span>`))}</div>
            ${number === 'pl' ? html`<p class="gender-band-note">${t('past.mixed')}</p>` : ''}
          </div>`)}
        </div>
      </section>
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.placement')}</h4>
        <div class="card-items">${examples(PAST.examples)}</div>
      </section>
    </article>
  `;

    const future = html`
    <article class="card" data-tone="future">
      ${cardHead(sr('Futur'), t('verbs.future'))}
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.formula')}</h4>
        <p class="verb-formula">${formula(FUTURE.formula)}</p>
      </section>
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.orthography')}</h4>
        <div class="card-items">${examples(FUTURE.examples)}</div>
      </section>
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.merged')}</h4>
        <p class="verb-list" lang="sr">${srList(FUTURE.merged)}</p>
      </section>
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.ici.exception')}</h4>
        <p class="verb-list" lang="sr">${srList(FUTURE.exceptions)}</p>
      </section>
    </article>
  `;

    /* A rule is prose, not a specimen, so it is a labelled body-size section
       rather than a .card-q line. */
    const clitics = html`
    <article class="card verb-clitic" data-tone="clitic">
      ${cardHead(sr('se'), t('verbs.clitics'))}
      <section class="card-section">
        <h4 class="card-section-label">${t('verbs.position')}</h4>
        <p class="verb-rule">${srGrammarHTML(t('verbs.position.rule').value)}</p>
      </section>
      <section class="card-section">
        <h4 class="card-section-label">${t('cases.examples')}</h4>
        <div class="card-items">${CLITICS.map(ex => html`
          <div class="card-item">
            <div class="sr" lang="sr">${srHTML(ex.sr)}</div>
            <div class="tr">${srGrammarHTML(ex[lang] || ex.en)}</div>
          </div>`)}
        </div>
      </section>
    </article>
  `;

    return {
      verbGrid: [...VERB_GROUPS.map(regular), ...IRREGULARS.map(irregular), past, future, clitics]
        .map(x => x.value).join(''),
    };
  },

  popovers: [
    {
      match: '[data-verb-tip]',
      variant: 'chart-pop',
      render: (attrs, lang) => {
        const t = translator(lang);
        const item = IRREGULARS[Number(attrs['data-verb-tip'])];
        return item?.full ? html`
      <article class="chart-tip">
        <h4><span lang="sr">${sr(item.title)}</span> · ${t('verbs.full.forms')}</h4>
        ${paradigm(item.full, t)}
      </article>
    ` : '';
      },
    },
    {
      match: '[data-verb-note]',
      variant: 'chart-pop',
      render: (attrs, lang) => {
        const t = translator(lang);
        const note = attrs['data-verb-note'];
        if (!note || !VERB_GROUPS.some(g => g.note === note)) return '';
        return html`
      <article class="chart-tip">
        <h4>${srGrammarHTML(t(`verbs.${note}.title`).value)}</h4>
        <p>${srGrammarHTML(t(`verbs.${note}.body`).value)}</p>
      </article>
    `;
      },
    },
  ],
};

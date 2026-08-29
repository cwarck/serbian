import { html, raw, sr, srGrammarHTML, type Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { PRONOUNS, VERB_GROUPS, IRREGULARS, PAST, FUTURE, CLITICS } from '../content/verbs.ts';
import type { PersonForms, VerbGroup, Irregular } from '../lib/types.ts';
import { gloss, type Chart } from './chart.ts';

type T = (key: string) => Raw;

/* Paired paradigm order: SG | PL side by side, three visual rows
   (ja|mi, ti|vi, on|oni) inside a .verb-pair-grid container. */
const PAIR_ORDER = [0, 3, 1, 4, 2, 5];

function pronounRows(values: PersonForms): Raw {
  return raw(PAIR_ORDER.map(i => PRONOUNS[i]!).map(p => html`
    <div class="chart-pair">
      <span class="verb-pron" lang="sr">${sr(p.label)}</span>
      <span class="chart-form verb-form" lang="sr">${sr(values[p.key as keyof PersonForms])}</span>
    </div>
  `.value).join(''));
}

function formRows(forms: readonly string[], paired?: boolean): Raw {
  const order = paired ? PAIR_ORDER : forms.map((_, i) => i);
  return raw(order.map(i => html`
    <div class="chart-pair">
      <span class="verb-pron" lang="sr">${sr(PRONOUNS[i]!.label)}</span>
      <span class="chart-form verb-form" lang="sr">${sr(forms[i]!)}</span>
    </div>
  `.value).join(''));
}

export const chart: Chart = {
  name: 'verbs',
  mounts: (lang: Lang) => {
    const t = translator(lang);

    const examples = (items: readonly { sr: string; en: string; ru: string }[]) =>
      raw(items.map(ex => html`
    <div class="chart-example verb-example">
      <span class="sr" lang="sr">${sr(ex.sr)}</span>
      <span class="tr">${srGrammarHTML(ex[lang] || ex.en)}</span>
    </div>
  `.value).join(''));

    /* Only the lang="sr" run is a specimen. The translated term ("past
       participle") is apparatus and the "+" a connector, so both speak sans. */
    const formula = (parts: readonly { sr?: string; key?: string; text?: string }[]) =>
      raw(parts.map(part => {
        if (part.sr) return `<span lang="sr">${sr(part.sr).value}</span>`;
        if (part.key) return `<span class="verb-term">${t(part.key).value}</span>`;
        return part.text ? `<span class="chart-sep">${part.text}</span>` : '';
      }).join(' '));

    const regular = (group: VerbGroup) => html`
    <article class="chart-panel verb-col" data-tone="${group.tone}">
      <header class="chart-panel-head">
        <span class="chart-label">${t('verbs.present')}</span>
        <h3>${group.title}</h3>
      </header>
      <div class="chart-pairs verb-pair-grid" aria-label="${t('verbs.endings')}">
        ${pronounRows(group.endings)}
      </div>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.inf.cues')}</h4>
        <div class="verb-patterns">
          ${group.patterns.map(pattern => html`<span class="verb-pattern" lang="sr">${sr(pattern)}</span>`)}
        </div>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.common')}</h4>
        <ul class="verb-list verb-list-glossed">
          ${group.verbs.map(verb => html`
            <li>
              <span class="verb-lemma" lang="sr">${sr(verb.lemma)}</span>
              <span class="verb-stem" lang="sr">${sr(verb.present)}</span>
              <span class="verb-gloss">${gloss(verb.lemma, lang)}</span>
            </li>
          `)}
        </ul>
      </section>
      <section class="verb-block verb-block-example">
        <header class="verb-lemma-head">
          <span class="chart-label">${t('verbs.example')}</span>
          <h4 class="sr-head" lang="sr">${sr(group.example.infinitive)}</h4>
        </header>
        <div class="chart-pairs verb-pair-grid">
          ${pronounRows(group.example.forms)}
        </div>
      </section>
    </article>
  `;

    const irregulars = html`
    <article class="chart-panel verb-col" data-tone="irr">
      <header class="chart-panel-head">
        <span class="chart-label">${t('verbs.present')}</span>
        <h3>${t('verbs.irregulars')}</h3>
      </header>
      <div class="verb-mini-list">${IRREGULARS.map((item: Irregular, idx) => html`
    <section class="verb-mini">
      <header class="verb-lemma-head">
        <h4 class="sr-head" lang="sr">${sr(item.title)}</h4>
        ${item.full
          ? raw(`<button class="tip-chip" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${t('verbs.full.forms').value}" data-verb-tip="${idx}">?</button>`)
          : ''}
      </header>
      <div class="chart-pairs verb-pair-grid">
        ${formRows(item.forms, true)}
      </div>
      ${item.negative && item.negative.length ? html`
        <div class="verb-negative">
          <span class="chart-label">${t('verbs.negative')}</span>
          <p lang="sr">${raw(item.negative.map(form => sr(form).value).join(', '))}</p>
        </div>` : ''}
    </section>
  `)}</div>
    </article>
  `;

    const past = html`
    <article class="chart-panel verb-col" data-tone="past">
      <header class="chart-panel-head">
        <span class="chart-label">${t('verbs.tense')}</span>
        <h3>${t('verbs.past')}</h3>
      </header>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.formula')}</h4>
        <p class="verb-formula">${formula(PAST.formula)}</p>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.placement')}</h4>
        <div class="verb-examples">${examples(PAST.examples)}</div>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.participle')}</h4>
        <div class="chart-pairs verb-pair-grid">
          ${PAIR_ORDER.map(i => PAST.endings[i]!).map(item => html`
            <div class="chart-pair">
              <span class="chart-label">${t(item.key)}</span>
              <span class="chart-form verb-form">${sr(item.ending)}</span>
            </div>
          `)}
        </div>
      </section>
    </article>
  `;

    const future = html`
    <article class="chart-panel verb-col" data-tone="future">
      <header class="chart-panel-head">
        <span class="chart-label">${t('verbs.tense')}</span>
        <h3>${t('verbs.future')}</h3>
      </header>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.formula')}</h4>
        <p class="verb-formula">${formula(FUTURE.formula)}</p>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.orthography')}</h4>
        <div class="verb-examples">${examples(FUTURE.examples)}</div>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.merged')}</h4>
        <p class="verb-list" lang="sr">${raw(FUTURE.merged.map(item => sr(item).value).join(', '))}</p>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.ici.exception')}</h4>
        <p class="verb-list" lang="sr">${raw(FUTURE.exceptions.map(item => sr(item).value).join(', '))}</p>
      </section>
    </article>
  `;

    const clitics = html`
    <article class="chart-panel verb-col" data-tone="clitic">
      <header class="chart-panel-head">
        <span class="chart-label">${t('verbs.clitics')}</span>
        <h3 lang="sr">${sr('se')}</h3>
      </header>
      <section class="verb-block">
        <p class="verb-note">${srGrammarHTML(t('verbs.se.rule').value)}</p>
        <div class="verb-examples">${raw(CLITICS.map(s => `<div class="chart-example verb-example"><span class="sr" lang="sr">${sr(s).value}</span></div>`).join(''))}</div>
      </section>
    </article>
  `;

    return {
      verbGrid: [...VERB_GROUPS.map(regular), irregulars, past, future, clitics]
        .map(x => x.value).join(''),
    };
  },

  popovers: [{
    match: '[data-verb-tip]',
    variant: 'chart-pop',
    render: (attrs, lang) => {
      const t = translator(lang);
      const item = IRREGULARS[Number(attrs['data-verb-tip'])];
      return item?.full ? html`
      <article class="chart-tip">
        <h4><span lang="sr">${sr(item.title)}</span> · ${t('verbs.full.forms')}</h4>
        <div class="chart-pairs">${formRows(item.full)}</div>
      </article>
    ` : '';
    },
  }],
};

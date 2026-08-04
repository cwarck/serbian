function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function t(key) { return dict()[key] || ''; }
function currentLang() { return document.documentElement.getAttribute('lang') || 'en'; }
/* Paired paradigm order: SG | PL side by side, three visual rows
   (ja|mi, ti|vi, on|oni) inside a .verb-pair-grid container. */
const PAIR_ORDER = [0, 3, 1, 4, 2, 5];

function pronounRows(values) {
  return PAIR_ORDER.map(i => PRONOUNS[i]).map(p => `
    <div class="chart-pair">
      <span class="verb-pron" lang="sr">${SerbianFyi.sr(p.label)}</span>
      <span class="chart-form verb-form" lang="sr">${SerbianFyi.sr(values[p.key])}</span>
    </div>
  `).join('');
}

function formRows(forms, paired) {
  const order = paired ? PAIR_ORDER : forms.map((_, i) => i);
  return order.map(i => `
    <div class="chart-pair">
      <span class="verb-pron" lang="sr">${SerbianFyi.sr(PRONOUNS[i].label)}</span>
      <span class="chart-form verb-form" lang="sr">${SerbianFyi.sr(forms[i])}</span>
    </div>
  `).join('');
}

function examplesHTML(examples) {
  const lang = currentLang();
  return examples.map(ex => `
    <div class="chart-example verb-example">
      <span class="sr" lang="sr">${SerbianFyi.sr(ex.sr)}</span>
      <span class="tr">${SerbianFyi.srGrammarHTML(ex[lang] || ex.en)}</span>
    </div>
  `).join('');
}

/* Only the lang="sr" run is a specimen. The translated term ("past participle")
   is apparatus and the "+" a connector, so both speak sans. */
function formulaHTML(parts) {
  return parts.map(part => {
    if (part.sr) return `<span lang="sr">${SerbianFyi.sr(part.sr)}</span>`;
    if (part.key) return `<span class="verb-term">${t(part.key)}</span>`;
    return part.text ? `<span class="chart-sep">${part.text}</span>` : '';
  }).join(' ');
}

function renderRegularGroup(group) {
  return `
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
          ${group.patterns.map(pattern => `<span class="verb-pattern" lang="sr">${SerbianFyi.sr(pattern)}</span>`).join('')}
        </div>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.common')}</h4>
        <ul class="verb-list verb-list-glossed">
          ${group.verbs.map(verb => `
            <li>
              <span class="verb-lemma" lang="sr">${SerbianFyi.sr(verb)}</span>
              <span class="verb-gloss">${SerbianFyi.glossary.gloss(verb, currentLang())}</span>
            </li>
          `).join('')}
        </ul>
      </section>
      <section class="verb-block verb-block-example">
        <header class="verb-lemma-head">
          <span class="chart-label">${t('verbs.example')}</span>
          <h4 class="sr-head" lang="sr">${SerbianFyi.sr(group.example.infinitive)}</h4>
        </header>
        <div class="chart-pairs verb-pair-grid">
          ${pronounRows(group.example.forms)}
        </div>
      </section>
    </article>
  `;
}

function renderIrregulars() {
  const minis = IRREGULARS.map((item, idx) => `
    <section class="verb-mini">
      <header class="verb-lemma-head">
        <h4 class="sr-head" lang="sr">${SerbianFyi.sr(item.title)}</h4>
        ${item.full ? `<button class="tip-chip" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${t('verbs.full.forms')}" data-verb-tip="${idx}">?</button>` : ''}
      </header>
      <div class="chart-pairs verb-pair-grid">
        ${formRows(item.forms, true)}
      </div>
      ${item.negative.length ? `
        <div class="verb-negative">
          <span class="chart-label">${t('verbs.negative')}</span>
          <p lang="sr">${item.negative.map(form => SerbianFyi.sr(form)).join(', ')}</p>
        </div>` : ''}
    </section>
  `).join('');

  return `
    <article class="chart-panel verb-col" data-tone="irr">
      <header class="chart-panel-head">
        <span class="chart-label">${t('verbs.present')}</span>
        <h3>${t('verbs.irregulars')}</h3>
      </header>
      <div class="verb-mini-list">${minis}</div>
    </article>
  `;
}

function renderPast() {
  return `
    <article class="chart-panel verb-col" data-tone="past">
      <header class="chart-panel-head">
        <span class="chart-label">${t('verbs.tense')}</span>
        <h3>${t('verbs.past')}</h3>
      </header>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.formula')}</h4>
        <p class="verb-formula">${formulaHTML(PAST.formula)}</p>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.placement')}</h4>
        <div class="verb-examples">${examplesHTML(PAST.examples)}</div>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.participle')}</h4>
        <div class="chart-pairs verb-pair-grid">
          ${PAIR_ORDER.map(i => PAST.endings[i]).map(item => `
            <div class="chart-pair">
              <span class="chart-label">${t(item.key)}</span>
              <span class="chart-form verb-form">${SerbianFyi.sr(item.ending)}</span>
            </div>
          `).join('')}
        </div>
      </section>
    </article>
  `;
}

function renderFuture() {
  return `
    <article class="chart-panel verb-col" data-tone="future">
      <header class="chart-panel-head">
        <span class="chart-label">${t('verbs.tense')}</span>
        <h3>${t('verbs.future')}</h3>
      </header>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.formula')}</h4>
        <p class="verb-formula">${formulaHTML(FUTURE.formula)}</p>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.orthography')}</h4>
        <div class="verb-examples">${examplesHTML(FUTURE.examples)}</div>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.merged')}</h4>
        <p class="verb-list" lang="sr">${FUTURE.merged.map(item => SerbianFyi.sr(item)).join(', ')}</p>
      </section>
      <section class="verb-block">
        <h4 class="chart-label">${t('verbs.ici.exception')}</h4>
        <p class="verb-list" lang="sr">${FUTURE.exceptions.map(item => SerbianFyi.sr(item)).join(', ')}</p>
      </section>
    </article>
  `;
}

function renderClitics() {
  return `
    <article class="chart-panel verb-col" data-tone="clitic">
      <header class="chart-panel-head">
        <span class="chart-label">${t('verbs.clitics')}</span>
        <h3 lang="sr">${SerbianFyi.sr('se')}</h3>
      </header>
      <section class="verb-block">
        <p class="verb-note">${SerbianFyi.srGrammarHTML(t('verbs.se.rule'))}</p>
        <div class="verb-examples">${CLITICS.map(sr => `<div class="chart-example verb-example"><span class="sr" lang="sr">${SerbianFyi.sr(sr)}</span></div>`).join('')}</div>
      </section>
    </article>
  `;
}

function renderVerbs() {
  const root = document.getElementById('verbGrid');
  if (!root) return;
  root.innerHTML = [
    ...VERB_GROUPS.map(renderRegularGroup),
    renderIrregulars(),
    renderPast(),
    renderFuture(),
    renderClitics()
  ].join('');
}

/* Irregular full-forms popover — rides the shared popover shell. */
SerbianFyi.popover.register({
  match: '[data-verb-tip]',
  variant: 'chart-pop',
  render: (trigger) => {
    const item = IRREGULARS[+trigger.getAttribute('data-verb-tip')];
    return (item && item.full) ? `
      <article class="chart-tip">
        <h4><span lang="sr">${SerbianFyi.sr(item.title)}</span> · ${t('verbs.full.forms')}</h4>
        <div class="chart-pairs">${formRows(item.full)}</div>
      </article>
    ` : '';
  },
});

document.addEventListener('langchange', renderVerbs);
document.addEventListener('scriptchange', renderVerbs);
renderVerbs();

function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function t(key) { return dict()[key] || ''; }
function currentLang() { return document.documentElement.getAttribute('lang') || 'en'; }
function pronounRows(values, cls) {
  return PRONOUNS.map(p => `
    <div class="${cls}">
      <span class="verb-pron" lang="sr">${SerbianFyi.sr(p.label)}</span>
      <span class="verb-form" lang="sr">${SerbianFyi.sr(values[p.key])}</span>
    </div>
  `).join('');
}

function formRows(forms, cls) {
  return forms.map((form, i) => `
    <div class="${cls}">
      <span class="verb-pron" lang="sr">${SerbianFyi.sr(PRONOUNS[i].label)}</span>
      <span class="verb-form" lang="sr">${SerbianFyi.sr(form)}</span>
    </div>
  `).join('');
}

function examplesHTML(examples) {
  const lang = currentLang();
  return examples.map(ex => `
    <div class="verb-example">
      <span class="sr" lang="sr">${SerbianFyi.sr(ex.sr)}</span>
      <span class="tr">${SerbianFyi.srGrammarHTML(ex[lang] || ex.en)}</span>
    </div>
  `).join('');
}

function formulaHTML(parts) {
  return parts.map(part => {
    if (part.sr) return `<span lang="sr">${SerbianFyi.sr(part.sr)}</span>`;
    if (part.key) return t(part.key);
    return part.text || '';
  }).join(' ');
}

function renderRegularGroup(group) {
  return `
    <article class="verb-col" data-tone="${group.tone}">
      <header class="verb-col-head">
        <span class="verb-kicker">${t('verbs.present')}</span>
        <h3>${group.title}</h3>
      </header>
      <div class="verb-endings" aria-label="${t('verbs.endings')}">
        ${pronounRows(group.endings, 'verb-ending-row')}
      </div>
      <section class="verb-block">
        <h4>${t('verbs.inf.cues')}</h4>
        <div class="verb-patterns">
          ${group.patterns.map(pattern => `<span class="verb-pattern" lang="sr">${SerbianFyi.sr(pattern)}</span>`).join('')}
        </div>
      </section>
      <section class="verb-block">
        <h4>${t('verbs.common')}</h4>
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
        <h4 class="sr-head" lang="sr">${SerbianFyi.sr(group.example.infinitive)}</h4>
        <div class="verb-example-grid">
          ${pronounRows(group.example.forms, 'verb-example-row')}
        </div>
      </section>
    </article>
  `;
}

function renderIrregulars() {
  const minis = IRREGULARS.map((item, idx) => `
    <section class="verb-mini">
      <header class="verb-mini-head">
        <h4 class="sr-head" lang="sr">${SerbianFyi.sr(item.title)}</h4>
        ${item.full ? `<button class="tip-chip" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${t('verbs.full.forms')}" data-verb-tip="${idx}">?</button>` : ''}
      </header>
      <div class="verb-example-grid">
        ${formRows(item.forms, 'verb-example-row')}
      </div>
      ${item.negative.length ? `
        <div class="verb-negative">
          <span class="verb-sub">${t('verbs.negative')}</span>
          <p lang="sr">${item.negative.map(form => SerbianFyi.sr(form)).join(', ')}</p>
        </div>` : ''}
    </section>
  `).join('');

  return `
    <article class="verb-col" data-tone="irr">
      <header class="verb-col-head">
        <span class="verb-kicker">${t('verbs.present')}</span>
        <h3>${t('verbs.irregulars')}</h3>
      </header>
      <div class="verb-mini-list">${minis}</div>
    </article>
  `;
}

function renderPast() {
  return `
    <article class="verb-col" data-tone="past">
      <header class="verb-col-head">
        <span class="verb-kicker">${t('verbs.tense')}</span>
        <h3>${t('verbs.past')}</h3>
      </header>
      <section class="verb-block">
        <h4>${t('verbs.formula')}</h4>
        <p class="verb-formula">${formulaHTML(PAST.formula)}</p>
      </section>
      <section class="verb-block">
        <h4>${t('verbs.placement')}</h4>
        <div class="verb-examples">${examplesHTML(PAST.examples)}</div>
      </section>
      <section class="verb-block">
        <h4>${t('verbs.participle')}</h4>
        <div class="verb-participle-grid">
          ${PAST.endings.map(item => `
            <div>
              <span class="verb-sub">${t(item.key)}</span>
              <span class="verb-form">${SerbianFyi.sr(item.ending)}</span>
            </div>
          `).join('')}
        </div>
      </section>
    </article>
  `;
}

function renderFuture() {
  return `
    <article class="verb-col" data-tone="future">
      <header class="verb-col-head">
        <span class="verb-kicker">${t('verbs.tense')}</span>
        <h3>${t('verbs.future')}</h3>
      </header>
      <section class="verb-block">
        <h4>${t('verbs.formula')}</h4>
        <p class="verb-formula">${formulaHTML(FUTURE.formula)}</p>
      </section>
      <section class="verb-block">
        <h4>${t('verbs.orthography')}</h4>
        <div class="verb-examples">${examplesHTML(FUTURE.examples)}</div>
      </section>
      <section class="verb-block">
        <h4>${t('verbs.merged')}</h4>
        <p class="verb-list" lang="sr">${FUTURE.merged.map(item => SerbianFyi.sr(item)).join(', ')}</p>
      </section>
      <section class="verb-block">
        <h4>${t('verbs.ici.exception')}</h4>
        <p class="verb-list" lang="sr">${FUTURE.exceptions.map(item => SerbianFyi.sr(item)).join(', ')}</p>
      </section>
      <section class="verb-block verb-reflexive">
        <h4 class="sr-head" lang="sr">${SerbianFyi.sr('se')}</h4>
        <p class="verb-note">${SerbianFyi.srGrammarHTML(t('verbs.se.rule'))}</p>
        <div class="verb-examples">${FUTURE.reflexive.map(sr => `<div class="verb-example"><span class="sr" lang="sr">${SerbianFyi.sr(sr)}</span></div>`).join('')}</div>
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
    renderFuture()
  ].join('');
}

/* Irregular full-forms popover — rides the shared popover shell. */
SerbianFyi.popover.register({
  match: '[data-verb-tip]',
  variant: 'verb-pop',
  render: (trigger) => {
    const item = IRREGULARS[+trigger.getAttribute('data-verb-tip')];
    return (item && item.full) ? `
      <article class="verb-tip">
        <h4><span lang="sr">${SerbianFyi.sr(item.title)}</span> · ${t('verbs.full.forms')}</h4>
        <div class="verb-example-grid">${formRows(item.full, 'verb-example-row')}</div>
      </article>
    ` : '';
  },
});

document.addEventListener('langchange', renderVerbs);
document.addEventListener('scriptchange', renderVerbs);
renderVerbs();

function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function t(key) { return dict()[key] || ''; }
function currentLang() { return document.documentElement.getAttribute('lang') || 'en'; }
function srText(text) {
  return window.AtlasSrpski ? window.AtlasSrpski.sr(text) : String(text);
}
function srHTML(html) {
  return window.AtlasSrpski ? window.AtlasSrpski.srHTML(html) : String(html);
}
function srGrammarHTML(html) {
  return window.AtlasSrpski ? window.AtlasSrpski.srGrammarHTML(html) : String(html);
}

function pronounRows(values, cls) {
  return PRONOUNS.map(p => `
    <div class="${cls}">
      <span class="verb-pron">${srText(p.label)}</span>
      <span class="verb-form">${srText(values[p.key])}</span>
    </div>
  `).join('');
}

function formRows(forms, cls) {
  return forms.map((form, i) => `
    <div class="${cls}">
      <span class="verb-pron">${srText(PRONOUNS[i].label)}</span>
      <span class="verb-form">${srText(form)}</span>
    </div>
  `).join('');
}

function examplesHTML(examples) {
  const lang = currentLang();
  return examples.map(ex => `
    <div class="verb-example">
      <span class="sr">${srText(ex.sr)}</span>
      <span class="tr">${srGrammarHTML(ex[lang] || ex.en)}</span>
    </div>
  `).join('');
}

function formulaHTML(parts) {
  return parts.map(part => {
    if (part.sr) return srText(part.sr);
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
          ${group.patterns.map(pattern => `<span class="verb-pattern">${srText(pattern)}</span>`).join('')}
        </div>
      </section>
      <section class="verb-block">
        <h4>${t('verbs.common')}</h4>
        <p class="verb-list">${group.verbs.map(verb => srText(verb)).join(', ')}</p>
      </section>
      <section class="verb-block verb-block-example">
        <h4>${srText(group.example.infinitive)}</h4>
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
        <h4>${srText(item.title)}</h4>
        ${item.full ? `<button class="tip-chip" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${t('verbs.full.forms')}" data-verb-tip="${idx}">?</button>` : ''}
      </header>
      <div class="verb-example-grid">
        ${formRows(item.forms, 'verb-example-row')}
      </div>
      ${item.negative.length ? `
        <div class="verb-negative">
          <span class="verb-sub">${t('verbs.negative')}</span>
          <p>${item.negative.map(form => srText(form)).join(', ')}</p>
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
              <span class="verb-form">${srText(item.ending)}</span>
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
        <p class="verb-list">${FUTURE.merged.map(item => srText(item)).join(', ')}</p>
      </section>
      <section class="verb-block">
        <h4>${t('verbs.ici.exception')}</h4>
        <p class="verb-list">${FUTURE.exceptions.map(item => srText(item)).join(', ')}</p>
      </section>
      <section class="verb-block verb-reflexive">
        <h4>${srText('se')}</h4>
        <p class="verb-note">${srGrammarHTML(t('verbs.se.rule'))}</p>
        <div class="verb-examples">${FUTURE.reflexive.map(sr => `<div class="verb-example"><span class="sr">${srText(sr)}</span></div>`).join('')}</div>
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

(function setupVerbPopover(){
  const pop = document.getElementById('verbPop');
  if (!pop) return;
  const bodyEl = pop.querySelector('#verbPopBody');
  const closeBtn = pop.querySelector('.tip-pop-close');
  let active = null;

  function position() {
    if (!active) return;
    const r = active.getBoundingClientRect();
    const sx = window.scrollX || window.pageXOffset;
    const sy = window.scrollY || window.pageYOffset;
    pop.style.left = '0px'; pop.style.top = '0px';
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    const gutter = 12;
    const vw = document.documentElement.clientWidth;
    let left = r.left + sx + r.width / 2 - pw / 2;
    left = Math.max(sx + gutter, Math.min(left, sx + vw - pw - gutter));
    const spaceBelow = window.innerHeight - r.bottom;
    const placeAbove = spaceBelow < ph + gutter && r.top > ph + gutter;
    pop.style.left = left + 'px';
    pop.style.top = (placeAbove ? r.top + sy - ph - 8 : r.bottom + sy + 8) + 'px';
    pop.dataset.placement = placeAbove ? 'above' : 'below';
  }

  function open(trigger) {
    const item = IRREGULARS[+trigger.getAttribute('data-verb-tip')];
    if (!item || !item.full) return;
    if (active && active !== trigger) active.setAttribute('aria-expanded', 'false');
    active = trigger;
    trigger.setAttribute('aria-expanded', 'true');
    bodyEl.innerHTML = `
      <article class="verb-tip">
        <h4>${srText(item.title)} · ${t('verbs.full.forms')}</h4>
        <div class="verb-example-grid">${formRows(item.full, 'verb-example-row')}</div>
      </article>
    `;
    pop.hidden = false;
    requestAnimationFrame(() => { position(); pop.classList.add('is-open'); });
  }

  function close() {
    const trigger = active;
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', 'false');
    active = null;
    pop.classList.remove('is-open');
    pop.hidden = true;
    return trigger;
  }

  function closeAndReturnFocus() {
    const trigger = close();
    if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-verb-tip]');
    if (trigger) {
      e.preventDefault();
      if (active === trigger) close(); else open(trigger);
      return;
    }
    if (!pop.hidden && !pop.contains(e.target)) close();
  });
  closeBtn.addEventListener('click', closeAndReturnFocus);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || pop.hidden) return;
    e.preventDefault();
    closeAndReturnFocus();
  });
  window.addEventListener('resize', () => { if (!pop.hidden) position(); });
  window.addEventListener('scroll', () => { if (!pop.hidden) position(); }, { passive: true });
  document.addEventListener('langchange', close);
  document.addEventListener('scriptchange', close);
})();

document.addEventListener('langchange', renderVerbs);
document.addEventListener('scriptchange', renderVerbs);
renderVerbs();

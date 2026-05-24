function lang() { return document.documentElement.getAttribute('lang') || 'en'; }
function dict() {
  return (window.I18N && window.I18N[lang()]) || {};
}
function t(key) { return dict()[key] || key; }
function ui(key) { return t('aspect.' + key); }
function pick(value) {
  if (typeof value === 'string') return value;
  return (value && (value[lang()] || value.en)) || '';
}
function srText(text) {
  return window.AtlasSrpski ? window.AtlasSrpski.sr(text) : String(text);
}
function srPair(pair) {
  return String(pair).split(/( -> | \/ )/g).map(part => {
    if (part === ' -> ' || part === ' / ') return `<span class="aspect-arrow">${part.trim()}</span>`;
    return `<span>${srText(part)}</span>`;
  }).join(' ');
}
function exampleHTML(ex) {
  return `
    <div class="aspect-example">
      <span class="sr">${srText(ex.sr)}</span>
      <span class="tr">${pick(ex)}</span>
    </div>
  `;
}
function noteButton(idx) {
  return `<button class="tip-chip aspect-note-btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${ui('note')}" data-aspect-note="${idx}">?</button>`;
}

function renderContrast() {
  return `
    <section class="aspect-group aspect-contrast" data-tone="aspect-core">
      <header class="aspect-group-head"><h3>${ui('contrast')}</h3></header>
      <div class="aspect-compare-head">
        <span></span>
        <span>${ui('imperfective')}</span>
        <span>${ui('perfective')}</span>
      </div>
      <div class="aspect-compare">
        ${CONTRAST.map(row => `
          <article class="aspect-compare-row">
            <h4>${pick(row.key)}</h4>
            <div class="aspect-side" data-aspect="imp" data-label="${ui('imperfective')}">
              <p>${pick(row.imp)}</p>
              ${exampleHTML(row.impEx)}
            </div>
            <div class="aspect-side" data-aspect="perf" data-label="${ui('perfective')}">
              <p>${pick(row.perf)}</p>
              ${exampleHTML(row.perfEx)}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderTime() {
  return `
    <section class="aspect-group aspect-time" data-tone="aspect-time">
      <header class="aspect-group-head"><h3>${ui('time')}</h3></header>
      <div class="aspect-table aspect-time-table">
        <div class="aspect-table-head">
          <span></span><span>${ui('imperfective')}</span><span>${ui('perfective')}</span>
        </div>
        ${TIME_ROWS.map(row => `
          <article class="aspect-table-row">
            <h4>${pick(row.tense)}</h4>
            <div class="aspect-cell" data-label="${ui('imperfective')}">${exampleHTML(row.imp)}</div>
            <div class="aspect-cell" data-label="${ui('perfective')}">${exampleHTML(row.perf)}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPatterns() {
  return `
    <section class="aspect-group aspect-patterns" data-tone="aspect-pattern">
      <header class="aspect-group-head"><h3>${ui('patterns')}</h3></header>
      <div class="aspect-table aspect-pattern-table">
        <div class="aspect-table-head">
          <span>${ui('pattern')}</span><span>${ui('imperfective')}</span><span>${ui('perfective')}</span><span>${ui('signal')}</span>
        </div>
        ${PATTERNS.map(row => `
          <article class="aspect-table-row">
            <h4>${pick(row.pattern)}</h4>
            <span class="aspect-form aspect-cell" data-label="${ui('imperfective')}">${srText(row.imp)}</span>
            <span class="aspect-form aspect-cell" data-label="${ui('perfective')}">${srText(row.perf)}</span>
            <p class="aspect-cell" data-label="${ui('signal')}">${pick(row.signal)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPrefixes() {
  let noteIdx = 0;
  const rows = PREFIXES.map(row => {
    const idx = row.note ? noteIdx++ : null;
    if (row.note) row.note._idx = idx;
    return `
      <article class="aspect-prefix" data-tone="${row.tone}">
        <header class="aspect-prefix-head">
          <h4>${srText(row.prefix)}</h4>
          ${row.note ? noteButton(idx) : ''}
        </header>
        <p>${pick(row.feel)}</p>
        <ul>
          ${row.pairs.map(pair => `<li>${srPair(pair)}</li>`).join('')}
        </ul>
      </article>
    `;
  }).join('');
  return `
    <section class="aspect-group aspect-prefixes" data-tone="aspect-prefix">
      <header class="aspect-group-head"><h3>${ui('prefixes')}</h3></header>
      <div class="aspect-prefix-grid">${rows}</div>
    </section>
  `;
}

function renderPairs() {
  return `
    <section class="aspect-group aspect-pairs" data-tone="aspect-pairs">
      <header class="aspect-group-head"><h3>${ui('pairs')}</h3></header>
      <div class="aspect-table aspect-pair-table">
        <div class="aspect-table-head">
          <span>${ui('meaning')}</span><span>${ui('imperfective')}</span><span>${ui('perfective')}</span><span>${ui('example')}</span>
        </div>
        ${COMMON_PAIRS.map(row => `
          <article class="aspect-table-row">
            <h4>${pick(row.meaning)}</h4>
            <span class="aspect-form aspect-cell" data-label="${ui('imperfective')}">${srText(row.imp)}</span>
            <span class="aspect-form aspect-cell" data-label="${ui('perfective')}">${srText(row.perf)}</span>
            <div class="aspect-cell" data-label="${ui('example')}">${exampleHTML(row.ex)}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderTraps() {
  return `
    <section class="aspect-group aspect-traps" data-tone="aspect-trap">
      <header class="aspect-group-head"><h3>${ui('traps')}</h3></header>
      <div class="aspect-trap-grid">
        ${TRAPS.map(row => `
          <article class="aspect-trap">
            <h4>${pick(row.trap)}</h4>
            <p>${pick(row.why)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderAspect() {
  const root = document.getElementById('aspectChart');
  if (!root) return;
  root.innerHTML = [
    renderContrast(),
    renderTime(),
    renderPatterns(),
    renderPrefixes(),
    renderPairs(),
    renderTraps()
  ].join('');
}

(function setupAspectPopover(){
  const pop = document.getElementById('aspectPop');
  if (!pop) return;
  const bodyEl = pop.querySelector('#aspectPopBody');
  const closeBtn = pop.querySelector('.tip-pop-close');
  let active = null;

  function notes() {
    return PREFIXES.filter(item => item.note).map(item => item.note);
  }
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
    const note = notes()[+trigger.getAttribute('data-aspect-note')];
    if (!note) return;
    if (active && active !== trigger) active.setAttribute('aria-expanded', 'false');
    active = trigger;
    trigger.setAttribute('aria-expanded', 'true');
    bodyEl.innerHTML = `
      <article class="aspect-tip">
        <h4>${pick(note.title)}</h4>
        <p>${pick(note.body)}</p>
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
    const trigger = e.target.closest('[data-aspect-note]');
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

document.addEventListener('langchange', renderAspect);
document.addEventListener('scriptchange', renderAspect);
renderAspect();

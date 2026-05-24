function lang() { return document.documentElement.getAttribute('lang') || 'en'; }
function dict() {
  return (window.I18N && window.I18N[lang()]) || {};
}
function t(key) { return dict()[key] || key; }
function ui(key) { return t('pitch.' + key); }
function pick(value) {
  if (typeof value === 'string') return value;
  return (value && (value[lang()] || value.en)) || '';
}
function noteButton(id) {
  return `<button class="tip-chip pitch-note-btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${ui('note')}" data-pitch-note="${id}">?</button>`;
}
function exampleHTML(ex) {
  return `
    <span class="pitch-example">
      <span class="sr">${AtlasSrpski.sr(ex.sr)}</span>
      <span class="tr">${pick(ex.tr)}</span>
    </span>
  `;
}
function exampleListHTML(items) {
  return `<div class="pitch-examples">${items.map(exampleHTML).join('')}</div>`;
}
function srListHTML(items) {
  return `<div class="pitch-sr-list">${items.map(item => `<span>${AtlasSrpski.sr(item)}</span>`).join('')}</div>`;
}

function renderAccents() {
  return `
    <section class="pitch-group pitch-accents">
      <header class="pitch-group-head"><h3>${ui('accents')}</h3></header>
      <div class="pitch-accent-head" aria-hidden="true">
        <span>${ui('mark')}</span>
        <span>${ui('length')}</span>
        <span>${ui('contour')}</span>
        <span>${ui('pattern')}</span>
        <span>${ui('examples')}</span>
      </div>
      <div class="pitch-accent-grid">
        ${PITCH_ACCENTS.map(row => `
          <article class="pitch-accent-card" data-contour="${row.contour.en}">
            <div class="pitch-mark" data-label="${ui('mark')}">${row.mark}</div>
            <div class="pitch-cell" data-label="${ui('length')}">${pick(row.length)}</div>
            <div class="pitch-cell pitch-contour-cell" data-label="${ui('contour')}">
              <span class="pitch-contour">${pick(row.contour)}</span>
              ${noteButton(row.note)}
            </div>
            <div class="pitch-cell pitch-pattern" data-label="${ui('pattern')}">${row.pattern}</div>
            <div class="pitch-cell" data-label="${ui('examples')}">${exampleListHTML(row.examples)}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderRules() {
  return `
    <section class="pitch-group pitch-rules">
      <header class="pitch-group-head"><h3>${ui('rules')}</h3></header>
      <div class="pitch-table">
        <div class="pitch-table-head">
          <span>${ui('slot')}</span><span>${ui('fact')}</span><span>${ui('examples')}</span>
        </div>
        ${PITCH_RULES.map(row => `
          <article class="pitch-table-row">
            <h4>${pick(row.label)} ${noteButton(row.note)}</h4>
            <p class="pitch-cell" data-label="${ui('fact')}">${pick(row.fact)}</p>
            <div class="pitch-cell" data-label="${ui('examples')}">${srListHTML(row.examples)}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderLength() {
  return `
    <section class="pitch-group pitch-length">
      <header class="pitch-group-head"><h3>${ui('lengths')}</h3></header>
      <div class="pitch-table pitch-length-table">
        <div class="pitch-table-head">
          <span>${ui('type')}</span><span>${ui('marks')}</span><span>${ui('examples')}</span>
        </div>
        ${PITCH_LENGTH_ROWS.map(row => `
          <article class="pitch-table-row">
            <h4>${pick(row.label)} ${row.note ? noteButton(row.note) : ''}</h4>
            <div class="pitch-cell pitch-marks" data-label="${ui('marks')}">${row.marks.map(mark => `<span>${mark}</span>`).join('')}</div>
            <div class="pitch-cell" data-label="${ui('examples')}">${exampleListHTML(row.examples)}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderParadigms() {
  return `
    <section class="pitch-group pitch-paradigms">
      <header class="pitch-group-head"><h3>${ui('paradigms')}</h3></header>
      <div class="pitch-paradigm-grid">
        ${PITCH_PARADIGMS.map(row => `
          <article class="pitch-paradigm">
            <header class="pitch-paradigm-head">
              <h4>${AtlasSrpski.sr(row.word.sr)}</h4>
              <span>${pick(row.word.tr)}</span>
              ${noteButton(row.note)}
            </header>
            <div class="pitch-paradigm-cells">
              ${row.cells.map(cell => `
                <div>
                  <span class="pitch-case">${cell.label}</span>
                  <span class="pitch-form">${AtlasSrpski.sr(cell.sr)}</span>
                </div>
              `).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPriority() {
  return `
    <section class="pitch-group pitch-priority">
      <header class="pitch-group-head"><h3>${ui('priority')}</h3></header>
      <div class="pitch-priority-list">
        ${PITCH_PRIORITY.map(row => `
          <article class="pitch-priority-row">
            <span class="pitch-rank">${row.rank}</span>
            <h4>${pick(row.label)} ${row.note ? noteButton(row.note) : ''}</h4>
            <p>${pick(row.fact)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderReading() {
  return `
    <section class="pitch-group pitch-reading">
      <header class="pitch-group-head"><h3>${ui('reading')}</h3></header>
      <ol class="pitch-reading-list">
        ${PITCH_READING.map(row => `
          <li>
            <span>${row.step}</span>
            <p>${pick(row.text)}</p>
          </li>
        `).join('')}
      </ol>
    </section>
  `;
}

function renderPitch() {
  const root = document.getElementById('pitchChart');
  if (!root) return;
  root.innerHTML = [
    renderAccents(),
    renderRules(),
    renderLength(),
    renderParadigms(),
    renderPriority(),
    renderReading()
  ].join('');
}

(function setupPitchPopover(){
  const pop = document.getElementById('pitchPop');
  if (!pop) return;
  const bodyEl = pop.querySelector('#pitchPopBody');
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
    const note = PITCH_NOTES[trigger.getAttribute('data-pitch-note')];
    if (!note) return;
    if (active && active !== trigger) active.setAttribute('aria-expanded', 'false');
    active = trigger;
    trigger.setAttribute('aria-expanded', 'true');
    bodyEl.innerHTML = `
      <article class="pitch-tip">
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
    const trigger = e.target.closest('[data-pitch-note]');
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

document.addEventListener('langchange', renderPitch);
document.addEventListener('scriptchange', renderPitch);
renderPitch();

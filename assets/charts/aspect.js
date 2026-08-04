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
function srPair(pair) {
  return String(pair).split(/( -> | \/ )/g).map(part => {
    if (part === ' -> ' || part === ' / ') return `<span class="chart-sep">${part.trim()}</span>`;
    return `<span>${SerbianFyi.sr(part)}</span>`;
  }).join(' ');
}
function exampleHTML(ex) {
  return `
    <div class="chart-example">
      <span class="sr" lang="sr">${SerbianFyi.sr(ex.sr)}</span>
      <span class="tr">${pick(ex)}</span>
    </div>
  `;
}
function noteButton(idx) {
  return `<button class="tip-chip aspect-note-btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${ui('note')}" data-aspect-note="${idx}">?</button>`;
}

function renderContrast() {
  return `
    <section class="chart-group aspect-contrast" data-tone="aspect-core">
      <header class="chart-group-head"><h3>${ui('contrast')}</h3></header>
      <div class="chart-table">
        ${CONTRAST.map(row => `
          <article class="chart-row">
            <h4>${pick(row.key)}</h4>
            <div class="chart-cell aspect-side" data-aspect="imp" data-label="${ui('imperfective')}">
              <p>${pick(row.imp)}</p>
              ${exampleHTML(row.impEx)}
            </div>
            <div class="chart-cell aspect-side" data-aspect="perf" data-label="${ui('perfective')}">
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
    <section class="chart-group aspect-time" data-tone="aspect-time">
      <header class="chart-group-head"><h3>${ui('time')}</h3></header>
      <div class="chart-table">
        ${TIME_ROWS.map(row => `
          <article class="chart-row">
            <h4>${pick(row.tense)}</h4>
            <div class="chart-cell" data-label="${ui('imperfective')}">${exampleHTML(row.imp)}</div>
            <div class="chart-cell" data-label="${ui('perfective')}">${exampleHTML(row.perf)}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPatterns() {
  return `
    <section class="chart-group aspect-patterns" data-tone="aspect-pattern">
      <header class="chart-group-head"><h3>${ui('patterns')}</h3></header>
      <div class="chart-table">
        ${PATTERNS.map(row => `
          <article class="chart-row">
            <h4>${pick(row.pattern)}</h4>
            <div class="chart-form aspect-form aspect-pair" lang="sr">${srPair(`${row.imp} -> ${row.perf}`)}</div>
            <p>${pick(row.signal)}</p>
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
      <article class="chart-tile aspect-prefix" data-tone="${row.tone}">
        <header class="aspect-prefix-head">
          <h4 class="chart-form" lang="sr">${SerbianFyi.sr(row.prefix)}</h4>
          ${row.note ? noteButton(idx) : ''}
        </header>
        <p class="chart-label">${pick(row.feel)}</p>
        <ul>
          ${row.pairs.map(pair => `<li class="chart-form" lang="sr">${srPair(pair)}</li>`).join('')}
        </ul>
      </article>
    `;
  }).join('');
  return `
    <section class="chart-group aspect-prefixes" data-tone="aspect-prefix">
      <header class="chart-group-head"><h3>${ui('prefixes')}</h3></header>
      <div class="chart-tiles aspect-prefix-grid">${rows}</div>
    </section>
  `;
}

function renderPairs() {
  return `
    <section class="chart-group aspect-pairs" data-tone="aspect-pairs">
      <header class="chart-group-head"><h3>${ui('pairs')}</h3></header>
      <div class="chart-table">
        ${COMMON_PAIRS.map(row => `
          <article class="chart-row">
            <h4>${SerbianFyi.glossary.gloss(row.imp, lang())}</h4>
            <div class="chart-form aspect-form aspect-pair" lang="sr">${srPair(`${row.imp} -> ${row.perf}`)}</div>
            ${exampleHTML(row.ex)}
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
    renderPairs()
  ].join('');
}

/* Prefix-note popover — rides the shared popover shell. */
SerbianFyi.popover.register({
  match: '[data-aspect-note]',
  variant: 'chart-pop',
  render: (t) => {
    const notes = PREFIXES.filter(item => item.note).map(item => item.note);
    const note = notes[+t.getAttribute('data-aspect-note')];
    return note ? `
      <article class="chart-tip">
        <h4>${pick(note.title)}</h4>
        <p>${pick(note.body)}</p>
      </article>
    ` : '';
  },
});

document.addEventListener('langchange', renderAspect);
document.addEventListener('scriptchange', renderAspect);
renderAspect();

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
const PITCH_TO_PLAIN = {
  'à':'a','á':'a','ā':'a','ȁ':'a','ȃ':'a',
  'è':'e','é':'e','ē':'e','ȅ':'e','ȇ':'e',
  'ì':'i','í':'i','ī':'i','ȉ':'i','ȋ':'i',
  'ò':'o','ó':'o','ō':'o','ȍ':'o','ȏ':'o',
  'ù':'u','ú':'u','ū':'u','ȕ':'u','ȗ':'u',
  'ŕ':'r','ȑ':'r','ȓ':'r',
  'À':'A','Á':'A','Ā':'A','Ȁ':'A','Ȃ':'A',
  'È':'E','É':'E','Ē':'E','Ȅ':'E','Ȇ':'E',
  'Ì':'I','Í':'I','Ī':'I','Ȉ':'I','Ȋ':'I',
  'Ò':'O','Ó':'O','Ō':'O','Ȍ':'O','Ȏ':'O',
  'Ù':'U','Ú':'U','Ū':'U','Ȕ':'U','Ȗ':'U',
  'Ŕ':'R','Ȑ':'R','Ȓ':'R',
};
function stripPitch(text) {
  return String(text).split('').map(ch => PITCH_TO_PLAIN[ch] || ch).join('');
}
function exampleGloss(ex) {
  return ex.tr ? pick(ex.tr) : SerbianFyi.glossary.gloss(stripPitch(ex.sr), lang());
}
function noteButton(id) {
  return `<button class="tip-chip pitch-note-btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${ui('note')}" data-pitch-note="${id}">?</button>`;
}
function exampleHTML(ex) {
  return `
    <span class="chart-example">
      <span class="sr" lang="sr">${SerbianFyi.sr(ex.sr)}</span>
      <span class="tr">${exampleGloss(ex)}</span>
    </span>
  `;
}
function exampleListHTML(items) {
  return `<div class="pitch-examples">${items.map(exampleHTML).join('')}</div>`;
}
function srListHTML(items) {
  return `<div class="pitch-sr-list" lang="sr">${items.map(item => `<span class="chart-form">${SerbianFyi.sr(item)}</span>`).join('')}</div>`;
}

function renderAccents() {
  return `
    <section class="chart-group pitch-accents">
      <header class="chart-group-head"><h3>${ui('accents')}</h3></header>
      <div role="table" style="display:contents">
        <div class="chart-table-head" role="row">
          <span role="columnheader">${ui('mark')}</span>
          <span role="columnheader">${ui('length')}</span>
          <span role="columnheader">${ui('contour')}</span>
          <span role="columnheader">${ui('pattern')}</span>
          <span role="columnheader">${ui('examples')}</span>
        </div>
        <div class="chart-table" role="rowgroup">
          ${PITCH_ACCENTS.map(row => `
            <article class="chart-row pitch-accent-card" data-contour="${row.contour.en}" role="row">
              <div class="chart-cell pitch-mark" data-label="${ui('mark')}" role="cell">${row.mark}</div>
              <div class="chart-cell" data-label="${ui('length')}" role="cell">${pick(row.length)}</div>
              <div class="chart-cell pitch-contour-cell" data-label="${ui('contour')}" role="cell">
                <span class="chart-label pitch-contour">${pick(row.contour)}</span>
                ${noteButton(row.note)}
              </div>
              <div class="chart-cell chart-label pitch-pattern" data-label="${ui('pattern')}" role="cell">${row.pattern}</div>
              <div class="chart-cell" data-label="${ui('examples')}" role="cell">${exampleListHTML(row.examples)}</div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderRules() {
  return `
    <section class="chart-group pitch-rules">
      <header class="chart-group-head"><h3>${ui('rules')}</h3></header>
      <div class="chart-table">
        <div class="chart-table-head">
          <span>${ui('slot')}</span><span>${ui('fact')}</span><span>${ui('examples')}</span>
        </div>
        ${PITCH_RULES.map(row => `
          <article class="chart-row">
            <h4>${pick(row.label)} ${noteButton(row.note)}</h4>
            <p class="chart-cell" data-label="${ui('fact')}">${pick(row.fact)}</p>
            <div class="chart-cell" data-label="${ui('examples')}">${srListHTML(row.examples)}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderParadigms() {
  return `
    <section class="chart-group pitch-paradigms">
      <header class="chart-group-head"><h3>${ui('paradigms')}</h3></header>
      <div class="chart-tiles pitch-paradigm-grid">
        ${PITCH_PARADIGMS.map(row => `
          <article class="chart-tile">
            <header class="chart-label pitch-paradigm-head">
              <h4 class="chart-form" lang="sr">${SerbianFyi.sr(row.word.sr)}</h4>
              <span>${exampleGloss(row.word)}</span>
              ${noteButton(row.note)}
            </header>
            <div class="chart-pairs">
              ${row.cells.map(cell => `
                <div class="chart-pair">
                  <span class="chart-label">${cell.label}</span>
                  <span class="chart-form" lang="sr">${SerbianFyi.sr(cell.sr)}</span>
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
    <section class="chart-group pitch-priority">
      <header class="chart-group-head"><h3>${ui('priority')}</h3></header>
      <div class="chart-tiles">
        ${PITCH_PRIORITY.map(row => `
          <article class="chart-tile pitch-priority-row">
            <span class="chart-label pitch-rank">${row.rank}</span>
            <h4 class="chart-label">${pick(row.label)} ${row.note ? noteButton(row.note) : ''}</h4>
            <p>${pick(row.fact)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderReading() {
  return `
    <section class="chart-group pitch-reading">
      <header class="chart-group-head"><h3>${ui('reading')}</h3></header>
      <ol class="chart-tiles pitch-reading-list">
        ${PITCH_READING.map(row => `
          <li class="chart-pair">
            <span class="chart-label">${row.step}</span>
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
    renderParadigms(),
    renderPriority(),
    renderReading()
  ].join('');
}

/* Pitch-note popover — rides the shared popover shell. */
SerbianFyi.popover.register({
  match: '[data-pitch-note]',
  variant: 'chart-pop',
  render: (t) => {
    const note = PITCH_NOTES[t.getAttribute('data-pitch-note')];
    return note ? `
      <article class="chart-tip">
        <h4>${pick(note.title)}</h4>
        <p>${pick(note.body)}</p>
      </article>
    ` : '';
  },
});

document.addEventListener('langchange', renderPitch);
document.addEventListener('scriptchange', renderPitch);
renderPitch();

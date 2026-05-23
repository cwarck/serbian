function lang() { return document.documentElement.getAttribute('lang') || 'en'; }
function dict() {
  return (window.I18N && window.I18N[lang()]) || {};
}
function t(key) { return dict()[key] || key; }
function pick(value) {
  if (typeof value === 'string') return value;
  return (value && (value[lang()] || value.en)) || '';
}
function srText(text) {
  return window.AtlasSrpski ? window.AtlasSrpski.sr(text) : String(text);
}

function srParts(parts) {
  return parts.map(part => `<span>${srText(part)}</span>`).join('<span class="num-plus">+</span>');
}

function renderNumberGroup(group) {
  const columns = 4;
  const blanks = (columns - (group.rows.length % columns)) % columns;
  const cells = group.rows.map(row => `
    <article class="num-mini">
      <span class="num-value">${row.n}</span>
      <span class="num-word">${srText(row.sr)}</span>
    </article>
  `).join('') + Array.from({ length: blanks }, () => '<article class="num-mini num-mini-empty" aria-hidden="true"></article>').join('');
  return `
    <section class="num-panel num-cardinals" data-tone="${group.tone}">
      <header class="num-panel-head">
        <h3>${t(group.key)}</h3>
      </header>
      <div class="num-mini-grid">
        ${cells}
      </div>
    </section>
  `;
}

function renderBuilds() {
  return `
    <section class="num-panel num-builds" data-tone="num-build">
      <header class="num-panel-head">
        <h3>${t('numbers.build')}</h3>
      </header>
      <div class="num-table num-build-table">
        <div class="num-table-head">
          <span>${t('numbers.number')}</span>
          <span>${t('numbers.parts')}</span>
          <span>${t('numbers.meaning')}</span>
        </div>
        ${NUMBER_BUILDS.map(row => `
          <article class="num-table-row">
            <span class="num-value" data-label="${t('numbers.number')}">${row.n}</span>
            <span class="num-built" data-label="${t('numbers.parts')}">${srParts(row.parts)}</span>
            <span class="num-meaning" data-label="${t('numbers.meaning')}">${pick(row)}</span>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderNounCounts() {
  return `
    <section class="num-panel num-nouns" data-tone="num-noun">
      <header class="num-panel-head">
        <h3>${t('numbers.nouns')}</h3>
      </header>
      <div class="num-table num-noun-table">
        <div class="num-table-head">
          <span>${t('numbers.number')}</span>
          <span>${t('numbers.pattern')}</span>
          <span>${t('numbers.examples')}</span>
        </div>
        ${NOUN_COUNTS.map(row => `
          <article class="num-table-row">
            <span class="num-value" data-label="${t('numbers.number')}">${row.n}</span>
            <span class="num-pattern" data-label="${t('numbers.pattern')}">${pick(row.pattern)}</span>
            <div class="num-examples" data-label="${t('numbers.examples')}">
              ${row.examples.map(example => `<span>${srText(example)}</span>`).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderOrdinals() {
  return `
    <section class="num-panel num-ordinals" data-tone="num-ordinal">
      <header class="num-panel-head">
        <h3>${t('numbers.ordinals')}</h3>
      </header>
      <div class="num-table num-ordinal-table">
        <div class="num-table-head">
          <span>${t('numbers.number')}</span>
          <span data-gender="m">${t('cases.gender.m')}</span>
          <span data-gender="f">${t('cases.gender.f')}</span>
          <span data-gender="n">${t('cases.gender.n')}</span>
        </div>
        ${ORDINALS.map(row => `
          <article class="num-table-row">
            <span class="num-value" data-label="${t('numbers.number')}">${row.n}</span>
            ${row.forms.map((form, idx) => `<span class="num-word" data-label="${t(['cases.gender.m', 'cases.gender.f', 'cases.gender.n'][idx])}">${srText(form)}</span>`).join('')}
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderNumbers() {
  const root = document.getElementById('numbersChart');
  if (!root) return;
  root.innerHTML = [
    ...NUMBER_GROUPS.map(renderNumberGroup),
    renderBuilds(),
    renderNounCounts(),
    renderOrdinals()
  ].join('');
}

document.addEventListener('langchange', renderNumbers);
document.addEventListener('scriptchange', renderNumbers);
renderNumbers();

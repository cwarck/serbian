function lang() { return document.documentElement.getAttribute('lang') || 'en'; }
function dict() {
  return (window.I18N && window.I18N[lang()]) || {};
}
function t(key) { return dict()[key] || key; }
function pick(value) {
  if (typeof value === 'string') return value;
  return (value && (value[lang()] || value.en)) || '';
}
function srParts(parts) {
  return parts.map(part => `<span>${SerbianFyi.sr(part)}</span>`).join('<span class="chart-sep">+</span>');
}

function numWord(row) {
  const stem = SerbianFyi.sr(row.sr);
  return row.end ? `${stem}<b class="num-end">${SerbianFyi.sr(row.end)}</b>` : stem;
}

/* Order of magnitude → background-shade band. Derived from the value so the
   data stays a plain list; the dot in "1.000" is stripped before parsing. */
function numBand(n) {
  const v = parseInt(String(n).replace(/\D/g, ''), 10);
  if (v < 10) return 'ones';
  if (v < 20) return 'teens';
  if (v < 100) return 'tens';
  if (v < 1000) return 'hundreds';
  return 'thousands';
}

function renderCardinals() {
  const cells = CARDINALS.map(row => `
    <article class="num-cell" data-band="${numBand(row.n)}">
      <span class="num-value">${row.n}</span>
      <span class="chart-form num-word" lang="sr">${numWord(row)}</span>
    </article>
  `).join('');
  return `
    <section class="num-cardinals" aria-label="${t('numbers.cardinals')}">
      <div class="num-grid">
        ${cells}
      </div>
    </section>
  `;
}

function renderBuilds() {
  return `
    <section class="chart-group num-builds" data-tone="num-build">
      <header class="chart-group-head">
        <h3>${t('numbers.build')}</h3>
      </header>
      <div class="chart-table">
        ${NUMBER_BUILDS.map(row => `
          <article class="chart-row">
            <span class="chart-cell num-value" data-label="${t('numbers.number')}">${row.n}</span>
            <span class="chart-cell chart-form num-built" data-label="${t('numbers.parts')}" lang="sr">${srParts(row.parts)}</span>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderNounCounts() {
  return `
    <section class="chart-group num-nouns" data-tone="num-noun">
      <header class="chart-group-head">
        <h3>${t('numbers.nouns')}</h3>
      </header>
      <div class="chart-table">
        ${NOUN_COUNTS.map(row => `
          <article class="chart-row">
            <span class="chart-cell num-value" data-label="${t('numbers.number')}">${row.n}</span>
            <span class="chart-cell num-pattern" data-label="${t('numbers.pattern')}">${pick(row.pattern)}</span>
            <div class="chart-cell num-examples" data-label="${t('numbers.examples')}" lang="sr">
              ${row.examples.map(example => `<span class="chart-form">${SerbianFyi.sr(example)}</span>`).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderOrdinals() {
  return `
    <section class="chart-group num-ordinals" data-tone="num-ordinal">
      <header class="chart-group-head">
        <h3>${t('numbers.ordinals')}</h3>
      </header>
      <div class="chart-table">
        ${ORDINALS.map(row => `
          <article class="chart-row">
            <span class="chart-cell num-value" data-label="${t('numbers.number')}">${row.n}</span>
            ${row.forms.map((form, idx) => `<span class="chart-cell chart-form num-word" data-label="${t(['cases.gender.m', 'cases.gender.f', 'cases.gender.n'][idx])}" lang="sr">${SerbianFyi.sr(form)}</span>`).join('')}
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
    renderCardinals(),
    renderBuilds(),
    renderNounCounts(),
    renderOrdinals()
  ].join('');
}

document.addEventListener('langchange', renderNumbers);
document.addEventListener('scriptchange', renderNumbers);
renderNumbers();

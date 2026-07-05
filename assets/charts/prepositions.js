function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function t(key) { return dict()[key] || key; }
function currentLang() { return document.documentElement.getAttribute('lang') || 'en'; }
/* prepIcon() lives in prepositions-shared.js (loaded first) so the card can
   reuse the same glyph vocabulary without pulling in this renderer. */

function caseChip(use) {
  return `<span class="chart-label prep-case" data-case="${use.case}">${PREP_CASE_ABBR[use.case] || t(CASE_KEYS[use.case])}</span>`;
}

function visualHTML(row) {
  const split = row.uses.length > 1 ? ' is-split' : '';
  return `
    <div class="prep-visual-pack${split}">
      ${row.uses.map(use => `
        <span class="prep-icon-cell" data-case="${use.case}">
          ${prepIcon(use.icon || row.icon)}
          <span class="sr-only">${t(CASE_KEYS[use.case])}</span>
        </span>
      `).join('')}
    </div>
  `;
}

function renderUse(use) {
  const lang = currentLang();
  return `
    <div class="prep-use" data-case="${use.case}">
      <div class="prep-use-head">
        ${caseChip(use)}
        <span class="prep-meaning">${use.meaning[lang] || use.meaning.en}</span>
      </div>
      <div class="chart-example prep-example">
        <span class="sr" lang="sr">${SerbianFyi.sr(use.sr)}</span>
        <span class="tr">${use.tr[lang] || use.tr.en}</span>
      </div>
    </div>
  `;
}

const PREP_WIDE_QUERY = '(min-width: 1440px)';

function renderGroup(group) {
  return `
    <section class="chart-group">
      <header class="chart-group-head">
        <h3>${t(group.key)}</h3>
      </header>
      <div class="chart-table">
        <div class="chart-table-head">
          <span>${t('prep.col.visual')}</span>
          <span>${t('prep.col.prep')}</span>
          <span>${t('prep.col.case')}</span>
          <span>${t('prep.col.example')}</span>
        </div>
        ${group.rows.map(row => `
          <article class="chart-row prep-row" data-tone="${row.tone}">
            <div class="prep-visual">${visualHTML(row)}</div>
            <div class="prep-name" lang="sr">${SerbianFyi.sr(row.prep)}</div>
            <div class="prep-uses">${row.uses.map(renderUse).join('')}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPrepChart() {
  const root = document.getElementById('prepChart');
  if (!root) return;
  const groups = PREP_GROUPS.map(renderGroup);
  const isWide = window.matchMedia(PREP_WIDE_QUERY).matches;
  if (!isWide) {
    root.innerHTML = groups.join('');
    return;
  }
  root.innerHTML = [0, 1].map(column => `
    <div class="prep-column">
      ${groups.filter((_, index) => index % 2 === column).join('')}
    </div>
  `).join('');
}

document.addEventListener('langchange', renderPrepChart);
document.addEventListener('scriptchange', renderPrepChart);
window.matchMedia(PREP_WIDE_QUERY).addEventListener('change', renderPrepChart);
renderPrepChart();

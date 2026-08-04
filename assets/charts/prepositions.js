function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function t(key) { return dict()[key] || key; }
function currentLang() { return document.documentElement.getAttribute('lang') || 'en'; }
/* prepIcon() lives in prepositions-shared.js (loaded first) so the card can
   reuse the same glyph vocabulary without pulling in this renderer. */

/* The chip inherits --tone from its use (or card use) — the shared
   [data-tone] map is the only case→hue source. */
function caseChip(use) {
  return `<span class="chart-label prep-case">${PREP_CASE_ABBR[use.case] || t(CASE_KEYS[use.case])}</span>`;
}

/* One row per use: its own icon beside its own chip, meaning and example — the
   same grid the popover card uses. A dual-case preposition (pod, za…) no longer
   detaches its icons from the uses they illustrate. */
function renderUse(use, row) {
  const lang = currentLang();
  return `
    <div class="prep-use" data-tone="${use.case}">
      <span class="prep-icon-cell">
        ${prepIcon(use.icon || row.icon)}
        <span class="sr-only">${t(CASE_KEYS[use.case])}</span>
      </span>
      <div class="prep-use-text">
        <div class="prep-use-head">
          ${caseChip(use)}
          <span class="prep-meaning">${use.meaning[lang] || use.meaning.en}</span>
        </div>
        <div class="chart-example prep-example">
          <span class="sr" lang="sr">${SerbianFyi.sr(use.sr)}</span>
          <span class="tr">${use.tr[lang] || use.tr.en}</span>
        </div>
      </div>
    </div>
  `;
}

function renderGroup(group) {
  return `
    <section class="chart-group">
      <header class="chart-group-head">
        <h3>${t(group.key)}</h3>
      </header>
      <div class="chart-table">
        ${group.rows.map(row => `
          <article class="chart-row prep-row">
            <div class="prep-name" lang="sr">${SerbianFyi.sr(row.prep)}</div>
            <div class="prep-uses">${row.uses.map(use => renderUse(use, row)).join('')}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPrepChart() {
  const root = document.getElementById('prepChart');
  if (!root) return;
  root.innerHTML = PREP_GROUPS.map(renderGroup).join('');
}

document.addEventListener('langchange', renderPrepChart);
document.addEventListener('scriptchange', renderPrepChart);
renderPrepChart();

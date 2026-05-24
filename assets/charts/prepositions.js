function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function t(key) { return dict()[key] || key; }
function currentLang() { return document.documentElement.getAttribute('lang') || 'en'; }
function iconSVG(kind) {
  const object = '<rect class="prep-icon-object" x="30" y="18" width="28" height="28"></rect>';
  const dot = (x, y) => `<circle class="prep-icon-dot" cx="${x}" cy="${y}" r="9"></circle>`;
  const arrow = (d) => `<path class="prep-icon-arrow" d="${d}"></path>`;
  const head = (d) => `<path class="prep-icon-arrow" d="${d}"></path>`;
  const line = (d) => `<path class="prep-icon-line" d="${d}"></path>`;
  const dashed = (d) => `<path class="prep-icon-dash" d="${d}"></path>`;
  const icons = {
    in: `${object}${dot(44,32)}`,
    into: `${object}${dot(18,32)}${arrow('M26 32H45')}${head('M37 24L47 32L37 40')}`,
    on: `${object.replace('y="18"', 'y="28"')}${dot(44,24)}`,
    onto: `${object.replace('y="18"', 'y="28"')}${dot(19,18)}${arrow('M27 18C34 18 38 21 42 25')}${head('M31 26L44 26L40 14')}`,
    under: `${object.replace('y="18"', 'y="10"')}${dot(44,52)}`,
    'under-motion': `${object.replace('y="18"', 'y="10"')}${dot(18,52)}${arrow('M27 52H44')}${head('M36 44L46 52L36 60')}`,
    over: `${object.replace('y="18"', 'y="30"')}${dot(44,14)}`,
    'over-motion': `${object.replace('y="18"', 'y="30"')}${dot(18,14)}${arrow('M27 14H44')}${head('M36 6L46 14L36 22')}`,
    front: `${object}${dot(22,32)}`,
    'front-motion': `${object}${dot(14,32)}${arrow('M22 32H34')}${head('M26 24L36 32L26 40')}`,
    behind: `<rect class="prep-icon-object" x="28" y="18" width="28" height="28"></rect>${dot(58,36)}`,
    'behind-motion': `<rect class="prep-icon-object" x="28" y="18" width="28" height="28"></rect>${dot(70,36)}${arrow('M68 36H56')}${head('M64 28L54 36L64 44')}`,
    between: `${line('M25 10V54M63 10V54')}${dot(44,32)}`,
    'between-motion': `${line('M25 10V54M63 10V54')}${dot(14,32)}${arrow('M23 32H44')}${head('M36 24L46 32L36 40')}`,
    through: `${object}${arrow('M16 33H70')}${head('M62 25L72 33L62 41')}${dot(24,33)}`,
    up: `${dashed('M20 50L68 14')}${arrow('M28 44L60 20')}${head('M49 18L63 18L59 31')}${dot(24,48)}`,
    down: `${dashed('M20 14L68 50')}${arrow('M28 20L60 44')}${head('M59 33L63 47L49 44')}${dot(24,16)}`,
    out: `<rect class="prep-icon-object" x="20" y="26" width="26" height="26"></rect>${dot(28,39)}${arrow('M36 30C45 14 55 13 67 15')}${head('M58 8L71 15L58 22')}`,
    off: `${object.replace('y="18"', 'y="28"')}${dot(44,24)}${arrow('M39 23C31 22 24 26 19 35')}${head('M17 23L18 38L31 31')}`,
    from: `${object}${dot(56,32)}${arrow('M48 32H16')}${head('M24 24L14 32L24 40')}`,
    toward: `${object}${dot(18,32)}${arrow('M28 32H66')}${head('M58 24L68 32L58 40')}`,
    limit: `${line('M62 12V52')}${dot(22,32)}${arrow('M32 32H58')}${head('M50 24L60 32L50 40')}`,
    with: `${dot(34,32)}${dot(54,32)}`,
    for: `${dot(24,32)}${arrow('M34 32H64')}${head('M56 24L66 32L56 40')}`,
    about: `${object}${arrow('M27 21C35 8 58 9 65 23')}${head('M53 20L66 24L62 11')}`,
    around: `${object}${arrow('M22 32C22 12 66 12 66 32C66 52 22 52 22 32')}${head('M58 25L67 33L58 40')}`,
    near: `${object}${dot(20,32)}`,
    opposite: `${object}${dot(14,32)}${dot(74,32)}${dashed('M23 32H65')}`,
    without: `${object}${dot(44,32)}${line('M26 52L62 12')}`,
    before: `${line('M20 32H68')}${dot(30,32)}${line('M48 18V46')}`,
    after: `${line('M20 32H68')}${line('M40 18V46')}${dot(58,32)}`,
    future: `${line('M16 32H72')}${line('M40 18V46')}${dot(58,32)}${arrow('M45 32H70')}${head('M62 24L72 32L62 40')}`,
  };
  return `<svg class="prep-icon" viewBox="0 0 88 64" aria-hidden="true">${icons[kind] || icons.in}</svg>`;
}

function caseChip(use) {
  return `<span class="prep-case" data-case="${use.case}">${t(CASE_KEYS[use.case])}</span>`;
}

function visualHTML(row) {
  const split = row.uses.length > 1 ? ' is-split' : '';
  return `
    <div class="prep-visual-pack${split}">
      ${row.uses.map(use => `
        <span class="prep-icon-cell" data-case="${use.case}">
          ${iconSVG(use.icon || row.icon)}
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
      <div class="prep-example">
        <span class="sr">${AtlasSrpski.sr(use.sr)}</span>
        <span class="tr">${use.tr[lang] || use.tr.en}</span>
      </div>
    </div>
  `;
}

function renderPrepChart() {
  const root = document.getElementById('prepChart');
  if (!root) return;
  root.innerHTML = PREP_GROUPS.map(group => `
    <section class="prep-group">
      <header class="prep-group-head">
        <h3>${t(group.key)}</h3>
      </header>
      <div class="prep-table">
        <div class="prep-table-head">
          <span>${t('prep.col.visual')}</span>
          <span>${t('prep.col.prep')}</span>
          <span>${t('prep.col.case')}</span>
          <span>${t('prep.col.example')}</span>
        </div>
        ${group.rows.map(row => `
          <article class="prep-row" data-tone="${row.tone}">
            <div class="prep-visual">${visualHTML(row)}</div>
            <div class="prep-name">${AtlasSrpski.sr(row.prep)}</div>
            <div class="prep-uses">${row.uses.map(renderUse).join('')}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `).join('');
}

document.addEventListener('langchange', renderPrepChart);
document.addEventListener('scriptchange', renderPrepChart);
renderPrepChart();

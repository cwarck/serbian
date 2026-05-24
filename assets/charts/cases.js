/* Three regular nouns walking through all seven cases.
   Order matches CASES — NOM, GEN, DAT, AKU, VOK, INS, LOK.
   Picked for full regularity: no fleeting-a, no -ov- infix, no sibilant
   softening (ženi is straight -i, not the ruka→ruci shift). */

function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function tCases(key) { return dict()[key] || ''; }
function currentLang() { return document.documentElement.getAttribute('lang') || 'en'; }
function srStrongHTML(html) {
  return String(html).replace(/<strong>(.*?)<\/strong>/g, (_, inner) => `<strong>${AtlasSrpski.srHTML(inner)}</strong>`);
}
function renderStaticGrammarTokens() {
  const lang = currentLang();
  document.querySelectorAll('[data-i18n^="cases."], [data-i18n^="wrinkle."]').forEach(node => {
    if (node.getAttribute('data-sr-grammar-lang') !== lang) {
      node.setAttribute('data-sr-grammar-source', node.innerHTML);
      node.setAttribute('data-sr-grammar-lang', lang);
    }
    node.innerHTML = AtlasSrpski.srGrammarHTML(node.getAttribute('data-sr-grammar-source') || node.innerHTML);
  });
}

function caseAnchor(key) { return key.replace(/\./g,'-'); }

/* Spotlight changed letters in a sound-change pair: walk common prefix and
   suffix from both ends, wrap the divergent middle in <span class="lit">.
   Falls back to wrapping the whole word when the two share nothing. */
function diffHL(a, b) {
  const sa = String(a), sb = String(b);
  let p = 0;
  const minLen = Math.min(sa.length, sb.length);
  while (p < minLen && sa[p] === sb[p]) p++;
  let ea = sa.length, eb = sb.length;
  while (ea > p && eb > p && sa[ea-1] === sb[eb-1]) { ea--; eb--; }
  const wrap = (s, i, j) =>
    s.slice(0, i) + (i < j ? `<span class="lit">${s.slice(i, j)}</span>` : '') + s.slice(j);
  return { from: wrap(sa, p, ea), to: wrap(sb, p, eb) };
}

/* The CAST hero — three nouns × seven cases. Tap a cell to jump to that case. */
function renderCast() {
  const root = document.getElementById('castScroll');
  if (!root) return;
  const d = dict();
  const genderLabel = cast =>
    d['cases.gender.' + cast.gender] || cast.gender.toUpperCase();

  const mobileHeadRow = `
    <div class="cast-row cast-row-head" role="row">
      <span class="cast-cell cast-cell-head" role="rowheader"></span>
      ${CAST.map(cast => `
        <span class="cast-cell cast-cell-head cast-gender-head" data-gender="${cast.gender}" role="columnheader">${genderLabel(cast)}</span>
      `).join('')}
    </div>`;
  const mobileRows = CASES.map((c, i) => {
    const cells = CAST.map(cast => {
      const base = cast.forms.sg[0];
      const form = cast.forms.sg[i];
      const hl = i === 0 ? cast.word : diffHL(base, form).to;
      return `
        <a class="cast-cell" data-tone="${c.tone}" href="#${caseAnchor(c.key)}" aria-label="${c.abbr}, ${genderLabel(cast)}: ${AtlasSrpski.sr(form)}">
          <span class="cast-form">${AtlasSrpski.srHTML(hl)}</span>
        </a>`;
    }).join('');
    return `
      <div class="cast-row" data-tone="${c.tone}" role="row">
        <a class="cast-cell cast-case" data-tone="${c.tone}" role="rowheader" href="#${caseAnchor(c.key)}">
          <span class="cast-abbr">${c.abbr}</span>
        </a>
        ${cells}
      </div>`;
  }).join('');

  const wideHeadRow = `
    <div class="cast-row cast-row-head" role="row">
      <span class="cast-cell cast-cell-head" role="rowheader"></span>
      ${CASES.map(c => `
        <a class="cast-cell cast-cell-head" data-tone="${c.tone}" role="columnheader" href="#${caseAnchor(c.key)}">
          <span class="cast-abbr">${c.abbr}</span>
        </a>
      `).join('')}
    </div>`;
  const wideRows = CAST.map(cast => {
    const cells = cast.forms.sg.map((form, i) => {
      const c = CASES[i];
      const base = cast.forms.sg[0];
      const hl = i === 0 ? cast.word : diffHL(base, form).to;
      return `
        <a class="cast-cell" data-tone="${c.tone}" href="#${caseAnchor(c.key)}" aria-label="${c.abbr}: ${AtlasSrpski.sr(form)}">
          <span class="cast-form">${AtlasSrpski.srHTML(hl)}</span>
        </a>
      `;
    }).join('');
    return `
      <div class="cast-row" data-gender="${cast.gender}" role="row">
        <span class="cast-cell cast-gender" data-gender="${cast.gender}" role="rowheader">${genderLabel(cast)}</span>
        ${cells}
      </div>`;
  }).join('');
  root.innerHTML = `
    <div class="cast-table cast-mobile" role="table" aria-label="Three nouns declined through seven cases">${mobileHeadRow}${mobileRows}</div>
    <div class="cast-table cast-wide" role="table" aria-label="Three nouns declined through seven cases">${wideHeadRow}${wideRows}</div>`;
}

function renderCaseStrip() {
  const list = document.getElementById('caseStripList');
  if (!list) return;
  list.innerHTML = CASES.map((c) => `
    <li class="case-strip-cell" data-tone="${c.tone}">
      <a href="#${caseAnchor(c.key)}">
        <span class="strip-abbr">${c.abbr}</span>
        <span class="strip-name">${tCases(c.key + '.name')}</span>
      </a>
    </li>
  `).join('');
}

function notePopoverHTML(caseIdx, noteId) {
  const lang = currentLang();
  const c = CASES[caseIdx];
  const note = c && c.notes && c.notes[noteId];
  if (!note) return '';
  const title = AtlasSrpski.srGrammarHTML(lang === 'ru' ? note.titleRu : note.titleEn);
  const body  = AtlasSrpski.srGrammarHTML(lang === 'ru' ? note.bodyRu  : note.bodyEn);
  const pairs = (note.pairs || []).map(p => {
    const hl = diffHL(p[0], p[1]);
    return `
      <li>
        <span class="from">${AtlasSrpski.srHTML(hl.from)}</span>
        <span class="arrow" aria-hidden="true">→</span>
        <span class="to">${AtlasSrpski.srHTML(hl.to)}</span>
      </li>`;
  }).join('');
  return `
    <article class="note-pop">
      <h4 class="note-title">${title}</h4>
      <p class="note-body">${body}</p>
      ${pairs ? `<ul class="note-pairs">${pairs}</ul>` : ''}
    </article>`;
}

/* Convert a cell entry into HTML for the endings table. */
function buildSharePills(entry) {
  const targets = [];
  if (entry && entry.same) targets.push(entry.same);
  if (entry && Array.isArray(entry.share)) targets.push(...entry.share);
  if (targets.length === 0) return '';
  const pills = targets.map(t => `
    <span class="cell-share" data-target="${t}" data-tone="${t.toLowerCase()}">
      <span class="share-label">${t}</span>
    </span>
  `).join('');
  return `<span class="cell-shares" aria-label="shared with">${pills}</span>`;
}

function cellHTML(entry, caseIdx) {
  if (entry == null) return '<span class="cell cell-empty"><span class="end">—</span></span>';
  if (typeof entry === 'string') {
    return `<span class="cell"><span class="end">${AtlasSrpski.sr(entry)}</span></span>`;
  }
  const noteMark = (id) => {
    const c = CASES[caseIdx];
    const note = c && c.notes && c.notes[id];
    const lang = currentLang();
    const title = note ? AtlasSrpski.srGrammarHTML(lang === 'ru' ? note.titleRu : note.titleEn).replace(/<[^>]*>/g, '') : 'see note';
    return `<button type="button" class="tip-chip cell-note" aria-haspopup="dialog" aria-expanded="false" aria-label="${title}" data-note-trigger data-case-idx="${caseIdx}" data-note-id="${id}">?</button>`;
  };

  if (entry.split) {
    const variants = entry.split;
    /* If every variant points to the same note, hoist one marker to the end
       so the cell reads `-a / -∅¹` rather than `-a¹ / -∅¹`. */
    const sharedNote = variants.every(s => s.n && s.n === variants[0].n)
      ? variants[0].n : null;
    const hasLabels = variants.some(s => s.labelKey);
    if (hasLabels) {
      const d = dict();
      const rows = variants.map((s, idx) => {
        const label = s.labelKey ? (d[s.labelKey] || '') : '';
        const m = sharedNote && idx === variants.length - 1 ? noteMark(sharedNote) : !sharedNote && s.n ? noteMark(s.n) : '';
        return `
          <span class="end-row">
            <span class="cell-label">${label}</span>
            <span class="end">${AtlasSrpski.sr(s.v)}${m}</span>
          </span>`;
      }).join('');
      return `<span class="cell cell-alt cell-alt-labeled">${rows}</span>`;
    }
    const ends = variants.map((s, idx) => {
      const m = !sharedNote && s.n ? noteMark(s.n) : '';
      return `<span class="end">${AtlasSrpski.sr(s.v)}${m}</span>`;
    }).join('<span class="cell-sep" aria-hidden="true">/</span>');
    const tail = sharedNote ? noteMark(sharedNote) : '';
    return `<span class="cell cell-alt">${ends}${tail}</span>`;
  }
  const pills = buildSharePills(entry);
  const note = entry.n ? noteMark(entry.n) : '';
  return `<span class="cell"><span class="end">${AtlasSrpski.sr(entry.v)}${note}</span>${pills}</span>`;
}

function axisLabel(ax, d) {
  const gl = d['cases.gender.' + ax.g] || ax.g.toUpperCase();
  const nl = d['cases.number.' + ax.n] || (ax.n === 'sg' ? 'Sg' : 'Pl');
  return `${gl}.${nl}`;
}

function renderCases() {
  const list = document.getElementById('caseList');
  const d = dict();
  if (!list) return;
  const lang = currentLang();
  const exLabel    = d['cases.examples'] || 'In the wild';
  const prepsLabel = d['cases.preps']    || 'Prepositions';

  const headerRow = `
    <div class="case-row case-row-head" aria-hidden="true">
      <span class="case-cell case-cell-head"></span>
      ${ENDING_AXES.map(ax => `
        <span class="case-cell case-cell-col" data-gender="${ax.g}" data-axis="${ax.key}">${axisLabel(ax, d)}</span>
      `).join('')}
      <span class="case-cell case-cell-col case-cell-col-ex">${exLabel}</span>
      <span class="case-cell case-cell-col case-cell-col-preps">${prepsLabel}</span>
    </div>`;

  const caseRows = CASES.map((c, i) => {
    const caseId  = caseAnchor(c.key);
    const name    = d[c.key + '.name']    || '';
    const local   = AtlasSrpski.sr(d[c.key + '.local'] || '');
    const tagline = d[c.key + '.tagline'] || '';
    const q       = srStrongHTML(d[c.key + '.q'] || '');

    const headHTML = `
      <div class="case-cell case-cell-head">
        <header class="case-head">
          <span class="case-tag">${c.abbr}</span>
          <h3>${name}<em title="${d['cases.local.tooltip'] || ''}">${local}</em></h3>
          <p class="q">${q}</p>
          <p class="tagline">${tagline}</p>
        </header>
      </div>`;

    const endCells = ENDING_AXES.map(ax => `
      <div class="case-cell case-cell-end" data-axis="${ax.key}" data-gender="${ax.g}">
        <span class="cell-axis">${axisLabel(ax, d)}</span>
        ${cellHTML(c.endings[ax.g][ax.n], i)}
      </div>
    `).join('');

    const exHTML = c.examples.map(ex => `
      <div class="ex">
        <div class="sr">${AtlasSrpski.srHTML(ex.sr)}</div>
        <div class="tr">${AtlasSrpski.srGrammarHTML(ex[lang] || ex.en)}</div>
      </div>
    `).join('');
    const exCell = `
      <div class="case-cell case-cell-ex">
        <span class="cell-axis">${exLabel}</span>
        <div class="examples">${exHTML}</div>
      </div>`;

    const prepCell = c.preps.length === 0 ? `
      <div class="case-cell case-cell-preps is-empty" aria-hidden="true"></div>
    ` : `
      <div class="case-cell case-cell-preps">
        <span class="cell-axis">${prepsLabel}</span>
        <p class="prep-list">${c.preps.map(p => AtlasSrpski.sr(p)).join(', ')}</p>
      </div>`;

    return `
      <article class="case-row" id="${caseId}" data-tone="${c.tone}">
        ${headHTML}
        ${endCells}
        ${exCell}
        ${prepCell}
      </article>`;
  }).join('');

  list.innerHTML = headerRow + caseRows;
}

function renderExtras() {
  const root = document.getElementById('extraPack');
  if (!root) return;
  const d = dict();
  const lang = currentLang();

  const idRows = IDECL.cases.map((abbr, i) => `
    <tr>
      <th scope="row" class="num">${abbr}</th>
      <td><span class="end">${AtlasSrpski.sr(IDECL.sg[i])}</span></td>
      <td><span class="end">${AtlasSrpski.sr(IDECL.pl[i])}</span></td>
    </tr>
  `).join('');
  const idTitle = d['cases.extra.title'] || 'Feminines without -a';
  const idGloss = d['cases.extra.gloss'] || '';
  const idPanel = `
    <article class="extra-panel extra-panel-idecl">
      <header class="extra-panel-head">
        <h3 class="extra-panel-title">${AtlasSrpski.srGrammarHTML(idTitle)}</h3>
        <span class="extra-panel-sub"><em>${AtlasSrpski.sr('ljubav')}</em>${idGloss ? ' · ' + idGloss : ''}</span>
      </header>
      <div class="extra-panel-body">
        <table class="i-decl">
          <thead>
            <tr>
              <th></th>
              <th>${d['cases.number.sg'] || 'Sg'}</th>
              <th>${d['cases.number.pl'] || 'Pl'}</th>
            </tr>
          </thead>
          <tbody>${idRows}</tbody>
        </table>
      </div>
    </article>
  `;

  const wrinklePanels = WRINKLES.map(w => {
    const title = d[w.key + '.title'] || '';
    const items = w.examples.map(ex => {
      const hl = diffHL(ex.from, ex.to);
      return `
        <li>
          <span class="from">${AtlasSrpski.srHTML(hl.from)}</span>
          <span class="arrow" aria-hidden="true">→</span>
          <span class="to">${AtlasSrpski.srHTML(hl.to)}</span>
          <span class="gloss">${AtlasSrpski.srGrammarHTML(ex[lang] || ex.en)}</span>
        </li>
      `;
    }).join('');
    return `
      <article class="extra-panel">
        <header class="extra-panel-head">
          <h3 class="extra-panel-title">${AtlasSrpski.srGrammarHTML(title)}</h3>
        </header>
        <div class="extra-panel-body">
          <ul class="wrinkle-list">${items}</ul>
        </div>
      </article>
    `;
  }).join('');

  root.innerHTML = idPanel + wrinklePanels;
}

function renderAll() {
  renderStaticGrammarTokens();
  renderCaseStrip();
  renderCast();
  renderCases();
  renderExtras();
}

function updateStickyOffset() {
  const header = document.querySelector('header.nav');
  const strip  = document.querySelector('.case-strip');
  const navHeight = header ? header.offsetHeight : 0;
  const stickyOffset = navHeight + (strip ? strip.offsetHeight : 0);
  document.documentElement.style.setProperty('--nav-height', navHeight + 'px');
  document.documentElement.style.setProperty('--sticky-offset', stickyOffset + 'px');
}

/* Case strip visibility — labels the cases table only. Hide once the user
   scrolls past the entire case-list (into the off-paradigm panel); bring it
   back on any upward scroll. */
function setupCaseStripVisibility() {
  const strip = document.querySelector('.case-strip');
  const header = document.querySelector('header.nav');
  const list = document.getElementById('caseList');
  if (!strip || !list) return;

  let lastY = window.scrollY || window.pageYOffset || 0;
  let ticking = false;
  let pointerFocused = false;

  function setHidden(hidden) {
    strip.classList.toggle('is-hidden', hidden);
    strip.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    strip.querySelectorAll('a').forEach(a => { a.tabIndex = hidden ? -1 : 0; });
  }

  function update() {
    ticking = false;
    const y = window.scrollY || window.pageYOffset || 0;
    const scrollingDown = y > lastY + 2;
    const scrollingUp = y < lastY - 2;
    const headerHeight = header ? header.offsetHeight : 0;
    const listRect = list.getBoundingClientRect();
    const passedList = listRect.bottom <= headerHeight + 12;
    const keyboardFocusInStrip = strip.matches(':focus-within') && !pointerFocused;

    if (scrollingUp || !passedList || keyboardFocusInStrip) {
      setHidden(false);
    } else if (scrollingDown && passedList) {
      setHidden(true);
    }

    lastY = y;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  strip.addEventListener('pointerdown', () => { pointerFocused = true; });
  strip.addEventListener('keydown', () => { pointerFocused = false; });
  strip.addEventListener('focusin', () => setHidden(false));
  strip.addEventListener('focusout', () => { pointerFocused = false; });
  update();
}

/* Scroll-spy — mark the case-strip cell whose row is currently nearest the
   top of the viewport (below the sticky header) as is-current. */
function setupScrollSpy() {
  const update = () => {
    const cells = document.querySelectorAll('.case-strip-cell');
    const rows = document.querySelectorAll('#caseList .case-row[id]');
    if (!cells.length || !rows.length) return;
    const off = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--sticky-offset')) || 0;
    const probe = off + 24;
    let candidateId = rows[0].id;
    for (const row of rows) {
      if (row.getBoundingClientRect().top - probe <= 0) candidateId = row.id;
      else break;
    }
    cells.forEach(cell => {
      const a = cell.querySelector('a');
      const match = !!a && a.getAttribute('href') === '#' + candidateId;
      cell.classList.toggle('is-current', match);
      if (a) a.setAttribute('aria-selected', match ? 'true' : 'false');
    });
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);
  document.addEventListener('langchange', update);
  document.addEventListener('scriptchange', update);
  update();
}

/* Ending note popovers — same small `?` trigger and popover shell as the
   alphabet chart. */
(function setupNotePopover(){
  const pop = document.getElementById('casePop');
  if (!pop) return;
  const bodyEl   = pop.querySelector('#casePopBody');
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
    let left = r.left + sx + r.width/2 - pw/2;
    left = Math.max(sx + gutter, Math.min(left, sx + vw - pw - gutter));
    const spaceBelow = window.innerHeight - r.bottom;
    const placeAbove = spaceBelow < ph + gutter && r.top > ph + gutter;
    const top = placeAbove ? r.top + sy - ph - 8 : r.bottom + sy + 8;
    pop.style.left = left + 'px';
    pop.style.top  = top  + 'px';
    pop.dataset.placement = placeAbove ? 'above' : 'below';
  }

  function open(trigger) {
    const caseIdx = +trigger.getAttribute('data-case-idx');
    const noteId  = trigger.getAttribute('data-note-id');
    if (isNaN(caseIdx) || !noteId) return;
    const c = CASES[caseIdx];
    const content = notePopoverHTML(caseIdx, noteId);
    if (!content) return;
    pop.dataset.tone = c && c.tone || '';
    if (active && active !== trigger) active.setAttribute('aria-expanded','false');
    active = trigger;
    trigger.setAttribute('aria-expanded','true');
    bodyEl.innerHTML = content;
    pop.hidden = false;
    requestAnimationFrame(() => { position(); pop.classList.add('is-open'); });
  }

  function close() {
    const trigger = active;
    if (!trigger) return;
    trigger.setAttribute('aria-expanded','false');
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
    const trigger = e.target.closest('[data-note-trigger]');
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
})();

document.addEventListener('langchange', () => {
  renderAll();
  updateStickyOffset();
});
document.addEventListener('scriptchange', () => {
  renderAll();
  updateStickyOffset();
});
window.addEventListener('resize', updateStickyOffset);
window.addEventListener('load', updateStickyOffset);
renderAll();
updateStickyOffset();
setupCaseStripVisibility();
setupScrollSpy();

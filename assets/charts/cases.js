function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function tCases(key) { return dict()[key] || ''; }
function currentLang() { return document.documentElement.getAttribute('lang') || 'en'; }
function srStrongHTML(html) {
  return String(html).replace(/<strong>(.*?)<\/strong>/g, (_, inner) => `<strong lang="sr">${SerbianFyi.srHTML(inner)}</strong>`);
}
function renderStaticGrammarTokens() {
  const lang = currentLang();
  document.querySelectorAll('[data-i18n^="cases."], [data-i18n^="wrinkle."]').forEach(node => {
    if (node.getAttribute('data-sr-grammar-lang') !== lang) {
      node.setAttribute('data-sr-grammar-source', node.innerHTML);
      node.setAttribute('data-sr-grammar-lang', lang);
    }
    node.innerHTML = SerbianFyi.srGrammarHTML(node.getAttribute('data-sr-grammar-source') || node.innerHTML);
  });
}

function caseAnchor(key) { return key.replace(/\./g,'-'); }

/* A preposition in the case's prep list. If the shared prep card knows this
   lemma, render a clickable trigger that opens the card in place; otherwise
   fall back to plain text (no dead affordance). */
function prepToken(p) {
  const sr = SerbianFyi.sr(p);
  const known = window.SerbianFyi && SerbianFyi.prep && SerbianFyi.prep.lookup(p);
  return known
    ? `<button type="button" class="prep-trigger" data-prep="${p}" aria-expanded="false">${sr}</button>`
    : sr;
}

/* Shared-endings recession is the only view now — no toggle, no stored
   preference. Sweep the retired keys so returning users don't carry dead
   settings forever. */
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
['as_detail', 'as_hint_detail', 'as_syncretism'].forEach(lsDel);

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

function renderCaseStrip() {
  const list = document.getElementById('caseStripList');
  if (!list) return;
  list.innerHTML = CASES.map((c) => `
    <li class="case-strip-cell" data-tone="${c.tone}">
      <a href="#${caseAnchor(c.key)}" aria-label="${tCases(c.key + '.name')}">
        <span class="strip-abbr">${c.abbr}</span>
      </a>
    </li>
  `).join('');
}

function notePopoverHTML(caseIdx, noteId) {
  const lang = currentLang();
  const c = CASES[caseIdx];
  const note = c && c.notes && c.notes[noteId];
  if (!note) return '';
  const title = SerbianFyi.srGrammarHTML(lang === 'ru' ? note.titleRu : note.titleEn);
  const body  = SerbianFyi.srGrammarHTML(lang === 'ru' ? note.bodyRu  : note.bodyEn);
  const pairs = (note.pairs || []).map(p => {
    const hl = diffHL(p[0], p[1]);
    return `
      <li>
        <span class="from" lang="sr">${SerbianFyi.srHTML(hl.from)}</span>
        <span class="arrow" aria-hidden="true">→</span>
        <span class="to" lang="sr">${SerbianFyi.srHTML(hl.to)}</span>
      </li>`;
  }).join('');
  return `
    <article class="note-pop">
      <h4 class="note-title">${title}</h4>
      <p class="note-body">${body}</p>
      ${pairs ? `<ul class="note-pairs">${pairs}</ul>` : ''}
    </article>`;
}

/* ── Syncretism (prototype) ───────────────────────────────────────────
   Walk each gender/number column down the seven cases. The first time an
   ending shape appears it is "novel" (kept lit in its case tone); every
   later identical shape is an "echo" that recedes to ink and points back
   to the case that introduced it. Turns the 42-slot grid into the ~dozen
   genuinely-new endings, read off contrast rather than from a footnote. */
function entryBranchValues(entry) {
  if (entry == null) return [];
  if (typeof entry === 'string') return [entry];
  if (entry.split) return entry.split.map(s => s.v);
  return [entry.v];
}

function computeSyncretism() {
  const map = {};
  ENDING_AXES.forEach(ax => {
    const firstSeen = new Map(); // ending value -> case abbr that introduced it
    CASES.forEach((c, i) => {
      const entry = c.endings[ax.g][ax.n];
      /* Sound-conditioned alternation — a plain split like the palatal/soft
         vocative (-e / -u) — is not syncretism. A coincidental shape match
         (VOK soft -u vs DAT -u) must not read as "borrowed", so those branches
         stay lit. Only a split flagged syncretic (AKU animacy) is genuine reuse
         of GEN/NOM and keeps its echo chips. */
      const conditioned = entry && typeof entry !== 'string'
        && Array.isArray(entry.split) && !entry.syncretic;
      const vals = entryBranchValues(entry);
      const branches = vals.map(v => (!conditioned && firstSeen.has(String(v)))
        ? { v, novel: false, source: firstSeen.get(String(v)) }
        : { v, novel: true, source: null });
      vals.forEach(v => { if (!firstSeen.has(String(v))) firstSeen.set(String(v), c.abbr); });
      (map[i] = map[i] || {})[ax.key] = branches;
    });
  });
  return map;
}
const SYNC = computeSyncretism();

/* Tone-dotted chip: on an echo cell, name the case the shape came from —
   the chip's data-tone paints it in that case's hue. */
function pillsHTML(targets) {
  if (!targets || !targets.length) return '';
  const pills = targets.map(t => `
    <span class="cell-share" data-target="${t}" data-tone="${String(t).toLowerCase()}">
      <span class="share-label">${t}</span>
    </span>
  `).join('');
  return `<span class="cell-shares" aria-label="same as">${pills}</span>`;
}

function cellHTML(entry, caseIdx, axisKey) {
  if (entry == null) return '<span class="cell cell-empty"><span class="end">—</span></span>';
  const branches = (SYNC[caseIdx] && SYNC[caseIdx][axisKey]) || [];
  const noteMark = (id) => {
    const c = CASES[caseIdx];
    const note = c && c.notes && c.notes[id];
    const lang = currentLang();
    const title = note ? SerbianFyi.srGrammarHTML(lang === 'ru' ? note.titleRu : note.titleEn).replace(/<[^>]*>/g, '') : 'see note';
    return `<button type="button" class="tip-chip cell-note" aria-haspopup="dialog" aria-expanded="false" aria-label="${title}" data-note-trigger data-case-idx="${caseIdx}" data-note-id="${id}">?</button>`;
  };
  /* One ending + its trailing note + (if it's an echo) the source-case chip. */
  const endHTML = (value, branch, note) => {
    const echo = branch && !branch.novel;
    return `<span class="end${echo ? ' is-echo' : ''}"><span lang="sr">${SerbianFyi.sr(value)}</span>${note}</span>${echo ? pillsHTML([branch.source]) : ''}`;
  };

  if (typeof entry === 'string') {
    return `<span class="cell">${endHTML(entry, branches[0], '')}</span>`;
  }

  if (entry.split) {
    const variants = entry.split;
    /* If every variant points to the same note, hoist one marker to the end
       so the cell reads `-a / -∅¹` rather than `-a¹ / -∅¹`. */
    const sharedNote = variants.every(s => s.n && s.n === variants[0].n)
      ? variants[0].n : null;
    /* Syncretic split (AKU animacy): each ending reuses a known case, so it
       stacks with its source-case chip. The criterion that picks between them
       (alive vs thing) lives in the ? note, not inline — the cell stays narrow
       and the two reused shapes read at a glance. */
    if (entry.syncretic) {
      const rows = variants.map((s, idx) => {
        const m = sharedNote && idx === variants.length - 1 ? noteMark(sharedNote)
                : !sharedNote && s.n ? noteMark(s.n) : '';
        return `<span class="end-row">${endHTML(s.v, branches[idx], m)}</span>`;
      }).join('');
      return `<span class="cell cell-alt cell-alt-stack">${rows}</span>`;
    }
    const ends = variants.map((s, idx) => {
      const m = !sharedNote && s.n ? noteMark(s.n) : '';
      return endHTML(s.v, branches[idx], m);
    }).join('<span class="cell-sep" aria-hidden="true">/</span>');
    const tail = sharedNote ? noteMark(sharedNote) : '';
    return `<span class="cell cell-alt">${ends}${tail}</span>`;
  }

  const note = entry.n ? noteMark(entry.n) : '';
  return `<span class="cell">${endHTML(entry.v, branches[0], note)}</span>`;
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
  const prepsLabel = d['cases.preps']    || 'Prepositions';
  const exLabel    = d['cases.examples'] || 'Examples';

  const headBlock = (c) => {
    const name    = d[c.key + '.name']    || '';
    const local   = SerbianFyi.sr(d[c.key + '.local'] || '');
    const q       = srStrongHTML(d[c.key + '.q'] || '');
    return `
      <div class="case-cell case-cell-head">
        <header class="case-head">
          <div class="case-head-title">
            <h3><span lang="sr">${local}</span><em>${name}</em></h3>
            <span class="case-tag">${c.abbr}</span>
          </div>
          <p class="q">${q}</p>
        </header>
      </div>`;
  };

  list.className = 'case-list';

  const caseRows = CASES.map((c, i) => {
    const endCells = ENDING_AXES.map(ax => `
      <div class="case-cell case-cell-end" data-axis="${ax.key}" data-gender="${ax.g}">
        <span class="cell-axis">${axisLabel(ax, d)}</span>
        ${cellHTML(c.endings[ax.g][ax.n], i, ax.key)}
      </div>
    `).join('');

    const exCell = c.examples.length === 0 ? '' : `
      <div class="case-cell case-cell-ex">
        <span class="cell-axis">${exLabel}</span>
        <div class="examples">${c.examples.map(ex => `
          <div class="ex">
            <div class="sr" lang="sr">${SerbianFyi.srHTML(ex.sr)}</div>
            <div class="tr">${SerbianFyi.srGrammarHTML(ex[lang] || ex.en)}</div>
          </div>`).join('')}
        </div>
      </div>`;

    const prepCell = c.preps.length === 0 ? `
      <div class="case-cell case-cell-preps is-empty" aria-hidden="true"></div>
    ` : `
      <div class="case-cell case-cell-preps">
        <span class="cell-axis">${prepsLabel}</span>
        <p class="prep-list">${c.preps.map(prepToken).join(', ')}</p>
      </div>`;

    return `
      <article class="case-row" id="${caseAnchor(c.key)}" data-tone="${c.tone}">
        ${headBlock(c)}
        ${endCells}
        ${exCell}
        ${prepCell}
      </article>`;
  }).join('');

  list.innerHTML = caseRows;
}

function renderExtras() {
  const root = document.getElementById('extraPack');
  if (!root) return;
  const d = dict();
  const lang = currentLang();

  const idRows = IDECL.cases.map((abbr, i) => `
    <tr>
      <th scope="row" class="num">${abbr}</th>
      <td><span class="end" lang="sr">${SerbianFyi.sr(IDECL.sg[i])}</span></td>
      <td><span class="end" lang="sr">${SerbianFyi.sr(IDECL.pl[i])}</span></td>
    </tr>
  `).join('');
  const idTitle = d['cases.extra.title'] || 'Feminines without -a';
  const idGloss = d['cases.extra.gloss'] || '';
  const idPanel = `
    <article class="extra-panel extra-panel-idecl">
      <header class="extra-panel-head">
        <h3 class="extra-panel-title">${SerbianFyi.srGrammarHTML(idTitle)}</h3>
        <span class="extra-panel-sub"><em lang="sr">${SerbianFyi.sr('ljubav')}</em>${idGloss ? ' · ' + idGloss : ''}</span>
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
          <span class="from" lang="sr">${SerbianFyi.srHTML(hl.from)}</span>
          <span class="arrow" aria-hidden="true">→</span>
          <span class="to" lang="sr">${SerbianFyi.srHTML(hl.to)}</span>
          <span class="gloss">${SerbianFyi.srGrammarHTML(ex[lang] || ex.en)}</span>
        </li>
      `;
    }).join('');
    return `
      <article class="extra-panel">
        <header class="extra-panel-head">
          <h3 class="extra-panel-title">${SerbianFyi.srGrammarHTML(title)}</h3>
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
      if (a) {
        if (match) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      }
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

/* Ending note popovers + inline preposition cards — both ride the shared
   popover shell (SerbianFyi.popover). The note keeps its case tone; the prep
   card colours each use by its own case, so its shell stays tone-less. */
SerbianFyi.popover.register({
  match: '[data-note-trigger]',
  variant: 'case-pop',
  render: (t) => {
    const caseIdx = +t.getAttribute('data-case-idx');
    const noteId = t.getAttribute('data-note-id');
    return (isNaN(caseIdx) || !noteId) ? '' : notePopoverHTML(caseIdx, noteId);
  },
  tone: (t) => (CASES[+t.getAttribute('data-case-idx')] || {}).tone || '',
});

if (window.SerbianFyi && SerbianFyi.prep) {
  SerbianFyi.popover.register({
    match: '[data-prep]',
    variant: 'prep-pop',
    render: (t) => SerbianFyi.prep.renderCard(t.getAttribute('data-prep')),
  });
}

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

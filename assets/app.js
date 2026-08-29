/* serbian.fyi — language + theme.
   Pure DOM, no framework, no build. Persist choices to localStorage. */

(function () {
  const LS_LANG = 'as_lang';
  const LS_THEME = 'as_theme';
  const LS_SCRIPT = 'as_script';

  const supportedLangs = ['en', 'ru'];
  const supportedScripts = ['lat', 'cyr'];

  function readStored(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function writeStored(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function removeStored(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  function normalizeLang(value) {
    const lang = String(value || '').toLowerCase().split(/[-_]/)[0];
    return supportedLangs.includes(lang) ? lang : null;
  }

  function detectLang() {
    const stored = normalizeLang(readStored(LS_LANG));
    const nav = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    if (stored) return stored;
    for (const lang of nav) {
      const normalized = normalizeLang(lang);
      if (normalized) return normalized;
    }
    return 'en';
  }

  const defaultScript = (() => {
    const stored = readStored(LS_SCRIPT);
    return supportedScripts.includes(stored) ? stored : 'lat';
  })();

  /* ---------- Serbian script ---------- */

  const latToCyrMap = {
    a:'а', b:'б', c:'ц', č:'ч', ć:'ћ', d:'д', đ:'ђ', e:'е', f:'ф', g:'г',
    h:'х', i:'и', j:'ј', k:'к', l:'л', m:'м', n:'н', o:'о', p:'п', r:'р',
    s:'с', š:'ш', t:'т', u:'у', v:'в', z:'з', ž:'ж',
    A:'А', B:'Б', C:'Ц', Č:'Ч', Ć:'Ћ', D:'Д', Đ:'Ђ', E:'Е', F:'Ф', G:'Г',
    H:'Х', I:'И', J:'Ј', K:'К', L:'Л', M:'М', N:'Н', O:'О', P:'П', R:'Р',
    S:'С', Š:'Ш', T:'Т', U:'У', V:'В', Z:'З', Ž:'Ж'
  };
  const accentToCyrMap = {
    à:'а̀', á:'а́', ā:'а̄', ȁ:'а̏', ȃ:'а̑',
    è:'ѐ', é:'е́', ē:'е̄', ȅ:'е̏', ȇ:'е̑',
    ì:'ѝ', í:'и́', ī:'ӣ', ȉ:'и̏', ȋ:'и̑',
    ò:'о̀', ó:'о́', ō:'о̄', ȍ:'о̏', ȏ:'о̑',
    ù:'у̀', ú:'у́', ū:'ӯ', ȕ:'у̏', ȗ:'у̑',
    ŕ:'р́', ȑ:'р̏', ȓ:'р̑',
    À:'А̀', Á:'А́', Ā:'А̄', Ȁ:'А̏', Ȃ:'А̑',
    È:'Ѐ', É:'Е́', Ē:'Е̄', Ȅ:'Е̏', Ȇ:'Е̑',
    Ì:'Ѝ', Í:'И́', Ī:'Ӣ', Ȉ:'И̏', Ȋ:'И̑',
    Ò:'О̀', Ó:'О́', Ō:'О̄', Ȍ:'О̏', Ȏ:'О̑',
    Ù:'У̀', Ú:'У́', Ū:'Ӯ', Ȕ:'У̏', Ȗ:'У̑',
    Ŕ:'Р́', Ȑ:'Р̏', Ȓ:'Р̑'
  };
  const cyrToLatMap = Object.assign(
    Object.fromEntries(Object.entries(latToCyrMap).map(([lat, cyr]) => [cyr, lat])),
    { љ:'lj', њ:'nj', џ:'dž', Љ:'Lj', Њ:'Nj', Џ:'Dž' }
  );

  function cyrDigraphReplacement(match) {
    const first = match[0];
    const second = match[1];
    const lower = match.toLowerCase();
    const cyr = lower === 'lj' ? 'љ' : lower === 'nj' ? 'њ' : 'џ';
    if (first === first.toUpperCase() && second === second.toUpperCase()) return cyr.toUpperCase();
    if (first === first.toUpperCase()) return cyr.toUpperCase();
    return cyr;
  }

  function toCyrillic(text) {
    return String(text).normalize('NFC')
      .replace(/dž|Dž|DŽ|lj|Lj|LJ|nj|Nj|NJ/g, cyrDigraphReplacement)
      .replace(/[àáāȁȃèéēȅȇìíīȉȋòóōȍȏùúūȕȗŕȑȓÀÁĀȀȂÈÉĒȄȆÌÍĪȈȊÒÓŌȌȎÙÚŪȔȖŔȐȒ]/g, ch => accentToCyrMap[ch] || ch)
      .replace(/[A-Za-zČĆĐŠŽčćđšž]/g, ch => latToCyrMap[ch] || ch);
  }

  function toLatin(text) {
    return String(text)
      .replace(/[А-ШЂЈЉЊЋЏа-шђјљњћџ]/g, ch => cyrToLatMap[ch] || ch)
      .normalize('NFC');
  }

  const diacriticToPlain = { 'š':'s', 'č':'c', 'ć':'c', 'ž':'z', 'đ':'dj', 'Š':'S', 'Č':'C', 'Ć':'C', 'Ž':'Z', 'Đ':'Dj' };
  function stripDiacritics(text) {
    return String(text).split('').map(ch => diacriticToPlain[ch] || ch).join('');
  }

  function currentScript() {
    const stored = readStored(LS_SCRIPT);
    return supportedScripts.includes(stored) ? stored : defaultScript;
  }

  function sr(text) {
    return currentScript() === 'cyr' ? toCyrillic(text) : toLatin(text);
  }

  function srHTML(html) {
    return String(html)
      .split(/(<[^>]+>|&[^;\s]+;)/g)
      .map(part => part.startsWith('<') || part.startsWith('&') ? part : sr(part))
      .join('');
  }

  /* Convert Serbian tokens inline in foreign prose: wrap each Serbian word or
     ending in <i>...</i> in the i18n source, and only that text flips script.
     Everything outside the marker stays in its native language. The same <i>
     marker also localises the token for assistive tech — tag the opening tag
     with lang="sr" so a screen reader pronounces the specimen with Serbian
     phonology instead of the surrounding UI language's. Idempotent: skipped if
     the tag already carries a lang (re-render reads back a tagged source). */
  function srGrammarHTML(html) {
    let depth = 0;
    return String(html)
      .split(/(<[^>]+>|&[^;\s]+;)/g)
      .map(part => {
        if (!part) return part;
        if (part.startsWith('&')) return part;
        if (part.startsWith('<')) {
          const m = part.match(/^<\s*(\/?)\s*([a-z][a-z0-9]*)/i);
          if (m && m[2].toLowerCase() === 'i') {
            if (m[1]) depth = Math.max(0, depth - 1);
            else if (!/\/\s*>\s*$/.test(part)) {
              depth++;
              if (!/\blang\s*=/i.test(part)) {
                return part.replace(/^<\s*i\b/i, '<i lang="sr"');
              }
            }
          }
          return part;
        }
        return depth > 0 ? sr(part) : part;
      })
      .join('');
  }

  function applyScript(script) {
    const normalized = supportedScripts.includes(script) ? script : 'lat';
    document.documentElement.setAttribute('data-script', normalized);
    const convert = normalized === 'cyr' ? toCyrillic : toLatin;
    const convertHTML = (html) => String(html)
      .split(/(<[^>]+>|&[^;\s]+;)/g)
      .map(part => (part.startsWith('<') || part.startsWith('&')) ? part : convert(part))
      .join('');
    document.querySelectorAll('[data-sr-script]').forEach((node) => {
      const source = node.getAttribute('data-sr-source') || node.innerHTML;
      node.innerHTML = convertHTML(source);
    });
    document.querySelectorAll('[data-script-chip]').forEach((chip) => {
      const s = chip.getAttribute('data-script-chip');
      chip.setAttribute('aria-pressed', String(s === normalized));
    });
  }

  function setScript(script) {
    if (!supportedScripts.includes(script)) return;
    writeStored(LS_SCRIPT, script);
    applyScript(script);
    document.dispatchEvent(new CustomEvent('scriptchange', { detail: { script } }));
  }

  /* ---------- glossary ---------- */

  const glossary = {
    get(lemma) {
      const dict = window.GLOSSARY;
      return (dict && Object.hasOwn(dict, lemma)) ? dict[lemma] : null;
    },
    gloss(lemma, lang) {
      const entry = glossary.get(lemma);
      if (!entry) return lemma;
      return entry.gloss[lang === 'ru' ? 'ru' : 'en'];
    },
  };

  /* ---------- popover ----------
     One floating `.tip-pop` shell, shared site-wide. Charts register a
     { match, render, variant?, tone? } descriptor instead of hand-rolling
     their own open/close/position/dismiss logic (this used to be copy-pasted
     across five charts). A delegated click finds the first matching trigger,
     renders its content, and toggles the shell. */
  const popover = (() => {
    let pop, bodyEl, active = null;
    const registry = [];

    function ensure() {
      if (pop) return;
      pop = document.createElement('div');
      pop.className = 'tip-pop';
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-modal', 'false');
      pop.hidden = true;
      pop.innerHTML =
        '<div class="tip-pop-card">' +
          '<div class="tip-pop-body"></div>' +
          '<button type="button" class="tip-pop-close" data-i18n-attr="aria-label:pop.close" aria-label="Close">×</button>' +
        '</div>';
      bodyEl = pop.querySelector('.tip-pop-body');
      const closeBtn = pop.querySelector('.tip-pop-close');
      closeBtn.addEventListener('click', closeAndReturnFocus);
      // Localise the close label now (the panel is built lazily, after the
      // initial applyI18n); later language switches re-run applyI18n.
      const lang = document.documentElement.getAttribute('lang') || 'en';
      const label = window.I18N && window.I18N[lang] && window.I18N[lang]['pop.close'];
      if (label) closeBtn.setAttribute('aria-label', label);
      document.body.appendChild(pop);
      attachListeners();
    }

    // Attached once, on first register() — i.e. only in a browser. Keeps the
    // IIFE side-effect-free at module eval (the validator runs it head-less).
    function attachListeners() {
      document.addEventListener('click', (e) => {
        const hit = registry.length ? findMatch(e.target) : null;
        if (hit) {
          e.preventDefault();
          if (active === hit.trigger) close(); else open(hit.trigger, hit.reg);
          return;
        }
        if (pop && !pop.hidden && !pop.contains(e.target)) close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !pop || pop.hidden) return;
        e.preventDefault();
        closeAndReturnFocus();
      });
      window.addEventListener('resize', () => { if (pop && !pop.hidden) position(); });
      window.addEventListener('scroll', () => { if (pop && !pop.hidden) position(); }, { passive: true });
      document.addEventListener('langchange', () => { if (pop) close(); });
      document.addEventListener('scriptchange', () => { if (pop) close(); });
    }

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
      let top = placeAbove ? r.top + sy - ph - 8 : r.bottom + sy + 8;
      // Clamp into the visible viewport so an edge/tall popover never clips;
      // if it's taller than the viewport, pin to the top and let it scroll.
      const minTop = sy + gutter;
      const maxTop = sy + window.innerHeight - ph - gutter;
      top = maxTop >= minTop ? Math.max(minTop, Math.min(top, maxTop)) : minTop;
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';
      pop.dataset.placement = placeAbove ? 'above' : 'below';
    }

    function open(trigger, reg) {
      const content = reg.render(trigger);
      if (!content) return;
      pop.className = 'tip-pop' + (reg.variant ? ' ' + reg.variant : '');
      pop.dataset.tone = (reg.tone && reg.tone(trigger)) || '';
      if (active && active !== trigger) active.setAttribute('aria-expanded', 'false');
      active = trigger;
      trigger.setAttribute('aria-expanded', 'true');
      bodyEl.innerHTML = content;
      pop.hidden = false;
      requestAnimationFrame(() => { position(); pop.classList.add('is-open'); });
    }

    function close() {
      const trigger = active;
      if (!trigger) return null;
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

    function findMatch(target) {
      for (const reg of registry) {
        const trigger = target.closest(reg.match);
        if (trigger) return { trigger, reg };
      }
      return null;
    }

    return {
      register(descriptor) { ensure(); registry.push(descriptor); },
      close: () => { if (pop) close(); },
    };
  })();

  window.SerbianFyi = Object.assign(window.SerbianFyi || {}, {
    sr,
    srHTML,
    srGrammarHTML,
    toCyrillic,
    toLatin,
    stripDiacritics,
    glossary,
    popover,
  });

  /* ---------- i18n ---------- */

  function applyI18n(lang) {
    const dict = (window.I18N && window.I18N[lang]) || {};
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang-source', normalizeLang(readStored(LS_LANG)) ? 'stored' : 'auto');

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (!(key in dict)) return;
      const mode = node.getAttribute('data-i18n-mode') || 'html';
      if (mode === 'text') node.textContent = dict[key];
      else node.innerHTML = dict[key];
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((node) => {
      // Format: "attr:key, attr:key"
      const spec = node.getAttribute('data-i18n-attr');
      spec.split(',').forEach((pair) => {
        const [attr, key] = pair.trim().split(':');
        if (dict[key]) node.setAttribute(attr, dict[key]);
      });
    });

    document.querySelectorAll('[data-sr-script]').forEach((node) => {
      node.setAttribute('data-sr-source', node.innerHTML);
    });
    applyScript(currentScript());

    document.querySelectorAll('[data-lang-chip]').forEach((chip) => {
      const l = chip.getAttribute('data-lang-chip');
      chip.setAttribute('aria-pressed', String(l === lang));
    });
  }

  function setLang(lang) {
    if (!supportedLangs.includes(lang)) return;
    writeStored(LS_LANG, lang);
    applyI18n(lang);
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  /* ---------- theme ---------- */

  let themeQuery = null;

  function normalizeTheme(theme) {
    return theme === 'light' || theme === 'dark' ? theme : null;
  }

  function getThemeQuery() {
    if (!themeQuery && window.matchMedia) themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return themeQuery;
  }

  function systemTheme() {
    const query = getThemeQuery();
    return query && query.matches ? 'dark' : 'light';
  }

  function storedTheme() {
    return normalizeTheme(readStored(LS_THEME));
  }

  function detectedTheme() {
    return storedTheme() || systemTheme();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', normalizeTheme(theme) || systemTheme());
    document.documentElement.setAttribute('data-theme-source', storedTheme() ? 'stored' : 'auto');
    applyThemeChips();
  }

  /* The user's explicit choice: 'system' (follow the OS — the default), 'light'
     or 'dark'. Light/dark persist; system clears the stored override. */
  function currentThemeChoice() {
    return storedTheme() || 'system';
  }

  function applyThemeChips() {
    const choice = currentThemeChoice();
    document.querySelectorAll('[data-theme-chip]').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.getAttribute('data-theme-chip') === choice));
    });
  }

  function setTheme(choice) {
    if (choice === 'system') {
      removeStored(LS_THEME);
      applyTheme(systemTheme());
    } else if (normalizeTheme(choice)) {
      writeStored(LS_THEME, choice);
      applyTheme(choice);
    }
  }

  /* ---------- settings menu ---------- */

  /* Consolidate the masthead toggles behind one button + floating panel.
     Controls are RELOCATED (not recreated), so the data-attribute wiring in
     init() keeps working. */
  const SLIDERS_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
      <line x1="4" y1="9" x2="20" y2="9"></line>
      <line x1="4" y1="15" x2="20" y2="15"></line>
      <circle cx="15" cy="9" r="2.3"></circle>
      <circle cx="9" cy="15" r="2.3"></circle>
    </svg>`;

  function buildSettingsMenu() {
    const actions = document.querySelector('.nav-inner .nav-actions');
    if (!actions || actions.querySelector('[data-settings-toggle]')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'settings-btn';
    btn.setAttribute('data-settings-toggle', '');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Settings');
    btn.setAttribute('data-i18n-attr', 'aria-label:nav.settings');
    btn.innerHTML = SLIDERS_SVG;

    const menu = document.createElement('div');
    menu.className = 'settings-menu';
    menu.id = 'settingsMenu';
    menu.hidden = true;
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Settings');
    menu.setAttribute('data-i18n-attr', 'aria-label:nav.settings');
    const card = document.createElement('div');
    card.className = 'settings-menu-card';
    menu.appendChild(card);

    const addRow = (labelKey, control) => {
      const row = document.createElement('div');
      row.className = 'settings-row';
      const label = document.createElement('span');
      label.className = 'settings-label';
      label.setAttribute('data-i18n', labelKey);
      row.appendChild(label);
      if (control) row.appendChild(control);
      card.appendChild(row);
    };

    const langGroup = actions.querySelector('.nav-controls:not(.script-controls)');
    const scriptGroup = actions.querySelector('.script-controls');

    if (langGroup) {
      // Static endonyms — never translated.
      langGroup.querySelectorAll('[data-lang-chip]').forEach((chip) => {
        chip.textContent = chip.getAttribute('data-lang-chip') === 'ru' ? 'Русский' : 'English';
      });
      addRow('settings.language', langGroup);
    }
    if (scriptGroup) addRow('settings.script', scriptGroup);

    const themeGroup = document.createElement('div');
    themeGroup.className = 'nav-controls';
    themeGroup.setAttribute('role', 'group');
    ['system', 'dark', 'light'].forEach((v) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.setAttribute('data-theme-chip', v);
      chip.setAttribute('data-i18n', 'settings.theme.' + v);
      chip.textContent = v;
      themeGroup.appendChild(chip);
    });
    addRow('settings.theme', themeGroup);

    actions.appendChild(btn);
    document.body.appendChild(menu);

    wireSettingsMenu(btn, menu, card);
  }

  function wireSettingsMenu(btn, menu, card) {
    let open = false;
    const position = () => {
      const r = btn.getBoundingClientRect();
      const gutter = 12;
      const cardW = card.offsetWidth || 280;
      let left = r.right - cardW;
      left = Math.max(gutter, Math.min(left, window.innerWidth - cardW - gutter));
      menu.style.left = left + 'px';
      menu.style.top = (r.bottom + 8) + 'px';
    };
    const setOpen = (next) => {
      open = next;
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => { position(); menu.classList.add('is-open'); });
      } else {
        menu.classList.remove('is-open');
        menu.hidden = true;
      }
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!open); });
    document.addEventListener('click', (e) => {
      if (open && !menu.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) { setOpen(false); btn.focus({ preventScroll: true }); }
    });
    window.addEventListener('resize', () => { if (open) position(); });
    window.addEventListener('scroll', () => { if (open) position(); }, { passive: true });
  }

  /* ---------- init ---------- */

  function init() {
    applyTheme(detectedTheme());

    getThemeQuery()?.addEventListener?.('change', () => {
      if (!storedTheme()) applyTheme(systemTheme());
    });

    buildSettingsMenu();
    applyThemeChips();

    /* No langchange/scriptchange here. Chart scripts sit at end of body, so
       they eval BEFORE DOMContentLoaded and render themselves once — already
       correct, because theme-init.js stamped html[lang] pre-paint and sr()
       reads the stored script directly. Dispatching would re-render every
       chart twice before first paint. applyI18n ends in applyScript(). */
    applyI18n(detectLang());

    // Wire controls
    document.querySelectorAll('[data-lang-chip]').forEach((chip) => {
      chip.addEventListener('click', () => setLang(chip.getAttribute('data-lang-chip')));
    });
    document.querySelectorAll('[data-script-chip]').forEach((chip) => {
      chip.addEventListener('click', () => setScript(chip.getAttribute('data-script-chip')));
    });
    document.querySelectorAll('[data-theme-chip]').forEach((chip) => {
      chip.addEventListener('click', () => setTheme(chip.getAttribute('data-theme-chip')));
    });
  }

  // Run after DOM ready, but also after i18n.js has populated window.I18N.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

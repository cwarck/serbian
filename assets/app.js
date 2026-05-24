/* Atlas Srpski — language + theme.
   Pure DOM, no framework, no build. Persist choices to localStorage. */

(function () {
  const LS_LANG = 'as_lang';
  const LS_THEME = 'as_theme';
  const LS_SCRIPT = 'as_script';

  const supportedLangs = ['en', 'ru'];
  const supportedScripts = ['lat', 'cyr'];
  const defaultLang = (() => {
    const stored = localStorage.getItem(LS_LANG);
    if (stored && supportedLangs.includes(stored)) return stored;
    const nav = (navigator.language || 'en').slice(0, 2);
    return supportedLangs.includes(nav) ? nav : 'en';
  })();
  const defaultScript = (() => {
    const stored = localStorage.getItem(LS_SCRIPT);
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
    return String(text)
      .replace(/dž|Dž|DŽ|lj|Lj|LJ|nj|Nj|NJ/g, cyrDigraphReplacement)
      .replace(/[àáāȁȃèéēȅȇìíīȉȋòóōȍȏùúūȕȗŕȑȓÀÁĀȀȂÈÉĒȄȆÌÍĪȈȊÒÓŌȌȎÙÚŪȔȖŔȐȒ]/g, ch => accentToCyrMap[ch] || ch)
      .replace(/[A-Za-zČĆĐŠŽčćđšž]/g, ch => latToCyrMap[ch] || ch);
  }

  function toLatin(text) {
    return String(text)
      .replace(/[А-ШЂЈЉЊЋЏа-шђјљњћџ]/g, ch => cyrToLatMap[ch] || ch);
  }

  function currentScript() {
    const stored = localStorage.getItem(LS_SCRIPT);
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

  function applyScript(script) {
    const normalized = supportedScripts.includes(script) ? script : 'lat';
    document.documentElement.setAttribute('data-script', normalized);
    document.querySelectorAll('[data-sr-script]').forEach((node) => {
      const source = node.getAttribute('data-sr-source') || node.innerHTML;
      node.innerHTML = normalized === 'cyr' ? toCyrillic(source) : toLatin(source);
    });
    document.querySelectorAll('[data-script-chip]').forEach((chip) => {
      const s = chip.getAttribute('data-script-chip');
      chip.setAttribute('aria-pressed', String(s === normalized));
    });
  }

  function setScript(script) {
    if (!supportedScripts.includes(script)) return;
    localStorage.setItem(LS_SCRIPT, script);
    applyScript(script);
    document.dispatchEvent(new CustomEvent('scriptchange', { detail: { script } }));
  }

  window.AtlasSrpski = Object.assign(window.AtlasSrpski || {}, {
    currentScript,
    sr,
    srHTML,
    toCyrillic,
    toLatin
  });

  /* ---------- i18n ---------- */

  function applyI18n(lang) {
    const dict = (window.I18N && window.I18N[lang]) || {};
    document.documentElement.setAttribute('lang', lang);

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
    localStorage.setItem(LS_LANG, lang);
    applyI18n(lang);
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  /* ---------- theme ---------- */

  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function currentTheme() {
    const stored = localStorage.getItem(LS_THEME);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(LS_THEME, next);
    applyTheme(next);
  }

  /* ---------- init ---------- */

  function init() {
    // Theme — respect stored, else system. Listen for system changes only when no override.
    const stored = localStorage.getItem(LS_THEME);
    if (stored === 'light' || stored === 'dark') applyTheme(stored);
    else applyTheme(null);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
      if (!localStorage.getItem(LS_THEME)) applyTheme(null);
    });

    // Language — also notify data-driven renderers (alphabet/cases) so they pick up
    // a non-default stored language on first paint.
    applyI18n(defaultLang);
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: defaultLang } }));
    applyScript(defaultScript);
    document.dispatchEvent(new CustomEvent('scriptchange', { detail: { script: defaultScript } }));

    // Wire controls
    document.querySelectorAll('[data-lang-chip]').forEach((chip) => {
      chip.addEventListener('click', () => setLang(chip.getAttribute('data-lang-chip')));
    });
    document.querySelectorAll('[data-script-chip]').forEach((chip) => {
      chip.addEventListener('click', () => setScript(chip.getAttribute('data-script-chip')));
    });
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', toggleTheme);
    });
  }

  // Run after DOM ready, but also after i18n.js has populated window.I18N.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

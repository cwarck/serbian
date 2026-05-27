/* Atlas Srpski — language + theme.
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
     Everything outside the marker stays in its native language. */
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
            else if (!/\/\s*>\s*$/.test(part)) depth++;
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
      if (!entry || !entry.gloss) return lemma;
      const key = lang === 'ru' ? 'ru' : 'en';
      return entry.gloss[key] || entry.gloss.en || entry.gloss.ru || lemma;
    },
  };

  window.AtlasSrpski = Object.assign(window.AtlasSrpski || {}, {
    currentLang: detectLang,
    currentScript,
    sr,
    srHTML,
    srGrammarHTML,
    toCyrillic,
    toLatin,
    stripDiacritics,
    glossary,
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
  }

  function currentTheme() {
    return detectedTheme();
  }

  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    writeStored(LS_THEME, next);
    applyTheme(next);
  }

  /* ---------- init ---------- */

  function init() {
    applyTheme(detectedTheme());

    getThemeQuery()?.addEventListener?.('change', () => {
      if (!storedTheme()) applyTheme(systemTheme());
    });

    const lang = detectLang();
    applyI18n(lang);
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
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

(function(){
  var root = document.documentElement;
  var langs = ['en', 'ru'];

  function readStored(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function normalizeLang(value) {
    var lang = String(value || '').toLowerCase().split(/[-_]/)[0];
    return langs.indexOf(lang) === -1 ? null : lang;
  }

  function detectLang() {
    var stored = normalizeLang(readStored('as_lang'));
    var nav = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    var i;
    var detected;

    if (stored) return { value: stored, source: 'stored' };
    for (i = 0; i < nav.length; i += 1) {
      detected = normalizeLang(nav[i]);
      if (detected) return { value: detected, source: 'auto' };
    }
    return { value: 'en', source: 'auto' };
  }

  function detectTheme() {
    var stored = readStored('as_theme');
    if (stored === 'light' || stored === 'dark') return { value: stored, source: 'stored' };
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return { value: 'dark', source: 'auto' };
    }
    return { value: 'light', source: 'auto' };
  }

  var lang = detectLang();
  var theme = detectTheme();

  root.lang = lang.value;
  root.setAttribute('data-lang-source', lang.source);
  root.setAttribute('data-theme', theme.value);
  root.setAttribute('data-theme-source', theme.source);
})();

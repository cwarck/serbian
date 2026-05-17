/* Atlas Srpski — language + theme + reveal.
   Pure DOM, no framework, no build. Persist choices to localStorage. */

(function () {
  const LS_LANG = 'as_lang';
  const LS_THEME = 'as_theme';

  const supportedLangs = ['en', 'ru'];
  const defaultLang = (() => {
    const stored = localStorage.getItem(LS_LANG);
    if (stored && supportedLangs.includes(stored)) return stored;
    const nav = (navigator.language || 'en').slice(0, 2);
    return supportedLangs.includes(nav) ? nav : 'en';
  })();

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

  /* ---------- reveal on scroll ---------- */

  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
    els.forEach((el) => io.observe(el));
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

    // Wire controls
    document.querySelectorAll('[data-lang-chip]').forEach((chip) => {
      chip.addEventListener('click', () => setLang(chip.getAttribute('data-lang-chip')));
    });
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', toggleTheme);
    });

    setupReveal();
  }

  // Run after DOM ready, but also after i18n.js has populated window.I18N.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

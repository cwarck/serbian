/* Pre-paint. The only render-blocking script on the site.

   Three jobs, all of which must happen before the first pixel:
   - data-theme, so a dark-mode reader never sees a white flash;
   - data-script, so a returning Cyrillic reader never watches the page repaint
     in Latin (the CSS switch is live, so this one is on the text itself);
   - the language redirect, so an EN URL can still serve a Russian reader.

   External <script src>, permitted by `script-src 'self'` — no inline script,
   no CSP conflict. */

import { resolveRedirect } from '../lib/negotiate.ts';

(function () {
  const root = document.documentElement;

  function read(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  /* EN is the negotiable tree; a /ru/ URL is an explicit statement and is
     never bounced. Redirects fire only on EN paths and only target RU paths,
     which never redirect — one hop maximum, structurally. */
  const target = resolveRedirect(
    location.pathname,
    read('as_lang'),
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ''],
  );
  if (target) {
    location.replace(target + location.search + location.hash);
    return;
  }

  const script = read('as_script');
  root.setAttribute('data-script', script === 'cyr' ? 'cyr' : 'lat');

  const storedTheme = read('as_theme');
  const theme = storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-theme-source', storedTheme ? 'stored' : 'auto');
})();

/* The masthead and the settings menu.

   Ten copy-pasted shells become one module — which is also the fix for the
   drift between them (index.html had already lost the "by " its nine siblings
   carried). The settings menu is emitted as markup here rather than assembled
   by the client at DOMContentLoaded; only its behaviour stays in JS. */

import { html, raw, type Raw } from '../lib/html.ts';
import { translator } from '../i18n/index.ts';
import type { Lang } from '../lib/negotiate.ts';
import { counterpart, type Route } from '../lib/routes.ts';

const SLIDERS_SVG = raw(`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
      <line x1="4" y1="9" x2="20" y2="9"></line>
      <line x1="4" y1="15" x2="20" y2="15"></line>
      <circle cx="15" cy="9" r="2.3"></circle>
      <circle cx="9" cy="15" r="2.3"></circle>
    </svg>`);

/* Language endonyms are never translated — a reader looking for their own
   language looks for its own name. */
const ENDONYMS: Record<Lang, string> = { en: 'English', ru: 'Русский' };

const THEMES = ['system', 'dark', 'light'] as const;
const SCRIPTS = ['lat', 'cyr'] as const;

export function masthead(route: Route): Raw {
  const t = translator(route.lang);
  return html`
<a class="skip-link" href="#content">${t('nav.skip')}</a>

<header class="nav">
  <div class="shell nav-inner">
    <a href="${route.lang === 'en' ? '/' : '/ru/'}" class="brand" aria-label="serbian.fyi">
      <span>${t('nav.brand')}</span>
    </a>
    <div class="nav-actions">
      <button type="button" class="settings-btn" data-settings-toggle aria-haspopup="dialog" aria-expanded="false" aria-label="${t('nav.settings')}">${SLIDERS_SVG}</button>
    </div>
  </div>
</header>
`;
}

/* The lang chip's href comes from the route table, so a switch keeps the
   reader on the page they were reading. false-friends has no EN counterpart,
   so its EN chip falls back to the locale root. */
function langHref(route: Route, lang: Lang): string {
  if (lang === route.lang) return route.path;
  const other = counterpart(route);
  if (other) return other.path;
  return lang === 'en' ? '/' : '/ru/';
}

export function settingsMenu(route: Route): Raw {
  const t = translator(route.lang);
  return html`
<div class="settings-menu" id="settingsMenu" hidden role="dialog" aria-label="${t('nav.settings')}">
  <div class="settings-menu-card">
    <div class="settings-row">
      <span class="settings-label">${t('settings.language')}</span>
      <div class="nav-controls" role="group" aria-label="${t('nav.langGroup')}">
        ${(['en', 'ru'] as const).map(lang => html`<a class="chip" data-lang-chip="${lang}" href="${langHref(route, lang)}" aria-current="${lang === route.lang ? 'true' : false}">${ENDONYMS[lang]}</a>`)}
      </div>
    </div>
    <div class="settings-row">
      <span class="settings-label">${t('settings.script')}</span>
      <div class="nav-controls script-controls" role="group" aria-label="${t('nav.scriptGroup')}">
        ${SCRIPTS.map(s => html`<button type="button" class="chip script-chip" data-script-chip="${s}" aria-pressed="${s === 'lat' ? 'true' : 'false'}" aria-label="${t(s === 'lat' ? 'script.useLat' : 'script.useCyr')}">${t(s === 'lat' ? 'script.lat' : 'script.cyr')}</button>`)}
      </div>
    </div>
    <div class="settings-row">
      <span class="settings-label">${t('settings.theme')}</span>
      <div class="nav-controls" role="group">
        ${THEMES.map(v => html`<button type="button" class="chip" data-theme-chip="${v}">${t('settings.theme.' + v)}</button>`)}
      </div>
    </div>
  </div>
</div>
`;
}

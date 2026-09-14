/* The masthead and the settings menu.

   Ten copy-pasted shells become one module — which is also the fix for the
   drift between them (index.html had already lost the "by " its nine siblings
   carried). The settings menu is emitted as markup here rather than assembled
   by the client at DOMContentLoaded; only its behaviour stays in JS. */

import { html, raw, type Raw } from '../lib/html.ts';
import { translator } from '../i18n/index.ts';
import type { Lang } from '../lib/negotiate.ts';
import { counterpart, PAGES, routeFor, type Route } from '../lib/routes.ts';
import { cardKey } from './foot.ts';

const SLIDERS_SVG = raw(`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
      <line x1="4" y1="9" x2="20" y2="9"></line>
      <line x1="4" y1="15" x2="20" y2="15"></line>
      <circle cx="15" cy="9" r="2.3"></circle>
      <circle cx="9" cy="15" r="2.3"></circle>
    </svg>`);

const CHECK_SVG = raw(`<svg class="charts-menu-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="5 12.5 10 17.5 19 7"></polyline></svg>`);

const CHEVRON_SVG = raw(`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"></polyline>
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
      ${route.name === 'home' ? '' : html`<button type="button" class="charts-btn" data-charts-toggle aria-expanded="false" aria-controls="chartsMenu"><span>${t('nav.chartsMenu')}</span>${CHEVRON_SVG}</button>${chartsMenu(route)}`}
      <button type="button" class="settings-btn" data-settings-toggle aria-haspopup="dialog" aria-expanded="false" aria-label="${t('nav.settings')}">${SLIDERS_SVG}</button>
      ${settingsMenu(route)}
    </div>
  </div>
</header>
`;
}

/* The quick switcher: every chart in the reader's locale, the current one
   marked. Home is the chart list already, so it carries no switcher. Both
   panels follow their buttons in DOM order, so Tab enters them next; they
   are absolute inside the sticky masthead, so nothing is placed by JS. */
function chartsMenu(route: Route): Raw {
  const t = translator(route.lang);
  const charts = PAGES.filter(page => page.name !== 'home' && page.langs.includes(route.lang));
  return html`
<nav class="charts-menu" id="chartsMenu" hidden aria-label="${t('nav.charts')}">
  <ul class="charts-menu-list">
    ${charts.map(page => {
      const target = routeFor(page, route.lang);
      const current = target.name === route.name;
      return html`<li><a href="${target.path}"${current ? raw(' aria-current="page"') : ''}>${t(cardKey(page.name))}${current ? CHECK_SVG : ''}</a></li>`;
    })}
  </ul>
</nav>
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

/* The language chip's state IS derivable at build time — it is the route. The
   script and theme chips are not: theme-init has already read the stored
   preference by the time this markup paints, so baking `lat`/`system` here
   would assert the opposite of what the page is showing. app.js marks them. */
function settingsMenu(route: Route): Raw {
  const t = translator(route.lang);
  return html`
<div class="settings-menu" id="settingsMenu" hidden role="dialog" aria-label="${t('nav.settings')}">
  <div class="settings-menu-card">
    <div class="settings-row">
      <span class="settings-label">${t('settings.language')}</span>
      <div class="nav-controls" role="group" aria-label="${t('nav.langGroup')}">
        ${(['en', 'ru'] as const).map(lang => html`<a class="chip" data-lang-chip="${lang}" href="${langHref(route, lang)}"${lang === route.lang ? raw(' aria-current="true"') : ''}>${ENDONYMS[lang]}</a>`)}
      </div>
    </div>
    <div class="settings-row">
      <span class="settings-label">${t('settings.script')}</span>
      <div class="nav-controls script-controls" role="group" aria-label="${t('nav.scriptGroup')}">
        ${SCRIPTS.map(s => html`<button type="button" class="chip script-chip" data-script-chip="${s}" aria-label="${t(s === 'lat' ? 'script.useLat' : 'script.useCyr')}">${t(s === 'lat' ? 'script.lat' : 'script.cyr')}</button>`)}
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

/* The footer, and the chart-to-chart strip that lives in it.

   A cheat-sheet site is flipped between, not read through: before this the
   only route from cases to verbs was wordmark → home → card. */

import { html, raw, type Raw } from '../lib/html.ts';
import { translator } from '../i18n/index.ts';
import { PAGES, routeFor, type Route } from '../lib/routes.ts';

export function chartStrip(route: Route): Raw {
  const t = translator(route.lang);
  const others = PAGES
    .filter(page => page.name !== 'home' && page.langs.includes(route.lang));
  return html`
<nav class="foot-charts" aria-label="${t('nav.charts')}">
  <span class="chart-label foot-charts-label">${t('nav.charts')}</span>
  <ul class="foot-charts-list">
    ${others.map(page => {
      const target = routeFor(page, route.lang);
      const current = target.name === route.name;
      return html`<li><a href="${target.path}"${current ? raw(' aria-current="page"') : ''}>${t(cardKey(page.name))}</a></li>`;
    })}
  </ul>
</nav>
`;
}

/* Card titles double as the strip's labels — one string, one place. */
function cardKey(name: string): string {
  const key = name === 'pitch-stress' ? 'pitch'
    : name === 'false-friends' ? 'falseFriends'
    : name;
  return `card.${key}.title`;
}

export { cardKey };

export function footer(route: Route): Raw {
  const t = translator(route.lang);
  return html`
<footer class="foot shell">
  ${chartStrip(route)}
  <div class="foot-meta">
    <span>${t('foot.copy')}</span>
    <span>${t('foot.credit')}</span>
    <span>
      <a href="https://github.com/cwarck/serbian" rel="noopener" target="_blank">${t('foot.repo')}</a>
      &nbsp;·&nbsp;
      <a href="https://ilyaakimov.com" rel="noopener" target="_blank">${t('foot.author')}</a>
    </span>
  </div>
</footer>
`;
}

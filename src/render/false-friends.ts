import { html, sr, type Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { FALSE_FRIEND_GROUPS } from '../content/false-friends.ts';
import type { FalseFriend } from '../lib/types.ts';
import type { Chart } from './chart.ts';

type T = (key: string) => Raw;

/* Rows flagged `partial` DO carry the Russian sense as well (vreme = время and
   погода), so the badge says "not only" — the absolute "not" contradicted the
   meaning printed right above it. */
function row(item: FalseFriend, t: T): Raw {
  return html`
    <article class="chart-row">
      <div class="false-head">
        <span class="false-word" lang="sr">${sr(item.sr)}</span>
        <span class="false-means">${item.means}</span>
      </div>
      <div class="false-trap">
        <span class="chart-label false-not">${t(item.partial ? 'false.trap.partial' : 'false.trap.label')}</span>
        <span>${item.trap}</span>
        <small>${item.trapMeans}</small>
      </div>
      <div class="chart-example">
        <span class="sr" lang="sr">${sr(item.ex.sr)}</span>
        <span class="tr">${item.ex.ru}</span>
      </div>
    </article>
  `;
}

export const chart: Chart = {
  name: 'false-friends',
  mounts: (lang: Lang) => {
    const t = translator(lang);
    return {
      falseFriendsChart: FALSE_FRIEND_GROUPS.map(group => html`
    <section class="chart-group">
      <header class="chart-group-head">
        <h3>${t(group.key)}</h3>
      </header>
      <div class="chart-table">
        ${group.rows.map(item => row(item, t))}
      </div>
    </section>
  `.value).join(''),
    };
  },
};

import { html, raw, sr } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { PREP_GROUPS } from '../content/prepositions.ts';
import type { PrepGroup, PrepRow } from '../lib/types.ts';
import { renderPrepUse } from './prep-shared.ts';
import type { Chart } from './chart.ts';

/* One universal card per pedagogical group; the lemmas are its repeated
   items. A group mixes cases (u = AKU/LOK), so the card bar stays neutral
   and colour lives on each use's chip and icon dot. */
export const chart: Chart = {
  name: 'prepositions',
  mountAttrs: { prepChart: { class: 'card-list' } },
  mounts: (lang: Lang) => {
    const t = translator(lang);

    const item = (row: PrepRow) => html`
          <div class="card-item prep-row">
            <div class="prep-name" lang="sr">${sr(row.prep)}</div>
            <div class="prep-uses">${raw(row.uses.map(use => renderPrepUse(use, row.icon, lang).value).join(''))}</div>
          </div>`;

    const card = (g: PrepGroup) => html`
      <article class="card prep-card-group" id="${g.key.replace(/\./g, '-')}">
        <header class="card-head">
          <div class="card-title"><h3>${t(g.key)}</h3></div>
        </header>
        <section class="card-section">
          <div class="card-items">${raw(g.rows.map(row => item(row).value).join(''))}</div>
        </section>
      </article>`;

    return { prepChart: (PREP_GROUPS as readonly PrepGroup[]).map(g => card(g).value).join('') };
  },
};

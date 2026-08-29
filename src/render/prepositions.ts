import { html, raw, sr } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { CASE_KEYS, PREP_CASE_ABBR, PREP_GROUPS } from '../content/prepositions.ts';
import type { PrepGroup, PrepRow, PrepUse } from '../lib/types.ts';
import { prepIcon } from './prep-shared.ts';
import type { Chart } from './chart.ts';

export const chart: Chart = {
  name: 'prepositions',
  mounts: (lang: Lang) => {
    const t = translator(lang);

    /* The chip inherits --tone from its use (or card use) — the shared
       [data-tone] map is the only case→hue source. */
    const caseChip = (use: PrepUse) => raw(
      `<span class="chart-label prep-case">${
        (PREP_CASE_ABBR as Record<string, string | undefined>)[use.case]
        ?? t((CASE_KEYS as Record<string, string>)[use.case]!).value}</span>`);

    /* One row per use: its own icon beside its own chip, meaning and example.
       A dual-case preposition (pod, za…) no longer detaches its icons from the
       uses they illustrate. */
    const renderUse = (use: PrepUse, row: PrepRow) => html`
    <div class="prep-use" data-tone="${use.case}">
      <span class="prep-icon-cell">
        ${raw(prepIcon(use.icon || row.icon))}
        <span class="sr-only">${t((CASE_KEYS as Record<string, string>)[use.case]!)}</span>
      </span>
      <div class="prep-use-text">
        <div class="prep-use-head">
          ${caseChip(use)}
          <span class="prep-meaning">${use.meaning[lang] || use.meaning.en}</span>
        </div>
        <div class="chart-example prep-example">
          <span class="sr" lang="sr">${sr(use.sr)}</span>
          <span class="tr">${use.tr[lang] || use.tr.en}</span>
        </div>
      </div>
    </div>
  `;

    const group = (g: PrepGroup) => html`
    <section class="chart-group">
      <header class="chart-group-head">
        <h3>${t(g.key)}</h3>
      </header>
      <div class="chart-table">
        ${g.rows.map(row => html`
          <article class="chart-row prep-row">
            <div class="prep-name" lang="sr">${sr(row.prep)}</div>
            <div class="prep-uses">${(row.uses as readonly PrepUse[]).map(use => renderUse(use, row))}</div>
          </article>
        `)}
      </div>
    </section>
  `;

    return { prepChart: (PREP_GROUPS as readonly PrepGroup[]).map(g => group(g).value).join('') };
  },
};

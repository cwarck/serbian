/* Render a chart the way the build does, then present it for comparison
   against the pre-rewrite fixtures.

   The build emits both alphabets and lets CSS choose; the old renderer emitted
   one. Collapsing the wrapper per script is the single intended difference
   (tests/harness/normalizers.ts) — so one render feeds both script columns of
   the matrix, and a wrong dual-emit shows up as a diff in exactly one of them. */

import type { Chart } from '../../src/render/chart.ts';
import type { Lang } from '../../src/lib/negotiate.ts';
import { collapseDualEmit, dropBakedNoteLabels, type Script } from './normalizers.ts';
import { findTriggers } from './normalize.ts';

export interface Rendered {
  mounts: Record<string, string>;
  popovers: Record<string, string>;
}

export function renderChart(chart: Chart, lang: Lang, script: Script): Rendered {
  const mounts: Record<string, string> = {};
  for (const [id, markup] of Object.entries(chart.mounts(lang))) {
    mounts[id] = dropBakedNoteLabels(collapseDualEmit(markup, script), script);
  }

  const pageHTML = Object.values(mounts).join('\n');
  const popovers: Record<string, string> = {};
  for (const reg of chart.popovers ?? []) {
    const seen = new Set<string>();
    for (const attrs of findTriggers(pageHTML, reg.match) as Record<string, string>[]) {
      const dataAttrs = Object.entries(attrs).filter(([k]) => k.startsWith('data-')).sort();
      const key = `${reg.match}|${JSON.stringify(dataAttrs)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const out = String(reg.render(attrs, lang) ?? '');
      if (out) popovers[key] = collapseDualEmit(out, script);
    }
  }
  return { mounts, popovers };
}

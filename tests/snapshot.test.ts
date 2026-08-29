import { expect, test } from 'bun:test';
import fs from 'node:fs';
import { normalizeHTML } from './harness/normalize.ts';
import { renderChart } from './harness/render-build.ts';
import { CHARTS, LANGS, SCRIPTS, serialize } from './harness/matrix.ts';
import type { Chart } from '../src/render/chart.ts';

/* The gate. Every ported renderer is diffed against the baseline captured from
   the pre-rewrite tree, over 2 languages x 2 scripts, page markup and popover
   fragments alike — normalized HTML, not text, because this codebase encodes
   its meaning in attributes (data-tone is the whole colour system).

   All nine charts were proved byte-identical against the pre-rewrite baseline
   before that tree was deleted; the fixtures now guard against regressions.
   `bun tests/snapshot.ts` rewrites them when a change is intentional. */

const cases = CHARTS.flatMap(name =>
  LANGS.flatMap(lang => SCRIPTS.map(script => [name, lang, script] as const)));

test.each(cases)('%s / %s / %s matches the pre-rewrite baseline', async (name, lang, script) => {
  const module = (await import(`../src/render/${name}.ts`)) as { chart: Chart };
  const actual = serialize(renderChart(module.chart, lang, script), normalizeHTML);
  const expected = fs.readFileSync(`tests/fixtures/${name}.${lang}.${script}.txt`, 'utf8');
  expect(actual).toBe(expected);
});

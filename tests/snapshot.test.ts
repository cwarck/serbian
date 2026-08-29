import { expect, test } from 'bun:test';
import fs from 'node:fs';
import { normalizeHTML } from './harness/normalize.mjs';
import { renderChart } from './harness/render-build.ts';
import type { Chart } from '../src/render/chart.ts';
import type { Lang } from '../src/lib/negotiate.ts';
import type { Script } from './harness/normalizers.ts';

/* The gate. Every ported renderer is diffed against the baseline captured from
   the pre-rewrite tree, over 2 languages x 2 scripts, page markup and popover
   fragments alike — normalized HTML, not text, because this codebase encodes
   its meaning in attributes (data-tone is the whole colour system).

   Charts land here one at a time as they are ported; PORTED is the list that
   has. When it names all nine, phase 2 is done. */

const PORTED = ['alphabet', 'false-friends', 'aspect', 'numbers', 'pronouns', 'pitch-stress', 'verbs'] as const;

const LANGS: Lang[] = ['en', 'ru'];
const SCRIPTS: Script[] = ['lat', 'cyr'];

function serialize(rendered: { mounts: Record<string, string>; popovers: Record<string, string> }): string {
  const out: string[] = [];
  for (const [id, markup] of Object.entries(rendered.mounts)) out.push(`### mount ${id}`, normalizeHTML(markup));
  for (const key of Object.keys(rendered.popovers).sort()) out.push(`### popover ${key}`, normalizeHTML(rendered.popovers[key]!));
  return out.join('\n') + '\n';
}

const cases = PORTED.flatMap(name => LANGS.flatMap(lang => SCRIPTS.map(script => [name, lang, script] as const)));

test.each(cases)('%s / %s / %s matches the pre-rewrite baseline', async (name, lang, script) => {
  const module = (await import(`../src/render/${name}.ts`)) as { chart: Chart };
  const actual = serialize(renderChart(module.chart, lang, script));
  const expected = fs.readFileSync(`tests/fixtures/${name}.${lang}.${script}.txt`, 'utf8');
  expect(actual).toBe(expected);
});

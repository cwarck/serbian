/* Rewrite the render baselines from the current renderers.
   `bun tests/snapshot.ts` — then read the diff before committing it.

   The fixtures were captured from the pre-rewrite tree and the port was proved
   against them byte for byte (see the phase-2 commits). That generator is gone
   with the tree it ran; from here the fixtures are ordinary regression
   baselines, and an intentional change updates them in a commit that says so.
   A diff you did not expect is the point of the whole file. */

import fs from 'node:fs';
import { normalizeHTML } from './harness/normalize.ts';
import { renderChart } from './harness/render-build.ts';
import { CHARTS, LANGS, SCRIPTS, serialize } from './harness/matrix.ts';

let files = 0;
for (const name of CHARTS) {
  const { chart } = await import(`../src/render/${name}.ts`);
  for (const lang of LANGS) {
    for (const script of SCRIPTS) {
      const out = serialize(renderChart(chart, lang, script), normalizeHTML);
      fs.writeFileSync(`tests/fixtures/${name}.${lang}.${script}.txt`, out);
      files++;
    }
  }
}
console.log(`wrote ${files} baselines`);

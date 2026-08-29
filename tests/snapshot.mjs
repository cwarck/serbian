/* Regression baselines for the rewrite.
   `bun tests/snapshot.mjs write` captures; `check` (the default) diffs.

   The fixtures are the rewrite's only safety net: they pin what the current
   renderers emit, over the full matrix of 9 charts x 2 languages x 2 scripts,
   plus every popover fragment — which never appears in a page snapshot because
   it exists only after a click. */

import fs from 'node:fs';
import path from 'node:path';
import { PAGES, LANGS, SCRIPTS, renderPage } from './harness/render-legacy.mjs';
import { normalizeHTML } from './harness/normalize.ts';

const DIR = path.join(process.cwd(), 'tests/fixtures');

function fixtureName(page, lang, script) { return `${page}.${lang}.${script}.txt`; }

function serialize({ mounts, popovers }) {
  const out = [];
  for (const [id, html] of Object.entries(mounts)) {
    out.push(`### mount ${id}`, normalizeHTML(html));
  }
  for (const key of Object.keys(popovers).sort()) {
    out.push(`### popover ${key}`, normalizeHTML(popovers[key]));
  }
  return out.join('\n') + '\n';
}

function eachCell(fn) {
  for (const page of PAGES) for (const lang of LANGS) for (const script of SCRIPTS) fn(page, lang, script);
}

function firstDiff(a, b) {
  const la = a.split('\n'), lb = b.split('\n');
  for (let i = 0; i < Math.max(la.length, lb.length); i++) {
    if (la[i] !== lb[i]) return `  line ${i + 1}\n  - ${la[i] ?? '<eof>'}\n  + ${lb[i] ?? '<eof>'}`;
  }
  return '  (trailing whitespace only)';
}

const mode = process.argv[2] || 'check';

if (mode === 'write') {
  fs.mkdirSync(DIR, { recursive: true });
  let n = 0, popovers = 0;
  eachCell((page, lang, script) => {
    const result = renderPage(page, lang, script);
    popovers += Object.keys(result.popovers).length;
    fs.writeFileSync(path.join(DIR, fixtureName(page.name, lang, script)), serialize(result));
    n++;
  });
  console.log(`wrote ${n} baselines (${popovers} popover fragments)`);
} else {
  const failures = [];
  eachCell((page, lang, script) => {
    const file = path.join(DIR, fixtureName(page.name, lang, script));
    const actual = serialize(renderPage(page, lang, script));
    if (!fs.existsSync(file)) { failures.push(`missing baseline ${path.basename(file)}`); return; }
    const expected = fs.readFileSync(file, 'utf8');
    if (actual !== expected) failures.push(`${path.basename(file)} differs\n${firstDiff(expected, actual)}`);
  });
  if (failures.length) {
    console.error(`Snapshot check failed (${failures.length})`);
    failures.forEach(f => console.error('- ' + f));
    process.exit(1);
  }
  console.log('Snapshots match');
}

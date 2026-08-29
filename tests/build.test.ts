import { expect, test, beforeAll } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { build } from '../build.ts';
import { ROUTES } from '../src/lib/routes.ts';
import { CASES } from '../src/content/cases.ts';
import { CASE_TONES } from '../src/lib/types.ts';
import { caseAnchor } from '../src/render/cases.ts';

/* Emission asserts that outlive the port. The snapshot gate compares renderer
   output; these check what the whole document must be true of, and would each
   have caught a real class of silent failure. */

const OUT = 'dist';
const pages = new Map<string, string>();

beforeAll(async () => {
  await build();
  for (const route of ROUTES) pages.set(route.path, fs.readFileSync(path.join(OUT, route.file), 'utf8'));
});

test('every route emits a document', () => {
  expect(pages.size).toBe(19);
  for (const [route, html] of pages) expect(html.length, route).toBeGreaterThan(1000);
});

/* index.html's eight card glyphs were the one place the alphabet toggle could
   silently stop reaching: they were hand-typed into the HTML with
   `data-sr-script` and rewritten in place, so they never passed through sr().
   No such attribute may survive into the build. */
test('no data-sr-script survives into dist', () => {
  for (const [route, html] of pages) expect(html, route).not.toContain('data-sr-script');
});

test('no runtime i18n attributes survive into dist', () => {
  for (const [route, html] of pages) {
    expect(html, route).not.toContain('data-i18n');
  }
});

test('sr() never emits class="sr" — .sr is a live specimen class', () => {
  for (const [route, html] of pages) {
    expect(html, route).not.toContain('<span class="sr"><i data-s=');
  }
});

/* Symmetric display rules would render `žena жена` on any document without
   data-script. The baseline must hide exactly one variant. */
test('the attribute-less rendering hides exactly one script', () => {
  const css = fs.readFileSync(path.join(OUT, 'assets/styles.css'), 'utf8');
  const baseline = css.match(/^\[data-s="(lat|cyr)"\]\s*\{\s*display:\s*none/m);
  expect(baseline, 'a baseline [data-s] display:none rule must exist').not.toBeNull();
  const flip = css.match(/\[data-script="cyr"\][^{]*\[data-s="(lat|cyr)"\]/g);
  expect(flip, 'the [data-script="cyr"] flip must exist').not.toBeNull();
});

test('every page carries one <main>, a skip link, and a noscript line', () => {
  for (const [route, html] of pages) {
    expect(html.match(/<main\b/g)?.length, route).toBe(1);
    expect(html, route).toContain('class="skip-link" href="#content"');
    expect(html, route).toContain('<noscript>');
  }
});

test('every page can reach every other chart', () => {
  for (const [route, html] of pages) {
    expect(html, route).toContain('class="foot-charts"');
  }
});

/* data-tone on a case row IS the colour system. A build that dropped it would
   pass a text-only diff while all seven cases rendered in undifferentiated ink. */
test('every case row carries a tone from the seven-value set', () => {
  for (const route of ['/charts/cases.html', '/ru/charts/cases.html']) {
    const html = pages.get(route)!;
    const rows = [...html.matchAll(/<article class="case-row" id="([^"]+)" data-tone="([^"]+)">/g)];
    expect(rows.length, route).toBe(7);
    for (const [, , tone] of rows) expect(CASE_TONES).toContain(tone as never);
  }
});

test('every case anchor the strip points at exists in the page', () => {
  for (const route of ['/charts/cases.html', '/ru/charts/cases.html']) {
    const html = pages.get(route)!;
    for (const c of CASES) {
      const id = caseAnchor(c.key);
      expect(html, `${route} #${id}`).toContain(`id="${id}"`);
      expect(html, `${route} strip -> #${id}`).toContain(`href="#${id}"`);
    }
  }
});

test('each locale serves its own language in the head', () => {
  const en = pages.get('/charts/cases.html')!;
  const ru = pages.get('/ru/charts/cases.html')!;
  expect(en).toContain('<html lang="en">');
  expect(ru).toContain('<html lang="ru">');
  expect(en).toContain('<title>Seven cases — serbian.fyi</title>');
  expect(ru).toContain('<title>Семь падежей — serbian.fyi</title>');
  expect(ru).toMatch(/<meta name="description" content="Семь падежей/);
});

test('every page declares its canonical and its alternate', () => {
  for (const [route, html] of pages) {
    expect(html, route).toContain(`<link rel="canonical" href="https://serbian.fyi${route}">`);
    expect(html, route).toContain('hreflang=');
  }
});

/* Serbian specimens must be reachable by assistive tech in the served bytes. */
test('every chart page marks its Serbian with lang="sr"', () => {
  for (const [route, html] of pages) {
    if (route === '/' || route === '/ru/') continue;
    expect((html.match(/lang="sr"/g) ?? []).length, route).toBeGreaterThan(10);
  }
});

test('_headers and _redirects land at the dist root', () => {
  expect(fs.existsSync(path.join(OUT, '_headers'))).toBe(true);
  expect(fs.existsSync(path.join(OUT, '_redirects'))).toBe(true);
  expect(fs.existsSync(path.join(OUT, 'public'))).toBe(false);
});

/* Three things hard-code this prefix and none of them should move: _headers'
   immutable rule, the preload tags, and the 12 url('fonts/…') declarations in
   styles.css, which resolve relative to the stylesheet's own directory. */
test('fonts land at dist/assets/fonts/', () => {
  const fonts = fs.readdirSync(path.join(OUT, 'assets/fonts'));
  expect(fonts.filter(f => f.endsWith('.woff2')).length).toBe(12);
});

test('the stylesheet is not collapsed to one line — the tone audit scans it', () => {
  const css = fs.readFileSync(path.join(OUT, 'assets/styles.css'), 'utf8');
  expect(css.split('\n').length).toBeGreaterThan(1000);
});

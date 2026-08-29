import { expect, test, beforeAll } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { build } from '../build.ts';
import { ROUTES } from '../src/lib/routes.ts';
import { CASES } from '../src/content/cases.ts';
import { CASE_TONES } from '../src/lib/types.ts';
import { caseAnchor } from '../src/render/cases.ts';
import { findTriggers, popoverKey } from '../src/lib/triggers.ts';

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

/* The build emits popover bodies as <template> nodes and the client looks them
   up by a key derived from the trigger's own attributes. Nothing links the two
   but that derivation — so assert it end to end on the real output. Every
   trigger the page renders must resolve to a template that exists. */
const TRIGGER_SELECTORS = [
  '.tip-chip', '[data-note-trigger]', '[data-prep]',
  '[data-verb-tip]', '[data-pitch-note]', '[data-aspect-note]',
];

test('every popover trigger resolves to a template in the same document', () => {
  let checked = 0;
  for (const [route, html] of pages) {
    const templateIds = new Set(
      [...html.matchAll(/<template id="([^"]+)"/g)].map(m => m[1]!));
    for (const selector of TRIGGER_SELECTORS) {
      for (const attrs of findTriggers(html, selector)) {
        if (attrs['class']?.includes('tip-pop-close')) continue;
        const key = popoverKey(attrs);
        expect(templateIds.has(key), `${route}: no template for ${key}`).toBe(true);
        checked++;
      }
    }
  }
  /* If this ever drops to zero the assertion above stops meaning anything. */
  expect(checked).toBeGreaterThan(100);
});

test('no template is emitted that no trigger can reach', () => {
  for (const [route, html] of pages) {
    const reachable = new Set<string>();
    for (const selector of TRIGGER_SELECTORS) {
      for (const attrs of findTriggers(html, selector)) reachable.add(popoverKey(attrs));
    }
    for (const [, id] of html.matchAll(/<template id="([^"]+)"/g)) {
      expect(reachable.has(id!), `${route}: unreachable template ${id}`).toBe(true);
    }
  }
});

/* Both scripts must be in the served bytes, or the toggle has nothing to
   switch between — the failure mode is invisible until someone clicks. */
test('every chart page ships both alphabets', () => {
  for (const [route, html] of pages) {
    if (route === '/' || route === '/ru/') continue;
    /* The alphabet chart shows both scripts side by side — the columns ARE the
       content — so it dual-emits nothing and the toggle correctly does nothing
       there. Every other chart must carry both. */
    if (route.endsWith('/alphabet.html')) continue;
    const lat = (html.match(/data-s="lat"/g) ?? []).length;
    const cyr = (html.match(/data-s="cyr"/g) ?? []).length;
    expect(lat, route).toBeGreaterThan(10);
    expect(cyr, route).toBe(lat);
  }
});

/* The home page's card glyphs are the one place this could silently fail:
   they used to be hand-typed, and no chart-data-driven test would notice. */
test('the home cards dual-emit their Serbian glyphs', () => {
  for (const route of ['/', '/ru/']) {
    const html = pages.get(route)!;
    const glyphs = [...html.matchAll(/<span class="chart-glyph"[^>]*>([\s\S]*?)<\/span>\s*<span class="chart-meta">/g)];
    expect(glyphs.length, route).toBe(route === '/' ? 8 : 9);
    const dual = glyphs.filter(m => m[1]!.includes('data-s="cyr"'));
    /* Six carry Serbian; 1·2·3, the pitch marks and \u2260 are script-invariant. */
    expect(dual.length, route).toBe(6);
  }
});

test('the client bundle carries no transliteration table', () => {
  const app = fs.readFileSync(path.join(OUT, 'assets/app.js'), 'utf8');
  for (const cyrillic of ['\u0436', '\u0459', '\u045a', '\u045f']) {
    expect(app, `app.js still ships ${cyrillic}`).not.toContain(cyrillic);
  }
  expect(app.length).toBeLessThan(20000);
});

import { expect, test } from 'bun:test';
import { resolveRedirect, ruPath } from '../src/lib/negotiate.ts';
import { ROUTES, PAGES, counterpart, routeFor } from '../src/lib/routes.ts';

const STORED = [null, 'en', 'ru'] as const;
const NAV = [['ru-RS', 'ru', 'en'], ['en-US', 'en'], []] as const;

test('the route matrix is 19 documents', () => {
  expect(ROUTES.length).toBe(19);
  expect(ROUTES.filter(r => r.lang === 'en').length).toBe(9);
  expect(ROUTES.filter(r => r.lang === 'ru').length).toBe(10);
});

test('every route resolves to a distinct output file', () => {
  expect(new Set(ROUTES.map(r => r.file)).size).toBe(ROUTES.length);
});

test('EN keeps today\'s URLs', () => {
  const en = ROUTES.filter(r => r.lang === 'en').map(r => r.path);
  expect(en).toContain('/');
  expect(en).toContain('/charts/cases.html');
  expect(en).not.toContain('/charts/false-friends.html');
});

/* 19 routes x {stored en, ru, none} x {nav ru-first, en-first, empty}. */
test('the redirect table terminates in at most one hop', () => {
  for (const route of ROUTES) {
    for (const stored of STORED) {
      for (const nav of NAV) {
        const to = resolveRedirect(route.path, stored, nav);
        if (route.lang === 'ru') {
          expect(to).toBeNull();                       // a /ru/ URL is explicit
          continue;
        }
        const wantsRu = stored === 'ru' || (stored === null && nav[0]?.startsWith('ru'));
        if (!wantsRu) { expect(to).toBeNull(); continue; }
        expect(to).toBe(ruPath(route.path));
        expect(resolveRedirect(to!, stored, nav)).toBeNull();   // second hop: none
      }
    }
  }
});

test('the switcher writes as_lang before navigating, so arrival agrees', () => {
  // /ru/x + EN chip -> as_lang='en', navigate to /x: no bounce back.
  expect(resolveRedirect('/charts/cases.html', 'en', ['ru'])).toBeNull();
  // /x + RU chip -> as_lang='ru', navigate to /ru/x: the /ru/ branch wins.
  expect(resolveRedirect('/ru/charts/cases.html', 'ru', ['en'])).toBeNull();
  // a /ru/ link shared with a stored-EN reader: the URL wins.
  expect(resolveRedirect('/ru/charts/cases.html', 'en', ['en'])).toBeNull();
});

test('an unsupported navigator language falls back to EN', () => {
  expect(resolveRedirect('/', null, ['de-DE', 'fr'])).toBeNull();
  expect(resolveRedirect('/', null, ['de-DE', 'ru'])).toBe('/ru/');
});

test('false-friends has no EN counterpart; every other page pairs up', () => {
  for (const page of PAGES) {
    for (const lang of page.langs) {
      const other = counterpart(routeFor(page, lang));
      if (page.name === 'false-friends') expect(other).toBeNull();
      else expect(other?.lang).toBe(lang === 'en' ? 'ru' : 'en');
    }
  }
});

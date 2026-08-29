/* The route matrix. 10 documents x 2 locales, minus the EN false-friends page
   (written for Russian speakers; the EN path becomes a permanent _redirects
   entry, since no EN counterpart will ever exist). */

import { LANGS, type Lang, ruPath } from './negotiate.ts';

export interface PageDef {
  /* Chart module name; also the fixture and renderer key. `home` is the index. */
  readonly name: string;
  /* EN path. RU is this path under /ru/. */
  readonly path: string;
  /* Locales this document exists in. */
  readonly langs: readonly Lang[];
}

export const PAGES: readonly PageDef[] = [
  { name: 'home',          path: '/',                            langs: LANGS },
  { name: 'alphabet',      path: '/charts/alphabet.html',        langs: LANGS },
  { name: 'numbers',       path: '/charts/numbers.html',         langs: LANGS },
  { name: 'cases',         path: '/charts/cases.html',           langs: LANGS },
  { name: 'verbs',         path: '/charts/verbs.html',           langs: LANGS },
  { name: 'pronouns',      path: '/charts/pronouns.html',        langs: LANGS },
  { name: 'prepositions',  path: '/charts/prepositions.html',    langs: LANGS },
  { name: 'aspect',        path: '/charts/aspect.html',          langs: LANGS },
  { name: 'pitch-stress',  path: '/charts/pitch-stress.html',    langs: LANGS },
  { name: 'false-friends', path: '/charts/false-friends.html',   langs: ['ru'] },
];

export interface Route {
  readonly name: string;
  readonly lang: Lang;
  readonly path: string;
  /* Where the file lands under dist/. */
  readonly file: string;
}

export function routeFor(page: PageDef, lang: Lang): Route {
  const path = lang === 'en' ? page.path : ruPath(page.path);
  const file = (path.endsWith('/') ? path + 'index.html' : path).replace(/^\//, '');
  return { name: page.name, lang, path, file };
}

export const ROUTES: readonly Route[] = PAGES.flatMap(page =>
  page.langs.map(lang => routeFor(page, lang)));

/* The counterpart route in the other locale, for hreflang alternates and the
   language chip's href. Null when the document exists in one locale only. */
export function counterpart(route: Route): Route | null {
  const page = PAGES.find(p => p.name === route.name);
  if (!page) return null;
  const other: Lang = route.lang === 'en' ? 'ru' : 'en';
  return page.langs.includes(other) ? routeFor(page, other) : null;
}

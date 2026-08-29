/* The page shell — one module, nineteen outputs.

   This replaces ten copy-pasted HTML files, which is also the fix for the drift
   between them. The chart slot is filled by the per-chart renderer (phase 2);
   the head, masthead, settings menu, footer and chart strip live here. */

import { html, raw, type Raw } from '../lib/html.ts';
import { counterpart, type Route } from '../lib/routes.ts';

export interface PageBody {
  /* Everything between <main> and </main>. */
  readonly main: Raw;
  /* Optional markup between the masthead and <main> (the cases strip). */
  readonly beforeMain?: Raw;
}

/* Fonts are preloaded from the stable /assets/fonts/ prefix — _headers pins
   `immutable` there and styles.css resolves its 12 url('fonts/…') rules
   relative to its own directory. */
const PRELOADS = [
  '/assets/fonts/source-sans-3-normal-latin.woff2',
  '/assets/fonts/source-serif-4-normal-latin.woff2',
];

export function documentHTML(route: Route, page: PageBody, head: {
  title: string;
  description: string;
}): string {
  const other = counterpart(route);
  return '<!doctype html>\n' + html`<html lang="${route.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${head.description}">
<title>${head.title}</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="canonical" href="${'https://serbian.fyi' + route.path}">
${other ? raw(`<link rel="alternate" hreflang="${other.lang}" href="https://serbian.fyi${other.path}">`) : ''}
<link rel="alternate" hreflang="${route.lang}" href="${'https://serbian.fyi' + route.path}">

<script src="/assets/theme-init.js"></script>

${raw(PRELOADS.map(href =>
  `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`).join('\n'))}
<link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
${page.beforeMain ?? ''}
<main id="content">
${page.main}
</main>
<script src="/assets/app.js"></script>
</body>
</html>
`.value;
}

/* Scaffold stand-in. The real per-route content arrives with the renderers
   (plan phase 2); until then the build is exercised end to end on an empty
   shell so `bun run build` is a thing that can fail early. */
export async function renderPage(route: Route): Promise<string> {
  return documentHTML(route, { main: html`` }, {
    title: `${route.name} — serbian.fyi`,
    description: '',
  });
}

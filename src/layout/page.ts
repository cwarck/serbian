/* The page shell — one module, nineteen outputs.

   This replaces ten copy-pasted HTML files, which is also the fix for the
   drift between them. Everything the reader sees is in the served bytes: the
   Serbian text, the <title>, the description, in the reader's own language. */

import { html, raw, type Raw } from '../lib/html.ts';
import { text } from '../i18n/index.ts';
import { counterpart, type Route } from '../lib/routes.ts';
import { masthead, settingsMenu } from './nav.ts';
import { footer } from './foot.ts';
import { home, chartBody } from './body.ts';
import { findTriggers, popoverKey } from '../lib/triggers.ts';
import type { Chart } from '../render/chart.ts';
import type { Lang } from '../lib/negotiate.ts';

const ORIGIN = 'https://serbian.fyi';

/* Fonts are preloaded from the stable /assets/fonts/ prefix — _headers pins
   `immutable` there and styles.css resolves its 12 url('fonts/…') rules
   relative to its own directory. */
const PRELOADS = [
  '/assets/fonts/source-sans-3-normal-latin.woff2',
  '/assets/fonts/source-serif-4-normal-latin.woff2',
];

/* Page name -> the i18n key stem for its title and description. */
function headKeys(name: string): { title: string; desc: string } {
  const stem = name === 'home' ? 'index'
    : name === 'pitch-stress' ? 'pitch'
    : name === 'false-friends' ? 'falseFriends'
    : name;
  return { title: `page.${stem}.title`, desc: `page.${stem}.desc` };
}

/* Popover bodies ship as inert <template> nodes; the shell clones instead of
   assigning innerHTML. Cheaper than it sounds and cheaper than today — the
   markup is repetitive and compresses about 12:1, against the runtime cost of
   shipping the data files and re-rendering on every open. */
function popoverTemplates(chart: Chart, mounts: Record<string, string>, lang: Lang): Raw {
  const pageHTML = Object.values(mounts).join('\n');
  const seen = new Set<string>();
  const out: string[] = [];
  for (const reg of chart.popovers ?? []) {
    for (const attrs of findTriggers(pageHTML, reg.match)) {
      const key = popoverKey(attrs);
      if (seen.has(key)) continue;
      seen.add(key);
      const markup = String(reg.render(attrs, lang) ?? '');
      if (!markup) continue;
      const tone = reg.tone?.(attrs) ?? '';
      out.push(`<template id="${key}"${reg.variant ? ` data-variant="${reg.variant}"` : ''}${tone ? ` data-tone="${tone}"` : ''}>${markup}</template>`);
    }
  }
  return raw(out.join('\n'));
}

export function documentHTML(route: Route, body: { main: Raw; beforeMain?: Raw; templates?: Raw }): string {
  const t = (key: string) => text(route.lang, key);
  const keys = headKeys(route.name);
  const other = counterpart(route);

  const alternates = [
    `<link rel="alternate" hreflang="${route.lang}" href="${ORIGIN}${route.path}">`,
    ...(other ? [
      `<link rel="alternate" hreflang="${other.lang}" href="${ORIGIN}${other.path}">`,
      `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${route.lang === 'en' ? route.path : other.path}">`,
    ] : []),
  ].join('\n');

  return '<!doctype html>\n' + html`<html lang="${route.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${t(keys.desc)}">
<title>${t(keys.title)}</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="canonical" href="${ORIGIN + route.path}">
${raw(alternates)}

<script src="/assets/theme-init.js"></script>

${raw(PRELOADS.map(href =>
  `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`).join('\n'))}
<link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
${masthead(route)}${body.beforeMain ?? ''}
<main id="content"${route.name === 'home' ? raw(' class="home shell"') : ''}>
<noscript><p class="noscript-note">${t('nav.noscript')}</p></noscript>
${body.main}</main>
${footer(route)}${settingsMenu(route)}
${body.templates ?? ''}
<script src="/assets/app.js"></script>
</body>
</html>
`.value;
}

const CHART_MODULES: Record<string, () => Promise<{ chart: Chart }>> = {
  alphabet: () => import('../render/alphabet.ts'),
  aspect: () => import('../render/aspect.ts'),
  cases: () => import('../render/cases.ts'),
  'false-friends': () => import('../render/false-friends.ts'),
  numbers: () => import('../render/numbers.ts'),
  'pitch-stress': () => import('../render/pitch-stress.ts'),
  prepositions: () => import('../render/prepositions.ts'),
  pronouns: () => import('../render/pronouns.ts'),
  verbs: () => import('../render/verbs.ts'),
};

export async function renderPage(route: Route): Promise<string> {
  if (route.name === 'home') {
    return documentHTML(route, { main: home(route) });
  }
  const load = CHART_MODULES[route.name];
  if (!load) throw new Error(`no renderer for route "${route.name}"`);
  const { chart } = await load();
  const mounts = chart.mounts(route.lang);
  const body = chartBody(chart, mounts, route);
  return documentHTML(route, { ...body, templates: popoverTemplates(chart, mounts, route.lang) });
}

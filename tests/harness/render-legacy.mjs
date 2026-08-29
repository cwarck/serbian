/* Run the pre-rewrite renderers headless and collect everything they emit:
   the page mount points, and every popover fragment reachable from a trigger
   the page actually rendered. Throwaway — dies with the old tree. */

import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { makeContext, flattenWindow } from './dom.mjs';
import { findTriggers } from './normalize.mjs';

const ROOT = process.cwd();

export const LANGS = ['en', 'ru'];
export const SCRIPTS = ['lat', 'cyr'];

export const PAGES = [
  { name: 'alphabet',      mounts: ['alphGrid'],           scripts: ['alphabet-data.js', 'alphabet.js'] },
  { name: 'aspect',        mounts: ['aspectChart'],        scripts: ['aspect-data.js', 'aspect.js'] },
  { name: 'cases',         mounts: ['caseStripList', 'caseList', 'extraPack'],
    scripts: ['prepositions-data.js', 'prepositions-shared.js', 'cases-data.js', 'cases.js'] },
  { name: 'false-friends', mounts: ['falseFriendsChart'],  scripts: ['false-friends-data.js', 'false-friends.js'] },
  { name: 'numbers',       mounts: ['numbersChart'],       scripts: ['numbers-data.js', 'numbers.js'] },
  { name: 'pitch-stress',  mounts: ['pitchChart'],         scripts: ['pitch-stress-data.js', 'pitch-stress.js'] },
  { name: 'prepositions',  mounts: ['prepChart'],          scripts: ['prepositions-data.js', 'prepositions-shared.js', 'prepositions.js'] },
  { name: 'pronouns',      mounts: ['personalPronouns', 'possessives', 'demonstratives', 'questions'],
    scripts: ['pronouns-data.js', 'pronouns.js'] },
  { name: 'verbs',         mounts: ['verbGrid'],           scripts: ['verbs-data.js', 'verbs.js'] },
];

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

/* A trigger stand-in: the popover renderers only ever read getAttribute and
   dataset off the element they are handed. */
function fakeTrigger(attrs) {
  const dataset = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (!k.startsWith('data-')) continue;
    dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return {
    dataset,
    getAttribute: name => (name in attrs ? attrs[name] : null),
    setAttribute() {},
    hasAttribute: name => name in attrs,
  };
}

export function renderPage(page, lang, script) {
  const { context, elements } = makeContext({ lang, script, mounts: page.mounts });

  const registry = [];
  vm.runInContext(read('assets/i18n.js'), context);
  flattenWindow(context);
  vm.runInContext(read('data/glossary.js'), context);
  flattenWindow(context);
  vm.runInContext(read('assets/app.js'), context);
  flattenWindow(context);

  // Intercept registrations instead of driving real clicks.
  const realRegister = context.window.SerbianFyi.popover.register;
  context.window.SerbianFyi.popover.register = (descriptor) => {
    registry.push(descriptor);
    return realRegister.call(context.window.SerbianFyi.popover, descriptor);
  };

  for (const s of page.scripts) {
    vm.runInContext(read(`assets/charts/${s}`), context);
    flattenWindow(context);
  }

  const mounts = {};
  for (const id of page.mounts) mounts[id] = elements.get(id).innerHTML;

  const pageHTML = Object.values(mounts).join('\n');
  const popovers = {};
  for (const reg of registry) {
    const seen = new Set();
    for (const attrs of findTriggers(pageHTML, reg.match)) {
      const key = `${reg.match}|${JSON.stringify(Object.entries(attrs).filter(([k]) => k.startsWith('data-')).sort())}`;
      if (seen.has(key)) continue;
      seen.add(key);
      let html = '';
      try { html = reg.render(fakeTrigger(attrs)) || ''; } catch (e) { html = `<!-- render error: ${e.message} -->`; }
      if (html) popovers[key] = html;
    }
  }
  return { mounts, popovers };
}

export function renderAll() {
  const out = {};
  for (const page of PAGES) {
    for (const lang of LANGS) {
      for (const script of SCRIPTS) {
        out[`${page.name}/${lang}/${script}`] = renderPage(page, lang, script);
      }
    }
  }
  return out;
}

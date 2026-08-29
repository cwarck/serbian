import { expect, test } from 'bun:test';
import vm from 'node:vm';
import fs from 'node:fs';

/* Phase 1 is a verbatim port: the TypeScript content must deep-equal the
   JavaScript it replaced, value for value. Deleted with the old tree at
   phase 5.5, by which point the snapshot fixtures carry the same guarantee. */

const FILES: [string, string, string[]][] = [
  ['alphabet',      'assets/charts/alphabet-data.js',      ['ALPHABET']],
  ['aspect',        'assets/charts/aspect-data.js',        ['CONTRAST', 'TIME_ROWS', 'PATTERNS', 'PREFIXES', 'COMMON_PAIRS']],
  ['cases',         'assets/charts/cases-data.js',         ['CASES', 'IDECL', 'WRINKLES', 'ENDING_AXES']],
  ['false-friends', 'assets/charts/false-friends-data.js', ['FALSE_FRIEND_GROUPS']],
  ['numbers',       'assets/charts/numbers-data.js',       ['CARDINALS', 'NUMBER_BUILDS', 'NOUN_COUNTS', 'ORDINALS']],
  ['pitch-stress',  'assets/charts/pitch-stress-data.js',  ['PITCH_ACCENTS', 'PITCH_RULES', 'PITCH_PARADIGMS', 'PITCH_PRIORITY', 'PITCH_READING', 'PITCH_NOTES']],
  ['prepositions',  'assets/charts/prepositions-data.js',  ['CASE_KEYS', 'PREP_CASE_ABBR', 'PREP_GROUPS']],
  ['pronouns',      'assets/charts/pronouns-data.js',      ['PERSONAL', 'POSSESSIVES', 'DEMOS', 'QUESTIONS']],
  ['verbs',         'assets/charts/verbs-data.js',         ['PRONOUNS', 'VERB_GROUPS', 'IRREGULARS', 'PAST', 'FUTURE', 'CLITICS']],
];

function legacy(file: string, names: string[]): Record<string, unknown> {
  const context: any = { console };
  vm.createContext(context);
  vm.runInContext(
    `${fs.readFileSync(file, 'utf8')}\nglobalThis.__d = { ${names.join(', ')} };`,
    context, { filename: file });
  return context.__d;
}

test.each(FILES)('src/content/%s.ts is a verbatim port of %s', async (name, file, names) => {
  const ported: any = await import(`../src/content/${name}.ts`);
  const original = legacy(file, names);
  for (const key of names) {
    expect(ported[key]).toBeDefined();
    expect(ported[key]).toEqual(original[key] as any);
  }
  /* No export drifts in or out. */
  expect(Object.keys(ported).sort()).toEqual([...names].sort());
});

test('the glossary is a verbatim port', async () => {
  const { GLOSSARY } = await import('../src/glossary/glossary.ts');
  const context: any = { window: {}, console };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('data/glossary.js', 'utf8'), context);
  expect(GLOSSARY).toEqual(context.window.GLOSSARY);
});

/* The port carried every pre-rewrite string across unchanged. New keys have
   been added since (per-route descriptions, the skip link, the noscript line),
   so this asserts non-regression of the old ones rather than equality. */
test('every pre-rewrite i18n string survived the port unchanged', async () => {
  const { DICTS } = await import('../src/i18n/index.ts');
  const context: any = { window: {}, console };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/i18n.js', 'utf8'), context);
  for (const lang of ['en', 'ru'] as const) {
    for (const [key, value] of Object.entries(context.window.I18N[lang])) {
      expect((DICTS[lang] as Record<string, string>)[key], `${lang} ${key}`).toBe(value as string);
    }
  }
});

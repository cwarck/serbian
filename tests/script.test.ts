import { expect, test } from 'bun:test';
import vm from 'node:vm';
import fs from 'node:fs';
import { toCyrillic, toLatin, stripDiacritics, fold } from '../src/lib/script.ts';

/* The eight canonical pairs and five accent roundtrips ported from
   tools/validate.mjs:359-386, plus the morpheme-boundary digraphs — the one
   place the converter is silently lossy if the exception set is dropped. */
const PAIRS: [string, string][] = [
  ['žena', 'жена'],
  ['ljubav', 'љубав'],
  ['njega', 'њега'],
  ['džep', 'џеп'],
  ['đak', 'ђак'],
  ['ćerka', 'ћерка'],
  ['čovek', 'човек'],
  ['jabuka', 'јабука'],
];

const BOUNDARY: [string, string][] = [
  ['nadživeti', 'надживети'],
  ['injekcija', 'инјекција'],
  ['konjugacija', 'конјугација'],
  ['konjunkcija', 'конјункција'],
  ['podžanr', 'поджанр'],
  ['Tanjug', 'Танјуг'],
];

/* Genuine digraphs sitting next to the exception patterns. If these ever split,
   the exception set has grown too greedy. */
const GENUINE: [string, string][] = [
  ['odžačar', 'оџачар'],
  ['konj', 'коњ'],
  ['inje', 'иње'],
  ['konjušar', 'коњушар'],
  ['nadljudski', 'надљудски'],
];

test.each([...PAIRS, ...BOUNDARY, ...GENUINE])('toCyrillic(%s) === %s', (lat: string, cyr: string) => {
  expect(toCyrillic(lat)).toBe(cyr);
});

test.each([...PAIRS, ...BOUNDARY, ...GENUINE])('roundtrip %s', (lat: string) => {
  expect(toLatin(toCyrillic(lat))).toBe(lat);
});

test('accent marks survive the roundtrip', () => {
  for (const word of ['pȁs', 'rúka', 'čòvek', 'zédnica', 'grȃd']) {
    expect(toLatin(toCyrillic(word))).toBe(word);
  }
});

test('stripDiacritics and fold', () => {
  expect(stripDiacritics('žena čovek đak')).toBe('zena covek djak');
  expect(fold('ŽENA')).toBe('zena');
  expect(fold('čòvek')).toBe('covek');
});

/* Byte-for-byte agreement with the renderer the snapshots were captured from.
   Deleted with the old tree at phase 5.5. */
test('matches the pre-rewrite converter on every string the charts ship', () => {
  const context: any = {
    window: {}, console,
    localStorage: { getItem: () => null, setItem: () => {} },
    navigator: { languages: ['en'], language: 'en' },
    document: {
      readyState: 'loading', addEventListener: () => {},
      documentElement: { setAttribute: () => {}, getAttribute: () => 'en' },
      querySelectorAll: () => [],
    },
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/app.js', 'utf8'), context);
  const legacy = context.window.SerbianFyi;

  const corpus = new Set<string>();
  for (const file of fs.readdirSync('assets/charts')) {
    const text = fs.readFileSync(`assets/charts/${file}`, 'utf8');
    for (const m of text.matchAll(/'([^'\\\n]{2,60})'/g)) corpus.add(m[1]!);
  }
  expect(corpus.size).toBeGreaterThan(500);
  for (const s of corpus) {
    expect(toCyrillic(s)).toBe(legacy.toCyrillic(s));
    expect(toLatin(s)).toBe(legacy.toLatin(s));
  }
});

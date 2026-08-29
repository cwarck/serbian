import { expect, test } from 'bun:test';
import { en } from '../src/i18n/en.ts';
import { ru } from '../src/i18n/ru.ts';

/* Types replace the key graph, not the content check. A thin RU dictionary used
   to degrade in the browser; after routing, an RU page is a prerendered file
   with no runtime left to fall back. */

/* Legitimately identical in both languages: the wordmark, the CC line, and the
   seven Latin case names (Nominativ, Genitiv, …). Nothing else. */
const SAME_IN_BOTH = new Set([
  'nav.brand', 'foot.copy',
  'case.1.local', 'case.2.local', 'case.3.local', 'case.4.local',
  'case.5.local', 'case.6.local', 'case.7.local',
]);

test('both dictionaries carry exactly the same keys', () => {
  expect(Object.keys(ru).sort()).toEqual(Object.keys(en).sort());
});

test('no value is empty on either side', () => {
  for (const [key, value] of Object.entries(en)) expect(value.trim(), `en ${key}`).not.toBe('');
  for (const [key, value] of Object.entries(ru)) expect(value.trim(), `ru ${key}`).not.toBe('');
});

test('RU differs from EN outside the allowlist', () => {
  const untranslated = Object.keys(en).filter(
    key => !SAME_IN_BOTH.has(key) && ru[key as keyof typeof en] === en[key as keyof typeof en]);
  expect(untranslated).toEqual([]);
});

test('the allowlist has no dead entries', () => {
  for (const key of SAME_IN_BOTH) {
    expect(en[key as keyof typeof en], `${key} is allowlisted but differs`)
      .toBe(ru[key as keyof typeof en] as never);
  }
});

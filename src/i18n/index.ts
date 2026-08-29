import { en, type Key } from './en.ts';
import { ru } from './ru.ts';
import { raw, type Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';

export type { Key };

export const DICTS: { readonly [L in Lang]: Record<Key, string> } = { en, ru };

/* Keys are data as often as they are literals — a chart row carries its own
   `key` — so the signature takes a string and an unknown key throws. That
   fails `bun run build`, which is the guarantee that matters; the compile-time
   half is covered by ru.ts being `Record<Key, string>` and by the value
   asserts in tests/i18n.test.ts. */
function lookup(lang: Lang, key: string): string {
  const value = (DICTS[lang] as Record<string, string | undefined>)[key];
  if (value === undefined) throw new Error(`i18n: no ${lang} string for "${key}"`);
  return value;
}

/* Dictionary values legitimately carry markup — <strong> in the case
   questions, <span class="brand-tld"> in the wordmark — so they are Raw. */
export function translator(lang: Lang): (key: string) => Raw {
  return key => raw(lookup(lang, key));
}

/* The plain string, for attribute values and <title>. */
export function text(lang: Lang, key: string): string {
  return lookup(lang, key);
}

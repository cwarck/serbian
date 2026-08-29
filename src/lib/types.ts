/* The content model.

   `satisfies` gives presence and shape. It does NOT give values — '' satisfies
   string — so tools/validate.mjs keeps its value checks (alphabet length,
   case order against the tone map, cross-referential conjugation coverage,
   ~120 non-empty string asserts). Types PLUS those, never instead of them. */

import type { Lang } from './negotiate.ts';

/* A string carried in both UI languages. */
export interface Localized {
  readonly en: string;
  readonly ru: string;
}

export type LocalizedKey<K extends string> = { readonly [L in Lang as `${K}${Capitalize<L>}`]: string };

/* An i18n key resolved against the dictionary at build time. */
export type I18nKey = string;

export const CASE_TONES = ['nom', 'gen', 'dat', 'aku', 'vok', 'ins', 'lok'] as const;
export type CaseTone = (typeof CASE_TONES)[number];

export const GENDERS = ['m', 'n', 'f'] as const;
export type Gender = (typeof GENDERS)[number];

export type Number_ = 'sg' | 'pl';

/* ---------- alphabet ---------- */

export interface Letter {
  readonly n: number;
  readonly cyr: string;
  readonly lat: string;
  readonly ipa: string;
  readonly wCyr: string;
  readonly wLat: string;
  readonly kind: 'shared' | 'unique' | 'diff';
  readonly tip?: Localized;
}

/* ---------- cases ---------- */

/* The ending cell union, previously documented in prose at the head of
   cases-data.js. A bare string is the ending; { v, n } adds a footnote id
   resolved against the case's own `notes`; a split carries a soft-consonant
   alternation, and `syncretic` marks the AKU animacy split whose two halves
   echo other cases. */
export interface EndingNote {
  readonly v: string;
  readonly n: string;
}

export interface EndingSplit {
  readonly syncretic?: boolean;
  readonly split: readonly EndingNote[];
}

export type Ending = string | EndingNote | EndingSplit;

export interface CaseNote {
  readonly titleEn: string;
  readonly titleRu: string;
  readonly bodyEn: string;
  readonly bodyRu: string;
  readonly pairs?: readonly (readonly [string, string])[];
}

export interface CaseExample {
  readonly sr: string;
  readonly en: string;
  readonly ru: string;
}

export interface CaseRow {
  readonly key: string;
  readonly abbr: string;
  readonly tone: CaseTone;
  readonly endings: { readonly [G in Gender]: { readonly [N in Number_]: Ending } };
  readonly notes: Readonly<Record<string, CaseNote | undefined>>;
  readonly examples: readonly CaseExample[];
  readonly preps: readonly string[];
}

export interface IDecl {
  readonly cases: readonly string[];
  readonly sg: readonly string[];
  readonly pl: readonly string[];
}

export interface Wrinkle {
  readonly key: string;
  readonly examples: readonly {
    readonly from: string;
    readonly to: string;
    readonly en: string;
    readonly ru: string;
  }[];
}

export interface EndingAxis {
  readonly key: string;
  readonly g: Gender;
  readonly n: Number_;
}

/* ---------- numbers ---------- */

export interface Cardinal {
  readonly n: string;
  readonly sr: string;
  readonly end?: string;
}

export interface NumberBuild {
  readonly n: string;
  readonly parts: readonly string[];
  readonly en: string;
  readonly ru: string;
}

export interface NounCount {
  readonly n: string;
  readonly pattern: Localized;
  readonly examples: readonly string[];
}

export interface Ordinal {
  /* M, N, F — the site-wide gender column order. */
  readonly n: string;
  readonly forms: readonly [string, string, string];
}

/* ---------- verbs ---------- */

/* The six person slots, keyed by subject pronoun. */
export type PersonForms = { readonly [K in 'ja' | 'ti' | 'on' | 'mi' | 'vi' | 'oni']: string };

export interface VerbGroup {
  readonly key: string;
  /* Present-tense buckets all carry the brand orange via [data-tone] — marker
     ink ("here's the live paradigm"), not a grammatical hue. */
  readonly tone: 'im' | 'am' | 'em' | 'jem';
  readonly title: string;
  readonly endings: PersonForms;
  readonly patterns: readonly string[];
  /* The 1sg present beside the lemma. Without it a learner reads the -em
     bucket and produces *pisem, *zvem, *brem — the stem mutations are the
     only hard part of the group and they were not on the chart. */
  readonly verbs: readonly { readonly lemma: string; readonly present: string }[];
  readonly example: { readonly infinitive: string; readonly forms: PersonForms };
}

export interface Irregular {
  readonly title: string;
  readonly forms: readonly string[];
  readonly negative?: readonly string[];
  readonly full?: readonly string[];
}

/* ---------- pronouns ---------- */

export interface PersonalPronoun {
  readonly label: string;
  readonly subject: string;
  readonly object: string;
  readonly datloc: string;
  readonly inst: string;
}

export interface FormsRow {
  readonly forms: readonly [string, string, string];
}

/* ---------- prepositions ---------- */

export interface PrepUse {
  readonly case: CaseTone;
  readonly meaning: Localized;
  readonly sr: string;
  readonly tr: Localized;
  readonly icon?: string;
}

export interface PrepRow {
  readonly prep: string;
  readonly icon?: string;
  readonly uses: readonly PrepUse[];
}

export interface PrepGroup {
  readonly key: string;
  readonly rows: readonly PrepRow[];
}

/* ---------- aspect ---------- */

export interface AspectNote {
  readonly title: Localized;
  readonly body: Localized;
}

/* ---------- false friends ---------- */

export interface FalseFriend {
  readonly sr: string;
  readonly means: string;
  readonly trap: string;
  readonly trapMeans: string;
  readonly ex: { readonly sr: string; readonly ru: string };
  readonly partial?: boolean;
}

export interface FalseFriendGroup {
  readonly key: string;
  readonly rows: readonly FalseFriend[];
}

/* ---------- glossary ---------- */

export const POS = ['verb', 'noun', 'adj', 'adv', 'prep', 'pron', 'num'] as const;
export type Pos = (typeof POS)[number];

export interface GlossaryEntry {
  readonly pos: Pos;
  readonly gloss: Localized;
  readonly aspect?: 'ipf' | 'pf';
  readonly gender?: Gender;
  readonly animate?: boolean;
  readonly government?: string | readonly string[];
  readonly level?: 'A0' | 'A1' | 'A2' | 'B1' | 'B2';
  readonly tags?: readonly string[];
  readonly related?: readonly string[];
  readonly slug?: string;
}

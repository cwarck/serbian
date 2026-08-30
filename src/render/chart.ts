/* What a chart renderer is, now that it is a pure function.

   Each module returns the markup for its mount points plus, separately, the
   popover fragments that used to be produced on click. Both are build-time
   enumerable: every registration is a static index lookup into constant data. */

import { html, raw, type Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import type { Gender } from '../lib/types.ts';
import { GLOSSARY } from '../glossary/glossary.ts';

export interface PopoverReg {
  /* The selector the client shell delegates on — also how the snapshot gate
     enumerates triggers out of the rendered page. */
  readonly match: string;
  readonly variant?: string;
  readonly render: (attrs: Record<string, string>, lang: Lang) => Raw | string;
  readonly tone?: (attrs: Record<string, string>) => string;
}

export interface Chart {
  readonly name: string;
  /* Mount id -> markup, keyed exactly as the pre-rewrite page ids were. */
  readonly mounts: (lang: Lang) => Record<string, string>;
  /* Attributes the pre-rewrite renderer set on the mount ELEMENT rather than
     inside it (pronouns' role="table"). The layout carries them now — they are
     invisible to a fixture that only captured innerHTML. */
  readonly mountAttrs?: Readonly<Record<string, Record<string, string>>>;
  readonly popovers?: readonly PopoverReg[];
}

export function gloss(lemma: string, lang: Lang): string {
  const entry = (GLOSSARY as Record<string, { gloss: { en: string; ru: string } }>)[lemma];
  return entry ? entry.gloss[lang] : lemma;
}

/* The ending unit: ONE segmented object whose fields are gender, form and
   provenance — not a chip inside a chip. Gender does not contain case, so
   nesting one badge in another states a containment that is not true;
   detaching the source instead is worse, because it loses which ending it
   annotates the moment a run wraps.

   A merged unit carries more than one gender field (M+N syncretism), which is
   why `data-gender` lives on the FIELD and the unit's own border is neutral:
   there is no "first gender" for a border to take.

   Every gender-bearing call site goes through here — no renderer hand-writes
   the markup, which is what makes the letter-attestation check in
   tools/validate.mjs enforceable.

   `label` MUST come from t(), never sr(): the letter is apparatus, not a
   specimen, so it must not dual-emit. A class="s" wrapper inside an
   .eu-gender would let the script toggle transliterate the gender letters. */
export interface UnitGender {
  readonly g: Gender;
  readonly label: Raw;
}

export interface UnitOpts {
  /* The provenance field, already rendered — cases only. */
  readonly source?: Raw | string;
  /* This ending merely repeats a shape an earlier case introduced. Uniform
     across the whole form field by construction: a conditioned alternation is
     never an echo, and a syncretic split gets one unit per branch. */
  readonly echo?: boolean;
}

export function endingUnit(genders: readonly UnitGender[], form: Raw | string, opts: UnitOpts = {}): Raw {
  /* Two adjacent knockout letters read as one token ("MN") to a screen
     reader — the knockout hairline that separates them visually has no
     accessible equivalent. */
  const fields = genders
    .map(u => html`<span class="eu-gender" data-gender="${u.g}">${u.label}</span>`.value)
    .join('<span class="sr-only">, </span>');
  const cls = opts.echo ? 'eu-form is-echo' : 'eu-form';
  return raw(`<span class="ending-unit">${fields}<span class="${cls}">${String(form ?? '')}</span>${opts.source ? String(opts.source) : ''}</span>`);
}

/* Single-gender shorthand — the three non-cases charts never merge. */
export function genderUnit(gender: Gender, label: Raw, form: Raw | string): Raw {
  return endingUnit([{ g: gender, label }], form);
}

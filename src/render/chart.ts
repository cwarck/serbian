/* What a chart renderer is, now that it is a pure function.

   Each module returns the markup for its mount points plus, separately, the
   popover fragments that used to be produced on click. Both are build-time
   enumerable: every registration is a static index lookup into constant data. */

import { html, type Raw } from '../lib/html.ts';
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

/* The tier-2 gender chip: one bounded object pairing the facet-filled letter
   with the specimen it labels. Every gender-bearing call site goes through
   here — no renderer hand-writes the markup, which is what makes the
   letter-attestation check in tools/validate.mjs enforceable.

   `label` MUST come from t(), never sr(): the letter is apparatus, not a
   specimen, so it must not dual-emit. A class="s" wrapper inside a
   .gender-tag would let the script toggle transliterate the gender letters. */
export function genderUnit(gender: Gender, label: Raw, inner: Raw): Raw {
  return html`<span class="gender-unit" data-gender="${gender}"><span class="gender-tag">${label}</span>${inner}</span>`;
}

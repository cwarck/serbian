/* What a chart renderer is, now that it is a pure function.

   Each module returns the markup for its mount points plus, separately, the
   popover fragments that used to be produced on click. Both are build-time
   enumerable: every registration is a static index lookup into constant data. */

import type { Raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
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
  readonly popovers?: readonly PopoverReg[];
}

export function gloss(lemma: string, lang: Lang): string {
  const entry = (GLOSSARY as Record<string, { gloss: { en: string; ru: string } }>)[lemma];
  return entry ? entry.gloss[lang] : lemma;
}

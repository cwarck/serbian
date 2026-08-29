/* The intended differences between the pre-rewrite output and the build.

   There is exactly one: the build dual-emits both alphabets and lets CSS pick,
   where the old renderer emitted whichever script was current. Collapsing the
   wrapper to the chosen variant makes the two comparable — and proves the
   dual-emit is correct in both directions, which is the whole point of the
   mechanism. Anything else that differs is a regression. */

export type Script = 'lat' | 'cyr';

const DUAL = /<span class="s"><i data-s="lat">((?:(?!<\/i>).)*)<\/i><i data-s="cyr">((?:(?!<\/i>).)*)<\/i><\/span>/gs;

export function collapseDualEmit(html: string, script: Script): string {
  let out = html;
  /* Nested wrappers (a marked <i> inside an example) need repeated passes. */
  for (let i = 0; i < 8; i++) {
    const next = out.replace(DUAL, (_, lat, cyr) => (script === 'lat' ? lat : cyr));
    if (next === out) return out;
    out = next;
  }
  return out;
}

/* The one place dual-emit cannot reach: an aria-label. The `?` note trigger's
   accessible name is the note title, which carries Serbian, and an attribute
   has no CSS switch — so the build bakes Latin and the script toggle does not
   reach it (see noteLabel() in src/render/cases.ts). The pre-rewrite renderer
   re-rendered it per script, so in the Cyrillic column the two legitimately
   disagree. Dropped from BOTH sides there, and compared exactly in Latin. */
export function dropBakedNoteLabels(html: string, script: Script): string {
  if (script === 'lat') return html;
  return html.replace(/(<button[^>]*\bdata-note-trigger\b[^>]*>)/g,
    tag => tag.replace(/\s*aria-label="[^"]*"/, ''));
}

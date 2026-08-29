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

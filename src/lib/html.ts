/* Build-time HTML assembly.

   The data legitimately carries raw markup — <mark> in example sentences, <i>
   markers in translations, <strong>, <span class="lit"> from the diff
   highlighter — so escaping is opt-out, not opt-in: every interpolation is
   escaped unless it is wrapped in raw(). Every call site is a decision. */

import { toCyrillic, toLatin } from './script.ts';

const ESCAPES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

export function escape(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, ch => ESCAPES[ch] as string);
}

/* A string that is already HTML and must not be escaped again. */
export class Raw {
  constructor(readonly value: string) {}
  toString() { return this.value; }
}

export function raw(value: unknown): Raw {
  return value instanceof Raw ? value : new Raw(String(value ?? ''));
}

function interpolate(value: unknown): string {
  if (value == null || value === false) return '';
  if (value instanceof Raw) return value.value;
  if (Array.isArray(value)) return value.map(interpolate).join('');
  return escape(value);
}

/* Tagged template producing a Raw, so nesting composes without double-escaping. */
export function html(strings: TemplateStringsArray, ...values: unknown[]): Raw {
  let out = strings[0] as string;
  for (let i = 0; i < values.length; i++) out += interpolate(values[i]) + strings[i + 1];
  return new Raw(out);
}

export type Script = 'lat' | 'cyr';

/* Dual-emit. Both alphabets ship in the markup; one attribute on <html> picks
   which one paints. The client never rewrites text.

   Deliberately `class="s"`, NOT `class="sr"` — `.sr` is a live block-level
   specimen class (styles.css: .chart-example .sr, .ex .sr), and <i> markers
   appear INSIDE translations, so a wrapper nested in .ex would inherit the
   specimen treatment. Reusing <i> for the two variants inherits the existing
   serif base rule and preserves the <i>-means-Serbian invariant the validator
   already enforces. */
export function sr(text: string): Raw {
  const lat = escape(toLatin(text));
  const cyr = escape(toCyrillic(text));
  return new Raw(`<span class="s"><i data-s="lat">${lat}</i><i data-s="cyr">${cyr}</i></span>`);
}

/* Serbian that already carries markup. Transliterates only the text nodes;
   tags and entities pass through untouched, and the nested markup is emitted
   inside each variant. */
export function srHTML(markup: string): Raw {
  return new Raw(
    `<span class="s"><i data-s="lat">${convertMarkup(markup, toLatin)}</i>` +
    `<i data-s="cyr">${convertMarkup(markup, toCyrillic)}</i></span>`
  );
}

/* Serbian inside an attribute value, where dual-emit has no CSS equivalent —
   you cannot hide half an aria-label. Bakes one script (Latin) and accepts
   that the toggle does not reach it. The validator asserts this stays rare. */
export function srAttr(text: string): string {
  return escape(toLatin(text));
}

export function convertMarkup(markup: string, convert: (s: string) => string): string {
  return String(markup)
    .split(/(<[^>]+>|&[^;\s]+;)/g)
    .map(part => (part.startsWith('<') || part.startsWith('&') ? part : convert(part)))
    .join('');
}

/* Serbian tokens marked with <i> inside foreign prose. Only the marked spans
   flip; everything outside stays in the surrounding language. The marker also
   localises the token for assistive tech via lang="sr". */
export function srGrammarHTML(markup: string): Raw {
  return new Raw(convertMarked(markup));
}

function convertMarked(markup: string): string {
  let depth = 0;
  return String(markup)
    .split(/(<[^>]+>|&[^;\s]+;)/g)
    .map(part => {
      if (!part) return part;
      if (part.startsWith('&')) return part;
      if (part.startsWith('<')) {
        const m = part.match(/^<\s*(\/?)\s*([a-z][a-z0-9]*)/i);
        if (m && m[2]!.toLowerCase() === 'i') {
          if (m[1]) { depth = Math.max(0, depth - 1); return part; }
          if (!/\/\s*>\s*$/.test(part)) {
            depth++;
            if (!/\blang\s*=/i.test(part)) return part.replace(/^<\s*i\b/i, '<i lang="sr"');
          }
        }
        return part;
      }
      if (depth === 0) return part;
      return `<span class="s"><i data-s="lat">${toLatin(part)}</i>` +
             `<i data-s="cyr">${toCyrillic(part)}</i></span>`;
    })
    .join('');
}

export function attrs(map: Record<string, string | number | boolean | null | undefined>): Raw {
  const parts: string[] = [];
  for (const [name, value] of Object.entries(map)) {
    if (value == null || value === false) continue;
    if (value === true) { parts.push(name); continue; }
    parts.push(`${name}="${escape(value)}"`);
  }
  return new Raw(parts.length ? ' ' + parts.join(' ') : '');
}

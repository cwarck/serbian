/* Popover triggers, enumerated from the markup that contains them.

   Every registration is a static index lookup into constant data, so the whole
   trigger set is build-time enumerable — which is what lets the popover bodies
   ship as inert <template> nodes instead of being re-rendered on every open.
   The build and the client derive the same key from the same attributes, so
   the trigger markup needs no extra plumbing attribute of its own. */

function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([^\s=/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    out[m[1]!.toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? '';
  }
  return out;
}

/* Handles only the selector shapes the registrations actually use:
   `[data-attr]` and `.class`. */
export function findTriggers(html: string, selector: string): Record<string, string>[] {
  const attrMatch = selector.match(/^\[([a-z-]+)\]$/);
  const classMatch = selector.match(/^\.([a-z-]+)$/);
  if (!attrMatch && !classMatch) return [];
  const found: Record<string, string>[] = [];
  const re = /<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*?)\/?>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const attrs = parseAttrs(m[2] || '');
    if (attrMatch && !(attrMatch[1]! in attrs)) continue;
    if (classMatch && !String(attrs['class'] ?? '').split(/\s+/).includes(classMatch[1]!)) continue;
    found.push(attrs);
  }
  return found;
}

/* The template id. Derived from the trigger's own data-* attributes, sorted,
   so build and client agree without a shared registry. Looked up with
   getElementById, which needs no selector escaping. */
export function popoverKey(attrs: Record<string, string>): string {
  const parts = Object.keys(attrs)
    .filter(name => name.startsWith('data-'))
    .sort()
    .map(name => `${name.slice(5)}=${attrs[name]}`);
  return 'pop:' + parts.join('&');
}

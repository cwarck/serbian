/* Normalize generated HTML for diffing.

   The diff must be over HTML, not text: this codebase encodes its meaning in
   attributes (data-tone is the whole colour system, data-gender, the anchor ids
   the case strip resolves against, lang="sr"). A build that dropped every
   data-tone would pass a text-only diff while all seven cases rendered in
   undifferentiated ink. */

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr']);

/* Decode entities before comparing. `it's` and `it&#39;s` render identically,
   and the build escapes attribute-safely everywhere while the pre-rewrite
   renderer interpolated raw — that difference is presentational, not semantic,
   so it must not read as a regression. Decoding runs on both sides. */
const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return NAMED[body.toLowerCase()] ?? whole;
  });
}

function parseAttrs(raw: string): [string, string | null][] {
  const out: [string, string | null][] = [];
  const re = /([^\s=/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(raw))) {
    const value = m[3] ?? m[4] ?? m[5] ?? null;
    out.push([m[1]!.toLowerCase(), value === null ? null : decodeEntities(value).replace(/\s+/g, ' ').trim()]);
  }
  return out;
}

/* Tag-level tokenizer. The input is HTML this repo generates, not the open web,
   so a tokenizer is enough — and it keeps the harness dependency-free. */
export function normalizeHTML(html: string): string {
  const out: string[] = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*?)(\/?)>|<!--[\s\S]*?-->/g;
  let last = 0;
  let m;
  const pushText = (text: string) => {
    const t = decodeEntities(text).replace(/\s+/g, ' ');
    if (t.trim()) out.push(t.trim());
  };
  while ((m = re.exec(html))) {
    pushText(html.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[0].startsWith('<!--')) continue;
    const [, close, rawName, rawAttrs, selfClose] = m;
    const name = rawName!.toLowerCase();
    if (close) { out.push(`</${name}>`); continue; }
    const attrs = parseAttrs(rawAttrs || '')
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .map(([k, v]) => (v === null ? k : `${k}="${v}"`));
    const tag = `<${[name, ...attrs].join(' ')}>`;
    out.push(tag);
    if (selfClose || VOID.has(name)) out.push(`</${name}>`);
  }
  pushText(html.slice(last));
  return out.join('\n');
}

/* Extract the elements a popover registration would match, so the fragment set
   is enumerable from the rendered page instead of hand-listed. Handles only the
   selector shapes the six registrations actually use. */
export function findTriggers(html: string, selector: string): Record<string, string>[] {
  const attrMatch = selector.match(/^\[([a-z-]+)\]$/);
  const classMatch = selector.match(/^\.([a-z-]+)$/);
  const found: Record<string, string>[] = [];
  const re = /<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*?)\/?>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = Object.fromEntries(parseAttrs(m[2] || '')) as Record<string, string>;
    if (attrMatch && !(attrMatch[1]! in attrs)) continue;
    if (classMatch && !String(attrs['class'] || '').split(/\s+/).includes(classMatch[1]!)) continue;
    if (!attrMatch && !classMatch) continue;
    found.push(attrs);
  }
  return found;
}

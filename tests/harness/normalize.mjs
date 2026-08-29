/* Normalize generated HTML for diffing.

   The diff must be over HTML, not text: this codebase encodes its meaning in
   attributes (data-tone is the whole colour system, data-gender, the anchor ids
   the case strip resolves against, lang="sr"). A build that dropped every
   data-tone would pass a text-only diff while all seven cases rendered in
   undifferentiated ink. */

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr']);

function parseAttrs(raw) {
  const out = [];
  const re = /([^\s=/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(raw))) {
    const value = m[3] ?? m[4] ?? m[5] ?? null;
    out.push([m[1].toLowerCase(), value === null ? null : value.replace(/\s+/g, ' ').trim()]);
  }
  return out;
}

/* Tag-level tokenizer. The input is HTML this repo generates, not the open web,
   so a tokenizer is enough — and it keeps the harness dependency-free. */
export function normalizeHTML(html) {
  const out = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*?)(\/?)>|<!--[\s\S]*?-->/g;
  let last = 0;
  let m;
  const pushText = (text) => {
    const t = text.replace(/\s+/g, ' ');
    if (t.trim()) out.push(t.trim());
  };
  while ((m = re.exec(html))) {
    pushText(html.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[0].startsWith('<!--')) continue;
    const [, close, rawName, rawAttrs, selfClose] = m;
    const name = rawName.toLowerCase();
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
export function findTriggers(html, selector) {
  const attrMatch = selector.match(/^\[([a-z-]+)\]$/);
  const classMatch = selector.match(/^\.([a-z-]+)$/);
  const found = [];
  const re = /<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*?)\/?>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = Object.fromEntries(parseAttrs(m[2] || ''));
    if (attrMatch && !(attrMatch[1] in attrs)) continue;
    if (classMatch && !String(attrs.class || '').split(/\s+/).includes(classMatch[1])) continue;
    if (!attrMatch && !classMatch) continue;
    found.push(attrs);
  }
  return found;
}

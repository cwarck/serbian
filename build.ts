/* serbian.fyi build.
   `bun build.ts`              -> dist/
   `bun --watch build.ts dev`  -> the same output, served on :3000, rebuilt on
                                  change. --watch is load-bearing, not a
                                  convenience: see WATCHED below.

   No dependency graph: one devDependency (typescript, for the editor and
   `tsc --noEmit`), and Bun's own bundler for the client script and CSS.

   build() returns the whole site as an in-memory Map and writes NOTHING. Only
   the one-shot path writes dist/; dev serves the Map. That is what keeps the
   two out of each other's way: a build clears dist/ and then refills it over
   several hundred ms, so while a watcher rebuild is in flight dist/ is empty,
   then partial. When dev owned dist/, a save during `bun run validate` wiped
   the tree the validator was about to read (validateLinks walks dist/) and it
   reported every page as a missing link; the same window served torn HTML to
   the browser. A Map cannot tear — a rebuild swaps the reference once, so a
   request sees the whole old tree or the whole new one. */

import fs from 'node:fs';
import path from 'node:path';
import { ROUTES, counterpart } from './src/lib/routes.ts';
import { renderPage } from './src/layout/page.ts';

const ROOT = import.meta.dir;
const OUT = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

/* ---------- the tree ---------- */

/* dist-relative path -> contents. Keys use forward slashes, so they are also
   the URL paths the dev server answers. */
export type Tree = Map<string, string | Uint8Array>;

function readDir(from: string, prefix: string, tree: Tree): void {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const key = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) readDir(src, key, tree);
    else tree.set(key, fs.readFileSync(src));
  }
}

/* The only writer. Clearing and refilling dist/ is destructive and slow; it
   happens once, at the end, with the whole tree already in hand. */
function writeTree(tree: Tree): void {
  fs.rmSync(OUT, { recursive: true, force: true });
  for (const [file, contents] of tree) {
    const target = path.join(OUT, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
  }
}

/* ---------- build ---------- */

export async function build(): Promise<Tree> {
  const tree: Tree = new Map();

  /* public/ lands at the dist root verbatim. Fonts MUST end up at
     dist/assets/fonts/ — _headers pins `immutable` there, the preload tags are
     absolute, and the 12 `src: url('fonts/…')` rules in styles.css resolve
     relative to the stylesheet's own directory. _headers and _redirects must
     likewise sit at the dist root or Workers ignores them. */
  readDir(PUBLIC, '', tree);

  /* Assets are emitted FIRST so their hashed names exist before a page needs
     to link them. */
  const assets = new Map<string, string>();
  await emitStyles(tree, assets);
  await emitClient(tree, assets);

  for (const route of ROUTES) {
    tree.set(route.file, resolveAssets(await renderPage(route), assets));
  }

  tree.set('sitemap.xml', sitemap());
  tree.set('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);

  return tree;
}

const ORIGIN = 'https://serbian.fyi';

/* Launch IS first indexing — the one moment where two parallel language trees
   are either understood as alternates or filed as duplicates, and the one
   thing that is not cheap to redo. Pairs with the per-route hreflang and
   canonical tags in the head, which crawlers read first. */
function sitemap(): string {
  const entries = ROUTES.map(route => {
    const alternates = [route, counterpart(route)]
      .filter((r): r is typeof route => r !== null)
      .map(r => `    <xhtml:link rel="alternate" hreflang="${r.lang}" href="${ORIGIN}${r.path}"/>`);
    return [
      '  <url>',
      `    <loc>${ORIGIN}${route.path}</loc>`,
      ...alternates,
      '  </url>',
    ].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

/* Content-hashed filenames move /assets/*.css and *.js from `no-cache` to
   `immutable`. The payoff is one blocking revalidation round-trip before paint,
   per asset, per pageview — `no-cache` means store-then-revalidate, and an
   unchanged ETag returns a 304 with an empty body, so the win is latency, not
   bytes.

   Assets are emitted before the pages that link them, so every asset is
   hashed — including the render-blocking theme-init. That keeps the
   Cache-Control patterns in _headers mutually exclusive, which matters:
   _headers rules are cumulative, and a header set twice is joined with a
   comma, so an overlapping `immutable` and `no-cache` would ship both. */
function hashed(name: string, contents: string | Uint8Array): string {
  const hash = new Bun.CryptoHasher('sha256').update(contents).digest('hex').slice(0, 8);
  return name.replace(/(\.[a-z0-9]+)$/, `.${hash}$1`);
}

function resolveAssets(html: string, assets: Map<string, string>): string {
  let out = html;
  for (const [logical, real] of assets) out = out.split(logical).join(real);
  return out;
}

/* styles.css stays ONE authored global file — the tone audit scans it line by
   line, so no minifier may collapse it. Copied, never bundled.

   The hashed stylesheet MUST stay in the same directory: its 12
   `src: url('fonts/…')` declarations resolve relative to the stylesheet's own
   location. */
async function emitStyles(tree: Tree, assets: Map<string, string>): Promise<void> {
  const contents = fs.readFileSync(path.join(ROOT, 'src/styles/styles.css'));
  const name = hashed('assets/styles.css', contents);
  tree.set(name, contents);
  assets.set('/assets/styles.css', '/' + name);
}

async function emitClient(tree: Tree, assets: Map<string, string>): Promise<void> {
  const result = await Bun.build({
    entrypoints: [
      path.join(ROOT, 'src/client/theme-init.ts'),
      path.join(ROOT, 'src/client/app.ts'),
    ],
    target: 'browser',
    minify: true,
    format: 'iife',
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error('client bundle failed');
  }
  for (const artifact of result.outputs) {
    const base = path.basename(artifact.path);
    const contents = Buffer.from(await artifact.arrayBuffer());
    const name = hashed(`assets/${base}`, contents);
    tree.set(name, contents);
    assets.set('/assets/' + base, '/' + name);
  }
}

/* ---------- dev ---------- */

/* A tree KEY for a request path, or null if it escapes the root. Resolving
   against OUT and relativising back is how the containment check stays the
   same one dist/ enforced; the keys just happen to live in a Map now. */
function key(file: string): string | null {
  const resolved = path.resolve(OUT, file);
  if (resolved !== OUT && !resolved.startsWith(OUT + path.sep)) return null;
  return path.relative(OUT, resolved).split(path.sep).join('/');
}

/* An in-process rebuild can only refresh what build() re-reads from disk:
   styles.css, the client entrypoints Bun.build re-bundles, and public/.
   Everything else — content, i18n, render, layout, routes — reaches build()
   through the static imports at the top of this file, and Bun's module
   registry hands back the copies loaded at startup for the process lifetime.
   Re-importing does not help either: a cache-busted specifier reloads that one
   module, not the graph beneath it.

   So the split is by mechanism, not by taste. `bun --watch` (see the dev
   script) owns the module graph and restarts the process; this watcher owns
   what build() re-reads. Watching src/ wholesale would fire a pointless
   in-process rebuild alongside every --watch restart, and — worse — print
   `built 41 files` for an edit it did not pick up.

   src/lib is on both sides. Most of it is in the runtime graph, but a module
   only the client bundle imports (store.ts) is invisible to --watch, so an
   edit there reached nobody until src/lib was added here. For a shared module
   both fire; the restart supersedes the rebuild, and the message it prints is
   for a tree that is about to be replaced anyway. */
const WATCHED = ['src/styles', 'src/client', 'src/lib', 'public'];

async function dev(): Promise<void> {
  const rebuild = async () => {
    const started = Date.now();
    try {
      const next = await build();
      tree = next;
      console.log(`built ${next.size} files in ${Date.now() - started}ms`);
    } catch (error) {
      console.error('build failed:', (error as Error).message);
    }
  };

  /* Swapped by reference on every rebuild, and only once the new tree is
     complete — a request is served entirely from one build or entirely from
     the one before it. A failed rebuild leaves the last good tree serving,
     and a failed FIRST build leaves an empty one: the server still comes up,
     so the next save can fix it. Throwing here would exit before the watcher
     is installed, and a fix to styles.css or the client bundle — the very
     files that fail inside build() rather than at import — is one --watch
     never sees, so nothing would bring the process back. */
  let tree: Tree = new Map();
  await rebuild();

  let queued: ReturnType<typeof setTimeout> | undefined;
  for (const dir of WATCHED) {
    fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
      clearTimeout(queued);
      queued = setTimeout(rebuild, 40);
    });
  }

  const server = Bun.serve({
    port: Number(process.env.PORT) || 3000,
    fetch(request) {
      const url = new URL(request.url);
      let file: string;
      try {
        file = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
      } catch { return new Response('Not found', { status: 404 }); }
      if (file.endsWith('/')) file += 'index.html';
      /* URL() normalizes literal `..` segments but not percent-encoded ones,
         and decoding happens after — so containment is checked, not assumed. */
      const direct = key(file);
      const indexed = key(`${file}/index.html`);
      /* Read the reference ONCE: an await-free handler cannot be preempted by
         a rebuild, but pinning it says so rather than relying on it. */
      const current = tree;
      const name = direct && current.has(direct) ? direct
        : indexed && current.has(indexed) ? indexed
        : null;
      if (!name) return new Response('Not found', { status: 404 });
      /* Buffer IS a Uint8Array at runtime; only its ArrayBufferLike type
         parameter keeps it out of BodyInit. */
      const body = current.get(name)! as string | Uint8Array<ArrayBuffer>;
      return new Response(body, { headers: { 'content-type': Bun.file(name).type } });
    },
  });
  console.log(`dev  http://localhost:${server.port}`);
}

if (import.meta.main) {
  if (process.argv[2] === 'dev') await dev();
  else {
    const tree = await build();
    writeTree(tree);
    console.log(`built ${tree.size} files -> dist/`);
  }
}

/* serbian.fyi build.
   `bun build.mjs`      -> dist/
   `bun build.mjs dev`  -> the same output, served on :3000, rebuilt on change.

   No dependency graph: one devDependency (typescript, for the editor and
   `tsc --noEmit`), and Bun's own bundler for the client script and CSS. */

import fs from 'node:fs';
import path from 'node:path';
import { ROUTES, counterpart } from './src/lib/routes.ts';
import { renderPage } from './src/layout/page.ts';

const ROOT = import.meta.dir;
const OUT = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

/* ---------- fs helpers ---------- */

function copyDir(from: string, to: string): void {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

function emit(file: string, contents: string | Uint8Array): string {
  const target = path.join(OUT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
  return target;
}

/* ---------- build ---------- */

export async function build(): Promise<string[]> {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  /* public/ lands at the dist root verbatim. Fonts MUST end up at
     dist/assets/fonts/ — _headers pins `immutable` there, the preload tags are
     absolute, and the 12 `src: url('fonts/…')` rules in styles.css resolve
     relative to the stylesheet's own directory. _headers and _redirects must
     likewise sit at the dist root or Workers ignores them. */
  copyDir(PUBLIC, OUT);


  const written: string[] = [];

  /* Assets are emitted FIRST so their hashed names exist before a page needs
     to link them. */
  const assets = new Map<string, string>();
  await emitStyles(written, assets);
  await emitClient(written, assets);

  for (const route of ROUTES) {
    written.push(emit(route.file, resolveAssets(await renderPage(route), assets)));
  }

  written.push(emit('sitemap.xml', sitemap()));
  written.push(emit('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`));

  return written;
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
async function emitStyles(written: string[], assets: Map<string, string>): Promise<void> {
  const contents = fs.readFileSync(path.join(ROOT, 'src/styles/styles.css'));
  const name = hashed('assets/styles.css', contents);
  written.push(emit(name, contents));
  assets.set('/assets/styles.css', '/' + name);
}

async function emitClient(written: string[], assets: Map<string, string>): Promise<void> {
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
    const name = hashed(path.join('assets', base), contents);
    written.push(emit(name, contents));
    assets.set('/assets/' + base, '/' + name);
  }
}

/* ---------- dev ---------- */

/* A path under dist/, or null if it escapes. */
function within(file: string): string | null {
  const resolved = path.resolve(OUT, file);
  return resolved === OUT || resolved.startsWith(OUT + path.sep) ? resolved : null;
}

async function dev(): Promise<void> {
  const rebuild = async () => {
    const started = Date.now();
    try {
      const written = await build();
      console.log(`built ${written.length} files in ${Date.now() - started}ms`);
    } catch (error) {
      console.error('build failed:', (error as Error).message);
    }
  };
  await rebuild();

  let queued: ReturnType<typeof setTimeout> | undefined;
  for (const dir of ['src', 'public']) {
    fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
      clearTimeout(queued);
      queued = setTimeout(rebuild, 40);
    });
  }

  const server = Bun.serve({
    port: Number(process.env.PORT) || 3000,
    async fetch(request) {
      const url = new URL(request.url);
      let file: string;
      try {
        file = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
      } catch { return new Response('Not found', { status: 404 }); }
      if (file.endsWith('/')) file += 'index.html';
      /* URL() normalizes literal `..` segments but not percent-encoded ones,
         and decoding happens after — so containment is checked, not assumed. */
      const direct = within(file);
      const indexed = within(path.join(file, 'index.html'));
      if (!direct || !indexed) return new Response('Not found', { status: 404 });
      let target = Bun.file(direct);
      if (!(await target.exists())) target = Bun.file(indexed);
      if (!(await target.exists())) return new Response('Not found', { status: 404 });
      return new Response(target);
    },
  });
  console.log(`dev  http://localhost:${server.port}`);
}

if (import.meta.main) {
  if (process.argv[2] === 'dev') await dev();
  else {
    const written = await build();
    console.log(`built ${written.length} files -> dist/`);
  }
}

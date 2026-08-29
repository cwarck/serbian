/* serbian.fyi build.
   `bun build.mjs`      -> dist/
   `bun build.mjs dev`  -> the same output, served on :3000, rebuilt on change.

   No dependency graph: one devDependency (typescript, for the editor and
   `tsc --noEmit`), and Bun's own bundler for the client script and CSS. */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = import.meta.dir;
const OUT = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

/* ---------- fs helpers ---------- */

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

function emit(file, contents) {
  const target = path.join(OUT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
  return target;
}

/* ---------- build ---------- */

export async function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  /* public/ lands at the dist root verbatim. Fonts MUST end up at
     dist/assets/fonts/ — _headers pins `immutable` there, the preload tags are
     absolute, and the 12 `src: url('fonts/…')` rules in styles.css resolve
     relative to the stylesheet's own directory. _headers and _redirects must
     likewise sit at the dist root or Workers ignores them. */
  copyDir(PUBLIC, OUT);

  const { ROUTES } = await import('./src/lib/routes.ts');
  const { renderPage } = await import('./src/layout/page.ts');

  const written = [];
  for (const route of ROUTES) {
    written.push(emit(route.file, await renderPage(route)));
  }

  await emitStyles(written);
  await emitClient(written);

  return written;
}

/* styles.css stays ONE authored global file — the tone audit scans it line by
   line, so no minifier may collapse it. Copied, never bundled. It still lives
   at assets/styles.css because the pre-rewrite pages link it; it moves under
   src/styles/ when that tree is deleted (plan phase 5.5). */
const STYLESHEET = 'assets/styles.css';

async function emitStyles(written) {
  for (const candidate of ['src/styles/styles.css', STYLESHEET]) {
    const src = path.join(ROOT, candidate);
    if (!fs.existsSync(src)) continue;
    written.push(emit('assets/styles.css', fs.readFileSync(src)));
    return;
  }
  throw new Error('stylesheet not found');
}

async function emitClient(written) {
  const entries = ['src/client/theme-init.ts', 'src/client/app.ts']
    .map(p => path.join(ROOT, p))
    .filter(fs.existsSync);
  if (!entries.length) return;

  const result = await Bun.build({
    entrypoints: entries,
    target: 'browser',
    minify: true,
    format: 'iife',
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error('client bundle failed');
  }
  for (const artifact of result.outputs) {
    const name = path.basename(artifact.path).replace(/\.js$/, '.js');
    written.push(emit(path.join('assets', name), Buffer.from(await artifact.arrayBuffer())));
  }
}

/* ---------- dev ---------- */

async function dev() {
  const rebuild = async () => {
    const started = Date.now();
    try {
      const written = await build();
      console.log(`built ${written.length} files in ${Date.now() - started}ms`);
    } catch (error) {
      console.error('build failed:', error.message);
    }
  };
  await rebuild();

  let queued = null;
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
      let file = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
      if (file.endsWith('/')) file += 'index.html';
      let target = Bun.file(path.join(OUT, file));
      if (!(await target.exists())) target = Bun.file(path.join(OUT, file, 'index.html'));
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

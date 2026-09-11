/* Rebuild the Source Serif 4 woff2 subsets in public/assets/fonts.
 *
 *   bun tools/fonts/build.mjs
 *
 * Source: the Google Fonts build of Source Serif 4 (the shipped subsets were
 * cut from it — its OFL carries no Reserved Font Name), pinned by commit.
 * Pipeline per style: download → extend-source-serif.py (pitch marks) →
 * pyftsubset once per @font-face block, with the unicode-range read from
 * styles.css so the CSS and the bytes cannot disagree.
 *
 * The output names carry `-sr-`: /assets/fonts/* is served immutable, so a
 * new cut must ship under a new path. Bump the token when the recipe changes.
 * Needs `uv` (fontTools + brotli are fetched into an ephemeral env).
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(root, 'public/assets/fonts');
const PIN = '08dc85da6bca7ae308a6f1d38d0b137465646071';
const STYLES = [
  { style: 'normal', file: 'SourceSerif4[opsz,wght].ttf',
    sha256: '97b2d4da6e3cb494b5a1e66ae176914d852ccabef49e0c02c0df25f3e39aca0b' },
  { style: 'italic', file: 'SourceSerif4-Italic[opsz,wght].ttf',
    sha256: '15fbc7e4679489a501998c3669272637a6646388ef7e4bd77eebb5bf967a1f42' },
];
const PY = ['uv', 'run', '--with', 'fonttools==4.65.0', '--with', 'brotli==1.2.0'];

function run(cmd) {
  const p = Bun.spawnSync(cmd, { stdout: 'inherit', stderr: 'inherit' });
  if (p.exitCode !== 0) throw new Error(`${cmd.join(' ')} exited ${p.exitCode}`);
}

/* url('fonts/<file>') → unicode-range, per @font-face block. */
function ranges() {
  const css = readFileSync(path.join(root, 'src/styles/styles.css'), 'utf8');
  const out = new Map();
  for (const block of css.match(/@font-face\s*{[^}]*}/g) ?? []) {
    const file = block.match(/url\('fonts\/([^']+)'\)/)?.[1];
    const range = block.match(/unicode-range:\s*([^;]+);/)?.[1];
    if (file && range) out.set(file, range.replace(/\s+/g, ''));
  }
  return out;
}

const work = mkdtempSync(path.join(tmpdir(), 'serbian-fonts-'));
try {
  const byFile = ranges();
  for (const { style, file, sha256 } of STYLES) {
    const url = `https://raw.githubusercontent.com/google/fonts/${PIN}/ofl/sourceserif4/${encodeURIComponent(file)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    const digest = new Bun.CryptoHasher('sha256').update(bytes).digest('hex');
    if (digest !== sha256) throw new Error(`${file}: sha256 ${digest}, pinned ${sha256}`);
    const src = path.join(work, `${style}.ttf`);
    writeFileSync(src, bytes);
    const ext = path.join(work, `${style}-ext.ttf`);
    run([...PY, 'python', path.join(root, 'tools/fonts/extend-source-serif.py'), src, ext]);
    const targets = [...byFile].filter(([f]) => f.startsWith(`source-serif-4-sr-${style}-`));
    if (targets.length !== 3) throw new Error(`expected 3 ${style} serif @font-face blocks, found ${targets.length}`);
    for (const [name, range] of targets) {
      run([...PY, 'pyftsubset', ext, `--unicodes=${range}`, '--flavor=woff2', '--layout-features+=locl',
        '--no-hinting', `--output-file=${path.join(OUT, name)}`]);
      console.log('wrote', name);
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

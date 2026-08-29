/* Language negotiation.

   EN keeps today's URLs (/charts/cases.html); RU mirrors under /ru/. Static
   routes cannot negotiate server-side — there is no Worker — so a pre-paint
   client redirect does it, inlined into theme-init at build.

   The asymmetry is the design: EN is the negotiable tree, a /ru/ URL is an
   explicit statement and is never redirected. Redirects fire only on EN paths
   and only target RU paths, which never redirect — termination is structural,
   one hop maximum. A /ru/ link shared with a stored-EN reader serves as-is:
   the URL wins. */

export const LANGS = ['en', 'ru'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';

export function normalizeLang(value: string | null | undefined): Lang | null {
  const tag = String(value ?? '').toLowerCase().split(/[-_]/)[0] ?? '';
  return (LANGS as readonly string[]).includes(tag) ? (tag as Lang) : null;
}

export function firstSupported(navLangs: readonly string[] | null | undefined): Lang | null {
  for (const tag of navLangs ?? []) {
    const lang = normalizeLang(tag);
    if (lang) return lang;
  }
  return null;
}

/* The RU counterpart of an EN path. '/' becomes '/ru/'. */
export function ruPath(path: string): string {
  return path === '/' ? '/ru/' : '/ru' + path;
}

/* Returns the path to redirect to, or null to stay put. */
export function resolveRedirect(
  path: string,
  stored: string | null | undefined,
  navLangs: readonly string[] | null | undefined,
): string | null {
  if (path === '/ru' || path.startsWith('/ru/')) return null;
  const want = normalizeLang(stored) ?? firstSupported(navLangs) ?? DEFAULT_LANG;
  return want === 'ru' ? ruPath(path) : null;
}

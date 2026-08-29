/* Reader preferences: script, theme, language.

   localStorage is not merely empty in Safari private browsing and with site
   data blocked — the getter throws. Swallowing that silently strands a reader:
   the language chip records nothing, theme-init re-negotiates from
   Accept-Language on arrival, and a Russian-browser reader who picked English
   is bounced straight back to /ru/ forever. A cookie is the fallback that
   survives the same navigation, so the chip's promise holds either way.

   localStorage stays the primary store — the cookie is written only when it
   refuses, and read only when it has nothing to say. */

const COOKIE_MAX_AGE = 31536000; /* one year */

function readCookie(key: string): string | null {
  let all = '';
  try { all = document.cookie || ''; } catch { return null; }
  for (const part of all.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== key) continue;
    const value = part.slice(eq + 1);
    try { return decodeURIComponent(value); } catch { return value; }
  }
  return null;
}

function writeCookie(key: string, value: string, maxAge: number): void {
  try {
    document.cookie = `${key}=${encodeURIComponent(value)};path=/;max-age=${maxAge};samesite=lax`;
  } catch { /* nothing left to try */ }
}

export function readPref(key: string): string | null {
  try {
    const value = localStorage.getItem(key);
    if (value !== null) return value;
  } catch { /* blocked — fall through to the cookie */ }
  return readCookie(key);
}

export function writePref(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
    return;
  } catch { /* blocked — fall through to the cookie */ }
  writeCookie(key, value, COOKIE_MAX_AGE);
}

export function removePref(key: string): void {
  try { localStorage.removeItem(key); } catch { /* blocked */ }
  if (readCookie(key) !== null) writeCookie(key, '', 0);
}

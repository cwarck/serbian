/* What is left of the client.

   Not here any more, and not coming back: both transliteration maps, the three
   regex passes, applyScript's rewrite loop, applyI18n and the whole 19 KB
   dictionary, the settings-menu constructor, and every chart renderer. The
   script switch is one attribute against baked markup; the language switch is
   a link to another URL; the popovers are <template> nodes already on the page.

   What survives is behaviour that cannot be baked: opening things, closing
   things, and knowing where the reader is on the page. */

import { popoverKey } from '../lib/triggers.ts';

const LS_THEME = 'as_theme';
const LS_SCRIPT = 'as_script';
const LS_LANG = 'as_lang';

const SCRIPTS = ['lat', 'cyr'] as const;
const THEMES = ['system', 'dark', 'light'] as const;

type Script = (typeof SCRIPTS)[number];

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* private mode */ }
}
function remove(key: string): void {
  try { localStorage.removeItem(key); } catch { /* private mode */ }
}

const root = document.documentElement;

/* ---------- theme ---------- */

const themeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');

function systemTheme(): 'light' | 'dark' {
  return themeQuery?.matches ? 'dark' : 'light';
}

function applyTheme(value: string): void {
  const stored = value === 'light' || value === 'dark' ? value : null;
  root.setAttribute('data-theme', stored ?? systemTheme());
  root.setAttribute('data-theme-source', stored ? 'stored' : 'auto');
  for (const chip of document.querySelectorAll<HTMLElement>('[data-theme-chip]')) {
    const v = chip.getAttribute('data-theme-chip');
    chip.setAttribute('aria-pressed', String(v === (stored ?? 'system')));
  }
}

function setTheme(value: string): void {
  if (!(THEMES as readonly string[]).includes(value)) return;
  if (value === 'system') remove(LS_THEME); else write(LS_THEME, value);
  applyTheme(value);
}

/* ---------- script ---------- */

/* One attribute. Both alphabets are already in the markup; CSS picks. */
function applyScript(value: Script): void {
  root.setAttribute('data-script', value);
  for (const chip of document.querySelectorAll<HTMLElement>('[data-script-chip]')) {
    chip.setAttribute('aria-pressed', String(chip.getAttribute('data-script-chip') === value));
  }
}

function setScript(value: string): void {
  if (!(SCRIPTS as readonly string[]).includes(value)) return;
  write(LS_SCRIPT, value);
  applyScript(value as Script);
}

/* ---------- popover ----------
   One floating shell, shared site-wide. Bodies are <template> nodes emitted by
   the build and keyed by the trigger's own data-* attributes, so the shell
   clones rather than rendering — and a trigger with no template is inert
   rather than broken. */

const popover = (() => {
  let pop: HTMLElement | null = null;
  let bodyEl: HTMLElement | null = null;
  let active: HTMLElement | null = null;

  function ensure(): void {
    if (pop) return;
    pop = document.createElement('div');
    pop.className = 'tip-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'false');
    pop.hidden = true;
    pop.innerHTML =
      '<div class="tip-pop-card">' +
        '<div class="tip-pop-body"></div>' +
        '<button type="button" class="tip-pop-close" aria-label="Close">×</button>' +
      '</div>';
    bodyEl = pop.querySelector('.tip-pop-body');
    pop.querySelector('.tip-pop-close')!.addEventListener('click', closeAndReturnFocus);
    document.body.appendChild(pop);
  }

  function position(): void {
    if (!active || !pop) return;
    const r = active.getBoundingClientRect();
    const sx = window.scrollX, sy = window.scrollY;
    pop.style.left = '0px'; pop.style.top = '0px';
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    const gutter = 12;
    const vw = root.clientWidth;
    let left = r.left + sx + r.width / 2 - pw / 2;
    left = Math.max(sx + gutter, Math.min(left, sx + vw - pw - gutter));
    const spaceBelow = window.innerHeight - r.bottom;
    const placeAbove = spaceBelow < ph + gutter && r.top > ph + gutter;
    let top = placeAbove ? r.top + sy - ph - 8 : r.bottom + sy + 8;
    /* Clamp into the visible viewport so an edge/tall popover never clips; if
       it is taller than the viewport, pin to the top and let it scroll. */
    const minTop = sy + gutter;
    const maxTop = sy + window.innerHeight - ph - gutter;
    top = maxTop >= minTop ? Math.max(minTop, Math.min(top, maxTop)) : minTop;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    pop.dataset['placement'] = placeAbove ? 'above' : 'below';
  }

  function templateFor(trigger: HTMLElement): HTMLTemplateElement | null {
    const attrs: Record<string, string> = {};
    for (const { name, value } of Array.from(trigger.attributes)) attrs[name] = value;
    const node = document.getElementById(popoverKey(attrs));
    return node instanceof HTMLTemplateElement ? node : null;
  }

  function open(trigger: HTMLElement): boolean {
    const template = templateFor(trigger);
    if (!template) return false;
    ensure();
    pop!.className = 'tip-pop' + (template.dataset['variant'] ? ' ' + template.dataset['variant'] : '');
    pop!.dataset['tone'] = template.dataset['tone'] ?? '';
    if (active && active !== trigger) active.setAttribute('aria-expanded', 'false');
    active = trigger;
    trigger.setAttribute('aria-expanded', 'true');
    bodyEl!.replaceChildren(template.content.cloneNode(true));
    pop!.hidden = false;
    requestAnimationFrame(() => { position(); pop!.classList.add('is-open'); });
    return true;
  }

  function close(): void {
    if (!pop) return;
    pop.classList.remove('is-open');
    pop.hidden = true;
    if (active) active.setAttribute('aria-expanded', 'false');
    active = null;
  }

  function closeAndReturnFocus(): void {
    const previous = active;
    close();
    previous?.focus({ preventScroll: true });
  }

  /* A trigger is anything the build gave a template. Delegated, so nothing has
     to be re-wired when the popover set changes. */
  const TRIGGER_SELECTOR = '.tip-chip, [data-note-trigger], [data-prep], [data-verb-tip], [data-pitch-note], [data-aspect-note]';

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const trigger = target?.closest?.(TRIGGER_SELECTOR) as HTMLElement | null;
    if (trigger) {
      event.preventDefault();
      if (active === trigger) { closeAndReturnFocus(); return; }
      open(trigger);
      return;
    }
    if (pop && !pop.hidden && !pop.contains(target as Node)) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !pop || pop.hidden) return;
    event.preventDefault();
    closeAndReturnFocus();
  });

  window.addEventListener('resize', () => { if (pop && !pop.hidden) position(); });
  window.addEventListener('scroll', () => { if (pop && !pop.hidden) position(); }, { passive: true });

  return { close };
})();

/* ---------- settings menu ----------
   The markup arrives from the build; only the opening and closing is here. */

function wireSettingsMenu(): void {
  const btn = document.querySelector<HTMLElement>('[data-settings-toggle]');
  const menu = document.getElementById('settingsMenu');
  const card = menu?.querySelector<HTMLElement>('.settings-menu-card');
  if (!btn || !menu || !card) return;

  let open = false;
  const position = () => {
    const r = btn.getBoundingClientRect();
    const gutter = 12;
    const cardW = card.offsetWidth || 280;
    let left = r.right - cardW;
    left = Math.max(gutter, Math.min(left, window.innerWidth - cardW - gutter));
    menu.style.left = left + 'px';
    menu.style.top = (r.bottom + 8) + 'px';
  };
  const setOpen = (next: boolean) => {
    open = next;
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => { position(); menu.classList.add('is-open'); });
    } else {
      menu.classList.remove('is-open');
      menu.hidden = true;
    }
  };

  btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!open); });
  document.addEventListener('click', (e) => {
    const target = e.target as Node;
    if (open && !menu.contains(target) && !btn.contains(target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) { setOpen(false); btn.focus({ preventScroll: true }); }
  });
  window.addEventListener('resize', () => { if (open) position(); });
  window.addEventListener('scroll', () => { if (open) position(); }, { passive: true });
}

/* ---------- case strip ---------- */

function stickyOffset(): void {
  const header = document.querySelector<HTMLElement>('header.nav');
  const strip = document.querySelector<HTMLElement>('.case-strip');
  const navHeight = header?.offsetHeight ?? 0;
  root.style.setProperty('--nav-height', navHeight + 'px');
  root.style.setProperty('--sticky-offset', (navHeight + (strip?.offsetHeight ?? 0)) + 'px');
}

/* Labels the cases table only. Hide once the reader scrolls past the whole
   case list (into the off-paradigm panel); bring it back on any upward scroll. */
function caseStripVisibility(): void {
  const strip = document.querySelector<HTMLElement>('.case-strip');
  const header = document.querySelector<HTMLElement>('header.nav');
  const list = document.getElementById('caseList');
  if (!strip || !list) return;

  let lastY = window.scrollY;
  let ticking = false;
  let pointerFocused = false;

  const setHidden = (hidden: boolean) => {
    strip.classList.toggle('is-hidden', hidden);
    strip.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    for (const a of strip.querySelectorAll('a')) a.tabIndex = hidden ? -1 : 0;
  };

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const headerHeight = header?.offsetHeight ?? 0;
    const passedList = list.getBoundingClientRect().bottom <= headerHeight + 12;
    const keyboardFocusInStrip = strip.matches(':focus-within') && !pointerFocused;
    if (y < lastY - 2 || !passedList || keyboardFocusInStrip) setHidden(false);
    else if (y > lastY + 2 && passedList) setHidden(true);
    lastY = y;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update);
  strip.addEventListener('pointerdown', () => { pointerFocused = true; });
  strip.addEventListener('keydown', () => { pointerFocused = false; });
  strip.addEventListener('focusin', () => setHidden(false));
  strip.addEventListener('focusout', () => { pointerFocused = false; });
  update();
}

/* Mark the strip cell whose row is nearest the top of the viewport, below the
   sticky header. The anchors are build-time ids now. */
function scrollSpy(): void {
  const cells = document.querySelectorAll<HTMLElement>('.case-strip-cell');
  const rows = document.querySelectorAll<HTMLElement>('#caseList .case-row[id]');
  if (!cells.length || !rows.length) return;

  const update = () => {
    const off = parseInt(getComputedStyle(root).getPropertyValue('--sticky-offset')) || 0;
    const probe = off + 24;
    let candidateId = rows[0]!.id;
    for (const row of rows) {
      if (row.getBoundingClientRect().top - probe <= 0) candidateId = row.id;
      else break;
    }
    for (const cell of cells) {
      const a = cell.querySelector('a');
      const match = !!a && a.getAttribute('href') === '#' + candidateId;
      cell.classList.toggle('is-current', match);
      if (a) {
        if (match) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      }
    }
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------- init ---------- */

function init(): void {
  applyTheme(read(LS_THEME) ?? 'system');
  themeQuery?.addEventListener?.('change', () => { if (!read(LS_THEME)) applyTheme('system'); });

  const script = read(LS_SCRIPT);
  applyScript(script === 'cyr' ? 'cyr' : 'lat');

  wireSettingsMenu();

  for (const chip of document.querySelectorAll<HTMLElement>('[data-script-chip]')) {
    chip.addEventListener('click', () => setScript(chip.getAttribute('data-script-chip') ?? ''));
  }
  for (const chip of document.querySelectorAll<HTMLElement>('[data-theme-chip]')) {
    chip.addEventListener('click', () => setTheme(chip.getAttribute('data-theme-chip') ?? ''));
  }

  /* The language chips are real links to the counterpart route. Recording the
     choice BEFORE navigating is what makes the arrival agree with the redirect
     — otherwise a reader who picked EN from /ru/ would be bounced straight
     back. */
  for (const chip of document.querySelectorAll<HTMLElement>('[data-lang-chip]')) {
    chip.addEventListener('click', () => {
      const lang = chip.getAttribute('data-lang-chip');
      if (lang) write(LS_LANG, lang);
    });
  }

  if (document.getElementById('caseList')) {
    stickyOffset();
    window.addEventListener('resize', stickyOffset);
    window.addEventListener('load', stickyOffset);
    caseStripVisibility();
    scrollSpy();
  }

  /* Retired preferences, swept so returning readers stop carrying them. */
  for (const key of ['as_detail', 'as_hint_detail', 'as_syncretism', 'as_lang_source']) remove(key);

  void popover;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

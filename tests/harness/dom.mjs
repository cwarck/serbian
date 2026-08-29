import vm from 'node:vm';

/* Throwaway fake DOM, just wide enough to run the pre-rewrite chart renderers
   under `vm` and read back what they assigned to `innerHTML`. Deleted with the
   old tree once the snapshot fixtures are trusted (plan phase 5.5). */

function makeElement(id) {
  const attrs = new Map();
  const el = {
    id: id || '',
    innerHTML: '',
    tabIndex: 0,
    style: { setProperty() {}, getPropertyValue: () => '' },
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.has(name) ? attrs.get(name) : null; },
    removeAttribute(name) { attrs.delete(name); },
    hasAttribute(name) { return attrs.has(name); },
    matches: () => false,
    closest: () => null,
    /* Element-level lookups hand back a fresh stub: app.js's popover shell
       builds its card with innerHTML then queries its own children. Document
       -level lookups stay null so the scroll/sticky wiring bails early. */
    querySelector: () => makeElement(''),
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    appendChild() {},
    getBoundingClientRect: () => ({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }),
    offsetHeight: 0,
    offsetWidth: 0,
    attrs,
  };
  return el;
}

/* One vm context per (page, lang, script) so no renderer sees another's state. */
export function makeContext({ lang, script, mounts }) {
  const store = { as_lang: lang, as_script: script };
  const elements = new Map(mounts.map(id => [id, makeElement(id)]));

  const documentElement = makeElement('');
  documentElement.setAttribute('lang', lang);
  documentElement.setAttribute('data-script', script);

  const document = {
    documentElement,
    getElementById: id => elements.get(id) || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => makeElement(''),
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    readyState: 'complete',
    body: makeElement(''),
    head: makeElement(''),
  };

  const window = {
    I18N: undefined,
    scrollY: 0,
    pageYOffset: 0,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  };

  const context = {
    window,
    document,
    console,
    navigator: { languages: [lang], language: lang },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
    },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    requestAnimationFrame: () => 0,
    cancelAnimationFrame() {},
    setTimeout: () => 0,
    clearTimeout() {},
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init && init.detail; } },
    Event: class Event { constructor(type) { this.type = type; } },
  };
  context.globalThis = context;
  context.self = context;
  vm.createContext(context);
  return { context, elements };
}

/* app.js and the chart scripts declare their exports as bare globals (`const
   CASES = …`, `window.SerbianFyi = …`). Running them in one context and then
   flattening `window` onto it is what makes both styles visible to the next
   script in the list — the same thing a browser does. */
export function flattenWindow(context) {
  for (const key of Object.keys(context.window)) {
    if (!(key in context)) context[key] = context.window[key];
    else if (key === 'I18N' || key === 'SerbianFyi' || key === 'GLOSSARY' || key === 'PREP') {
      context[key] = context.window[key];
    }
  }
}

import { html, raw, sr, srHTML, srGrammarHTML, escape, markedText, type Raw } from '../lib/html.ts';
import { toLatin, toCyrillic } from '../lib/script.ts';
import type { Lang } from '../lib/negotiate.ts';
import { translator } from '../i18n/index.ts';
import { CASES, IDECL, WRINKLES, ENDING_AXES } from '../content/cases.ts';
import { GENDERS, type CaseRow, type CaseNote, type Ending, type EndingAxis, type Number_ } from '../lib/types.ts';
import { lookupPrep, renderPrepCard } from './prep-shared.ts';
import { endingUnit, type Chart } from './chart.ts';

/* The two ending bands. Number is a band heading, never a chip: a chip says
   which gender, the band it sits in says which number. */
const NUMBERS = ['sg', 'pl'] as const satisfies readonly Number_[];

type T = (key: string) => Raw;

export function caseAnchor(key: string): string {
  return key.replace(/\./g, '-');
}

/* Spotlight the changed letters in a sound-change pair: walk the common prefix
   and suffix from both ends and wrap the divergent middle.

   The offsets are character offsets, and lj/nj/dž are two Latin characters
   against one Cyrillic — so the diff is computed on EACH script's own pair,
   never transliterated from the Latin-marked-up string. Transliterating a diff
   that split l|j would emit лј where љ belongs. */
function diffHL(a: string, b: string): { from: string; to: string } {
  const sa = String(a), sb = String(b);
  let p = 0;
  const minLen = Math.min(sa.length, sb.length);
  while (p < minLen && sa[p] === sb[p]) p++;
  let ea = sa.length, eb = sb.length;
  while (ea > p && eb > p && sa[ea - 1] === sb[eb - 1]) { ea--; eb--; }
  const wrap = (s: string, i: number, j: number) =>
    escape(s.slice(0, i)) + (i < j ? `<span class="lit">${escape(s.slice(i, j))}</span>` : '') + escape(s.slice(j));
  return { from: wrap(sa, p, ea), to: wrap(sb, p, eb) };
}

/* Dual-emit a diffed pair: each alphabet gets its own diff. */
function diffPair(a: string, b: string): { from: Raw; to: Raw } {
  const lat = diffHL(toLatin(a), toLatin(b));
  const cyr = diffHL(toCyrillic(a), toCyrillic(b));
  const dual = (l: string, c: string) =>
    raw(`<span class="s"><i data-s="lat">${l}</i><i data-s="cyr">${c}</i></span>`);
  return { from: dual(lat.from, cyr.from), to: dual(lat.to, cyr.to) };
}

/* ── Syncretism ────────────────────────────────────────────────────────
   Walk each gender/number column down the seven cases. The first time an
   ending shape appears it is "novel" (kept lit in its case tone); every later
   identical shape is an "echo" that recedes to ink and points back to the case
   that introduced it. Turns the 42-slot grid into the ~dozen genuinely-new
   endings, read off contrast rather than from a footnote. */
interface Branch { v: string; novel: boolean; source: string | null }

function entryBranchValues(entry: Ending | null | undefined): string[] {
  if (entry == null) return [];
  if (typeof entry === 'string') return [entry];
  if ('split' in entry) return entry.split.map(s => s.v);
  return [entry.v];
}

function computeSyncretism(): Record<number, Record<string, Branch[]>> {
  const map: Record<number, Record<string, Branch[]>> = {};
  for (const ax of ENDING_AXES as readonly EndingAxis[]) {
    const firstSeen = new Map<string, string>();
    (CASES as readonly CaseRow[]).forEach((c, i) => {
      const entry = c.endings[ax.g][ax.n];
      /* Sound-conditioned alternation — a plain split like the palatal/soft
         vocative (-e / -u) — is not syncretism. A coincidental shape match
         (VOK soft -u vs DAT -u) must not read as "borrowed", so those branches
         stay lit. Only a split flagged syncretic (AKU animacy) is genuine
         reuse of GEN/NOM and keeps its echo chips. */
      const conditioned = entry != null && typeof entry !== 'string'
        && 'split' in entry && Array.isArray(entry.split) && !entry.syncretic;
      const vals = entryBranchValues(entry);
      const branches = vals.map(v => (!conditioned && firstSeen.has(String(v)))
        ? { v, novel: false, source: firstSeen.get(String(v))! }
        : { v, novel: true, source: null });
      for (const v of vals) if (!firstSeen.has(String(v))) firstSeen.set(String(v), c.abbr);
      (map[i] ??= {})[ax.key] = branches;
    });
  }
  return map;
}

const SYNC = computeSyncretism();

/* The provenance field: on an echo cell, name the case the shape came from.
   Deliberately neutral — see .eu-source in styles.css. The relation ("same
   as") is invisible in text, so it is spelled for a screen reader; an
   aria-label on a generic span is not reliably exposed. */
function sourceField(target: string | null, t: T): string {
  if (!target) return '';
  return html`<span class="eu-source"><span class="sr-only">${t('cases.sameAs')} </span>${target}</span>`.value;
}

/* The `?` trigger's accessible name is the note title, which carries Serbian
   inside <i> markers. Dual-emit has no CSS equivalent in an attribute — you
   cannot hide half an aria-label — so ONE script is baked, and the script
   toggle does not reach it. Latin, matching the no-attribute default. */
function noteLabel(note: CaseNote | undefined, lang: Lang): string {
  if (!note) return 'see note';
  const title = lang === 'ru' ? note.titleRu : note.titleEn;
  return markedText(title, toLatin).replace(/<[^>]*>/g, '');
}

/* One cell's worth of ending FIELDS. Normally one; a syncretic split (AKU
   animacy) yields two, which stack as two whole units — each ending reuses a
   different case, so each needs its own provenance field. */
interface Field { readonly form: string; readonly source: string; readonly echo: boolean }

function endingFields(entry: Ending | null | undefined, caseIdx: number, axisKey: string, lang: Lang, t: T): Field[] {
  if (entry == null) return [{ form: '—', source: '', echo: false }];
  const branches = SYNC[caseIdx]?.[axisKey] ?? [];
  const c = (CASES as readonly CaseRow[])[caseIdx];

  const noteMark = (id: string) => raw(
    `<button type="button" class="tip-chip cell-note" aria-haspopup="dialog" aria-expanded="false" aria-label="${escape(noteLabel(c?.notes?.[id], lang))}" data-note-trigger data-case-idx="${caseIdx}" data-note-id="${id}">?</button>`);

  const one = (value: string, branch: Branch | undefined, note: Raw | string): Field => {
    const echo = !!branch && !branch.novel;
    return {
      form: `<span lang="sr">${sr(value).value}</span>${String(note ?? '')}`,
      source: echo ? sourceField(branch.source, t) : '',
      echo,
    };
  };

  if (typeof entry === 'string') return [one(entry, branches[0], '')];

  if ('split' in entry) {
    const variants = entry.split;
    /* If every variant points to the same note, hoist one marker to the end so
       the cell reads `-a / -∅¹` rather than `-a¹ / -∅¹`. */
    const sharedNote = variants.every(s => s.n && s.n === variants[0]!.n) ? variants[0]!.n : null;

    /* Syncretic split (AKU animacy): each ending reuses a known case, so it
       gets its own unit and its own source field. The criterion that picks
       between them (alive vs thing) lives in the ? note, not inline. */
    if (entry.syncretic) {
      return variants.map((s, idx) => {
        const m = sharedNote && idx === variants.length - 1 ? noteMark(sharedNote)
                : !sharedNote && s.n ? noteMark(s.n) : '';
        return one(s.v, branches[idx], m);
      });
    }

    /* A sound-conditioned alternation is ONE statement, so it stays inline in
       one form field. It must not become a baseline row — that construction is
       what the unit exists to delete. */
    const ends = variants.map((s, idx) => {
      const m = !sharedNote && s.n ? noteMark(s.n) : '';
      return one(s.v, branches[idx], m).form;
    }).join('<span class="cell-sep" aria-hidden="true">/</span>');
    const tail = sharedNote ? String(noteMark(sharedNote)) : '';
    /* Every variant of a conditioned alternation shares one provenance (they
       are all novel, or all echo the same case), so the first branch speaks
       for the cell. */
    const lead = branches[0];
    const echo = !!lead && !lead.novel;
    return [{ form: ends + tail, source: echo ? sourceField(lead.source, t) : '', echo }];
  }

  return [one(entry.v, branches[0], entry.n ? noteMark(entry.n) : '')];
}

/* The case question ("ko? / šta? — who, what.") leads with a Serbian run in
   <strong>; only that run flips script. */
function srStrongHTML(markup: string): Raw {
  return raw(String(markup).replace(/<strong>(.*?)<\/strong>/g,
    (_, inner: string) => `<strong lang="sr">${srHTML(inner).value}</strong>`));
}

/* A preposition in the case's prep list. If the shared prep card knows this
   lemma, render a clickable trigger that opens the card in place; otherwise
   fall back to plain text (no dead affordance). data-prep stays a Latin lookup
   key — correctly script-invariant. */
function prepToken(p: string): Raw {
  const known = lookupPrep(p);
  return known
    ? raw(`<button type="button" class="prep-trigger" data-prep="${escape(p)}" aria-expanded="false">${sr(p).value}</button>`)
    : sr(p);
}

export function notePopoverHTML(caseIdx: number, noteId: string, lang: Lang): Raw | string {
  const c = (CASES as readonly CaseRow[])[caseIdx];
  const note = c?.notes?.[noteId];
  if (!note) return '';
  const title = srGrammarHTML(lang === 'ru' ? note.titleRu : note.titleEn);
  const body = srGrammarHTML(lang === 'ru' ? note.bodyRu : note.bodyEn);
  const pairs = (note.pairs ?? []).map(p => {
    const hl = diffPair(p[0], p[1]);
    return html`
      <li>
        <span class="from" lang="sr">${hl.from}</span>
        <span class="arrow" aria-hidden="true">→</span>
        <span class="to" lang="sr">${hl.to}</span>
      </li>`.value;
  }).join('');
  return html`
    <article class="note-pop">
      <h4 class="note-title">${title}</h4>
      <p class="note-body">${body}</p>
      ${pairs ? raw(`<ul class="note-pairs">${pairs}</ul>`) : ''}
    </article>`;
}

export const chart: Chart = {
  name: 'cases',
  /* The pre-rewrite renderer re-asserted class="case-list" on every render. */
  mountAttrs: { caseList: { class: 'case-list' } },

  mounts: (lang: Lang) => {
    const t = translator(lang);

    const caseStripList = (CASES as readonly CaseRow[]).map(c => html`
    <li class="case-strip-cell" data-tone="${c.tone}">
      <a href="#${caseAnchor(c.key)}" aria-label="${t(c.key + '.name')}">
        <span class="strip-abbr">${c.abbr}</span>
      </a>
    </li>
  `.value).join('');

    const headBlock = (c: CaseRow) => html`
      <div class="case-cell case-cell-head">
        <header class="case-head">
          <div class="case-head-title">
            <h3><span lang="sr">${sr(t(c.key + '.local').value)}</span><em>${t(c.key + '.name')}</em></h3>
            <span class="case-tag">${c.abbr}</span>
          </div>
          <p class="q">${srStrongHTML(t(c.key + '.q').value)}</p>
        </header>
      </div>`;

    const caseList = (CASES as readonly CaseRow[]).map((c, i) => {
      /* One band per number, a wrapping run of units under it, M-N-F per
         GENDERS. The `M.SG` axis label is gone: the unit names the gender and
         the band names the number. */
      const endCells = NUMBERS.map(n => html`
      <div class="case-cell case-cell-band" data-band="${n}">
        <span class="cell-axis">${t('band.' + n)}</span>
      </div>
      <div class="case-cell case-cell-end" data-band="${n}">
        <div class="gender-run">${raw(GENDERS.map(g => {
          const units = endingFields(c.endings[g][n], i, `${g}-${n}`, lang, t)
            .map(f => endingUnit([{ g, label: t('cases.gender.' + g) }], raw(f.form), { source: f.source, echo: f.echo }).value);
          /* A syncretic split stacks two whole units — one per reused case. */
          return units.length > 1 ? `<span class="eu-stack">${units.join('')}</span>` : units.join('');
        }).join(''))}</div>
      </div>
    `.value).join('');

      const exCell = c.examples.length === 0 ? '' : html`
      <div class="case-cell case-cell-ex">
        <span class="cell-axis">${t('cases.examples')}</span>
        <div class="examples">${c.examples.map(ex => html`
          <div class="ex">
            <div class="sr" lang="sr">${srHTML(ex.sr)}</div>
            <div class="tr">${srGrammarHTML(ex[lang] || ex.en)}</div>
          </div>`)}
        </div>
      </div>`.value;

      const prepCell = c.preps.length === 0 ? html`
      <div class="case-cell case-cell-preps is-empty" aria-hidden="true"></div>
    `.value : html`
      <div class="case-cell case-cell-preps">
        <span class="cell-axis">${t('cases.preps')}</span>
        <p class="prep-list">${raw(c.preps.map(p => prepToken(p).value).join(', '))}</p>
      </div>`.value;

      return html`
      <article class="case-row" id="${caseAnchor(c.key)}" data-tone="${c.tone}">
        ${headBlock(c)}
        ${raw(endCells)}
        ${raw(exCell)}
        ${raw(prepCell)}
      </article>`.value;
    }).join('');

    const idRows = IDECL.cases.map((abbr, i) => html`
    <tr>
      <th scope="row" class="num">${abbr}</th>
      <td><span class="end" lang="sr">${sr(IDECL.sg[i]!)}</span></td>
      <td><span class="end" lang="sr">${sr(IDECL.pl[i]!)}</span></td>
    </tr>
  `.value).join('');

    const idGloss = t('cases.extra.gloss').value;
    const idPanel = html`
    <article class="extra-panel extra-panel-idecl">
      <header class="extra-panel-head">
        <h3 class="extra-panel-title">${srGrammarHTML(t('cases.extra.title').value)}</h3>
        <span class="extra-panel-sub"><em lang="sr">${sr('ljubav')}</em>${idGloss ? raw(' · ' + idGloss) : ''}</span>
      </header>
      <div class="extra-panel-body">
        <table class="i-decl">
          <thead>
            <tr>
              <th></th>
              <th>${t('cases.number.sg')}</th>
              <th>${t('cases.number.pl')}</th>
            </tr>
          </thead>
          <tbody>${raw(idRows)}</tbody>
        </table>
      </div>
    </article>
  `.value;

    const wrinklePanels = WRINKLES.map(w => {
      const items = w.examples.map(ex => {
        const hl = diffPair(ex.from, ex.to);
        return html`
        <li>
          <span class="from" lang="sr">${hl.from}</span>
          <span class="arrow" aria-hidden="true">→</span>
          <span class="to" lang="sr">${hl.to}</span>
          <span class="gloss">${srGrammarHTML(ex[lang] || ex.en)}</span>
        </li>
      `.value;
      }).join('');
      return html`
      <article class="extra-panel">
        <header class="extra-panel-head">
          <h3 class="extra-panel-title">${srGrammarHTML(t(w.key + '.title').value)}</h3>
        </header>
        <div class="extra-panel-body">
          <ul class="wrinkle-list">${raw(items)}</ul>
        </div>
      </article>
    `.value;
    }).join('');

    return { caseStripList, caseList, extraPack: idPanel + wrinklePanels };
  },

  popovers: [
    {
      match: '[data-note-trigger]',
      variant: 'case-pop',
      render: (attrs, lang) => {
        const caseIdx = Number(attrs['data-case-idx']);
        const noteId = attrs['data-note-id'];
        return (Number.isNaN(caseIdx) || !noteId) ? '' : notePopoverHTML(caseIdx, noteId, lang);
      },
      tone: attrs => (CASES as readonly CaseRow[])[Number(attrs['data-case-idx'])]?.tone ?? '',
    },
    {
      match: '[data-prep]',
      variant: 'prep-pop',
      render: (attrs, lang) => renderPrepCard(attrs['data-prep']!, lang),
    },
  ],
};

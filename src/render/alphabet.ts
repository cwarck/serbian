import { html, raw } from '../lib/html.ts';
import type { Lang } from '../lib/negotiate.ts';
import { text } from '../i18n/index.ts';
import { ALPHABET } from '../content/alphabet.ts';
import { gloss, type Chart } from './chart.ts';

/* The alphabet shows both scripts side by side by design, so its glyph cells
   are NOT dual-emitted — the columns are the content. Line-style (solid vs
   dashed stripe) carries the unique/diff axis; no colour. */

function letters(lang: Lang): string {
  const cta = text(lang, 'alph.tip.cta');
  return ALPHABET.map((L, i) => html`
    <article class="letter" data-kind="${L.kind}">
      <div class="glyphs" lang="sr">
        <span class="cyr">${L.cyr}</span>
        <span class="sep">·</span>
        <span class="lat">${L.lat}</span>
      </div>
      <div class="ipa-row">
        <span class="ipa">${L.ipa}</span>
        ${L.tip
          ? raw(`<button class="tip-chip" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${cta}" data-tip-idx="${i}">?</button>`)
          : ''}
      </div>
      <div class="example">
        <span class="word" lang="sr">
          <span class="word-cyr">${L.wCyr}</span>
          <span class="word-sep">·</span>
          <span class="word-lat">${L.wLat}</span>
        </span>
        <span class="tr">${gloss(L.wLat, lang)}</span>
      </div>
    </article>
  `.value).join('');
}

export const chart: Chart = {
  name: 'alphabet',
  mounts: lang => ({ alphGrid: letters(lang) }),
  popovers: [{
    match: '.tip-chip',
    render: (attrs, lang) => {
      const L = ALPHABET[Number(attrs['data-tip-idx'])];
      return L?.tip ? L.tip[lang] : '';
    },
  }],
};

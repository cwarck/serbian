function currentLang() {
  return document.documentElement.getAttribute('lang') || 'en';
}

function tipLabel(lang) {
  return (window.I18N && window.I18N[lang] && window.I18N[lang]['alph.tip.cta']) || 'how to say it';
}

function renderAlphabet() {
  const lang = currentLang();
  const grid = document.getElementById('alphGrid');
  if (!grid) return;
  const cta = tipLabel(lang);
  grid.innerHTML = ALPHABET.map((L, i) => `
    <article class="letter" data-kind="${L.kind}"${L.tip ? ' data-has-tip="true"' : ''}>
      <div class="glyphs">
        <span class="cyr">${L.cyr}</span>
        <span class="sep">·</span>
        <span class="lat">${L.lat}</span>
      </div>
      <div class="ipa-row">
        <span class="ipa">${L.ipa}</span>
        ${L.tip ? `<button class="tip-chip" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="${cta}" data-tip-idx="${i}">?</button>` : ''}
      </div>
      <div class="example">
        <span class="word">
          <span class="word-cyr">${L.wCyr}</span>
          <span class="word-sep">·</span>
          <span class="word-lat">${L.wLat}</span>
        </span>
        <span class="tr">${SerbianFyi.glossary.gloss(L.wLat, lang)}</span>
      </div>
    </article>
  `).join('');
}

/* Pronunciation tip popover — rides the shared popover shell. */
SerbianFyi.popover.register({
  match: '.tip-chip',
  render: (t) => {
    if (t.dataset.tipIdx === undefined) return '';
    const L = ALPHABET[+t.dataset.tipIdx];
    const lang = currentLang();
    return (L && L.tip) ? (L.tip[lang] || L.tip.en) : '';
  },
});

document.addEventListener('langchange', renderAlphabet);
renderAlphabet();

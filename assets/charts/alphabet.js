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
        <span class="tr">${L.tr[lang]}</span>
      </div>
    </article>
  `).join('');
}

/* Pronunciation tip popover */
(function setupTipPopover(){
  const pop = document.getElementById('tipPop');
  if (!pop) return;
  const bodyEl    = pop.querySelector('#tipPopBody');
  const closeBtn  = pop.querySelector('.tip-pop-close');
  let activeChip = null;

  function position() {
    if (!activeChip) return;
    const r = activeChip.getBoundingClientRect();
    const sx = window.scrollX || window.pageXOffset;
    const sy = window.scrollY || window.pageYOffset;
    // measure popover
    pop.style.left = '0px'; pop.style.top = '0px';
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    const gutter = 12;
    const vw = document.documentElement.clientWidth;
    // horizontal: align to chip center, clamp to viewport
    let left = r.left + sx + r.width/2 - pw/2;
    left = Math.max(sx + gutter, Math.min(left, sx + vw - pw - gutter));
    // vertical: prefer below; flip above if not enough room
    const spaceBelow = window.innerHeight - r.bottom;
    const placeAbove = spaceBelow < ph + gutter && r.top > ph + gutter;
    const top = placeAbove ? r.top + sy - ph - 8 : r.bottom + sy + 8;
    pop.style.left = left + 'px';
    pop.style.top  = top  + 'px';
    pop.dataset.placement = placeAbove ? 'above' : 'below';
  }

  function getTipContent(trigger) {
    const lang = currentLang();
    if (trigger.dataset.tipIdx !== undefined) {
      const L = ALPHABET[+trigger.dataset.tipIdx];
      return (L && L.tip) ? (L.tip[lang] || L.tip.en) : null;
    }
    return null;
  }

  function open(trigger) {
    const content = getTipContent(trigger);
    if (!content) return;
    if (activeChip && activeChip !== trigger) activeChip.setAttribute('aria-expanded','false');
    activeChip = trigger;
    trigger.setAttribute('aria-expanded','true');
    bodyEl.innerHTML = content;
    pop.hidden = false;
    requestAnimationFrame(() => {
      position();
      pop.classList.add('is-open');
    });
  }

  function close() {
    if (!activeChip) return;
    activeChip.setAttribute('aria-expanded','false');
    activeChip = null;
    pop.classList.remove('is-open');
    pop.hidden = true;
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.tip-chip');
    if (trigger) {
      e.preventDefault();
      if (activeChip === trigger) { close(); } else { open(trigger); }
      return;
    }
    if (!pop.hidden && !pop.contains(e.target)) close();
  });

  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (!pop.hidden) position(); });
  window.addEventListener('scroll', () => { if (!pop.hidden) position(); }, { passive: true });

  document.addEventListener('langchange', close);
})();

document.addEventListener('langchange', renderAlphabet);
renderAlphabet();

function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function t(key) { return dict()[key] || key; }
function colHeader(key, tones) {
  if (!tones.length) return t(key);
  if (tones.length === 1) return `<span data-tone="${tones[0]}">${t(key)}</span>`;
  return t(key).split('/').map((part, i) => {
    const tone = tones[i];
    const span = tone ? `<span data-tone="${tone}">${part.trim()}</span>` : part.trim();
    return span;
  }).join('<span class="pron-slash">/</span>');
}

function personalCell(value) {
  if (value === '-') return '<span class="pron-dash">-</span>';
  const parts = value.split(',').map(part => part.trim());
  return parts.map((part, idx) => `
    <span class="${idx === 0 ? 'pron-long' : 'pron-short'}">${AtlasSrpski.sr(part)}</span>
  `).join('<span class="pron-comma">,</span> ');
}

function renderPersonal() {
  const root = document.getElementById('personalPronouns');
  if (!root) return;
  const columns = [
    ['pron.subject', 'subject', ['nom']],
    ['pron.accgen', 'object', ['aku', 'gen']],
    ['pron.datloc', 'datloc', ['dat', 'lok']],
    ['case.6.name', 'inst', ['ins']],
    ['pron.poss.short', 'poss', []],
  ];
  const rows = PERSONAL.map(row => `
    <tr data-band="${row.band}">
      <th scope="row">
        <span class="pron-person-label">${t(row.label)}</span>
        <span class="pron-subject">${AtlasSrpski.sr(row.subject)}</span>
      </th>
      ${columns.slice(1).map(([key, prop]) => `<td data-label="${t(key)}">${personalCell(row[prop])}</td>`).join('')}
    </tr>
  `).join('');

  root.innerHTML = `
    <table class="pron-table">
      <thead>
        <tr>
          ${columns.map(([key, , tones = []]) => `<th scope="col">${colHeader(key, tones)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="pron-rule-row">
      <p><strong>${t('pron.long.short')}</strong> ${t('pron.long.short.rule')}</p>
      <p><strong>${AtlasSrpski.sr('svoj')}</strong> ${t('pron.svoj.rule')}</p>
    </div>
  `;
}

function renderPossessives() {
  const root = document.getElementById('possessives');
  if (!root) return;
  root.innerHTML = `
    <div class="pron-mini-head" aria-hidden="true">
      <span></span><span data-gender="m">${t('cases.gender.m')}</span><span data-gender="n">${t('cases.gender.n')}</span><span data-gender="f">${t('cases.gender.f')}</span>
    </div>
    ${POSSESSIVES.map(item => `
      <article class="pron-poss-card">
        <h4>${t(item.owner)}</h4>
        <div class="pron-gender-row">
          ${item.forms.map(form => `<span>${AtlasSrpski.sr(form)}</span>`).join('')}
        </div>
        ${item.note ? `<p>${t(item.note)}</p>` : ''}
      </article>
    `).join('')}
  `;
}

function genderHead() {
  return `<div class="pron-mini-head pron-genders" aria-hidden="true">
    <span></span><span data-gender="m">${t('cases.gender.m')}</span><span data-gender="n">${t('cases.gender.n')}</span><span data-gender="f">${t('cases.gender.f')}</span>
  </div>`;
}

function renderDemonstratives() {
  const root = document.getElementById('demonstratives');
  if (!root) return;
  root.innerHTML = DEMOS.map(group => `
    <section class="pron-demo-group">
      <h4>${t(group.title)}</h4>
      ${genderHead()}
      <div class="pron-matrix">
        ${group.rows.map(row => `
          <div class="pron-matrix-row">
            <span class="pron-row-label">${t(row.key)}</span>
            ${row.forms.map(form => `<span class="pron-form">${AtlasSrpski.sr(form)}</span>`).join('')}
          </div>
        `).join('')}
      </div>
    </section>
  `).join('') + `
    <div class="pron-rule-row">
      <p><strong>${AtlasSrpski.sr('Ovo je...')}</strong> ${t('pron.demo.predicate')}</p>
      <p><strong>${AtlasSrpski.sr('Ovaj pas')}</strong> ${t('pron.demo.noun.rule')}</p>
    </div>
  `;
}

function renderQuestions() {
  const root = document.getElementById('questions');
  if (!root) return;
  root.innerHTML = `
    <section class="pron-question-block">
      <h4>${t('pron.whose')}</h4>
      ${genderHead()}
      <div class="pron-matrix">
        ${QUESTIONS.whose.map(row => `
          <div class="pron-matrix-row">
            <span class="pron-row-label">${t(row.label)}</span>
            ${row.forms.map(form => `<span class="pron-form">${AtlasSrpski.sr(form)}</span>`).join('')}
          </div>
        `).join('')}
      </div>
    </section>
    <section class="pron-question-block">
      <h4>${t('pron.who.what')}</h4>
      <div class="pron-kw-table">
        <div class="pron-kw-head"><span></span><span>${t('pron.who')}</span><span>${t('pron.what')}</span></div>
        ${QUESTIONS.whoWhat.map(row => `
          <div class="pron-kw-row">
            <span>${t(row.key)}</span>
            <span>${AtlasSrpski.sr(row.who)}</span>
            <span>${AtlasSrpski.sr(row.what)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPronouns() {
  renderPersonal();
  renderPossessives();
  renderDemonstratives();
  renderQuestions();
}

document.addEventListener('langchange', renderPronouns);
document.addEventListener('scriptchange', renderPronouns);
renderPronouns();

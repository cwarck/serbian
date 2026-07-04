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
  const forms = parts.map((part, idx) => {
    const cls = idx === 0 ? 'pron-long' : 'pron-short';
    const comma = idx < parts.length - 1 ? '<span class="pron-comma">,</span>' : '';
    return `<span class="${cls}">${SerbianFyi.sr(part)}${comma}</span>`;
  });
  return `<span class="pron-pair" lang="sr">${forms.join(' ')}</span>`;
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
        <span class="pron-subject" lang="sr">${SerbianFyi.sr(row.subject)}</span>
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
      <p><strong><i lang="sr">${SerbianFyi.sr('svoj')}</i></strong> ${t('pron.svoj.rule')}</p>
    </div>
  `;
}

function renderPossessives() {
  const root = document.getElementById('possessives');
  if (!root) return;
  root.setAttribute('role', 'table');
  root.innerHTML = `
    <div class="pron-mini-head" role="row">
      <span role="presentation"></span><span role="columnheader" data-gender="m">${t('cases.gender.m')}</span><span role="columnheader" data-gender="n">${t('cases.gender.n')}</span><span role="columnheader" data-gender="f">${t('cases.gender.f')}</span>
    </div>
    ${POSSESSIVES.map((item, i) => `
      <article class="pron-poss-card" role="rowgroup">
        <h4 id="pron-poss-owner-${i}">${t(item.owner)}</h4>
        <div class="pron-gender-row" role="row" aria-labelledby="pron-poss-owner-${i}">
          ${item.forms.map(form => `<span role="cell" lang="sr">${SerbianFyi.sr(form)}</span>`).join('')}
        </div>
        ${item.note ? `<p>${t(item.note)}</p>` : ''}
      </article>
    `).join('')}
  `;
}

function genderHead() {
  return `<div class="pron-mini-head pron-genders" role="row">
    <span role="columnheader"></span><span role="columnheader" data-gender="m">${t('cases.gender.m')}</span><span role="columnheader" data-gender="n">${t('cases.gender.n')}</span><span role="columnheader" data-gender="f">${t('cases.gender.f')}</span>
  </div>`;
}

function renderDemonstratives() {
  const root = document.getElementById('demonstratives');
  if (!root) return;
  root.innerHTML = DEMOS.map(group => `
    <section class="pron-demo-group">
      <h4>${t(group.title)}</h4>
      <div role="table" style="display:contents">
        ${genderHead()}
        <div class="pron-matrix" role="rowgroup">
          ${group.rows.map(row => `
            <div class="pron-matrix-row" role="row">
              <span class="pron-row-label" role="rowheader">${t(row.key)}</span>
              ${row.forms.map(form => `<span class="pron-form" role="cell" lang="sr">${SerbianFyi.sr(form)}</span>`).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `).join('') + `
    <div class="pron-rule-row">
      <p><strong><i lang="sr">${SerbianFyi.sr('Ovo je...')}</i></strong> ${t('pron.demo.predicate')}</p>
      <p><strong><i lang="sr">${SerbianFyi.sr('Ovaj pas')}</i></strong> ${t('pron.demo.noun.rule')}</p>
    </div>
  `;
}

function renderQuestions() {
  const root = document.getElementById('questions');
  if (!root) return;
  root.innerHTML = `
    <section class="pron-question-block">
      <h4>${t('pron.whose')}</h4>
      <div role="table" style="display:contents">
        ${genderHead()}
        <div class="pron-matrix" role="rowgroup">
          ${QUESTIONS.whose.map(row => `
            <div class="pron-matrix-row" role="row">
              <span class="pron-row-label" role="rowheader">${t(row.label)}</span>
              ${row.forms.map(form => `<span class="pron-form" role="cell" lang="sr">${SerbianFyi.sr(form)}</span>`).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    <section class="pron-question-block">
      <h4>${t('pron.who.what')}</h4>
      <div class="pron-kw-table" role="table">
        <div class="pron-kw-head" role="row"><span role="columnheader"></span><span role="columnheader">${t('pron.who')}</span><span role="columnheader">${t('pron.what')}</span></div>
        ${QUESTIONS.whoWhat.map(row => `
          <div class="pron-kw-row" role="row">
            <span role="rowheader">${t(row.key)}</span>
            <span role="cell" lang="sr">${SerbianFyi.sr(row.who)}</span>
            <span role="cell" lang="sr">${SerbianFyi.sr(row.what)}</span>
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

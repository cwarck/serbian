function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function t(key) { return dict()[key] || key; }
function renderFalseRow(row) {
  return `
    <article class="false-row">
      <div class="false-word" data-label="${t('false.col.sr')}">
        <span class="sr">${AtlasSrpski.sr(row.sr)}</span>
      </div>
      <div class="false-cell false-means" data-label="${t('false.col.means')}">${row.means}</div>
      <div class="false-cell false-trap" data-label="${t('false.col.trap')}">
        <span class="false-not">${t('false.trap.label')}</span>
        <span>${row.trap}</span>
        <small>${row.trapMeans}</small>
      </div>
      <div class="false-example" data-label="${t('false.col.example')}">
        <span class="sr">${AtlasSrpski.sr(row.ex.sr)}</span>
        <span class="tr">${row.ex.ru}</span>
      </div>
    </article>
  `;
}

function renderFalseFriends() {
  const root = document.getElementById('falseFriendsChart');
  if (!root) return;
  root.innerHTML = FALSE_FRIEND_GROUPS.map(group => `
    <section class="false-group">
      <header class="false-group-head">
        <h3>${t(group.key)}</h3>
      </header>
      <div class="false-table">
        <div class="false-table-head">
          <span>${t('false.col.sr')}</span>
          <span>${t('false.col.means')}</span>
          <span>${t('false.col.trap')}</span>
          <span>${t('false.col.example')}</span>
        </div>
        ${group.rows.map(renderFalseRow).join('')}
      </div>
    </section>
  `).join('');
}

document.addEventListener('langchange', renderFalseFriends);
document.addEventListener('scriptchange', renderFalseFriends);
renderFalseFriends();

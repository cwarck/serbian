function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function t(key) { return dict()[key] || key; }
function renderFalseRow(row) {
  return `
    <article class="chart-row">
      <div class="chart-cell false-word" data-label="${t('false.col.sr')}">
        <span class="sr" lang="sr">${SerbianFyi.sr(row.sr)}</span>
      </div>
      <div class="chart-cell false-means" data-label="${t('false.col.means')}">${row.means}</div>
      <div class="chart-cell false-trap" data-label="${t('false.col.trap')}">
        <span class="chart-label false-not">${t('false.trap.label')}</span>
        <span>${row.trap}</span>
        <small>${row.trapMeans}</small>
      </div>
      <div class="chart-example" data-label="${t('false.col.example')}">
        <span class="sr" lang="sr">${SerbianFyi.sr(row.ex.sr)}</span>
        <span class="tr">${row.ex.ru}</span>
      </div>
    </article>
  `;
}

function renderFalseFriends() {
  const root = document.getElementById('falseFriendsChart');
  if (!root) return;
  root.innerHTML = FALSE_FRIEND_GROUPS.map(group => `
    <section class="chart-group">
      <header class="chart-group-head">
        <h3>${t(group.key)}</h3>
      </header>
      <div class="chart-table">
        ${group.rows.map(renderFalseRow).join('')}
      </div>
    </section>
  `).join('');
}

document.addEventListener('langchange', renderFalseFriends);
document.addEventListener('scriptchange', renderFalseFriends);
renderFalseFriends();

function dict() {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (window.I18N && window.I18N[lang]) || {};
}
function t(key) { return dict()[key] || key; }
/* Rows flagged `partial` DO carry the Russian sense as well (vreme = время and
   погода), so the badge says "not only" — the absolute "not" contradicted the
   meaning printed right above it. */
function renderFalseRow(row) {
  return `
    <article class="chart-row">
      <div class="false-head">
        <span class="false-word" lang="sr">${SerbianFyi.sr(row.sr)}</span>
        <span class="false-means">${row.means}</span>
      </div>
      <div class="false-trap">
        <span class="chart-label false-not">${t(row.partial ? 'false.trap.partial' : 'false.trap.label')}</span>
        <span>${row.trap}</span>
        <small>${row.trapMeans}</small>
      </div>
      <div class="chart-example">
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

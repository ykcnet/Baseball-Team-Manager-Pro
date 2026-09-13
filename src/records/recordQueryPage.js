import { loadData } from '../core/storage.js';

// ============================================================
// 比賽紀錄查詢
//
// 純查詢頁面：瀏覽歷史比賽結果（含每場的打擊/投手明細），
// 以及球員累積的打擊/投手數據。資料來源：
// - data.scoreSheets（每筆代表一場比賽的完整紀錄表）
// - data.players[].stats / pitchingStats（存比賽紀錄表時累加的數據）
// ============================================================

export function renderRecordQueryPage(container) {
  const data = loadData();
  const players = Array.isArray(data.players) ? data.players : [];
  const scoreSheets = Array.isArray(data.scoreSheets) ? data.scoreSheets : [];

  container.innerHTML = `
    <section class="record-query-page">
      <div class="record-query-header">
        <div>
          <h2>📖 比賽紀錄查詢</h2>
          <p>查詢歷史比賽結果，以及球員累積的打擊與投手數據</p>
        </div>
      </div>

      <div class="record-query-tabs">
        <button type="button" class="record-query-tab active" data-tab="games">⚾ 比賽紀錄</button>
        <button type="button" class="record-query-tab" data-tab="players">🧢 球員紀錄</button>
      </div>

      <div id="recordQueryGames" class="record-query-panel active"></div>
      <div id="recordQueryPlayers" class="record-query-panel"></div>
    </section>
  `;

  renderGamesPanel(container.querySelector('#recordQueryGames'), scoreSheets, players);
  renderPlayersPanel(container.querySelector('#recordQueryPlayers'), players, scoreSheets);

  container.querySelectorAll('.record-query-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.record-query-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.record-query-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const targetId = tab.dataset.tab === 'games' ? '#recordQueryGames' : '#recordQueryPlayers';
      container.querySelector(targetId).classList.add('active');
    });
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 每場比賽的局數紀錄是 2 個陣列（先攻/後攻），
// 每個陣列是 12 個數字：1~9 局 + R(索引9) + H(索引10) + E(索引11)。
// 這裡優先採用使用者填的 R 欄位，若是 0 或沒填，退回用 1~9 局加總估算。
function computeFinalScore(sheet) {
  const rows = Array.isArray(sheet.inningRecords) ? sheet.inningRecords : [];
  const awayRow = Array.isArray(rows[0]) ? rows[0] : [];
  const homeRow = Array.isArray(rows[1]) ? rows[1] : [];

  const sumFirstNine = row => row.slice(0, 9).reduce((total, value) => total + (Number(value) || 0), 0);

  const awayRuns = Number(awayRow[9]) || sumFirstNine(awayRow);
  const homeRuns = Number(homeRow[9]) || sumFirstNine(homeRow);

  return { away: awayRuns, home: homeRuns };
}

function renderGamesPanel(el, scoreSheets, players) {
  if (!el) return;

  if (scoreSheets.length === 0) {
    el.innerHTML = '<div class="record-query-empty">目前還沒有任何比賽紀錄，先到「比賽紀錄表」建立第一場吧。</div>';
    return;
  }

  const sorted = [...scoreSheets].sort((a, b) => {
    const dateA = a?.gameInfo?.gameDate || a?.createdAt || '';
    const dateB = b?.gameInfo?.gameDate || b?.createdAt || '';
    return dateB.localeCompare(dateA);
  });

  el.innerHTML = `
    <div class="record-query-game-list">
      ${sorted.map((sheet, index) => {
        const info = sheet.gameInfo || {};
        const hasStats = Array.isArray(sheet.battingRecords) && sheet.battingRecords.length > 0;
        const isHome = info.homeAway !== 'away';
        const { away, home } = computeFinalScore(sheet);
        const usScore = isHome ? home : away;
        const oppScore = isHome ? away : home;
        const hasScore = Array.isArray(sheet.inningRecords) && sheet.inningRecords.length > 0;
        const result = !hasScore ? '' : usScore > oppScore ? '勝' : usScore < oppScore ? '敗' : '平';
        const resultClass = result === '勝' ? 'win' : result === '敗' ? 'loss' : result === '平' ? 'tie' : '';

        return `
          <div class="record-query-game-item">
            <div class="record-query-game-summary">
              ${result ? `<span class="record-query-result ${resultClass}">${result}</span>` : '<span class="record-query-result"></span>'}
              <div class="record-query-game-info">
                <strong>vs. ${escapeHtml(info.opponent || '未指定對手')}</strong>
                <span>${escapeHtml(info.gameDate || '')}・${isHome ? '主場' : '客場'}</span>
              </div>
              <div class="record-query-game-score">${hasScore ? `${usScore} : ${oppScore}` : '—'}</div>
              ${!hasStats ? '<span class="score-sheet-draft-badge">尚未填寫詳細數據</span>' : ''}
              <button type="button" class="btn-secondary record-query-toggle-btn" data-index="${index}">詳細數據</button>
            </div>
            <div class="record-query-game-detail" id="recordQueryDetail${index}" hidden>
              ${renderGameDetail(sheet, players)}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  el.querySelectorAll('.record-query-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const detail = document.getElementById(`recordQueryDetail${btn.dataset.index}`);
      if (!detail) return;
      detail.hidden = !detail.hidden;
      btn.textContent = detail.hidden ? '詳細數據' : '收合';
    });
  });
}

function renderGameDetail(sheet, players) {
  const findPlayer = id => players.find(p => String(p.id) === String(id));

  const battingRecords = Array.isArray(sheet.battingRecords) ? sheet.battingRecords : [];
  const pitchingRecords = Array.isArray(sheet.pitchingRecords) ? sheet.pitchingRecords : [];

  const battingRows = battingRecords.map(record => {
    const player = findPlayer(record.playerId);
    const avg = record.atBats > 0 ? (record.hits / record.atBats).toFixed(3) : '.000';
    return `
      <tr>
        <td>${escapeHtml(player?.name || '未知球員')}</td>
        <td>#${escapeHtml(player?.number || '')}</td>
        <td>${record.atBats || 0}</td>
        <td>${record.hits || 0}</td>
        <td>${record.rbi || 0}</td>
        <td>${record.runs || 0}</td>
        <td>${record.walks || 0}</td>
        <td>${record.strikeouts || 0}</td>
        <td>${avg}</td>
      </tr>
    `;
  }).join('');

  const pitchingRows = pitchingRecords.map(record => {
    const player = findPlayer(record.playerId);
    const era = record.innings > 0 ? ((record.earnedRuns / record.innings) * 9).toFixed(2) : '0.00';
    return `
      <tr>
        <td>${escapeHtml(player?.name || '未知球員')}</td>
        <td>#${escapeHtml(player?.number || '')}</td>
        <td>${record.innings || 0}</td>
        <td>${record.hitsAllowed || 0}</td>
        <td>${record.runsAllowed || 0}</td>
        <td>${record.earnedRuns || 0}</td>
        <td>${record.walks || 0}</td>
        <td>${record.strikeouts || 0}</td>
        <td>${era}</td>
      </tr>
    `;
  }).join('');

  return `
    ${battingRows ? `
      <table class="record-query-table">
        <thead><tr><th>球員</th><th>背號</th><th>打數</th><th>安打</th><th>打點</th><th>得分</th><th>保送</th><th>三振</th><th>打擊率</th></tr></thead>
        <tbody>${battingRows}</tbody>
      </table>
    ` : '<p class="record-query-empty-inline">尚無打擊數據</p>'}
    ${pitchingRows ? `
      <table class="record-query-table">
        <thead><tr><th>投手</th><th>背號</th><th>局數</th><th>被安打</th><th>失分</th><th>自責分</th><th>保送</th><th>三振</th><th>防禦率</th></tr></thead>
        <tbody>${pitchingRows}</tbody>
      </table>
    ` : '<p class="record-query-empty-inline">尚無投手數據</p>'}
  `;
}

function renderPlayersPanel(el, players, scoreSheets) {
  if (!el) return;

  el.innerHTML = `
    <div class="record-query-search">
      <input type="text" id="playerRecordSearch" placeholder="搜尋姓名或背號">
    </div>
    <div id="playerRecordTables"></div>
  `;

  // 統計每位球員實際出賽場次（該場有留下打擊紀錄的比賽數）
  const gamesPlayedMap = new Map();
  scoreSheets.forEach(sheet => {
    (Array.isArray(sheet.battingRecords) ? sheet.battingRecords : []).forEach(record => {
      if (!record.playerId) return;
      gamesPlayedMap.set(record.playerId, (gamesPlayedMap.get(record.playerId) || 0) + 1);
    });
  });

  const tablesContainer = el.querySelector('#playerRecordTables');

  const renderTables = (keyword = '') => {
    const term = keyword.trim().toLowerCase();
    const filtered = players.filter(player => {
      if (!term) return true;
      return (
        String(player.name || '').toLowerCase().includes(term) ||
        String(player.number || '').includes(term)
      );
    });

    const battingPlayers = filtered.filter(player => player.stats && player.stats.atBats > 0);
    const pitchingPlayers = filtered.filter(player => player.pitchingStats && player.pitchingStats.innings > 0);

    const battingTable = battingPlayers.length === 0
      ? '<p class="record-query-empty-inline">尚無符合的打擊紀錄</p>'
      : `
        <table class="record-query-table">
          <thead>
            <tr><th>背號</th><th>姓名</th><th>出賽</th><th>打數</th><th>安打</th><th>打點</th><th>得分</th><th>保送</th><th>三振</th><th>盜壘</th><th>打擊率</th></tr>
          </thead>
          <tbody>
            ${battingPlayers.map(player => {
              const stats = player.stats || {};
              const avg = stats.battingAverage || (stats.atBats > 0 ? (stats.hits / stats.atBats).toFixed(3) : '.000');
              return `
                <tr>
                  <td>#${escapeHtml(player.number || '')}</td>
                  <td>${escapeHtml(player.name || '')}</td>
                  <td>${gamesPlayedMap.get(player.id) || 0}</td>
                  <td>${stats.atBats || 0}</td>
                  <td>${stats.hits || 0}</td>
                  <td>${stats.rbi || 0}</td>
                  <td>${stats.runs || 0}</td>
                  <td>${stats.walks || 0}</td>
                  <td>${stats.strikeouts || 0}</td>
                  <td>${stats.stolenBases || 0}</td>
                  <td>${avg}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

    const pitchingTable = pitchingPlayers.length === 0
      ? '<p class="record-query-empty-inline">尚無符合的投手紀錄</p>'
      : `
        <table class="record-query-table">
          <thead>
            <tr><th>背號</th><th>姓名</th><th>局數</th><th>被安打</th><th>失分</th><th>自責分</th><th>保送</th><th>三振</th><th>防禦率</th></tr>
          </thead>
          <tbody>
            ${pitchingPlayers.map(player => {
              const stats = player.pitchingStats || {};
              const era = stats.era || (stats.innings > 0 ? (stats.earnedRuns / stats.innings * 9).toFixed(2) : '0.00');
              return `
                <tr>
                  <td>#${escapeHtml(player.number || '')}</td>
                  <td>${escapeHtml(player.name || '')}</td>
                  <td>${stats.innings || 0}</td>
                  <td>${stats.hitsAllowed || 0}</td>
                  <td>${stats.runsAllowed || 0}</td>
                  <td>${stats.earnedRuns || 0}</td>
                  <td>${stats.walks || 0}</td>
                  <td>${stats.strikeouts || 0}</td>
                  <td>${era}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

    tablesContainer.innerHTML = `
      <h3>打擊紀錄</h3>
      ${battingTable}
      <h3>投手紀錄</h3>
      ${pitchingTable}
    `;
  };

  renderTables();

  el.querySelector('#playerRecordSearch').addEventListener('input', event => {
    renderTables(event.target.value);
  });
}

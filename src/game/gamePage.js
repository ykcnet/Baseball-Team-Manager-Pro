import { loadData } from '../core/storage.js';
import { getPlayers } from '../player/playerService.js';

// ============================================================
// 比賽紀錄查詢
//
// 這個頁面原本是「Game Day / 比賽中心」（建立比賽＋即時計分），
// 但那些功能跟「比賽紀錄表」重複，且已經合併到比賽紀錄表頁面，
// 所以這裡改成純查詢頁：
// - 比賽查詢：搜尋/瀏覽已經存檔的比賽紀錄表
// - 球員紀錄查詢：查詢單一球員的累計打擊／投手數據
// ============================================================

export function renderGamePage(container) {
  if (typeof container._gamePageCleanup === 'function') container._gamePageCleanup();

  container.innerHTML = `
    <section class="game-page">
      <div class="game-page-header">
        <div>
          <h2>🔍 比賽紀錄查詢</h2>
          <p>查詢球隊已存檔的比賽紀錄，或查詢單一球員的累計數據。</p>
        </div>
      </div>

      <div class="query-tabs">
        <button type="button" class="query-tab active" data-tab="games">📋 比賽查詢</button>
        <button type="button" class="query-tab" data-tab="players">🧢 球員紀錄查詢</button>
      </div>

      <div id="gameQueryPanel" class="query-panel"></div>
      <div id="playerQueryPanel" class="query-panel" style="display:none;"></div>
    </section>
  `;

  renderGameQueryPanel(container.querySelector('#gameQueryPanel'));
  renderPlayerQueryPanel(container.querySelector('#playerQueryPanel'));

  const tabs = container.querySelectorAll('.query-tab');
  const gamePanel = container.querySelector('#gameQueryPanel');
  const playerPanel = container.querySelector('#playerQueryPanel');

  const tabHandler = (e) => {
    const tab = e.target.closest('.query-tab');
    if (!tab) return;

    tabs.forEach(t => t.classList.toggle('active', t === tab));

    if (tab.dataset.tab === 'games') {
      gamePanel.style.display = '';
      playerPanel.style.display = 'none';
    } else {
      gamePanel.style.display = 'none';
      playerPanel.style.display = '';
    }
  };

  container.querySelector('.query-tabs').addEventListener('click', tabHandler);

  container._gamePageCleanup = () => {
    container.querySelector('.query-tabs')?.removeEventListener('click', tabHandler);
    container._gamePageCleanup = null;
  };
}

// ============================================================
// 比賽查詢
// ============================================================

function getScoreSheets() {
  const data = loadData();
  return Array.isArray(data.scoreSheets) ? data.scoreSheets : [];
}

// 從局數紀錄表算出雙方最終比分（R 欄位是教練直接輸入的總得分）。
// 找不到有效資料時回傳 null，畫面上顯示「—」。
function computeFinalScore(sheet) {
  const rows = sheet?.inningRecords;
  if (!Array.isArray(rows) || rows.length < 2) return null;

  const awayR = Number(rows[0]?.[9]);
  const homeR = Number(rows[1]?.[9]);

  if (Number.isNaN(awayR) || Number.isNaN(homeR)) return null;

  const homeAway = sheet.gameInfo?.homeAway === 'away' ? 'away' : 'home';
  const usScore = homeAway === 'home' ? homeR : awayR;
  const opponentScore = homeAway === 'home' ? awayR : homeR;

  return { usScore, opponentScore };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderGameQueryPanel(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="query-filters">
      <input type="text" id="gameSearchInput" placeholder="搜尋對手名稱...">
    </div>
    <div id="gameQueryResults"></div>
  `;

  const searchInput = container.querySelector('#gameSearchInput');
  const resultsEl = container.querySelector('#gameQueryResults');

  const renderResults = () => {
    const keyword = (searchInput.value || '').trim().toLowerCase();
    const sheets = getScoreSheets()
      .filter(sheet => {
        if (!keyword) return true;
        const opponent = (sheet.gameInfo?.opponent || '').toLowerCase();
        return opponent.includes(keyword);
      })
      .sort((a, b) => {
        const dateA = a?.gameInfo?.gameDate || a?.createdAt || '';
        const dateB = b?.gameInfo?.gameDate || b?.createdAt || '';
        return dateB.localeCompare(dateA);
      });

    if (sheets.length === 0) {
      resultsEl.innerHTML = `<div class="query-empty">找不到符合的比賽紀錄。</div>`;
      return;
    }

    resultsEl.innerHTML = `
      <div class="query-game-list">
        ${sheets.map(sheet => {
          const info = sheet.gameInfo || {};
          const venue = info.homeAway === 'away' ? '客場' : '主場';
          const score = computeFinalScore(sheet);
          const hasStats = Array.isArray(sheet.battingRecords) && sheet.battingRecords.length > 0;

          return `
            <div class="query-game-item">
              <div class="query-game-main">
                <strong>vs. ${escapeHtml(info.opponent || '未指定對手')}</strong>
                <span class="query-game-meta">${escapeHtml(info.gameDate || '')}・${venue}${info.gameName ? '・' + escapeHtml(info.gameName) : ''}</span>
              </div>
              <div class="query-game-score">
                ${score ? `<strong>${score.usScore} : ${score.opponentScore}</strong>` : '<span class="query-game-noscore">尚未登錄比分</span>'}
              </div>
              <div class="query-game-status">
                ${hasStats ? '<span class="query-badge complete">已有完整數據</span>' : '<span class="query-badge draft">尚未填寫數據</span>'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  searchInput.addEventListener('input', renderResults);
  renderResults();
}

// ============================================================
// 球員紀錄查詢
// ============================================================

function renderPlayerQueryPanel(container) {
  if (!container) return;

  const players = getPlayers();

  container.innerHTML = `
    <div class="query-filters">
      <select id="playerSelect">
        <option value="">請選擇球員</option>
        ${players.map(p => `<option value="${escapeHtml(p.id)}">#${escapeHtml(p.number || '')} ${escapeHtml(p.name || '')}</option>`).join('')}
      </select>
    </div>
    <div id="playerQueryResults"></div>
  `;

  const select = container.querySelector('#playerSelect');
  const resultsEl = container.querySelector('#playerQueryResults');

  select.addEventListener('change', () => {
    const playerId = select.value;
    if (!playerId) {
      resultsEl.innerHTML = '';
      return;
    }

    const player = getPlayers().find(p => String(p.id) === String(playerId));
    if (!player) {
      resultsEl.innerHTML = `<div class="query-empty">找不到這位球員的資料。</div>`;
      return;
    }

    const batting = player.stats || null;
    const pitching = player.pitchingStats || null;

    resultsEl.innerHTML = `
      <div class="query-player-stats">
        <h4>打擊數據</h4>
        ${
          batting
            ? `
              <table class="query-stats-table">
                <thead><tr><th>打數</th><th>得分</th><th>安打</th><th>打點</th><th>四死</th><th>三振</th><th>盜壘</th><th>打擊率</th></tr></thead>
                <tbody>
                  <tr>
                    <td>${batting.atBats || 0}</td>
                    <td>${batting.runs || 0}</td>
                    <td>${batting.hits || 0}</td>
                    <td>${batting.rbi || 0}</td>
                    <td>${batting.walks || 0}</td>
                    <td>${batting.strikeouts || 0}</td>
                    <td>${batting.stolenBases || 0}</td>
                    <td>${batting.battingAverage || '.000'}</td>
                  </tr>
                </tbody>
              </table>
            `
            : `<div class="query-empty">目前還沒有打擊紀錄。</div>`
        }

        <h4>投手數據</h4>
        ${
          pitching
            ? `
              <table class="query-stats-table">
                <thead><tr><th>局數</th><th>用球數</th><th>被安打</th><th>失分</th><th>自責分</th><th>四壞</th><th>三振</th><th>被全壘打</th><th>ERA</th></tr></thead>
                <tbody>
                  <tr>
                    <td>${pitching.innings || 0}</td>
                    <td>${pitching.pitches || 0}</td>
                    <td>${pitching.hitsAllowed || 0}</td>
                    <td>${pitching.runsAllowed || 0}</td>
                    <td>${pitching.earnedRuns || 0}</td>
                    <td>${pitching.walks || 0}</td>
                    <td>${pitching.strikeouts || 0}</td>
                    <td>${pitching.homeRuns || 0}</td>
                    <td>${pitching.era || '0.00'}</td>
                  </tr>
                </tbody>
              </table>
            `
            : `<div class="query-empty">目前還沒有投手紀錄。</div>`
        }
      </div>
    `;
  });
}

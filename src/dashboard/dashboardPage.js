import { renderPlayerPage } from '../player/playerPage.js';
import { renderLineupPage } from '../lineup/lineupPage.js';
import { renderScoreSheetPage } from '../scoreSheet/scoreSheetPage.js';
import { renderRecordQueryPage } from '../records/recordQueryPage.js';
import { renderBackupPanel } from '../backup/backupPanel.js';
import { getPlayers } from '../player/playerService.js';
import { generateSmartOrder } from '../lineup/smartOrderAI.js';

export function renderDashboard(container) {
  container.innerHTML = `
    <section class="dashboard dashboard-new">
      <header class="dashboard-hero">
        <div class="hero-content">
          <h1>⚾ Baseball Team Manager Pro</h1>
          <p class="lead">管理你的球隊：球員資料、先發名單與比賽日運作，一處完成。</p>
        </div>
        <div class="hero-actions">
          <button id="aiSuggestBtn" class="btn-primary">AI 建議先發</button>
        </div>
      </header>

      <section class="dashboard-cards">
        <div class="card" id="card-players">
          <h3>球員管理</h3>
          <p>新增、編輯與維護球員資料與守備評分。</p>
          <button id="playersBtn" class="card-btn">前往</button>
        </div>

        <div class="card" id="card-lineup">
          <h3>先發 Order</h3>
          <p>建立今日 9 人先發與儲存多套先發方案。</p>
          <button id="lineupBtn" class="card-btn">前往</button>
        </div>

        <div class="card" id="card-game">
          <h3>🔍 比賽紀錄查詢</h3>
          <p>查詢已存檔的比賽紀錄，或查詢單一球員的累計打擊／投手數據。</p>
          <button id="gameBtn" class="card-btn">前往</button>
        </div>

        <div class="card" id="card-scoreSheet">
          <h3>比賽紀錄</h3>
          <p>建立完整的比賽紀錄表，包含打擊、投手和局數統計。</p>
          <button id="scoreSheetBtn" class="card-btn">前往</button>
        </div>
      </section>

      <section id="dashboard-content" class="dashboard-content">
        <!-- AI 建議結果會顯示於此 -->
      </section>
    </section>
  `;

  const setActiveNav = (page) => {
    document.querySelectorAll('.nav-link').forEach(button => {
      button.classList.toggle('active', button.dataset.page === page);
    });
  };

  // Navigation handlers
  const playersBtn = container.querySelector('#playersBtn');
  if (playersBtn) playersBtn.onclick = () => { setActiveNav('players'); renderPlayerPage(container); };

  const lineupBtn = container.querySelector('#lineupBtn');
  if (lineupBtn) lineupBtn.onclick = () => { setActiveNav('lineup'); renderLineupPage(container); };

  const gameBtn = container.querySelector('#gameBtn');
  if (gameBtn) gameBtn.onclick = () => { setActiveNav('game'); renderRecordQueryPage(container); };

  const scoreSheetBtn = container.querySelector('#scoreSheetBtn');
  if (scoreSheetBtn) scoreSheetBtn.onclick = () => { 
    setActiveNav('scoreSheet'); 
    try {
      renderScoreSheetPage(container);
    } catch (error) {
      console.error('Error rendering score sheet page:', error);
      container.innerHTML = '<div class="error-message">比賽紀錄頁面載入失敗</div>';
    }
  };

  document.querySelectorAll('.nav-link:not([disabled])').forEach(button => {
    button.addEventListener('click', () => {
      const { page } = button.dataset;
      setActiveNav(page);
      if (page === 'dashboard') renderDashboard(container);
      if (page === 'players') renderPlayerPage(container);
      if (page === 'lineup') renderLineupPage(container);
      if (page === 'game') renderRecordQueryPage(container);
      if (page === 'scoreSheet') {
        try {
          renderScoreSheetPage(container);
        } catch (error) {
          console.error('Error rendering score sheet page:', error);
          container.innerHTML = '<div class="error-message">比賽紀錄頁面載入失敗</div>';
        }
      }
      if (page === 'backup') {
        container.innerHTML = '<div id="backup-panel" class="backup-page"></div>';
        renderBackupPanel(container.querySelector('#backup-panel'));
      }
      // Removed statistics page - no longer handled
    });
  });

  // AI 建議先發
  const aiBtn = container.querySelector('#aiSuggestBtn');
  const content = container.querySelector('#dashboard-content');
  if (aiBtn && content) {
    aiBtn.addEventListener('click', () => {
      const players = getPlayers();
      const suggestion = generateSmartOrder(players);

      if (!Array.isArray(suggestion) || suggestion.length === 0) {
        content.innerHTML = `<div class="ai-suggestion">無可用建議（請確認已有足夠可用球員）</div>`;
        return;
      }

      // Get player details for display
      const playerMap = new Map();
      players.forEach(p => {
        const id = p.id || p.playerId;
        if (id) playerMap.set(String(id), p);
      });

      const html = `
        <div class="ai-suggestion">
          <h3>AI 建議先發</h3>
          <ol>
            ${suggestion.map((item, index) => {
              const player = playerMap.get(String(item.playerId));
              const name = player?.name || player?.playerName || player?.number || '未知';
              const number = player?.number || player?.jerseyNumber || '';
              const position = item.position || '';
              return `
                <li>
                  <strong>#${number} ${name}</strong>
                  <div class="small">守備位置：${position}</div>
                </li>
              `;
            }).join('')}
          </ol>
          <div class="ai-actions">
            <button id="openLineupFromAI" class="card-btn">在先發頁查看</button>
          </div>
        </div>
      `;

      content.innerHTML = html;

      const openLineup = container.querySelector('#openLineupFromAI');
      if (openLineup) openLineup.onclick = () => {
        setActiveNav('lineup');
        renderLineupPage(container);
      };
    });
  }
}

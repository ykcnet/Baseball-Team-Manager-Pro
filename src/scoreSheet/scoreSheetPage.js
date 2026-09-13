import { loadData, saveData } from '../core/storage.js';
import { getPlayers } from '../player/playerService.js';
import { getCurrentLineup } from '../lineup/lineupManager.js';

export function renderScoreSheetPage(container) {
  const data = loadData();
  const players = Array.isArray(data.players) ? data.players : [];
  const scoreSheets = Array.isArray(data.scoreSheets) ? data.scoreSheets : [];

  container.innerHTML = `
    <section class="score-sheet-page">
      <div class="score-sheet-page-header">
        <div>
          <h2>📋 比賽紀錄</h2>
          <p>建立完整的比賽紀錄，包含打擊、投手和局數統計</p>
        </div>
      </div>

      <div class="score-sheet-actions">
        <button type="button" id="newScoreSheetBtn" class="btn-primary">📝 新增比賽紀錄</button>
        <button type="button" id="viewHistoryBtn" class="btn-secondary">📚 查看歷史紀錄</button>
      </div>

      <div id="scoreSheetContent">
        ${renderScoreSheetForm(players)}
      </div>
    </section>
  `;

  setupScoreSheetHandlers(container, players);

  const newScoreSheetBtn = container.querySelector('#newScoreSheetBtn');
  if (newScoreSheetBtn) {
    newScoreSheetBtn.addEventListener('click', () => {
      renderScoreSheetPage(container);
    });
  }

  const viewHistoryBtn = container.querySelector('#viewHistoryBtn');
  if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener('click', () => {
      renderScoreSheetHistory(container, players);
    });
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderScoreSheetHistory(container, players) {
  const data = loadData();
  const scoreSheets = Array.isArray(data.scoreSheets) ? data.scoreSheets : [];

  const content = container.querySelector('#scoreSheetContent');
  if (!content) return;

  if (scoreSheets.length === 0) {
    content.innerHTML = `
      <div class="score-sheet-history-empty">
        <p>目前還沒有任何比賽紀錄。</p>
      </div>
    `;
    return;
  }

  const sorted = [...scoreSheets].sort((a, b) => {
    const dateA = a?.gameInfo?.gameDate || a?.createdAt || '';
    const dateB = b?.gameInfo?.gameDate || b?.createdAt || '';
    return dateB.localeCompare(dateA);
  });

  content.innerHTML = `
    <div class="score-sheet-history-list">
      ${sorted.map(sheet => {
        const info = sheet.gameInfo || {};
        const venue = info.homeAway === 'away' ? '客場' : '主場';
        const hasStats = Array.isArray(sheet.battingRecords) && sheet.battingRecords.length > 0;
        return `
          <div class="score-sheet-history-item" data-sheet-id="${escapeHtml(sheet.id)}">
            <div class="score-sheet-history-info">
              <strong>vs. ${escapeHtml(info.opponent || '未指定對手')}</strong>
              <span>${escapeHtml(info.gameDate || '')}・${venue}</span>
              ${!hasStats ? '<span class="score-sheet-draft-badge">尚未填寫詳細數據</span>' : ''}
            </div>
            <div class="score-sheet-history-actions">
              <button type="button" class="btn-secondary score-sheet-edit-btn" data-sheet-id="${escapeHtml(sheet.id)}">${hasStats ? '編輯' : '繼續填寫'}</button>
              <button type="button" class="btn-danger score-sheet-delete-btn" data-sheet-id="${escapeHtml(sheet.id)}">刪除</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  content.querySelectorAll('.score-sheet-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sheetId = btn.dataset.sheetId;
      const sheet = scoreSheets.find(s => s.id === sheetId);
      content.innerHTML = renderScoreSheetForm(players, sheet || null);
      setupScoreSheetHandlers(container, players);
    });
  });

  content.querySelectorAll('.score-sheet-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sheetId = btn.dataset.sheetId;
      const sheet = scoreSheets.find(s => s.id === sheetId);
      if (!sheet) return;

      const opponentLabel = sheet.gameInfo?.opponent || '未指定對手';
      const confirmed = confirm(`確定要刪除這場比賽紀錄嗎？（vs. ${opponentLabel}）\n此操作無法復原，相關的球員累計數據也會一併扣除。`);
      if (!confirmed) return;

      const freshData = loadData();
      const target = (freshData.scoreSheets || []).find(s => s.id === sheetId);
      if (target) {
        // 刪除前先把這場比賽算進球員累計數據裡的部分扣掉，避免留下洗不掉的數字。
        unsyncFromPlayerStats(target, freshData);
      }
      freshData.scoreSheets = (freshData.scoreSheets || []).filter(s => s.id !== sheetId);
      saveData(freshData);

      renderScoreSheetHistory(container, players);
    });
  });
}

function renderScoreSheetForm(players, linkedSheet = null) {
  const info = linkedSheet?.gameInfo || {};
  const savedInnings = Array.isArray(linkedSheet?.inningRecords) ? linkedSheet.inningRecords : null;
  const awayInnings = savedInnings?.[0] || [];
  const homeInnings = savedInnings?.[1] || [];
  return `
    <div class="score-sheet-form" data-linked-sheet-id="${linkedSheet ? escapeHtml(linkedSheet.id) : ''}">
      <h3>基本比賽資訊</h3>
      <div class="form-grid">
        <div class="form-field">
          <label for="teamName">球隊名稱</label>
          <input type="text" id="teamName" placeholder="輸入球隊名稱" value="${escapeHtml(info.teamName || '')}">
        </div>
        <div class="form-field">
          <label for="opponent">對手球隊</label>
          <input type="text" id="opponent" placeholder="輸入對手名稱" value="${escapeHtml(info.opponent || '')}">
        </div>
        <div class="form-field">
          <label for="gameDate">比賽日期</label>
          <input type="date" id="gameDate" value="${escapeHtml(info.gameDate || '')}">
        </div>
        <div class="form-field">
          <label for="venue">比賽地點</label>
          <input type="text" id="venue" placeholder="輸入比賽地點" value="${escapeHtml(info.venue || '')}">
        </div>
        <div class="form-field">
          <label for="gameName">比賽名稱</label>
          <input type="text" id="gameName" placeholder="輸入比賽名稱" value="${escapeHtml(info.gameName || '')}">
        </div>
        <div class="form-field">
          <label for="homeAway">主客場</label>
          <select id="homeAway">
            <option value="home" ${info.homeAway !== 'away' ? 'selected' : ''}>主場</option>
            <option value="away" ${info.homeAway === 'away' ? 'selected' : ''}>客場</option>
          </select>
        </div>
      </div>

      <h3>局數紀錄表</h3>
      <div class="inning-section">
        <table class="inning-table">
          <thead>
            <tr>
              <th>球隊</th>
              ${Array.from({length: 9}, (_, i) => `<th>${i + 1}</th>`).join('')}
              <th>R</th>
              <th>H</th>
              <th>E</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>先攻 (客)</td>
              ${Array.from({length: 12}, (_, i) => `<td><input type="number" class="inning-input" min="0" value="${Number.isFinite(awayInnings[i]) ? awayInnings[i] : 0}"></td>`).join('')}
            </tr>
            <tr>
              <td>後攻 (主)</td>
              ${Array.from({length: 12}, (_, i) => `<td><input type="number" class="inning-input" min="0" value="${Number.isFinite(homeInnings[i]) ? homeInnings[i] : 0}"></td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>

      <h3>打擊與守備表現紀錄區</h3>
      <div class="coach-substitution-section">
        <h4>教練調度模式</h4>
        <div class="coach-substitution-form">
          <div class="form-field">
            <label for="outPlayerNumber">下場球員背號</label>
            <input type="number" id="outPlayerNumber" placeholder="輸入背號" min="1">
          </div>
          <div class="form-field">
            <label for="inPlayerNumber">上場球員背號</label>
            <input type="number" id="inPlayerNumber" placeholder="輸入背號" min="1">
          </div>
          <div class="form-field">
            <label for="substitutionType">替換類型</label>
            <select id="substitutionType">
              <option value="substitute-batting">代打</option>
              <option value="substitute-running">代跑</option>
              <option value="defensive-replacement">守備替換</option>
              <option value="injury">受傷退場</option>
            </select>
          </div>
          <button type="button" id="executeSubstitutionBtn" class="btn-primary">執行調度</button>
        </div>
        <div class="coach-substitution-form">
          <div class="form-field">
            <label for="positionChange">守備位置調動</label>
            <input type="text" id="positionChange" placeholder="例如: 1-2-6-1 (使用數字代碼)">
          </div>
          <button type="button" id="executePositionChangeBtn" class="btn-secondary">執行守備調動</button>
        </div>
        <div class="position-code-legend">
          <p>守備位置代碼：1-投手 2-捕手 3-一壘手 4-二壘手 5-三壘手 6-游擊手 7-左外野 8-中外野 9-右外野</p>
        </div>
      </div>
      <div class="batting-section">
        <div class="lineup-selector">
          <label for="useLineup">使用先發名單：</label>
          <select id="useLineup">
            <option value="current">使用當前先發名單</option>
            <option value="custom">自選球員</option>
          </select>
        </div>
        <table class="batting-table">
          <thead>
            <tr>
              <th>棒次</th>
              <th>身分</th>
              <th>背號</th>
              <th>姓名</th>
              <th>守位</th>
              ${Array.from({length: 9}, (_, i) => `<th>${i + 1}</th>`).join('')}
              <th>AB<br>打數</th>
              <th>R<br>得分</th>
              <th>H<br>安打</th>
              <th>RBI<br>打點</th>
              <th>BB/HP<br>四死</th>
              <th>SO<br>三振</th>
              <th>SB<br>盜壘</th>
              <th>E<br>失誤</th>
              <th>AVG<br>打擊率</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="battingRecordBody">
            ${renderBattingRecordRows(players, [], linkedSheet?.battingRecords || null)}
          </tbody>
          <tfoot>
            <tr class="team-total-row">
              <td colspan="5"><strong>團隊打擊與守備總計</strong></td>
              ${Array.from({length: 9}, () => `<td></td>`).join('')}
              <td id="teamTotalAtBats">0</td>
              <td id="teamTotalRuns">0</td>
              <td id="teamTotalHits">0</td>
              <td id="teamTotalRBI">0</td>
              <td id="teamTotalWalks">0</td>
              <td id="teamTotalStrikeouts">0</td>
              <td id="teamTotalStolenBases">0</td>
              <td id="teamTotalErrors">0</td>
              <td id="teamBattingAverage">.000</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <h3>投手表現紀錄專區</h3>
      <div class="pitching-section">
        <table class="pitching-table">
          <thead>
            <tr>
              <th>順序</th>
              <th>姓名</th>
              <th>背號</th>
              <th>IP<br>局數</th>
              <th>BF<br>人次</th>
              <th>NP<br>球數</th>
              <th>H<br>被安打</th>
              <th>R<br>失分</th>
              <th>ER<br>自責分</th>
              <th>BB<br>四死</th>
              <th>SO<br>三振</th>
              <th>HR<br>被轟</th>
              <th>ERA<br>防禦率</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="pitchingRecordBody">
            ${renderPitchingRecordRows(players, [], linkedSheet?.pitchingRecords || null)}
          </tbody>
          <tfoot>
            <tr class="team-total-row">
              <td colspan="3"><strong>團隊投手總計</strong></td>
              <td id="teamTotalInnings">0</td>
              <td id="teamTotalBattersFaced">0</td>
              <td id="teamTotalPitches">0</td>
              <td id="teamTotalHitsAllowed">0</td>
              <td id="teamTotalRunsAllowed">0</td>
              <td id="teamTotalEarnedRuns">0</td>
              <td id="teamTotalPitchingWalks">0</td>
              <td id="teamTotalPitchingStrikeouts">0</td>
              <td id="teamTotalHomeRuns">0</td>
              <td id="teamERA">0.00</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <button type="button" id="addPitchingRecordBtn" class="btn-small">+ 新增投手記錄</button>
      </div>

      <div class="form-actions">
        <button type="button" id="saveScoreSheetBtn" class="btn-primary">💾 儲存比賽紀錄</button>
        <button type="button" id="clearScoreSheetBtn" class="btn-secondary">🗑️ 清空表單</button>
      </div>
    </div>
  `;
}

function renderBattingRecordRows(players, starters, savedBattingRecords = null) {
  // 編輯模式：從已存檔的 battingRecords 重建每一列，並把數值全部帶回輸入框，
  // 用跟「自選球員」一樣的可編輯欄位（identity/player/position 都是下拉選單），
  // 這樣不管球員現在的先發名單長怎樣，都能正確還原、修改當初存的資料。
  if (Array.isArray(savedBattingRecords) && savedBattingRecords.length > 0) {
    return savedBattingRecords.map((record, index) => {
      const battingOrder = index + 1;
      const inningResults = Array.isArray(record.inningResults) ? record.inningResults : [];

      return `
        <tr data-batting-order="${battingOrder}">
          <td>${battingOrder}</td>
          <td>
            <select class="identity-select" data-field="identity">
              <option value="starter" ${record.identity === 'starter' || !record.identity ? 'selected' : ''}>先發</option>
              <option value="substitute-batting" ${record.identity === 'substitute-batting' ? 'selected' : ''}>代打</option>
              <option value="substitute-running" ${record.identity === 'substitute-running' ? 'selected' : ''}>代跑</option>
              <option value="defensive-replacement" ${record.identity === 'defensive-replacement' ? 'selected' : ''}>守備替換</option>
              <option value="injury" ${record.identity === 'injury' ? 'selected' : ''}>受傷退場</option>
            </select>
          </td>
          <td class="jersey-cell">
            <select class="player-select" data-field="playerId">
              <option value="">選擇球員</option>
              ${players.map(p => `<option value="${p.id}" ${String(p.id) === String(record.playerId) ? 'selected' : ''}>#${p.number} ${p.name}</option>`).join('')}
            </select>
          </td>
          <td class="player-name"></td>
          <td>
            <select class="position-select" data-field="position">
              <option value="">選擇守位</option>
              ${['投手','捕手','一壘手','二壘手','三壘手','游擊手','左外野','中外野','右外野','指定打擊'].map(pos =>
                `<option value="${pos}" ${record.position === pos ? 'selected' : ''}>${pos}</option>`
              ).join('')}
            </select>
          </td>
          ${Array.from({length: 9}, (_, i) => `
            <td><input type="text" class="inning-result-input" data-inning="${i + 1}" placeholder="輸入結果" value="${escapeHtml(inningResults[i] || '')}"></td>
          `).join('')}
          <td><input type="number" class="stat-input" data-field="atBats" min="0" value="${record.atBats || 0}"></td>
          <td><input type="number" class="stat-input" data-field="runs" min="0" value="${record.runs || 0}"></td>
          <td><input type="number" class="stat-input" data-field="hits" min="0" value="${record.hits || 0}"></td>
          <td><input type="number" class="stat-input" data-field="rbi" min="0" value="${record.rbi || 0}"></td>
          <td><input type="number" class="stat-input" data-field="walks" min="0" value="${record.walks || 0}"></td>
          <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="${record.strikeouts || 0}"></td>
          <td><input type="number" class="stat-input" data-field="stolenBases" min="0" value="${record.stolenBases || 0}"></td>
          <td><input type="number" class="stat-input" data-field="errors" min="0" value="${record.errors || 0}"></td>
          <td class="batting-average">.000</td>
        </tr>
      `;
    }).join('');
  }

  if (starters.length === 0) {
    // Create empty rows for 9 batting orders
    let rows = '';
    for (let i = 1; i <= 9; i++) {
      rows += `
        <tr data-batting-order="${i}">
          <td>${i}</td>
          <td>
            <select class="identity-select" data-field="identity">
              <option value="starter">先發</option>
              <option value="substitute-batting">代打</option>
              <option value="substitute-running">代跑</option>
              <option value="defensive-replacement">守備替換</option>
              <option value="injury">受傷退場</option>
            </select>
          </td>
          <td class="jersey-cell">
            <select class="player-select" data-field="playerId">
              <option value="">選擇球員</option>
              ${players.map(p => `<option value="${p.id}">#${p.number} ${p.name}</option>`).join('')}
            </select>
          </td>
          <td class="player-name"></td>
          <td>
            <select class="position-select" data-field="position">
              <option value="">選擇守位</option>
              <option value="投手">投手</option>
              <option value="捕手">捕手</option>
              <option value="一壘手">一壘手</option>
              <option value="二壘手">二壘手</option>
              <option value="三壘手">三壘手</option>
              <option value="游擊手">游擊手</option>
              <option value="左外野">左外野</option>
              <option value="中外野">中外野</option>
              <option value="右外野">右外野</option>
              <option value="指定打擊">指定打擊</option>
            </select>
          </td>
          ${Array.from({length: 9}, (_, i) => `
            <td><input type="text" class="inning-result-input" data-inning="${i + 1}" placeholder="輸入結果"></td>
          `).join('')}
          <td><input type="number" class="stat-input" data-field="atBats" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="runs" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="rbi" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="walks" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="stolenBases" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="errors" min="0" value="0"></td>
          <td class="batting-average">.000</td>
        </tr>
      `;
    }
    return rows;
  }

  // Use current lineup
  return starters.map((starter, index) => {
    const battingOrder = index + 1;
    const player = players.find(p => String(p.id) === String(starter.playerId));
    const playerName = player?.name || player?.playerName || '';
    const playerNumber = player?.number || player?.jerseyNumber || '';
    const position = typeof starter === 'object' ? starter.position : '';
    
    // Convert position code to Chinese if needed
    const positionDisplay = position === 'P' ? '投手' : 
                            position === 'C' ? '捕手' : 
                            position === '1B' ? '一壘手' : 
                            position === '2B' ? '二壘手' : 
                            position === '3B' ? '三壘手' : 
                            position === 'SS' ? '游擊手' : 
                            position === 'LF' ? '左外野' : 
                            position === 'CF' ? '中外野' : 
                            position === 'RF' ? '右外野' : 
                            position === 'DH' ? '指定打擊' : position;
    
    return `
      <tr data-batting-order="${battingOrder}">
        <td>${battingOrder}</td>
        <td>先發</td>
        <td>${playerNumber}</td>
        <td class="player-name">${playerName}</td>
        <td class="position-cell">${positionDisplay}</td>
        ${Array.from({length: 9}, (_, i) => `
          <td><input type="text" class="inning-result-input" data-inning="${i + 1}" placeholder="輸入結果"></td>
        `).join('')}
        <td><input type="number" class="stat-input" data-field="atBats" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="runs" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="rbi" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="stolenBases" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="errors" min="0" value="0"></td>
        <td class="batting-average">.000</td>
        <td>
          <button type="button" class="btn-small add-substitute-btn" data-batting-order="${battingOrder}">+ 替換</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPitchingRecordRows(players, starters, savedPitchingRecords = null) {
  // 編輯模式：依已存檔的 pitchingRecords 重建每一列並帶回數值。
  if (Array.isArray(savedPitchingRecords) && savedPitchingRecords.length > 0) {
    const pitchers = players.filter(p => p.position === '投手' || p.position === 'P' || p.positions?.some(pos => pos.code === 'P' || pos.code === '投手'));

    return savedPitchingRecords.map((record, index) => {
      const typeLabel = record.pitcherType === 'starter' ? '先發' : `第 ${index + 1} 任`;
      return `
        <tr data-pitcher-type="${record.pitcherType || (index === 0 ? 'starter' : 'relief')}" data-pitcher-id="${escapeHtml(record.playerId || '')}">
          <td>${typeLabel}</td>
          <td>
            <select class="pitcher-select" data-field="playerId">
              <option value="">選擇投手</option>
              ${pitchers.map(p => `<option value="${p.id}" ${String(p.id) === String(record.playerId) ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </td>
          <td class="pitcher-number"></td>
          <td><input type="number" class="pitching-input" data-field="innings" min="0" step="0.1" value="${record.innings || 0}"></td>
          <td><input type="number" class="pitching-input" data-field="battersFaced" min="0" value="${record.battersFaced || 0}"></td>
          <td><input type="number" class="pitching-input" data-field="pitches" min="0" value="${record.pitches || 0}"></td>
          <td><input type="number" class="pitching-input" data-field="hitsAllowed" min="0" value="${record.hitsAllowed || 0}"></td>
          <td><input type="number" class="pitching-input" data-field="runsAllowed" min="0" value="${record.runsAllowed || 0}"></td>
          <td><input type="number" class="pitching-input" data-field="earnedRuns" min="0" value="${record.earnedRuns || 0}"></td>
          <td><input type="number" class="pitching-input" data-field="walks" min="0" value="${record.walks || 0}"></td>
          <td><input type="number" class="pitching-input" data-field="strikeouts" min="0" value="${record.strikeouts || 0}"></td>
          <td><input type="number" class="pitching-input" data-field="homeRuns" min="0" value="${record.homeRuns || 0}"></td>
          <td class="era">0.00</td>
        </tr>
      `;
    }).join('');
  }

  const pitchers = players.filter(p => p.position === '投手' || p.position === 'P' || p.positions?.some(pos => pos.code === 'P' || pos.code === '投手'));
  
  // Find starting pitcher from lineup
  let startingPitcher = null;
  if (starters && starters.length === 9) {
    const pitcherStarter = starters.find(starter => {
      const position = typeof starter === 'object' ? starter.position : '';
      return position === 'P' || position === '投手';
    });
    
    if (pitcherStarter) {
      const pitcherId = typeof pitcherStarter === 'string' ? pitcherStarter : pitcherStarter.playerId;
      startingPitcher = pitchers.find(p => String(p.id) === String(pitcherId));
    }
  }
  
  let rows = '';
  
  // Starting pitcher
  if (startingPitcher) {
    rows += `
      <tr data-pitcher-type="starter" data-pitcher-id="${startingPitcher.id}">
        <td>先發</td>
        <td>${startingPitcher.name}</td>
        <td>${startingPitcher.number}</td>
        <td><input type="number" class="pitching-input" data-field="innings" min="0" step="0.1" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="battersFaced" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="pitches" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="hitsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="runsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="earnedRuns" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="homeRuns" min="0" value="0"></td>
        <td class="era">0.00</td>
      </tr>
    `;
  } else {
    rows += `
      <tr data-pitcher-type="starter" data-pitcher-id="">
        <td>先發</td>
        <td>
          <select class="pitcher-select" data-field="playerId">
            <option value="">選擇投手</option>
            ${pitchers.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </td>
        <td class="pitcher-number"></td>
        <td><input type="number" class="pitching-input" data-field="innings" min="0" step="0.1" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="battersFaced" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="pitches" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="hitsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="runsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="earnedRuns" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="homeRuns" min="0" value="0"></td>
        <td class="era">0.00</td>
      </tr>
    `;
  }
  
  // Relief pitchers
  for (let i = 2; i <= 4; i++) {
    rows += `
      <tr data-pitcher-type="relief" data-pitcher-id="">
        <td>第 ${i} 任</td>
        <td>
          <select class="pitcher-select" data-field="playerId">
            <option value="">選擇投手</option>
            ${pitchers.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </td>
        <td class="pitcher-number"></td>
        <td><input type="number" class="pitching-input" data-field="innings" min="0" step="0.1" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="battersFaced" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="pitches" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="hitsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="runsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="earnedRuns" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="homeRuns" min="0" value="0"></td>
        <td class="era">0.00</td>
      </tr>
    `;
  }
  
  return rows;
}

const POSITION_CODE_TO_LABEL = Object.freeze({
  '1': '投手',
  '2': '捕手',
  '3': '一壘手',
  '4': '二壘手',
  '5': '三壘手',
  '6': '游擊手',
  '7': '左外野',
  '8': '中外野',
  '9': '右外野',
  DH: '指定打擊'
});

const POSITION_ALIASES = Object.freeze({
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  p: '1',
  pitcher: '1',
  '投手': '1',
  c: '2',
  catcher: '2',
  '捕手': '2',
  '1b': '3',
  '一壘': '3',
  '一壘手': '3',
  '2b': '4',
  '二壘': '4',
  '二壘手': '4',
  '3b': '5',
  '三壘': '5',
  '三壘手': '5',
  ss: '6',
  '游擊': '6',
  '游擊手': '6',
  lf: '7',
  '左外': '7',
  '左外野': '7',
  cf: '8',
  '中外': '8',
  '中外野': '8',
  rf: '9',
  '右外': '9',
  '右外野': '9',
  dh: 'DH',
  '指定打擊': 'DH'
});

function normalizePositionCode(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const normalized = value.trim().toLowerCase();
  return POSITION_ALIASES[normalized] || '';
}

function getPositionLabel(code) {
  return POSITION_CODE_TO_LABEL[code] || '';
}

function parsePositionChangeInput(rawValue) {
  if (typeof rawValue !== 'string') {
    return [];
  }

  return rawValue
    .split(/[\s,，、\-]+/)
    .map(code => code.trim())
    .filter(Boolean)
    .map(code => normalizePositionCode(code))
    .filter(Boolean);
}

function findStaticPositionCell(row) {
  // 優先使用明確標記的守位儲存格，避免誤判「棒次」欄位
  // （棒次 1~9 與守備位置代碼 1~9 重疊，用內容猜測會抓錯欄位）。
  const markedCell = row.querySelector('.position-cell');
  if (markedCell) {
    return markedCell;
  }

  // 相容舊資料：若找不到標記儲存格，退回內容比對，
  // 但跳過第一格（棒次）與第二格（身分），避免誤判。
  const cells = Array.from(row.querySelectorAll('td'));
  return cells.slice(2).find(cell => normalizePositionCode(cell.textContent));
}

function getRowPositionState(row) {
  const positionSelect = row.querySelector('.position-select');
  const playerSelect = row.querySelector('.player-select');
  const staticPositionCell = findStaticPositionCell(row);
  const positionCode = normalizePositionCode(positionSelect?.value || staticPositionCell?.textContent || '');

  return {
    row,
    positionCode,
    positionSelect,
    positionCell: staticPositionCell,
    playerSelect
  };
}

function applyPositionToRow(rowState, positionCode) {
  const nextLabel = getPositionLabel(positionCode);
  if (!nextLabel) {
    return;
  }

  if (rowState.positionSelect) {
    rowState.positionSelect.value = nextLabel;
  } else if (rowState.positionCell) {
    rowState.positionCell.textContent = nextLabel;
  }

  rowState.positionCode = positionCode;
}

function getRowSavedPosition(row) {
  const rowPosition = getRowPositionState(row);
  return getPositionLabel(rowPosition.positionCode);
}

function setupScoreSheetHandlers(container, players) {
  // Set default date to today
  const dateInput = container.querySelector('#gameDate');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Auto-load current lineup on page load
  const useLineupSelect = container.querySelector('#useLineup');
  if (useLineupSelect && useLineupSelect.value === 'current') {
    const currentLineup = getCurrentLineup();
    const starters = currentLineup && Array.isArray(currentLineup.starters) ? currentLineup.starters : [];
    
    const battingBody = container.querySelector('#battingRecordBody');
    if (battingBody) {
      battingBody.innerHTML = renderBattingRecordRows(players, starters);
    }
    
    const pitchingBody = container.querySelector('#pitchingRecordBody');
    if (pitchingBody) {
      pitchingBody.innerHTML = renderPitchingRecordRows(players, starters);
    }
    
    // Initialize pitcher selection filtering
    setTimeout(() => {
      updatePitcherSelects(container, players, null);
    }, 100);
  }

  // Initial update of team totals
  updateTeamBattingTotals(container);
  updateTeamPitchingTotals(container);

  // Lineup selection
  if (useLineupSelect) {
    useLineupSelect.addEventListener('change', (e) => {
      if (e.target.value === 'current') {
        const currentLineup = getCurrentLineup();
        const starters = currentLineup && Array.isArray(currentLineup.starters) ? currentLineup.starters : [];
        
        const battingBody = container.querySelector('#battingRecordBody');
        if (battingBody) {
          battingBody.innerHTML = renderBattingRecordRows(players, starters);
        }
        
        const pitchingBody = container.querySelector('#pitchingRecordBody');
        if (pitchingBody) {
          pitchingBody.innerHTML = renderPitchingRecordRows(players, starters);
        }
        
        // Update totals after lineup change
        updateTeamBattingTotals(container);
        updateTeamPitchingTotals(container);
        
        // Initialize pitcher selection filtering
        setTimeout(() => {
          updatePitcherSelects(container, players, null);
        }, 100);
      } else {
        // Reset to empty form
        const battingBody = container.querySelector('#battingRecordBody');
        if (battingBody) {
          battingBody.innerHTML = renderBattingRecordRows(players, []);
        }
        
        const pitchingBody = container.querySelector('#pitchingRecordBody');
        if (pitchingBody) {
          pitchingBody.innerHTML = renderPitchingRecordRows(players, []);
        }
        
        // Update totals after reset
        updateTeamBattingTotals(container);
        updateTeamPitchingTotals(container);
        
        // Reset pitcher selection filtering
        setTimeout(() => {
          updatePitcherSelects(container, players, null);
        }, 100);
      }
    });
  }

  // Real-time batting average calculation
  container.addEventListener('input', (e) => {
    if (e.target.classList.contains('stat-input') && e.target.dataset.field === 'atBats' || 
        e.target.classList.contains('stat-input') && e.target.dataset.field === 'hits') {
      const row = e.target.closest('tr');
      if (row) {
        const atBats = parseInt(row.querySelector('[data-field="atBats"]')?.value) || 0;
        const hits = parseInt(row.querySelector('[data-field="hits"]')?.value) || 0;
        const avgCell = row.querySelector('.batting-average');
        if (avgCell) {
          avgCell.textContent = atBats > 0 ? (hits / atBats).toFixed(3) : '.000';
        }
        updateTeamBattingTotals(container);
      }
    }
    
    // Update team totals for other batting stats
    if (e.target.classList.contains('stat-input')) {
      updateTeamBattingTotals(container);
    }
  });

  // Real-time ERA calculation
  container.addEventListener('input', (e) => {
    if (e.target.classList.contains('pitching-input') && e.target.dataset.field === 'innings' || 
        e.target.classList.contains('pitching-input') && e.target.dataset.field === 'earnedRuns') {
      const row = e.target.closest('tr');
      if (row) {
        const innings = parseFloat(row.querySelector('[data-field="innings"]')?.value) || 0;
        const earnedRuns = parseInt(row.querySelector('[data-field="earnedRuns"]')?.value) || 0;
        const eraCell = row.querySelector('.era');
        if (eraCell) {
          eraCell.textContent = innings > 0 ? (earnedRuns / innings * 9).toFixed(2) : '0.00';
        }
        updateTeamPitchingTotals(container);
      }
    }
    
    // Update team totals for other pitching stats
    if (e.target.classList.contains('pitching-input')) {
      updateTeamPitchingTotals(container);
    }
  });

  // Player name update when selecting player
  container.addEventListener('change', (e) => {
    if (e.target.classList.contains('player-select')) {
      const row = e.target.closest('tr');
      if (row) {
        const player = players.find(p => String(p.id) === e.target.value);
        const nameCell = row.querySelector('.player-name');
        if (nameCell) {
          nameCell.textContent = player?.name || '';
        }
        // Update jersey cell to show just the number after selection
        const jerseyCell = row.querySelector('.jersey-cell');
        if (jerseyCell && player) {
          // Replace the select with just the number display
          jerseyCell.innerHTML = `
            <span class="jersey-number">${player.number || player.jerseyNumber || ''}</span>
            <button type="button" class="edit-jersey-btn" title="修改球員">✏️</button>
            <select class="player-select" data-field="playerId" style="display: none;">
              <option value="">選擇球員</option>
              ${players.map(p => `<option value="${p.id}" ${String(p.id) === String(player.id) ? 'selected' : ''}>#${p.number} ${p.name}</option>`).join('')}
            </select>
          `;
          
          // Add edit button functionality
          const editBtn = jerseyCell.querySelector('.edit-jersey-btn');
          const select = jerseyCell.querySelector('.player-select');
          const display = jerseyCell.querySelector('.jersey-number');
          
          if (editBtn && select && display) {
            editBtn.addEventListener('click', () => {
              display.style.display = 'none';
              editBtn.style.display = 'none';
              select.style.display = 'inline';
              select.focus();
            });
            
            select.addEventListener('change', (e) => {
              const newPlayer = players.find(p => String(p.id) === e.target.value);
              if (newPlayer) {
                display.textContent = newPlayer.number || newPlayer.jerseyNumber || '';
                nameCell.textContent = newPlayer.name || '';
                display.style.display = 'inline';
                editBtn.style.display = 'inline';
                select.style.display = 'none';
                
                // Update select options
                select.innerHTML = `
                  <option value="">選擇球員</option>
                  ${players.map(p => `<option value="${p.id}" ${String(p.id) === String(newPlayer.id) ? 'selected' : ''}>#${p.number} ${p.name}</option>`).join('')}
                `;
              }
            });
          }
        }
      }
    }
    
    // Pitching selection - exclude already selected pitchers
    if (e.target.classList.contains('pitcher-select')) {
      const row = e.target.closest('tr');
      if (row) {
        const player = players.find(p => String(p.id) === e.target.value);
        const numberCell = row.querySelector('.pitcher-number');
        if (numberCell) {
          numberCell.textContent = player?.number || '';
        }
        
        // Update other pitcher selects to exclude this pitcher
        updatePitcherSelects(container, players, e.target.value);
      }
    }
  });

  // Save score sheet
  const saveBtn = container.querySelector('#saveScoreSheetBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveScoreSheet(container);
    });
  }

  // Clear form
  const clearBtn = container.querySelector('#clearScoreSheetBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('確定要清空表單嗎？')) {
        container.querySelector('#scoreSheetContent').innerHTML = renderScoreSheetForm(players);
        setupScoreSheetHandlers(container, players);
      }
    });
  }

  // Add substitute player buttons for each batting order
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-substitute-btn')) {
      const battingOrder = e.target.dataset.battingOrder;
      const battingBody = container.querySelector('#battingRecordBody');
      if (battingBody && battingOrder) {
        const newRow = document.createElement('tr');
        newRow.className = 'substitute-player-row';
        newRow.dataset.battingOrder = battingOrder;
        newRow.innerHTML = `
          <td>${battingOrder}</td>
          <td>
            <select class="identity-select" data-field="identity">
              <option value="substitute-batting">代打</option>
              <option value="substitute-running">代跑</option>
              <option value="defensive-replacement">守備替換</option>
              <option value="injury">受傷退場</option>
            </select>
          </td>
          <td class="jersey-cell">
            <select class="player-select" data-field="playerId">
              <option value="">選擇球員</option>
              ${players.map(p => `<option value="${p.id}">#${p.number} ${p.name}</option>`).join('')}
            </select>
          </td>
          <td class="player-name"></td>
          <td>
            <select class="position-select" data-field="position">
              <option value="">選擇守位</option>
              <option value="投手">投手</option>
              <option value="捕手">捕手</option>
              <option value="一壘手">一壘手</option>
              <option value="二壘手">二壘手</option>
              <option value="三壘手">三壘手</option>
              <option value="游擊手">游擊手</option>
              <option value="左外野">左外野</option>
              <option value="中外野">中外野</option>
              <option value="右外野">右外野</option>
              <option value="指定打擊">指定打擊</option>
            </select>
          </td>
          ${Array.from({length: 9}, (_, i) => `
            <td><input type="text" class="inning-result-input" data-inning="${i + 1}" placeholder="輸入結果"></td>
          `).join('')}
          <td><input type="number" class="stat-input" data-field="atBats" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="runs" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="rbi" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="walks" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="stolenBases" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="errors" min="0" value="0"></td>
          <td class="batting-average">.000</td>
          <td>
            <button type="button" class="btn-small remove-row-btn" data-action="remove">刪除</button>
          </td>
        `;
        
        // Find all rows with the same batting order
        const allBattingOrderRows = battingBody.querySelectorAll(`tr[data-batting-order="${battingOrder}"]`);
        
        // Insert after the last row with the same batting order
        if (allBattingOrderRows.length > 0) {
          const lastRow = allBattingOrderRows[allBattingOrderRows.length - 1];
          lastRow.parentNode.insertBefore(newRow, lastRow.nextSibling);
        } else {
          // Fallback: find the original batting order row
          const originalRow = battingBody.querySelector(`tr[data-batting-order="${battingOrder}"]`);
          if (originalRow) {
            originalRow.parentNode.insertBefore(newRow, originalRow.nextSibling);
          } else {
            battingBody.appendChild(newRow);
          }
        }
        
        // Add event handlers for the new row
        const select = newRow.querySelector('.player-select');
        const nameCell = newRow.querySelector('.player-name');
        const jerseyCell = newRow.querySelector('.jersey-cell');
        
        if (select && nameCell && jerseyCell) {
          select.addEventListener('change', (e) => {
            const player = players.find(p => String(p.id) === e.target.value);
            if (player) {
              nameCell.textContent = player?.name || '';
              jerseyCell.innerHTML = `
                <span class="jersey-number">${player.number || player.jerseyNumber || ''}</span>
                <button type="button" class="edit-jersey-btn" title="修改球員">✏️</button>
                <select class="player-select" data-field="playerId" style="display: none;">
                  <option value="">選擇球員</option>
                  ${players.map(p => `<option value="${p.id}" ${String(p.id) === String(player.id) ? 'selected' : ''}>#${p.number} ${p.name}</option>`).join('')}
                </select>
              `;
              
              const editBtn = jerseyCell.querySelector('.edit-jersey-btn');
              const newSelect = jerseyCell.querySelector('.player-select');
              const display = jerseyCell.querySelector('.jersey-number');
              
              if (editBtn && newSelect && display) {
                editBtn.addEventListener('click', () => {
                  display.style.display = 'none';
                  editBtn.style.display = 'none';
                  newSelect.style.display = 'inline';
                  newSelect.focus();
                });
                
                newSelect.addEventListener('change', (e) => {
                  const newPlayer = players.find(p => String(p.id) === e.target.value);
                  if (newPlayer) {
                    display.textContent = newPlayer.number || newPlayer.jerseyNumber || '';
                    nameCell.textContent = newPlayer.name || '';
                    display.style.display = 'inline';
                    editBtn.style.display = 'inline';
                    newSelect.style.display = 'none';
                    
                    newSelect.innerHTML = `
                      <option value="">選擇球員</option>
                      ${players.map(p => `<option value="${p.id}" ${String(p.id) === String(newPlayer.id) ? 'selected' : ''}>#${p.number} ${p.name}</option>`).join('')}
                    `;
                  }
                });
              }
            }
          });
        }
        
        // Add remove button handler
        const removeBtn = newRow.querySelector('.remove-row-btn');
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            if (confirm('確定要刪除這個替換記錄嗎？')) {
              newRow.remove();
              updateTeamBattingTotals(container);
            }
          });
        }
      }
    }
  });

  // Add pitching record button
  const addPitchingRecordBtn = container.querySelector('#addPitchingRecordBtn');
  if (addPitchingRecordBtn) {
    addPitchingRecordBtn.addEventListener('click', () => {
      const pitchingBody = container.querySelector('#pitchingRecordBody');
      if (pitchingBody) {
        const currentPitcherCount = pitchingBody.querySelectorAll('tr').length;
        const newPitcherOrder = currentPitcherCount + 1;
        const pitchers = players.filter(p => p.position === '投手' || p.position === 'P' || p.positions?.some(pos => pos.code === 'P' || pos.code === '投手'));
        
        const newRow = document.createElement('tr');
        newRow.className = 'relief-pitcher-row';
        newRow.dataset.pitcherType = 'relief';
        newRow.dataset.pitcherId = '';
        newRow.innerHTML = `
          <td>第 ${newPitcherOrder} 任</td>
          <td>
            <select class="pitcher-select" data-field="playerId">
              <option value="">選擇投手</option>
              ${pitchers.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </td>
          <td class="pitcher-number"></td>
          <td><input type="number" class="pitching-input" data-field="innings" min="0" step="0.1" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="battersFaced" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="pitches" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="hitsAllowed" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="runsAllowed" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="earnedRuns" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="walks" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="strikeouts" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="homeRuns" min="0" value="0"></td>
          <td class="era">0.00</td>
          <td>
            <button type="button" class="btn-small remove-pitcher-btn" data-action="remove">刪除</button>
          </td>
        `;
        
        // Insert after the last pitcher row
        const lastPitcherRow = pitchingBody.querySelector('tr:last-child');
        if (lastPitcherRow) {
          lastPitcherRow.parentNode.insertBefore(newRow, lastPitcherRow.nextSibling);
        } else {
          pitchingBody.appendChild(newRow);
        }
        
        // Update pitcher selects to exclude already selected pitchers
        updatePitcherSelects(container, players, null);
        
        // Add remove button handler
        const removeBtn = newRow.querySelector('.remove-pitcher-btn');
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            if (confirm('確定要刪除這個投手記錄嗎？')) {
              newRow.remove();
              updateTeamPitchingTotals(container);
              updatePitcherSelects(container, players, null);
            }
          });
        }
      }
    });
  }

  // Coach substitution mode
  const executeSubstitutionBtn = container.querySelector('#executeSubstitutionBtn');
  if (executeSubstitutionBtn) {
    executeSubstitutionBtn.addEventListener('click', () => {
      const outPlayerNumber = container.querySelector('#outPlayerNumber').value;
      const inPlayerNumber = container.querySelector('#inPlayerNumber').value;
      const substitutionType = container.querySelector('#substitutionType').value;
      
      if (!outPlayerNumber || !inPlayerNumber) {
        alert('請輸入下場和上場球員的背號');
        return;
      }
      
      const battingBody = container.querySelector('#battingRecordBody');
      if (!battingBody) return;
      
      // Find the batting order row with the outgoing player
      const battingRows = battingBody.querySelectorAll('tr');
      let targetRow = null;
      let battingOrder = null;
      
      for (const row of battingRows) {
        // Check all cells in the row for jersey number
        const cells = row.querySelectorAll('td');
        for (const cell of cells) {
          const cellText = cell.textContent.trim();
          const cleanNumber = cellText.replace(/[^\d]/g, '');
          
          if (cleanNumber === outPlayerNumber) {
            targetRow = row;
            battingOrder = row.dataset.battingOrder;
            break;
          }
        }
        
        if (targetRow) break;
      }
      
      if (!targetRow || !battingOrder) {
        alert(`找不到背號 ${outPlayerNumber} 的球員`);
        return;
      }
      
      // Find the incoming player
      const inPlayer = players.find(p => String(p.number) === inPlayerNumber || String(p.jerseyNumber) === inPlayerNumber);
      if (!inPlayer) {
        alert(`找不到背號 ${inPlayerNumber} 的球員`);
        return;
      }
      
      // Create substitute row
      const newRow = document.createElement('tr');
      newRow.className = 'substitute-player-row';
      newRow.dataset.battingOrder = battingOrder;
      newRow.innerHTML = `
        <td>${battingOrder}</td>
        <td>
          <select class="identity-select" data-field="identity">
            <option value="substitute-batting" ${substitutionType === 'substitute-batting' ? 'selected' : ''}>代打</option>
            <option value="substitute-running" ${substitutionType === 'substitute-running' ? 'selected' : ''}>代跑</option>
            <option value="defensive-replacement" ${substitutionType === 'defensive-replacement' ? 'selected' : ''}>守備替換</option>
            <option value="injury" ${substitutionType === 'injury' ? 'selected' : ''}>受傷退場</option>
          </select>
        </td>
        <td class="jersey-cell">
          <span class="jersey-number">${inPlayer.number || inPlayer.jerseyNumber || ''}</span>
          <button type="button" class="edit-jersey-btn" title="修改球員">✏️</button>
          <select class="player-select" data-field="playerId" style="display: none;">
            <option value="">選擇球員</option>
            ${players.map(p => `<option value="${p.id}" ${String(p.id) === String(inPlayer.id) ? 'selected' : ''}>#${p.number} ${p.name}</option>`).join('')}
          </select>
        </td>
        <td class="player-name">${inPlayer.name || ''}</td>
        <td>
          <select class="position-select" data-field="position">
            <option value="">選擇守位</option>
            <option value="投手">投手</option>
            <option value="捕手">捕手</option>
            <option value="一壘手">一壘手</option>
            <option value="二壘手">二壘手</option>
            <option value="三壘手">三壘手</option>
            <option value="游擊手">游擊手</option>
            <option value="左外野">左外野</option>
            <option value="中外野">中外野</option>
            <option value="右外野">右外野</option>
            <option value="指定打擊">指定打擊</option>
          </select>
        </td>
        ${Array.from({length: 9}, (_, i) => `
          <td><input type="text" class="inning-result-input" data-inning="${i + 1}" placeholder="輸入結果"></td>
        `).join('')}
        <td><input type="number" class="stat-input" data-field="atBats" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="runs" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="rbi" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="stolenBases" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="errors" min="0" value="0"></td>
        <td class="batting-average">.000</td>
        <td>
          <button type="button" class="btn-small remove-row-btn" data-action="remove">刪除</button>
        </td>
      `;
      
      // Find all rows with the same batting order
      const allBattingOrderRows = battingBody.querySelectorAll(`tr[data-batting-order="${battingOrder}"]`);
      
      // Insert after the last row with the same batting order
      if (allBattingOrderRows.length > 0) {
        const lastRow = allBattingOrderRows[allBattingOrderRows.length - 1];
        lastRow.parentNode.insertBefore(newRow, lastRow.nextSibling);
      } else {
        // Fallback: insert after the original batting order row
        targetRow.parentNode.insertBefore(newRow, targetRow.nextSibling);
      }
      
      // Add edit button functionality
      const editBtn = newRow.querySelector('.edit-jersey-btn');
      const newSelect = newRow.querySelector('.player-select');
      const display = newRow.querySelector('.jersey-number');
      const nameCell = newRow.querySelector('.player-name');
      
      if (editBtn && newSelect && display) {
        editBtn.addEventListener('click', () => {
          display.style.display = 'none';
          editBtn.style.display = 'none';
          newSelect.style.display = 'inline';
          newSelect.focus();
        });
        
        newSelect.addEventListener('change', (e) => {
          const newPlayer = players.find(p => String(p.id) === e.target.value);
          if (newPlayer) {
            display.textContent = newPlayer.number || newPlayer.jerseyNumber || '';
            nameCell.textContent = newPlayer.name || '';
            display.style.display = 'inline';
            editBtn.style.display = 'inline';
            newSelect.style.display = 'none';
            
            newSelect.innerHTML = `
              <option value="">選擇球員</option>
              ${players.map(p => `<option value="${p.id}" ${String(p.id) === String(newPlayer.id) ? 'selected' : ''}>#${p.number} ${p.name}</option>`).join('')}
            `;
          }
        });
      }
      
      // Add remove button handler
      const removeBtn = newRow.querySelector('.remove-row-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          if (confirm('確定要刪除這個替換記錄嗎？')) {
            newRow.remove();
            updateTeamBattingTotals(container);
          }
        });
      }
      
      // Clear the form
      container.querySelector('#outPlayerNumber').value = '';
      container.querySelector('#inPlayerNumber').value = '';
      
      // Update team totals
      updateTeamBattingTotals(container);
      
      alert(`成功執行調度：背號 ${outPlayerNumber} 下場，背號 ${inPlayerNumber} 上場`);
    });
  }

  // Coach position change mode - use event delegation
  container.addEventListener('click', (e) => {
    if (e.target.id !== 'executePositionChangeBtn') {
      return;
    }

    const positionChangeInput = container.querySelector('#positionChange');
    if (!positionChangeInput) {
      alert('找不到守備位置調動輸入框');
      return;
    }

    const positionCodes = parsePositionChangeInput(positionChangeInput.value);
    if (positionCodes.length < 2) {
      alert('請輸入至少兩個守備位置代碼，例如 1-2-6-1');
      return;
    }

    const invalidCode = positionCodes.find(code => !getPositionLabel(code) || code === 'DH');
    if (invalidCode) {
      alert(`無效的守備位置代碼: ${invalidCode}`);
      return;
    }

    const battingBody = container.querySelector('#battingRecordBody');
    if (!battingBody) {
      return;
    }

    const positionPlayers = {};
    battingBody.querySelectorAll('tr').forEach(row => {
      const rowState = getRowPositionState(row);
      if (rowState.positionCode && rowState.positionCode !== 'DH') {
        // 同打序若有替換列，保留最後一列作為場上守備者。
        positionPlayers[rowState.positionCode] = rowState;
      }
    });

    const requiredCodes = [...new Set(positionCodes.slice(0, -1))];
    const missingCodes = requiredCodes.filter(code => !positionPlayers[code]);
    if (missingCodes.length > 0) {
      const missingLabels = missingCodes.map(code => `${code}(${getPositionLabel(code)})`).join('、');
      alert(`無法執行守備調動：找不到 ${missingLabels} 的球員\n請確認目前場上球員已有對應守位`);
      return;
    }

    const changes = [];
    for (let i = 0; i < positionCodes.length - 1; i++) {
      const fromCode = positionCodes[i];
      const toCode = positionCodes[i + 1];
      const fromPlayer = positionPlayers[fromCode];

      applyPositionToRow(fromPlayer, toCode);
      changes.push(`位置 ${fromCode}(${getPositionLabel(fromCode)}) → ${toCode}(${getPositionLabel(toCode)})`);
    }

    positionChangeInput.value = '';
    alert(`成功執行守備調動：\n${changes.join('\n')}`);
  });


}

function updatePitcherSelects(container, players, selectedPitcherId) {
  const allPitcherSelects = container.querySelectorAll('.pitcher-select');
  const selectedPitcherIds = new Set();
  
  // Collect all selected pitcher IDs (including the current one)
  allPitcherSelects.forEach(select => {
    if (select.value) {
      selectedPitcherIds.add(select.value);
    }
  });
  
  // Update each select to exclude already selected pitchers
  allPitcherSelects.forEach(select => {
    const currentValue = select.value;
    const selectContainer = select.closest('td');
    
    // Rebuild the select options
    select.innerHTML = `
      <option value="">選擇投手</option>
      ${players.filter(p => !selectedPitcherIds.has(String(p.id)) || String(p.id) === currentValue)
        .map(p => `<option value="${p.id}" ${String(p.id) === currentValue ? 'selected' : ''}>${p.name}</option>`).join('')}
    `;
  });
}

function updateTeamBattingTotals(container) {
  const battingRows = container.querySelectorAll('#battingRecordBody tr');
  let totalAtBats = 0;
  let totalRuns = 0;
  let totalHits = 0;
  let totalRBI = 0;
  let totalWalks = 0;
  let totalStrikeouts = 0;
  let totalStolenBases = 0;
  let totalErrors = 0;
  
  battingRows.forEach(row => {
    totalAtBats += parseInt(row.querySelector('[data-field="atBats"]')?.value) || 0;
    totalRuns += parseInt(row.querySelector('[data-field="runs"]')?.value) || 0;
    totalHits += parseInt(row.querySelector('[data-field="hits"]')?.value) || 0;
    totalRBI += parseInt(row.querySelector('[data-field="rbi"]')?.value) || 0;
    totalWalks += parseInt(row.querySelector('[data-field="walks"]')?.value) || 0;
    totalStrikeouts += parseInt(row.querySelector('[data-field="strikeouts"]')?.value) || 0;
    totalStolenBases += parseInt(row.querySelector('[data-field="stolenBases"]')?.value) || 0;
    totalErrors += parseInt(row.querySelector('[data-field="errors"]')?.value) || 0;
  });
  
  const teamBattingAverage = totalAtBats > 0 ? (totalHits / totalAtBats).toFixed(3) : '.000';
  
  const teamTotalAtBats = container.querySelector('#teamTotalAtBats');
  const teamTotalRuns = container.querySelector('#teamTotalRuns');
  const teamTotalHits = container.querySelector('#teamTotalHits');
  const teamTotalRBI = container.querySelector('#teamTotalRBI');
  const teamTotalWalks = container.querySelector('#teamTotalWalks');
  const teamTotalStrikeouts = container.querySelector('#teamTotalStrikeouts');
  const teamTotalStolenBases = container.querySelector('#teamTotalStolenBases');
  const teamTotalErrors = container.querySelector('#teamTotalErrors');
  const teamBattingAverageCell = container.querySelector('#teamBattingAverage');
  
  if (teamTotalAtBats) teamTotalAtBats.textContent = totalAtBats;
  if (teamTotalRuns) teamTotalRuns.textContent = totalRuns;
  if (teamTotalHits) teamTotalHits.textContent = totalHits;
  if (teamTotalRBI) teamTotalRBI.textContent = totalRBI;
  if (teamTotalWalks) teamTotalWalks.textContent = totalWalks;
  if (teamTotalStrikeouts) teamTotalStrikeouts.textContent = totalStrikeouts;
  if (teamTotalStolenBases) teamTotalStolenBases.textContent = totalStolenBases;
  if (teamTotalErrors) teamTotalErrors.textContent = totalErrors;
  if (teamBattingAverageCell) teamBattingAverageCell.textContent = teamBattingAverage;
}

function updateTeamPitchingTotals(container) {
  const pitchingRows = container.querySelectorAll('#pitchingRecordBody tr');
  let totalInnings = 0;
  let totalBattersFaced = 0;
  let totalPitches = 0;
  let totalHitsAllowed = 0;
  let totalRunsAllowed = 0;
  let totalEarnedRuns = 0;
  let totalWalks = 0;
  let totalStrikeouts = 0;
  let totalHomeRuns = 0;
  
  pitchingRows.forEach(row => {
    totalInnings += parseFloat(row.querySelector('[data-field="innings"]')?.value) || 0;
    totalBattersFaced += parseInt(row.querySelector('[data-field="battersFaced"]')?.value) || 0;
    totalPitches += parseInt(row.querySelector('[data-field="pitches"]')?.value) || 0;
    totalHitsAllowed += parseInt(row.querySelector('[data-field="hitsAllowed"]')?.value) || 0;
    totalRunsAllowed += parseInt(row.querySelector('[data-field="runsAllowed"]')?.value) || 0;
    totalEarnedRuns += parseInt(row.querySelector('[data-field="earnedRuns"]')?.value) || 0;
    totalWalks += parseInt(row.querySelector('[data-field="walks"]')?.value) || 0;
    totalStrikeouts += parseInt(row.querySelector('[data-field="strikeouts"]')?.value) || 0;
    totalHomeRuns += parseInt(row.querySelector('[data-field="homeRuns"]')?.value) || 0;
  });
  
  const teamERA = totalInnings > 0 ? (totalEarnedRuns / totalInnings * 9).toFixed(2) : '0.00';
  
  const teamTotalInnings = container.querySelector('#teamTotalInnings');
  const teamTotalBattersFaced = container.querySelector('#teamTotalBattersFaced');
  const teamTotalPitches = container.querySelector('#teamTotalPitches');
  const teamTotalHitsAllowed = container.querySelector('#teamTotalHitsAllowed');
  const teamTotalRunsAllowed = container.querySelector('#teamTotalRunsAllowed');
  const teamTotalEarnedRuns = container.querySelector('#teamTotalEarnedRuns');
  const teamTotalPitchingWalks = container.querySelector('#teamTotalPitchingWalks');
  const teamTotalPitchingStrikeouts = container.querySelector('#teamTotalPitchingStrikeouts');
  const teamTotalHomeRuns = container.querySelector('#teamTotalHomeRuns');
  const teamERACell = container.querySelector('#teamERA');
  
  if (teamTotalInnings) teamTotalInnings.textContent = totalInnings.toFixed(1);
  if (teamTotalBattersFaced) teamTotalBattersFaced.textContent = totalBattersFaced;
  if (teamTotalPitches) teamTotalPitches.textContent = totalPitches;
  if (teamTotalHitsAllowed) teamTotalHitsAllowed.textContent = totalHitsAllowed;
  if (teamTotalRunsAllowed) teamTotalRunsAllowed.textContent = totalRunsAllowed;
  if (teamTotalEarnedRuns) teamTotalEarnedRuns.textContent = totalEarnedRuns;
  if (teamTotalPitchingWalks) teamTotalPitchingWalks.textContent = totalWalks;
  if (teamTotalPitchingStrikeouts) teamTotalPitchingStrikeouts.textContent = totalStrikeouts;
  if (teamTotalHomeRuns) teamTotalHomeRuns.textContent = totalHomeRuns;
  if (teamERACell) teamERACell.textContent = teamERA;
}

// ============================================================
// 檢查守備位置是否重複
//
// battingRecords 中每筆為 { position, ... }，
// 空字串 / 未指定守位不列入檢查。
// ============================================================
function findDuplicatePositions(battingRecords) {
  const seen = new Map();
  const duplicates = [];

  battingRecords.forEach((record, index) => {
    const position = (record.position || '').trim();
    if (!position) {
      return;
    }

    const key = position.toUpperCase();
    if (seen.has(key)) {
      duplicates.push({
        position,
        firstBattingOrder: seen.get(key) + 1,
        battingOrder: index + 1
      });
    } else {
      seen.set(key, index);
    }
  });

  return duplicates;
}

function saveScoreSheet(container) {
  try {
    const data = loadData();
    
    // Basic game info
    const gameInfo = {
      teamName: container.querySelector('#teamName')?.value || '',
      opponent: container.querySelector('#opponent')?.value || '',
      gameDate: container.querySelector('#gameDate')?.value || '',
      venue: container.querySelector('#venue')?.value || '',
      gameName: container.querySelector('#gameName')?.value || '',
      homeAway: container.querySelector('#homeAway')?.value || 'home'
    };

    // Inning records
    const inningRows = container.querySelectorAll('.inning-table tbody tr');
    const inningRecords = [];
    inningRows.forEach(row => {
      const inputs = row.querySelectorAll('.inning-input');
      const values = Array.from(inputs).map(input => parseInt(input.value) || 0);
      inningRecords.push(values);
    });

    // Batting records
    const battingRows = container.querySelectorAll('#battingRecordBody tr');
    const battingRecords = [];
    battingRows.forEach(row => {
      const playerId = row.querySelector('.player-select')?.value || '';
      const identity = row.querySelector('.identity-select')?.value || 'starter';
      const position = row.querySelector('.position-select')?.value || getRowSavedPosition(row);
      
      const statInputs = row.querySelectorAll('.stat-input');
      const inningResults = Array.from(row.querySelectorAll('.inning-result-input')).map(input => input.value || '');
      
      battingRecords.push({
        playerId,
        identity,
        position,
        atBats: parseInt(row.querySelector('[data-field="atBats"]')?.value) || 0,
        runs: parseInt(row.querySelector('[data-field="runs"]')?.value) || 0,
        hits: parseInt(row.querySelector('[data-field="hits"]')?.value) || 0,
        rbi: parseInt(row.querySelector('[data-field="rbi"]')?.value) || 0,
        walks: parseInt(row.querySelector('[data-field="walks"]')?.value) || 0,
        strikeouts: parseInt(row.querySelector('[data-field="strikeouts"]')?.value) || 0,
        stolenBases: parseInt(row.querySelector('[data-field="stolenBases"]')?.value) || 0,
        errors: parseInt(row.querySelector('[data-field="errors"]')?.value) || 0,
        inningResults
      });
    });

    // Pitching records
    const pitchingRows = container.querySelectorAll('#pitchingRecordBody tr');
    const pitchingRecords = [];
    pitchingRows.forEach(row => {
      const playerId = row.querySelector('.pitcher-select')?.value || '';
      const pitcherType = row.dataset.pitcherType || 'starter';
      
      pitchingRecords.push({
        playerId,
        pitcherType,
        innings: parseFloat(row.querySelector('[data-field="innings"]')?.value) || 0,
        battersFaced: parseInt(row.querySelector('[data-field="battersFaced"]')?.value) || 0,
        pitches: parseInt(row.querySelector('[data-field="pitches"]')?.value) || 0,
        hitsAllowed: parseInt(row.querySelector('[data-field="hitsAllowed"]')?.value) || 0,
        runsAllowed: parseInt(row.querySelector('[data-field="runsAllowed"]')?.value) || 0,
        earnedRuns: parseInt(row.querySelector('[data-field="earnedRuns"]')?.value) || 0,
        walks: parseInt(row.querySelector('[data-field="walks"]')?.value) || 0,
        strikeouts: parseInt(row.querySelector('[data-field="strikeouts"]')?.value) || 0,
        homeRuns: parseInt(row.querySelector('[data-field="homeRuns"]')?.value) || 0
      });
    });

    // 守備位置重複檢查（不阻擋沒有指定守位的欄位）
    const duplicatePositions = findDuplicatePositions(battingRecords);
    if (duplicatePositions.length > 0) {
      const messages = duplicatePositions.map(d =>
        `第 ${d.firstBattingOrder} 棒與第 ${d.battingOrder} 棒皆為「${d.position}」`
      );
      alert(`守備位置重複，請修正後再儲存：\n${messages.join('\n')}`);
      return;
    }

    const linkedSheetId = container.querySelector('.score-sheet-form')?.dataset.linkedSheetId || '';

    const scoreSheet = {
      id: linkedSheetId || ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `ss_${Date.now()}`),
      gameInfo,
      inningRecords,
      battingRecords,
      pitchingRecords,
      createdAt: new Date().toISOString()
    };

    // Save to data
    if (!Array.isArray(data.scoreSheets)) {
      data.scoreSheets = [];
    }

    const existingIndex = linkedSheetId
      ? data.scoreSheets.findIndex(sheet => sheet && sheet.id === linkedSheetId)
      : -1;

    if (existingIndex !== -1) {
      // 這張紀錄表是編輯既有紀錄（可能是繼續填寫草稿，也可能是修改已完成的紀錄）。
      // 先把「舊」的數據從球員累計數據裡扣掉，避免等一下重新加總時被算兩次。
      unsyncFromPlayerStats(data.scoreSheets[existingIndex], data);
      scoreSheet.createdAt = data.scoreSheets[existingIndex].createdAt || scoreSheet.createdAt;
      data.scoreSheets[existingIndex] = scoreSheet;
    } else {
      data.scoreSheets.push(scoreSheet);
    }

    saveData(data);

    alert('比賽紀錄已儲存！');
    
    // Optionally sync to player stats
    syncToPlayerStats(scoreSheet, data);
    saveData(data);
    
  } catch (error) {
    console.error('儲存比賽紀錄失敗：', error);
    alert('儲存比賽紀錄失敗，請稍後再試');
  }
}

function unsyncFromPlayerStats(scoreSheet, data) {
  if (!Array.isArray(data.players)) return;

  (scoreSheet.battingRecords || []).forEach(record => {
    if (!record.playerId) return;

    const player = data.players.find(p => String(p.id) === String(record.playerId));
    if (!player || !player.stats) return;

    player.stats.atBats = Math.max(0, (player.stats.atBats || 0) - (record.atBats || 0));
    player.stats.hits = Math.max(0, (player.stats.hits || 0) - (record.hits || 0));
    player.stats.rbi = Math.max(0, (player.stats.rbi || 0) - (record.rbi || 0));
    player.stats.runs = Math.max(0, (player.stats.runs || 0) - (record.runs || 0));
    player.stats.walks = Math.max(0, (player.stats.walks || 0) - (record.walks || 0));
    player.stats.strikeouts = Math.max(0, (player.stats.strikeouts || 0) - (record.strikeouts || 0));
    player.stats.stolenBases = Math.max(0, (player.stats.stolenBases || 0) - (record.stolenBases || 0));

    player.stats.battingAverage = player.stats.atBats > 0
      ? (player.stats.hits / player.stats.atBats).toFixed(3)
      : '.000';
  });

  (scoreSheet.pitchingRecords || []).forEach(record => {
    if (!record.playerId) return;

    const player = data.players.find(p => String(p.id) === String(record.playerId));
    if (!player || !player.pitchingStats) return;

    player.pitchingStats.innings = Math.max(0, (player.pitchingStats.innings || 0) - (record.innings || 0));
    player.pitchingStats.pitches = Math.max(0, (player.pitchingStats.pitches || 0) - (record.pitches || 0));
    player.pitchingStats.hitsAllowed = Math.max(0, (player.pitchingStats.hitsAllowed || 0) - (record.hitsAllowed || 0));
    player.pitchingStats.runsAllowed = Math.max(0, (player.pitchingStats.runsAllowed || 0) - (record.runsAllowed || 0));
    player.pitchingStats.earnedRuns = Math.max(0, (player.pitchingStats.earnedRuns || 0) - (record.earnedRuns || 0));
    player.pitchingStats.walks = Math.max(0, (player.pitchingStats.walks || 0) - (record.walks || 0));
    player.pitchingStats.strikeouts = Math.max(0, (player.pitchingStats.strikeouts || 0) - (record.strikeouts || 0));
    player.pitchingStats.homeRuns = Math.max(0, (player.pitchingStats.homeRuns || 0) - (record.homeRuns || 0));

    player.pitchingStats.era = player.pitchingStats.innings > 0
      ? (player.pitchingStats.earnedRuns / player.pitchingStats.innings * 9).toFixed(2)
      : '0.00';
  });
}

function syncToPlayerStats(scoreSheet, data) {
  if (!Array.isArray(data.players)) return;
  
  scoreSheet.battingRecords.forEach(record => {
    if (!record.playerId) return;
    
    const player = data.players.find(p => String(p.id) === String(record.playerId));
    if (!player) return;
    
    if (!player.stats) {
      player.stats = {};
    }
    
    // Accumulate stats
    player.stats.atBats = (player.stats.atBats || 0) + record.atBats;
    player.stats.hits = (player.stats.hits || 0) + record.hits;
    player.stats.rbi = (player.stats.rbi || 0) + record.rbi;
    player.stats.runs = (player.stats.runs || 0) + record.runs;
    player.stats.walks = (player.stats.walks || 0) + record.walks;
    player.stats.strikeouts = (player.stats.strikeouts || 0) + record.strikeouts;
    player.stats.stolenBases = (player.stats.stolenBases || 0) + record.stolenBases;
    
    // Update batting average
    if (player.stats.atBats > 0) {
      player.stats.battingAverage = (player.stats.hits / player.stats.atBats).toFixed(3);
    }
  });
  
  scoreSheet.pitchingRecords.forEach(record => {
    if (!record.playerId) return;
    
    const player = data.players.find(p => String(p.id) === String(record.playerId));
    if (!player) return;
    
    if (!player.pitchingStats) {
      player.pitchingStats = {};
    }
    
    // Accumulate pitching stats
    player.pitchingStats.innings = (player.pitchingStats.innings || 0) + record.innings;
    player.pitchingStats.pitches = (player.pitchingStats.pitches || 0) + record.pitches;
    player.pitchingStats.hitsAllowed = (player.pitchingStats.hitsAllowed || 0) + record.hitsAllowed;
    player.pitchingStats.runsAllowed = (player.pitchingStats.runsAllowed || 0) + record.runsAllowed;
    player.pitchingStats.earnedRuns = (player.pitchingStats.earnedRuns || 0) + record.earnedRuns;
    player.pitchingStats.walks = (player.pitchingStats.walks || 0) + record.walks;
    player.pitchingStats.strikeouts = (player.pitchingStats.strikeouts || 0) + record.strikeouts;
    player.pitchingStats.homeRuns = (player.pitchingStats.homeRuns || 0) + record.homeRuns;
    
    // Update ERA
    if (player.pitchingStats.innings > 0) {
      player.pitchingStats.era = (player.pitchingStats.earnedRuns / player.pitchingStats.innings * 9).toFixed(2);
    }
  });
}

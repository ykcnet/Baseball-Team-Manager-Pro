import { loadData, saveData } from '../core/storage.js';
import { calculateBattingAverage } from './battingStats.js';
import { getPlayers } from '../player/playerService.js';
import { getCurrentLineup } from '../lineup/lineupManager.js';

export function renderStatsPage(container) {
  // Cleanup previous event listeners
  if (container._statsPageCleanup) {
    container._statsPageCleanup();
  }
  
  if (container._lineupSavedHandler) {
    document.removeEventListener('lineup:saved', container._lineupSavedHandler);
  }
  
  if (container._deleteAllGameRecordsHandler) {
    const deleteBtn = container.querySelector('#deleteAllGameRecordsBtn');
    if (deleteBtn) {
      deleteBtn.removeEventListener('click', container._deleteAllGameRecordsHandler);
    }
  }

  const data = loadData();
  const players = Array.isArray(data.players) ? data.players : [];
  const games = Array.isArray(data.games) ? data.games : [];
  const gameRecords = Array.isArray(data.gameRecords) ? data.gameRecords : [];

  container.innerHTML = `
    <section class="stats-page">
      <div class="page-intro">
        <div>
          <p class="eyebrow">STATISTICS</p>
          <h2>比賽紀錄</h2>
          <p>球員個人比賽紀錄與統計</p>
        </div>
        <div class="dashboard-ball" aria-hidden="true">📊</div>
      </div>

      <div class="stats-summary">
        <div class="stat-card">
          <div class="stat-value">${players.length}</div>
          <div class="stat-label">球員總數</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${gameRecords.length}</div>
          <div class="stat-label">比賽紀錄</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${players.length > 0 ? calculateTeamBattingAverage(players) : '.000'}</div>
          <div class="stat-label">球隊打擊率</div>
        </div>
      </div>

      <div class="stats-header-actions">
        <button type="button" id="deleteAllGameRecordsBtn" class="btn-danger">🗑️ 刪除所有比賽紀錄</button>
      </div>

      <div class="stats-tabs">
        <button class="stats-tab active" data-tab="game-record">比賽紀錄</button>
        <button class="stats-tab" data-tab="batting">打擊統計</button>
        <button class="stats-tab" data-tab="pitching">投球統計</button>
      </div>

      <div id="gameRecord" class="stats-content active">
        ${renderGameRecordForm()}
      </div>

      <div id="battingStats" class="stats-content">
        ${renderBattingStatsTable(players)}
      </div>

      <div id="pitchingStats" class="stats-content">
        ${renderPitchingStatsTable(players)}
      </div>
    </section>
  `;

  setupStatsHandlers(container);
}

function setupStatsHandlers(container) {

  // Tab switching
  container.querySelectorAll('.stats-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.stats-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      const targetId = tabName === 'game-record' ? 'gameRecord' : `${tabName}Stats`;
      container.querySelector(`#${targetId}`).classList.add('active');
    });
  });

  // Edit and delete handlers
  container.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.stats-edit-btn');
    const deleteBtn = e.target.closest('.stats-delete-btn');
    
    if (editBtn) {
      handleEditStats(editBtn.dataset.playerId, editBtn.dataset.type);
    }
    
    if (deleteBtn) {
      handleDeleteStats(deleteBtn.dataset.playerId, deleteBtn.dataset.type);
    }
  });

  // Game record handlers
  setupGameRecordHandlers(container);

  // Delete all game records handler
  const deleteAllGameRecordsBtn = container.querySelector('#deleteAllGameRecordsBtn');
  const deleteAllGameRecordsHandler = () => {
    const data = loadData();
    const gameRecords = Array.isArray(data.gameRecords) ? data.gameRecords : [];
    
    if (gameRecords.length === 0) {
      alert('目前沒有比賽紀錄可以刪除');
      return;
    }
    
    if (confirm(`確定要刪除所有 ${gameRecords.length} 筆比賽紀錄嗎？此操作無法復原。`)) {
      data.gameRecords = [];
      saveData(data);
      
      // Refresh the page to show updated stats
      renderStatsPage(container);
      
      alert('所有比賽紀錄已刪除');
    }
  };
  
  if (deleteAllGameRecordsBtn) {
    deleteAllGameRecordsBtn.addEventListener('click', deleteAllGameRecordsHandler);
    container._deleteAllGameRecordsHandler = deleteAllGameRecordsHandler;
  }
  
  // Store cleanup function for event listeners
  container._statsPageCleanup = () => {
    if (container._lineupSavedHandler) {
      document.removeEventListener('lineup:saved', container._lineupSavedHandler);
    }
    if (container._deleteAllGameRecordsHandler) {
      const deleteBtn = container.querySelector('#deleteAllGameRecordsBtn');
      if (deleteBtn) {
        deleteBtn.removeEventListener('click', container._deleteAllGameRecordsHandler);
      }
    }
  };
}

function handleEditStats(playerId, type) {
  const data = loadData();
  const players = Array.isArray(data.players) ? data.players : [];
  const player = players.find(p => p.id === playerId);
  
  if (!player) return;

  if (type === 'batting') {
    const stats = player.stats || { atBats: 0, hits: 0, rbi: 0, runs: 0 };
    
    const atBats = prompt('更新打數:', stats.atBats);
    const hits = prompt('更新安打:', stats.hits);
    const rbi = prompt('更新打點:', stats.rbi || 0);
    const runs = prompt('更新得分:', stats.runs || 0);
    
    if (atBats !== null && hits !== null && rbi !== null && runs !== null) {
      player.stats = {
        atBats: parseInt(atBats) || 0,
        hits: parseInt(hits) || 0,
        rbi: parseInt(rbi) || 0,
        runs: parseInt(runs) || 0
      };
      
      saveData(data);
      renderStatsPage(document.querySelector('#dashboard'));
    }
  } else if (type === 'pitching') {
    const stats = player.pitchingStats || { innings: 0, pitches: 0, strikeouts: 0, walks: 0, earnedRuns: 0 };
    
    const innings = prompt('更新局數:', stats.innings);
    const pitches = prompt('更新投球數:', stats.pitches);
    const strikeouts = prompt('更新三振:', stats.strikeouts);
    const walks = prompt('更新保送:', stats.walks);
    const earnedRuns = prompt('更新自責分:', stats.earnedRuns);
    
    if (innings !== null && pitches !== null && strikeouts !== null && walks !== null && earnedRuns !== null) {
      player.pitchingStats = {
        innings: parseFloat(innings) || 0,
        pitches: parseInt(pitches) || 0,
        strikeouts: parseInt(strikeouts) || 0,
        walks: parseInt(walks) || 0,
        earnedRuns: parseInt(earnedRuns) || 0
      };
      
      saveData(data);
      renderStatsPage(document.querySelector('#dashboard'));
    }
  }
}

function handleDeleteStats(playerId, type) {
  if (!confirm('確定要刪除此統計資料嗎？此操作無法復原。')) return;
  
  const data = loadData();
  const players = Array.isArray(data.players) ? data.players : [];
  const player = players.find(p => p.id === playerId);
  
  if (!player) return;

  if (type === 'batting') {
    delete player.stats;
  } else if (type === 'pitching') {
    delete player.pitchingStats;
  }
  
  saveData(data);
  renderStatsPage(document.querySelector('#dashboard'));
}

function calculateTeamBattingAverage(players) {
  let totalHits = 0;
  let totalAtBats = 0;

  players.forEach(player => {
    if (player.stats) {
      totalHits += player.stats.hits || 0;
      totalAtBats += player.stats.atBats || 0;
    }
  });

  if (totalAtBats === 0) return '.000';
  return (totalHits / totalAtBats).toFixed(3);
}

function renderBattingStatsTable(players) {
  if (players.length === 0) {
    return '<div class="empty-state">尚無球員資料</div>';
  }

  const playersWithStats = players.filter(p => p.stats && p.stats.atBats > 0);
  
  if (playersWithStats.length === 0) {
    return '<div class="empty-state">尚無打擊統計資料</div>';
  }

  return `
    <div class="stats-table-container">
      <table class="stats-table">
        <thead>
          <tr>
            <th>球員</th>
            <th>背號</th>
            <th>打數</th>
            <th>安打</th>
            <th>打點</th>
            <th>得分</th>
            <th>打擊率</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${playersWithStats.map(player => `
            <tr data-player-id="${player.id}">
              <td>${player.name}</td>
              <td>${player.number}</td>
              <td>${player.stats.atBats}</td>
              <td>${player.stats.hits}</td>
              <td>${player.stats.rbi || 0}</td>
              <td>${player.stats.runs || 0}</td>
              <td>${calculateBattingAverage(player.stats).toFixed(3)}</td>
              <td>
                <button class="stats-edit-btn" data-player-id="${player.id}" data-type="batting">編輯</button>
                <button class="stats-delete-btn" data-player-id="${player.id}" data-type="batting">刪除</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderPitchingStatsTable(players) {
  if (players.length === 0) {
    return '<div class="empty-state">尚無球員資料</div>';
  }

  const pitchers = players.filter(p => p.position === '投手' || (p.pitchingStats && p.pitchingStats.innings > 0));
  
  if (pitchers.length === 0) {
    return '<div class="empty-state">尚無投球統計資料</div>';
  }

  return `
    <div class="stats-table-container">
      <table class="stats-table">
        <thead>
          <tr>
            <th>投手</th>
            <th>背號</th>
            <th>局數</th>
            <th>投球數</th>
            <th>三振</th>
            <th>保送</th>
            <th>自責分</th>
            <th>防禦率</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${pitchers.map(player => {
            const stats = player.pitchingStats || { innings: 0, pitches: 0, strikeouts: 0, walks: 0, earnedRuns: 0 };
            const era = stats.innings > 0 ? (stats.earnedRuns / stats.innings * 9).toFixed(2) : '0.00';
            
            return `
              <tr data-player-id="${player.id}">
                <td>${player.name}</td>
                <td>${player.number}</td>
                <td>${stats.innings}</td>
                <td>${stats.pitches}</td>
                <td>${stats.strikeouts}</td>
                <td>${stats.walks}</td>
                <td>${stats.earnedRuns}</td>
                <td>${era}</td>
                <td>
                  <button class="stats-edit-btn" data-player-id="${player.id}" data-type="pitching">編輯</button>
                  <button class="stats-delete-btn" data-player-id="${player.id}" data-type="pitching">刪除</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================================
// Game Record Form
// ============================================================

function renderGameRecordForm() {
  const players = getPlayers();
  const currentLineup = getCurrentLineup();
  const starters = currentLineup && Array.isArray(currentLineup.starters) ? currentLineup.starters : [];
  
  // Auto-use current lineup if available
  const autoUseLineup = starters.length === 9 ? 'current' : '';
  
  return `
    <div class="game-record-container">
      <div class="game-info-section">
        <h3>比賽基本資訊</h3>
        <div class="game-info-form">
          <div class="form-group">
            <label>比賽日期</label>
            <input type="date" id="gameDate" class="form-input">
          </div>
          <div class="form-group">
            <label>對手球隊</label>
            <input type="text" id="opponent" class="form-input" placeholder="輸入對手球隊名稱">
          </div>
          <div class="form-group">
            <label>比賽場地</label>
            <input type="text" id="venue" class="form-input" placeholder="輸入比賽場地">
          </div>
          <div class="form-group">
            <label>先發名單</label>
            <select id="useLineup" class="form-input">
              <option value="">自選球員</option>
              ${starters.length === 9 ? `<option value="current" ${autoUseLineup === 'current' ? 'selected' : ''}>使用目前先發名單 (${starters.length}人)</option>` : ''}
            </select>
          </div>
        </div>
      </div>

      <div class="batting-record-section">
        <h3>打擊紀錄</h3>
        <div class="batting-table-container">
          <table class="game-record-table">
            <thead>
              <tr>
                <th>棒次</th>
                <th>球員</th>
                <th>背號</th>
                <th>守備位置</th>
                <th>替換情況</th>
                <th>打數</th>
                <th>安打</th>
                <th>打點</th>
                <th>得分</th>
                <th>打擊率</th>
                <th>1局</th>
                <th>2局</th>
                <th>3局</th>
                <th>4局</th>
                <th>5局</th>
                <th>6局</th>
                <th>7局</th>
                <th>8局</th>
                <th>9局</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="battingRecordBody">
              ${renderBattingRecordRows(players, starters)}
            </tbody>
          </table>
          <button type="button" id="addBattingRecordBtn" class="btn-secondary">+ 新增打擊記錄</button>
        </div>
      </div>

      <div class="pitching-record-section">
        <h3>投手紀錄</h3>
        <div class="pitching-table-container">
          <table class="game-record-table">
            <thead>
              <tr>
                <th>投手</th>
                <th>背號</th>
                <th>類型</th>
                <th>接替局數</th>
                <th>局數</th>
                <th>打席</th>
                <th>安打</th>
                <th>三振</th>
                <th>四死</th>
                <th>責失</th>
                <th>勝敗</th>
                <th>防禦率</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="pitchingRecordBody">
              ${renderPitchingRecordRows(players, starters)}
            </tbody>
          </table>
          <button type="button" id="addPitcherBtn" class="btn-secondary">+ 牛棚投手</button>
        </div>
      </div>

      <div class="inning-record-section">
        <h3>每局紀錄</h3>
        <div class="inning-table-container">
          <table class="game-record-table">
            <thead>
              <tr>
                <th>局數</th>
                <th>被安打</th>
                <th>四壞球</th>
                <th>失誤</th>
                <th>失分</th>
                <th>投球數</th>
              </tr>
            </thead>
            <tbody id="inningRecordBody">
              ${renderInningRecordRows()}
            </tbody>
          </table>
        </div>
      </div>

      <div class="game-record-actions">
        <button type="button" id="saveGameRecordBtn" class="btn-primary">儲存比賽紀錄</button>
        <button type="button" id="clearGameRecordBtn" class="btn-secondary">清除全部</button>
      </div>
    </div>
  `;
}

function renderBattingRecordRows(players, starters) {
  const playersToUse = starters.length === 9 
    ? starters.map(starter => {
        const playerId = typeof starter === 'string' ? starter : starter.playerId;
        return players.find(p => String(p.id) === String(playerId));
      }).filter(p => p)
    : players.slice(0, 9);

  if (playersToUse.length === 0) {
    return '<tr><td colspan="19" class="empty-message">請先選擇先發名單或新增球員</td></tr>';
  }

  return playersToUse.map((player, index) => {
    if (!player) return '';
    
    const order = index + 1;
    const position = starters.length === 9 
      ? (typeof starters[index] === 'object' ? starters[index].position : '')
      : player.position || '';
    
    return `
      <tr data-player-id="${player.id}" data-order="${order}" data-is-starter="true">
        <td>${order}</td>
        <td>
          <select class="player-select" data-field="player">
            <option value="">選擇球員</option>
            ${players.map(p => `
              <option value="${p.id}" ${p.id === player.id ? 'selected' : ''}>${p.name} #${p.number}</option>
            `).join('')}
          </select>
        </td>
        <td>${player.number}</td>
        <td>${position}</td>
        <td>
          <select class="replacement-select" data-field="replacement">
            <option value="">無替換</option>
            <option value="substitute-batting">代打</option>
            <option value="substitute-running">代跑</option>
            <option value="defensive-replacement">守備替換</option>
            <option value="injury">受傷退場</option>
          </select>
        </td>
        <td><input type="number" class="stat-input" data-field="atBats" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="rbi" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="runs" min="0" value="0"></td>
        <td class="batting-average">.000</td>
        ${Array.from({length: 9}, (_, i) => `
          <td><input type="text" class="inning-input" data-inning="${i + 1}" placeholder="輸入結果"></td>
        `).join('')}
        <td>
          <button type="button" class="btn-small remove-row-btn" data-row-id="${player.id}">刪除</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPitchingRecordRows(players, starters) {
  const pitchers = players.filter(p => p.position === '投手' || p.positions?.some(pos => pos.code === 'P'));
  
  // Find starting pitcher from lineup
  let startingPitcher = null;
  if (starters && starters.length === 9) {
    const pitcherStarter = starters.find(starter => {
      const position = typeof starter === 'object' ? starter.position : '';
      return position === 'P';
    });
    
    if (pitcherStarter) {
      const pitcherId = typeof pitcherStarter === 'string' ? pitcherStarter : pitcherStarter.playerId;
      startingPitcher = pitchers.find(p => String(p.id) === String(pitcherId));
    }
  }
  
  let rows = '';
  
  // Add starting pitcher if found
  if (startingPitcher) {
    rows += `
      <tr data-player-id="${startingPitcher.id}" data-pitcher-type="starter">
        <td>
          <select class="pitcher-select" data-field="player">
            <option value="">選擇投手</option>
            ${pitchers.map(p => `
              <option value="${p.id}" ${p.id === startingPitcher.id ? 'selected' : ''}>${p.name} #${p.number}</option>
            `).join('')}
          </select>
        </td>
        <td>${startingPitcher.number}</td>
        <td>
          <select class="pitcher-type-select" data-field="pitcherType">
            <option value="starter" selected>先發</option>
            <option value="relief">牛棚</option>
          </select>
        </td>
        <td>-</td>
        <td><input type="number" class="stat-input" data-field="innings" min="0" step="0.1" value="0"></td>
        <td><input type="number" class="stat-input" data-field="battersFaced" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="earnedRuns" min="0" value="0"></td>
        <td>
          <select class="win-loss-select" data-field="winLoss">
            <option value="">無</option>
            <option value="W">勝</option>
            <option value="L">敗</option>
            <option value="S">救援</option>
            <option value="H">中繼</option>
          </select>
        </td>
        <td class="era">0.00</td>
        <td>-</td>
      </tr>
    `;
  } else if (starters && starters.length === 0) {
    // Show empty message when no lineup selected
    rows = '<tr><td colspan="13" class="empty-message">請先選擇先發名單或新增投手</td></tr>';
  }
  
  return rows;
}

function renderInningRecordRows() {
  return Array.from({length: 9}, (_, i) => {
    const inning = i + 1;
    return `
      <tr data-inning="${inning}">
        <td>${inning}局</td>
        <td><input type="number" class="inning-stat-input" data-field="hits" min="0" value="0"></td>
        <td><input type="number" class="inning-stat-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="inning-stat-input" data-field="errors" min="0" value="0"></td>
        <td><input type="number" class="inning-stat-input" data-field="runs" min="0" value="0"></td>
        <td><input type="number" class="inning-stat-input" data-field="pitches" min="0" value="0"></td>
      </tr>
    `;
  }).join('');
}

function setupGameRecordHandlers(container) {
  // Auto-load current lineup on page load
  const useLineupSelect = container.querySelector('#useLineup');
  if (useLineupSelect && useLineupSelect.value === 'current') {
    const currentLineup = getCurrentLineup();
    const players = getPlayers();
    const starters = currentLineup && Array.isArray(currentLineup.starters) ? currentLineup.starters : [];
    
    const battingBody = container.querySelector('#battingRecordBody');
    if (battingBody) {
      battingBody.innerHTML = renderBattingRecordRows(players, starters);
    }
    
    const pitchingBody = container.querySelector('#pitchingRecordBody');
    if (pitchingBody) {
      pitchingBody.innerHTML = renderPitchingRecordRows(players, starters);
    }
  }

  // Lineup selection
  if (useLineupSelect) {
    useLineupSelect.addEventListener('change', (e) => {
      if (e.target.value === 'current') {
        const currentLineup = getCurrentLineup();
        const players = getPlayers();
        const starters = currentLineup && Array.isArray(currentLineup.starters) ? currentLineup.starters : [];
        
        const battingBody = container.querySelector('#battingRecordBody');
        if (battingBody) {
          battingBody.innerHTML = renderBattingRecordRows(players, starters);
        }
        
        const pitchingBody = container.querySelector('#pitchingRecordBody');
        if (pitchingBody) {
          pitchingBody.innerHTML = renderPitchingRecordRows(players, starters);
        }
      } else {
        // Clear batting records when not using lineup
        const battingBody = container.querySelector('#battingRecordBody');
        if (battingBody) {
          battingBody.innerHTML = renderBattingRecordRows(players, []);
        }
        
        // Clear pitching records when not using lineup
        const pitchingBody = container.querySelector('#pitchingRecordBody');
        if (pitchingBody) {
          pitchingBody.innerHTML = renderPitchingRecordRows(players, []);
        }
      }
    });
  }

  // Listen for lineup saved events to auto-update batting records
  const lineupSavedHandler = () => {
    const currentLineup = getCurrentLineup();
    const players = getPlayers();
    const starters = currentLineup && Array.isArray(currentLineup.starters) ? currentLineup.starters : [];
    
    // Auto-update lineup select option
    if (useLineupSelect && starters.length === 9) {
      useLineupSelect.value = 'current';
      useLineupSelect.innerHTML = `
        <option value="">自選球員</option>
        <option value="current" selected>使用目前先發名單 (${starters.length}人)</option>
      `;
    }
    
    // Update batting records
    const battingBody = container.querySelector('#battingRecordBody');
    if (battingBody) {
      battingBody.innerHTML = renderBattingRecordRows(players, starters);
    }
    
    // Update pitching records to show starting pitcher
    const pitchingBody = container.querySelector('#pitchingRecordBody');
    if (pitchingBody) {
      pitchingBody.innerHTML = renderPitchingRecordRows(players, starters);
    }
  };

  document.addEventListener('lineup:saved', lineupSavedHandler);
  
  // Store cleanup for the event listener
  container._lineupSavedHandler = lineupSavedHandler;

  // Real-time batting average calculation
  container.addEventListener('input', (e) => {
    if (e.target.classList.contains('stat-input') && (e.target.dataset.field === 'atBats' || e.target.dataset.field === 'hits')) {
      const row = e.target.closest('tr');
      if (row) {
        const atBats = parseInt(row.querySelector('[data-field="atBats"]').value) || 0;
        const hits = parseInt(row.querySelector('[data-field="hits"]').value) || 0;
        const avgCell = row.querySelector('.batting-average');
        if (avgCell) {
          avgCell.textContent = atBats > 0 ? (hits / atBats).toFixed(3) : '.000';
        }
      }
    }

    // Real-time ERA calculation
    if (e.target.classList.contains('stat-input') && (e.target.dataset.field === 'innings' || e.target.dataset.field === 'earnedRuns')) {
      const row = e.target.closest('tr');
      if (row) {
        const innings = parseFloat(row.querySelector('[data-field="innings"]').value) || 0;
        const earnedRuns = parseInt(row.querySelector('[data-field="earnedRuns"]').value) || 0;
        const eraCell = row.querySelector('.era');
        if (eraCell) {
          eraCell.textContent = innings > 0 ? (earnedRuns / innings * 9).toFixed(2) : '0.00';
        }
      }
    }
  });

  // Add pitcher button
  const addPitcherBtn = container.querySelector('#addPitcherBtn');
  if (addPitcherBtn) {
    addPitcherBtn.addEventListener('click', () => {
      const pitchingBody = container.querySelector('#pitchingRecordBody');
      if (pitchingBody) {
        const players = getPlayers();
        const pitchers = players.filter(p => p.position === '投手' || p.positions?.some(pos => pos.code === 'P'));
        const newRow = document.createElement('tr');
        newRow.dataset.pitcherType = 'relief';
        newRow.innerHTML = `
          <td>
            <select class="pitcher-select" data-field="player">
              <option value="">選擇投手</option>
              ${pitchers.map(p => `
                <option value="${p.id}">${p.name} #${p.number}</option>
              `).join('')}
            </select>
          </td>
          <td></td>
          <td>
            <select class="pitcher-type-select" data-field="pitcherType">
              <option value="starter">先發</option>
              <option value="relief" selected>牛棚</option>
            </select>
          </td>
          <td>
            <select class="relief-inning-select" data-field="reliefInning">
              <option value="">選擇局數</option>
              ${Array.from({length: 9}, (_, i) => `
                <option value="${i + 1}">第${i + 1}局</option>
              `).join('')}
            </select>
          </td>
          <td><input type="number" class="stat-input" data-field="innings" min="0" step="0.1" value="0"></td>
          <td><input type="number" class="stat-input" data-field="battersFaced" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="walks" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="earnedRuns" min="0" value="0"></td>
          <td>
            <select class="win-loss-select" data-field="winLoss">
              <option value="">無</option>
              <option value="W">勝</option>
              <option value="L">敗</option>
              <option value="S">救援</option>
              <option value="H">中繼</option>
            </select>
          </td>
          <td class="era">0.00</td>
          <td>
            <button type="button" class="btn-small remove-pitcher-btn">刪除</button>
          </td>
        `;
        pitchingBody.appendChild(newRow);
      }
    });
  }

  // Remove pitcher button handler
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-pitcher-btn')) {
      const row = e.target.closest('tr');
      if (row) {
        const pitcherType = row.dataset.pitcherType;
        if (pitcherType === 'starter') {
          alert('先發投手無法刪除，只能修改資料');
        } else {
          row.remove();
        }
      }
    }
  });

  // Add batting record button
  const addBattingRecordBtn = container.querySelector('#addBattingRecordBtn');
  if (addBattingRecordBtn) {
    addBattingRecordBtn.addEventListener('click', () => {
      const battingBody = container.querySelector('#battingRecordBody');
      if (battingBody) {
        const players = getPlayers();
        const currentRowCount = battingBody.querySelectorAll('tr').length;
        const newRow = document.createElement('tr');
        newRow.dataset.order = currentRowCount + 1;
        newRow.dataset.isStarter = 'false';
        newRow.innerHTML = `
          <td>${currentRowCount + 1}</td>
          <td>
            <select class="player-select" data-field="player">
              <option value="">選擇球員</option>
              ${players.map(p => `
                <option value="${p.id}">${p.name} #${p.number}</option>
              `).join('')}
            </select>
          </td>
          <td></td>
          <td>
            <select class="position-select" data-field="position">
              <option value="">選擇位置</option>
              <option value="P">投手</option>
              <option value="C">捕手</option>
              <option value="1B">一壘</option>
              <option value="2B">二壘</option>
              <option value="3B">三壘</option>
              <option value="SS">游擊</option>
              <option value="LF">左外</option>
              <option value="CF">中外</option>
              <option value="RF">右外</option>
              <option value="DH">指定打擊</option>
            </select>
          </td>
          <td>
            <select class="replacement-select" data-field="replacement">
              <option value="">無替換</option>
              <option value="substitute-batting">代打</option>
              <option value="substitute-running">代跑</option>
              <option value="defensive-replacement">守備替換</option>
              <option value="injury">受傷退場</option>
            </select>
          </td>
          <td><input type="number" class="stat-input" data-field="atBats" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="rbi" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="runs" min="0" value="0"></td>
          <td class="batting-average">.000</td>
          ${Array.from({length: 9}, (_, i) => `
            <td><input type="text" class="inning-input" data-inning="${i + 1}" placeholder="輸入結果"></td>
          `).join('')}
          <td>
            <button type="button" class="btn-small remove-row-btn">刪除</button>
          </td>
        `;
        battingBody.appendChild(newRow);
      }
    });
  }

  // Remove row button handlers
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-row-btn')) {
      const row = e.target.closest('tr');
      if (row && row.dataset.isStarter !== 'true') {
        row.remove();
        // Reorder batting order numbers
        container.querySelectorAll('#battingRecordBody tr').forEach((tr, index) => {
          tr.dataset.order = index + 1;
          tr.querySelector('td:first-child').textContent = index + 1;
        });
      } else {
        alert('先發球員無法刪除，只能修改資料');
      }
    }
  });

  // Save game record
  const saveBtn = container.querySelector('#saveGameRecordBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveGameRecord(container);
    });
  }

  // Clear game record
  const clearBtn = container.querySelector('#clearGameRecordBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('確定要清除所有比賽紀錄嗎？此操作無法復原。')) {
        clearGameRecordForm(container);
      }
    });
  }
}

function saveGameRecord(container) {
  const data = loadData();
  
  // Get game info
  const gameDate = container.querySelector('#gameDate').value;
  const opponent = container.querySelector('#opponent').value;
  const venue = container.querySelector('#venue').value;

  // Get batting records
  const battingRecords = [];
  container.querySelectorAll('#battingRecordBody tr').forEach(row => {
    const playerId = row.dataset.playerId;
    const order = parseInt(row.dataset.order);
    const isStarter = row.dataset.isStarter === 'true';
    const playerSelect = row.querySelector('.player-select');
    const selectedPlayerId = playerSelect ? playerSelect.value : playerId;
    const positionSelect = row.querySelector('.position-select');
    const position = positionSelect ? positionSelect.value : (row.querySelector('td:nth-child(4)').textContent || '');
    const replacementSelect = row.querySelector('.replacement-select');
    const replacement = replacementSelect ? replacementSelect.value : '';
    
    if (selectedPlayerId) {
      battingRecords.push({
        playerId: selectedPlayerId,
        order: order,
        position: position,
        isStarter: isStarter,
        replacement: replacement,
        atBats: parseInt(row.querySelector('[data-field="atBats"]').value) || 0,
        hits: parseInt(row.querySelector('[data-field="hits"]').value) || 0,
        rbi: parseInt(row.querySelector('[data-field="rbi"]').value) || 0,
        runs: parseInt(row.querySelector('[data-field="runs"]').value) || 0,
        innings: {}
      });
      
      // Get inning results
      row.querySelectorAll('.inning-input').forEach(input => {
        const inning = input.dataset.inning;
        battingRecords[battingRecords.length - 1].innings[inning] = input.value;
      });
    }
  });

  // Get pitching records
  const pitchingRecords = [];
  container.querySelectorAll('#pitchingRecordBody tr').forEach(row => {
    const playerId = row.dataset.playerId;
    const pitcherSelect = row.querySelector('.pitcher-select');
    const selectedPlayerId = pitcherSelect ? pitcherSelect.value : playerId;
    const pitcherTypeSelect = row.querySelector('.pitcher-type-select');
    const pitcherType = pitcherTypeSelect ? pitcherTypeSelect.value : 'starter';
    const reliefInningSelect = row.querySelector('.relief-inning-select');
    const reliefInning = reliefInningSelect ? reliefInningSelect.value : '';
    
    if (selectedPlayerId) {
      pitchingRecords.push({
        playerId: selectedPlayerId,
        pitcherType: pitcherType,
        reliefInning: reliefInning,
        innings: parseFloat(row.querySelector('[data-field="innings"]').value) || 0,
        battersFaced: parseInt(row.querySelector('[data-field="battersFaced"]').value) || 0,
        hits: parseInt(row.querySelector('[data-field="hits"]').value) || 0,
        strikeouts: parseInt(row.querySelector('[data-field="strikeouts"]').value) || 0,
        walks: parseInt(row.querySelector('[data-field="walks"]').value) || 0,
        earnedRuns: parseInt(row.querySelector('[data-field="earnedRuns"]').value) || 0,
        winLoss: row.querySelector('.win-loss-select').value
      });
    }
  });

  // Get inning records
  const inningRecords = {};
  container.querySelectorAll('#inningRecordBody tr').forEach(row => {
    const inning = row.dataset.inning;
    inningRecords[inning] = {
      hits: parseInt(row.querySelector('[data-field="hits"]').value) || 0,
      walks: parseInt(row.querySelector('[data-field="walks"]').value) || 0,
      errors: parseInt(row.querySelector('[data-field="errors"]').value) || 0,
      runs: parseInt(row.querySelector('[data-field="runs"]').value) || 0,
      pitches: parseInt(row.querySelector('[data-field="pitches"]').value) || 0
    };
  });

  // Create game record
  const gameRecord = {
    id: Date.now(),
    date: gameDate,
    opponent: opponent,
    venue: venue,
    battingRecords: battingRecords,
    pitchingRecords: pitchingRecords,
    inningRecords: inningRecords,
    createdAt: new Date().toISOString()
  };

  // Save to data
  if (!Array.isArray(data.gameRecords)) {
    data.gameRecords = [];
  }
  data.gameRecords.push(gameRecord);
  saveData(data);

  alert('比賽紀錄已儲存！');
}

function clearGameRecordForm(container) {
  // Reset all inputs
  container.querySelectorAll('input').forEach(input => {
    if (input.type === 'number') {
      input.value = '0';
    } else {
      input.value = '';
    }
  });
  
  container.querySelectorAll('select').forEach(select => {
    select.selectedIndex = 0;
  });
  
  // Reset batting averages
  container.querySelectorAll('.batting-average').forEach(cell => {
    cell.textContent = '.000';
  });
  
  // Reset ERAs
  container.querySelectorAll('.era').forEach(cell => {
    cell.textContent = '0.00';
  });
  
  // Re-render pitching body to show starting pitcher again
  const useLineupSelect = container.querySelector('#useLineup');
  if (useLineupSelect && useLineupSelect.value === 'current') {
    const currentLineup = getCurrentLineup();
    const players = getPlayers();
    const starters = currentLineup && Array.isArray(currentLineup.starters) ? currentLineup.starters : [];
    
    const pitchingBody = container.querySelector('#pitchingRecordBody');
    if (pitchingBody) {
      pitchingBody.innerHTML = renderPitchingRecordRows(players, starters);
    }
  }
}
import { getCurrentGame, changeScore, advanceInning, endGame } from './gameManager.js';

export function renderLiveScore(container) {
  const game = getCurrentGame();

  if (typeof container._liveScoreCleanup === 'function') container._liveScoreCleanup();

  if (!game) {
    container.innerHTML = `<section class="live-score empty"><div>⚾</div><h3>尚未建立比賽</h3><p>建立比賽後，即可在此記錄即時比分。</p></section>`;
    return;
  }

  const venue = game.homeAway === 'away' ? '客場' : '主場';
  const isCompleted = game.status === 'completed';
  
  // 根據主客場決定計分顯示順序：客場在前，主場在後
  const isHome = game.homeAway === 'home';
  const firstTeam = isHome ? 'opponent' : 'us';
  const secondTeam = isHome ? 'us' : 'opponent';
  const firstTeamName = isHome ? game.opponent : '我方';
  const secondTeamName = isHome ? '我方' : game.opponent;
  const firstTeamScore = isHome ? game.score.opponent : game.score.us;
  const secondTeamScore = isHome ? game.score.us : game.score.opponent;
  
  container.innerHTML = `
    <section class="live-score ${isCompleted ? 'completed' : ''}">
      <div class="live-score-header"><div><p class="eyebrow">${isCompleted ? 'FINAL SCORE' : 'LIVE SCORE'}</p><h3>vs. ${game.opponent}</h3><p>${game.date} · ${venue}</p></div><span class="inning-badge">${isCompleted ? '比賽結束' : `第 ${game.inning} 局`}</span></div>
      <div class="score-grid">
        <div class="score-team"><span>${firstTeamName}</span><strong>${firstTeamScore}</strong><div>${!isCompleted ? `<button type="button" data-team="${firstTeam}" data-change="-1" aria-label="${firstTeamName}減 1 分">−</button><button type="button" data-team="${firstTeam}" data-change="1" aria-label="${firstTeamName}加 1 分">＋</button>` : ''}</div></div>
        <div class="score-divider">:</div>
        <div class="score-team"><span>${secondTeamName}</span><strong>${secondTeamScore}</strong><div>${!isCompleted ? `<button type="button" data-team="${secondTeam}" data-change="-1" aria-label="${secondTeamName}減 1 分">−</button><button type="button" data-team="${secondTeam}" data-change="1" aria-label="${secondTeamName}加 1 分">＋</button>` : ''}</div></div>
      </div>
      <div class="live-score-actions">
        ${!isCompleted ? `
          <button type="button" id="nextInningBtn">下一局 →</button>
          <button type="button" id="endGameBtn" class="end-game-btn">結束比賽</button>
        ` : `
          <button type="button" id="newGameBtn" class="new-game-btn">建立新比賽</button>
        `}
      </div>
    </section>
  `;

  const scoreHandler = event => {
    const button = event.target.closest('[data-team]');
    if (button) changeScore(button.dataset.team, Number(button.dataset.change));
  };
  
  const inningButton = container.querySelector('#nextInningBtn');
  const endGameButton = container.querySelector('#endGameBtn');
  const newGameButton = container.querySelector('#newGameBtn');
  
  const handleEndGame = () => {
    if (confirm('確定要結束這場比賽嗎？結束後將無法再修改比分。')) {
      endGame();
    }
  };
  
  const handleNewGame = () => {
    // Instead of reloading, just clear the game form and show empty state
    // This allows user to create a new game immediately
    container.innerHTML = `<section class="live-score empty"><div>⚾</div><h3>建立新比賽</h3><p>請在上方的表單中輸入對手名稱來建立新比賽。</p></section>`;
  };
  
  container.addEventListener('click', scoreHandler);
  
  if (inningButton) {
    inningButton.addEventListener('click', advanceInning);
  }
  
  if (endGameButton) {
    endGameButton.addEventListener('click', handleEndGame);
  }
  
  if (newGameButton) {
    newGameButton.addEventListener('click', handleNewGame);
  }
  
  container._liveScoreCleanup = () => {
    container.removeEventListener('click', scoreHandler);
    if (inningButton) inningButton.removeEventListener('click', advanceInning);
    if (endGameButton) endGameButton.removeEventListener('click', handleEndGame);
    if (newGameButton) newGameButton.removeEventListener('click', handleNewGame);
    container._liveScoreCleanup = null;
  };
}

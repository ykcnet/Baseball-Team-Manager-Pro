import { addGame, getCurrentGame } from './gameManager.js';

export function renderGameForm(container) {
  const currentGame = getCurrentGame();
  const showForm = !currentGame || currentGame.status === 'completed';
  
  if (!showForm) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <section class="game-form-card">
      <div class="game-form-header">
        <div>
          <h3>建立比賽</h3>
          <p>設定對手與比賽場地後，即可開始記錄比分。</p>
        </div>
      </div>
      <div class="game-form-fields">
        <label for="opponent">對手
          <input id="opponent" placeholder="例如：台北猛虎隊" maxlength="50">
        </label>
        <label for="gameDate">比賽日期
          <input id="gameDate" type="date" value="${new Date().toISOString().slice(0, 10)}">
        </label>
        <label for="homeAway">場地
          <select id="homeAway"><option value="home">主場</option><option value="away">客場</option></select>
        </label>
      </div>
      <div id="gameFormMessage" class="game-form-message" role="status"></div>
      <div class="game-form-actions"><button type="button" id="createGameBtn">⚾ 建立比賽</button></div>
    </section>
  `;

  container.querySelector('#createGameBtn').onclick = () => {
    const opponent = container.querySelector('#opponent').value.trim();
    const message = container.querySelector('#gameFormMessage');
    if (!opponent) {
      message.textContent = '請先輸入對手名稱。';
      message.className = 'game-form-message error';
      return;
    }

    addGame({
      opponent,
      date: container.querySelector('#gameDate').value,
      homeAway: container.querySelector('#homeAway').value
    });

    message.textContent = `已建立對 ${opponent} 的比賽。`;
    message.className = 'game-form-message success';
    
    // Clear the form after successful creation
    setTimeout(() => {
      container.querySelector('#opponent').value = '';
      container.querySelector('#gameDate').value = new Date().toISOString().slice(0, 10);
      container.querySelector('#homeAway').value = 'home';
    }, 1000);
  };
}

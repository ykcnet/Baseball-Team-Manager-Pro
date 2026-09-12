export function createPlayerCard(player) {
  const status = player.injured
    ? '傷兵'
    : player.suspended
      ? '禁賽'
      : '可出賽';

  const positionsDisplay = Array.isArray(player.positions) && player.positions.length > 0
    ? player.positions.map(p => `${p.code}${typeof p.rating === 'number' ? `(${p.rating})` : ''}`).join(', ')
    : (player.position || '');

  const overall = typeof player.rating === 'number' && player.rating > 0
    ? `<p>評分：${player.rating}</p>`
    : '';

  return `
    <div class="player-card">
      <h3>#${player.number} ${player.name}</h3>
      <p>位置：${positionsDisplay}</p>
      ${overall}
      <p>狀態：${status}</p>
    </div>
  `;
}

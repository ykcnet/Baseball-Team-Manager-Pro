import { createGame } from './gameModel.js';
import { getGames, saveGames } from './gameService.js';

export function addGame(data) {
  const games = [...getGames()];
  const game = createGame(data);
  games.push(game);
  saveGames(games);
  window.dispatchEvent(new CustomEvent('game:created', { detail: { game } }));
  return game;
}

export function getCurrentGame() {
  const games = getGames();
  // Get the last in-progress game, or the last game if none are in progress
  const inProgressGame = games.filter(g => g.status === 'in-progress').at(-1);
  return inProgressGame || games.at(-1) || null;
}

export function updateCurrentGame(changes) {
  const games = [...getGames()];
  const current = games.at(-1);

  if (!current) return null;

  const game = { ...current, ...changes, updatedAt: new Date().toISOString() };
  games[games.length - 1] = game;
  saveGames(games);
  window.dispatchEvent(new CustomEvent('game:updated', { detail: { game } }));
  return game;
}

export function changeScore(team, amount) {
  const current = getCurrentGame();
  if (!current || !['us', 'opponent'].includes(team)) return null;

  return updateCurrentGame({
    score: {
      ...current.score,
      [team]: Math.max(0, Number(current.score?.[team] || 0) + amount)
    }
  });
}

export function advanceInning() {
  const current = getCurrentGame();
  if (!current) return null;
  return updateCurrentGame({ inning: Number(current.inning || 1) + 1 });
}

export function endGame() {
  const current = getCurrentGame();
  if (!current) return null;
  return updateCurrentGame({ status: 'completed' });
}

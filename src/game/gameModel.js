export function createGame(data = {}) {
  return {
    id: crypto.randomUUID(),
    opponent: data.opponent || '',
    date: data.date || new Date().toISOString().slice(0,10),
    homeAway: data.homeAway || 'home',
    score: { us: 0, opponent: 0 },
    inning: 1,
    status: 'in-progress' // 'in-progress' or 'completed'
  };
}

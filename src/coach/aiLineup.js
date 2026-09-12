import { optimizeBattingOrder } from './battingOrderAI.js';

export function suggestLineup(players = []) {
  // Use batting order optimizer which weights position ratings and skills
  return optimizeBattingOrder(players);
}

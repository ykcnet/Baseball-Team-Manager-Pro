export function suggestDefense(players = []) {
  const fieldPositions = ['P','C','1B','2B','3B','SS','LF','CF','RF'];
  const availablePlayers = players.filter(p => !p.injured && !p.suspended);
  
  // For each position, find the best available player
  const defense = [];
  const usedPlayerIds = new Set();
  
  for (const position of fieldPositions) {
    let bestPlayer = null;
    let bestRating = -1;
    
    for (const player of availablePlayers) {
      if (usedPlayerIds.has(player.id)) continue;
      
      // Find player's rating for this position
      const positionData = player.positions?.find(p => p.code === position);
      const rating = positionData?.rating || 0;
      
      if (rating > bestRating && rating > 0) {
        bestRating = rating;
        bestPlayer = player;
      }
    }
    
    if (bestPlayer) {
      defense.push({
        player: bestPlayer,
        position: position
      });
      usedPlayerIds.add(bestPlayer.id);
    } else {
      // If no player has rating for this position, assign available player with lowest overall position skill
      const fallbackPlayer = availablePlayers.find(p => !usedPlayerIds.has(p.id));
      if (fallbackPlayer) {
        defense.push({
          player: fallbackPlayer,
          position: position
        });
        usedPlayerIds.add(fallbackPlayer.id);
      }
    }
  }
  
  return defense;
}

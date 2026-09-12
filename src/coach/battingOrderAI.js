export function optimizeBattingOrder(players = []) {
  return [...players]
    .filter(player => !player.injured && !player.suspended)
    .map(player => {
      // Calculate overall position rating
      const positionRating = player.positions && player.positions.length > 0
        ? player.positions.reduce((sum, pos) => sum + (pos.rating || 0), 0) / player.positions.length
        : 0;
      
      // Add position rating to the score
      const existingScore = (player.contact || 0) + (player.power || 0) + (player.speed || 0);
      return {
        ...player,
        overallScore: existingScore + (positionRating * 2) // Position rating weighted
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 9)
    .map(({ overallScore, ...player }) => player); // Remove the temporary score
}

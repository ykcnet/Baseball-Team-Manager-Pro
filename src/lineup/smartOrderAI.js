// ============================================================
// Baseball Team Manager Pro
// Smart Order AI - Fixed Version
//
// 修復位置重複問題的改進版本
// ============================================================

import {
    getAvailablePlayers
} from './availablePlayers.js';

// ============================================================
// Player ID
// ============================================================

function getPlayerId(player) {
    return (
        player?.id ??
        player?.playerId ??
        ''
    );
}

// ============================================================
// Player Name
// ============================================================

function getPlayerName(player) {
    return (
        player?.name ??
        player?.playerName ??
        ''
    );
}

// ============================================================
// Player Number
// ============================================================

function getPlayerNumber(player) {
    return (
        player?.number ??
        player?.jerseyNumber ??
        ''
    );
}

// ============================================================
// 取得球員可用位置及評分
// ============================================================

function getPlayerPositions(player) {
    if (
        Array.isArray(
            player?.positions
        ) &&
        player.positions.length > 0
    ) {
        return player.positions
            .map(p => ({
                code: p.code,
                rating: p.rating || 0
            }))
            .filter(p => !!p.code && p.rating > 0);
    }

    const pos = player?.position ?? '';
    return pos ? [{ code: pos, rating: 3 }] : [];
}

// ============================================================
// 基礎球員分數（包含守備評分）
// ============================================================

function getBasicPlayerScore(player) {
    let score = 0;

    if (getPlayerId(player)) {
        score += 10;
    }

    if (getPlayerName(player).trim()) {
        score += 5;
    }

    if (String(getPlayerNumber(player)).trim()) {
        score += 2;
    }

    if (player?.position) {
        score += 1;
    }

    // Add position ratings to the score
    const positions = getPlayerPositions(player);
    const avgRating = positions.length > 0 
        ? positions.reduce((sum, p) => sum + p.rating, 0) / positions.length 
        : 0;
    
    score += avgRating * 3; // Weight position ratings

    // Add batting statistics influence from game records
    if (player.stats) {
        // Batting average influence (0-100 scale converted to 0-10 score)
        const battingAverage = parseFloat(player.stats.battingAverage) || 0;
        score += battingAverage * 10; // Higher batting average = higher score
        
        // Strikeouts penalty (fewer strikeouts = better)
        const strikeouts = player.stats.strikeouts || 0;
        const atBats = player.stats.atBats || 1;
        const strikeoutRate = strikeouts / atBats;
        score -= strikeoutRate * 5; // Penalty for high strikeout rate
        
        // Walks bonus (more walks = better)
        const walks = player.stats.walks || 0;
        const walkRate = walks / atBats;
        score += walkRate * 3; // Bonus for high walk rate
        
        // Stolen bases bonus
        const stolenBases = player.stats.stolenBases || 0;
        score += stolenBases * 0.5; // Small bonus for stolen bases
    }

    return score;
}

// ============================================================
// 球員排序
// ============================================================

function sortPlayers(players = []) {
    return [...players].sort((a, b) => {
        const scoreA = getBasicPlayerScore(a);
        const scoreB = getBasicPlayerScore(b);

        if (scoreA !== scoreB) {
            return scoreB - scoreA;
        }

        const nameA = getPlayerName(a);
        const nameB = getPlayerName(b);
        return nameA.localeCompare(nameB, 'zh-Hant');
    });
}

// ============================================================
// 建立 AI 先發（修復位置重複版本）
//
// 使用改進的演算法確保每個位置只分配給一個球員：
// 1. 為每個位置尋找評分最高的球員
// 2. 確保每個球員只分配到一個位置
// 3. 如遇重複位置，評分次等的球員遞補到其他位置
// 4. 按位置重要性排序
// 5. 根據球員的適合棒次調整最終棒次順序
// ============================================================

export function generateSmartOrder(players = []) {

    if (!Array.isArray(players)) {
        return [];
    }

    const available = getAvailablePlayers(players);
    console.log('📊 Available players:', available.length);
    
    // 過濾出有設定適合棒次的球員
    const playersWithBattingOrders = available.filter(p => 
        p.battingOrders && p.battingOrders.length > 0
    );
    
    console.log('🎯 Players with batting orders:', playersWithBattingOrders.length);
    console.log('🎯 Players with batting orders details:', playersWithBattingOrders.map(p => ({
        id: p.id,
        name: p.name,
        battingOrders: p.battingOrders
    })));
    
    // 如果有球員有適合棒次但不足9人，回傳空陣容
    if (playersWithBattingOrders.length < 9) {
        console.log('❌ Not enough players with batting orders:', playersWithBattingOrders.length);
        return [];
    }
    
    const sorted = sortPlayers(playersWithBattingOrders);

    // 所有可能的位置（按重要性排序）
    const allPositions = [
        'P',   // 投手最重要
        'C',   // 捕手第二重要
        'SS',  // 游擊手
        'CF',  // 中外野
        '1B',  // 一壘手
        '3B',  // 三壘手
        '2B',  // 二壘手
        'RF',  // 右外野
        'LF',  // 左外野
        'DH'   // 指定打擊
    ];

    // 第一步：為每個位置尋找評分最高的球員（初始分配）
    const positionCandidates = {}; // position -> {player, rating, score}
    
    for (const position of allPositions) {
        let bestPlayer = null;
        let bestRating = -1;
        let bestScore = -1;

        for (const player of sorted) {
            const positions = getPlayerPositions(player);
            const positionData = positions.find(p => p.code === position);
            
            if (positionData && positionData.rating > 0) {
                const playerScore = getBasicPlayerScore(player);
                
                if (positionData.rating > bestRating || 
                    (positionData.rating === bestRating && playerScore > bestScore)) {
                    bestPlayer = player;
                    bestRating = positionData.rating;
                    bestScore = playerScore;
                }
            }
        }

        if (bestPlayer) {
            positionCandidates[position] = {
                player: bestPlayer,
                rating: bestRating,
                score: bestScore
            };
        }
    }

    // 第二步：處理衝突 - 如果一個球員被多個位置選中，保留評分最高的位置
    const playerAssignments = {}; // playerId -> position
    const finalPositions = {};    // position -> playerId

    // 按位置重要性排序處理
    for (const position of allPositions) {
        const candidate = positionCandidates[position];
        if (!candidate) continue;

        const playerId = getPlayerId(candidate.player);
        
        // 檢查這個球員是否已經被分配到其他位置
        if (playerAssignments[playerId]) {
            const existingPosition = playerAssignments[playerId];
            const existingCandidate = positionCandidates[existingPosition];
            
            // 比較哪個位置的評分更高
            if (candidate.rating > existingCandidate.rating) {
                // 新位置的評分更高，將球員移到新位置
                delete finalPositions[existingPosition];
                finalPositions[position] = playerId;
                playerAssignments[playerId] = position;
            } else {
                // 保留原位置，跳過新位置
            }
        } else {
            // 球員還沒被分配，直接分配
            finalPositions[position] = playerId;
            playerAssignments[playerId] = position;
        }
    }

    // 第三步：為未分配的位置尋找遞補球員
    const usedPlayerIds = new Set(Object.values(finalPositions));
    const usedPositions = new Set(Object.keys(finalPositions));
    
    for (const position of allPositions) {
        if (usedPositions.has(position)) continue;

        // 尋找還沒被分配的球員中，能守這個位置且評分最高的
        let bestPlayer = null;
        let bestRating = -1;

        for (const player of sorted) {
            const playerId = getPlayerId(player);
            if (usedPlayerIds.has(playerId)) continue;

            const positions = getPlayerPositions(player);
            const positionData = positions.find(p => p.code === position);
            
            if (positionData && positionData.rating > 0) {
                if (positionData.rating > bestRating) {
                    bestPlayer = player;
                    bestRating = positionData.rating;
                }
            }
        }

        if (bestPlayer) {
            const playerId = getPlayerId(bestPlayer);
            finalPositions[position] = playerId;
            usedPlayerIds.add(playerId);
            usedPositions.add(position);
        }
    }

    // 第四步：如果還不夠9人，用剩餘球員填補任意位置
    if (Object.keys(finalPositions).length < 9) {
        
        const remainingPositions = allPositions.filter(pos => !usedPositions.has(pos));
        
        for (const player of sorted) {
            const playerId = getPlayerId(player);
            if (usedPlayerIds.has(playerId)) continue;
            if (remainingPositions.length === 0) break;

            const positions = getPlayerPositions(player);
            // 尋找球員能守的未分配位置
            const availablePosition = positions.find(p => remainingPositions.includes(p.code));

            if (availablePosition) {
                const position = availablePosition.code;
                finalPositions[position] = playerId;
                usedPlayerIds.add(playerId);
                usedPositions.add(position);
                remainingPositions.splice(remainingPositions.indexOf(position), 1);
            }
        }
    }

    // 轉換為標準格式
    const lineupOrder = [];
    for (const position of allPositions) {
        if (finalPositions[position]) {
            lineupOrder.push({
                playerId: finalPositions[position],
                position: position
            });
        }
    }

    // 不足 9 人則回傳空
    if (lineupOrder.length < 9) {
        return [];
    }

    // 最終驗證：確保沒有重複位置
    const positionCounts = {};
    lineupOrder.forEach(item => {
        positionCounts[item.position] = (positionCounts[item.position] || 0) + 1;
    });
    
    const duplicates = Object.entries(positionCounts).filter(([pos, count]) => count > 1);
    if (duplicates.length > 0) {
        return [];
    }

    // 第五步：根據球員的適合棒次調整最終棒次順序
    const battingOrderSlots = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const assignedBattingOrderSlots = new Set();
    const assignedPlayerIds = new Set();
    
    console.log('🔄 Step 5: Assigning batting orders based on player preferences');
    
    // 先創建一個球員到位置的映射
    const playerToPosition = {};
    lineupOrder.forEach(item => {
        playerToPosition[item.playerId] = item.position;
    });
    
    // 為每個棒次尋找最合適的球員
    const finalResult = [];
    
    for (const slot of battingOrderSlots) {
        let bestPlayer = null;
        let bestPlayerId = null;
        
        // 遍歷所有球員，找到最適合當前棒次的球員
        for (const item of lineupOrder) {
            const playerId = item.playerId;
            const player = sorted.find(p => String(getPlayerId(p)) === String(playerId));
            
            if (!player || !player.battingOrders || player.battingOrders.length === 0) {
                continue;
            }
            
            // 檢查球員是否適合當前棒次
            if (!player.battingOrders.some(bo => bo.code === slot)) {
                continue;
            }
            
            // 檢查球員是否已被分配到其他棒次
            if (assignedPlayerIds.has(playerId)) {
                continue;
            }
            
            // 如果當前是最好的選擇（優先考慮守備評分高的球員）
            if (!bestPlayer || getBasicPlayerScore(player) > getBasicPlayerScore(bestPlayer)) {
                bestPlayer = player;
                bestPlayerId = playerId;
            }
        }
        
        if (bestPlayer && bestPlayerId) {
            const position = playerToPosition[bestPlayerId];
            assignedBattingOrderSlots.add(slot);
            assignedPlayerIds.add(bestPlayerId);
            finalResult.push({
                playerId: bestPlayerId,
                battingOrder: parseInt(slot),
                order: parseInt(slot),
                position: position
            });
            console.log(`    ✅ Batting order ${slot}: Player ${bestPlayer.name} (position: ${position})`);
        } else {
            console.log(`    ❌ No suitable player found for batting order ${slot}`);
        }
    }
    
    // 如果還有球員沒有分配到棒次，按順序分配
    const remainingPlayers = lineupOrder.filter(item => !assignedPlayerIds.has(item.playerId));
    
    for (const item of remainingPlayers) {
        const playerId = item.playerId;
        const player = sorted.find(p => String(getPlayerId(p)) === String(playerId));
        
        // 找到下一個未分配的棒次
        let nextSlot = 1;
        while (assignedBattingOrderSlots.has(String(nextSlot))) {
            nextSlot++;
            if (nextSlot > 9) nextSlot = 1;
        }
        
        assignedBattingOrderSlots.add(String(nextSlot));
        assignedPlayerIds.add(playerId);
        
        finalResult.push({
            playerId: playerId,
            battingOrder: nextSlot,
            order: nextSlot,
            position: item.position
        });
        console.log(`    � Fallback: Player ${player.name} assigned to batting order ${nextSlot}`);
    }
    
    // 按棒次順序排序最終結果
    const sortedByBattingOrder = finalResult.sort((a, b) => a.battingOrder - b.battingOrder);
    console.log('📋 Final batting order assignment:', sortedByBattingOrder.map(r => ({ battingOrder: r.battingOrder, position: r.position })));
    
    return sortedByBattingOrder;
}


// ============================================================
// Default Export
// ============================================================

export default {
    generateSmartOrder
};
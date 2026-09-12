// ============================================================
// Baseball Team Manager Pro
// Smart Order AI
//
// Final Version
//
// 輸出標準 Lineup Starter 格式：
//
// {
//     playerId: "...",
//     battingOrder: 1,
//     order: 1,
//     position: "P"
// }
//
// 功能：
// - 排除受傷球員
// - 排除停賽球員
// - 排除重複球員
// - 最多產生 9 名先發
// - 自動產生 1～9 棒
// - 不將完整 player object 寫入 Lineup
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
// Player Position
// ============================================================

function getPlayerPosition(player) {

    return (
        player?.position ??
        ''
    );

}


// ============================================================
// 基礎球員分數
// ============================================================

function getBasicPlayerScore(player) {

    let score = 0;


    if (
        getPlayerId(player)
    ) {

        score += 10;

    }


    if (
        getPlayerName(player).trim()
    ) {

        score += 5;

    }


    if (
        String(
            getPlayerNumber(player)
        ).trim()
    ) {

        score += 2;

    }


    if (
        getPlayerPosition(player)
    ) {

        score += 1;

    }

    // Add position ratings to the score
    const positions = getPlayerPositions(player);
    const avgRating = positions.length > 0 
        ? positions.reduce((sum, p) => sum + p.rating, 0) / positions.length 
        : 0;
    
    score += avgRating * 3; // Weight position ratings

    return score;

}


// ============================================================
// 球員排序
// ============================================================

function sortPlayers(players = []) {

    return [...players].sort(
        (
            a,
            b
        ) => {

            const scoreA =
                getBasicPlayerScore(a);

            const scoreB =
                getBasicPlayerScore(b);


            if (
                scoreA !== scoreB
            ) {

                return scoreB - scoreA;

            }


            const nameA =
                getPlayerName(a);

            const nameB =
                getPlayerName(b);


            return nameA.localeCompare(
                nameB,
                'zh-Hant'
            );

        }
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


    const pos =
        getPlayerPosition(
            player
        );


    return pos ? [{ code: pos, rating: 3 }] : []; // Default rating for old format

}


// ============================================================
// 建立 AI 先發（改進版本）
//
// 使用貪心演算法避免位置重複：
// 1. 按評分排序所有可用球員
// 2. 依序分配球員到缺的位置
// 3. 多位置球員優先填補缺的位置
// 4. 單位置球員只能填對應位置
// ============================================================

export function generateSmartOrder(
    players = []
) {

    console.log('🤖 generateSmartOrder called with players:', players.length);

    if (
        !Array.isArray(players)
    ) {

        return [];

    }


    const available =
        getAvailablePlayers(
            players
        );

    console.log('✅ Available players:', available.length);

    const sorted =
        sortPlayers(
            available
        );

    console.log('📊 Sorted players:', sorted.length);


    // ========================================================
    // 所有可能的位置（按重要性排序）
    // ========================================================

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


    // ========================================================
    // 追蹤已分配的位置和球員
    // ========================================================

    const usedPositions =
        new Set();

    const usedPlayerIds =
        new Set();

    const lineupOrder = [];


    // ========================================================
    // 貪心演算法：按評分排序，依序分配
    // ========================================================

    for (
        const player of sorted
    ) {

        const playerId =
            getPlayerId(
                player
            );

        console.log(`  🔄 Processing: #${getPlayerNumber(player)} ${getPlayerName(player)}`);

        if (
            usedPlayerIds.has(
                playerId
            )
        ) {

            console.log(`    ⏭️  Already used, skipping`);
            continue;

        }


        const positions =
            getPlayerPositions(
                player
            );

        console.log(`    📌 Available positions: ${positions.map(p => `${p.code}(${p.rating})`).join(', ')}`);

        if (
            positions.length === 0
        ) {

            console.log(`    ⏭️  No positions available, skipping`);
            continue;

        }


        // ====================================================
        // 優先分配到缺少的位置（基於評分和重要性）
        // ====================================================

        let assignedPosition =
            null;
        let bestRating = -1;
        let bestPriority = Infinity;


        // 優先級 1: 尋找缺少、評分最高且最重要的位置
        for (
            const pos of positions
        ) {

            if (
                !usedPositions.has(
                    pos.code
                )
            ) {
                const priority = allPositions.indexOf(pos.code);
                
                // Choose position with better rating, or same rating but higher priority
                if (pos.rating > bestRating || 
                    (pos.rating === bestRating && priority < bestPriority)) {
                    
                    assignedPosition = pos.code;
                    bestRating = pos.rating;
                    bestPriority = priority;
                }

            }

        }

        if (assignedPosition) {
            console.log(`    ✅ Assigned to: ${assignedPosition} (rating: ${bestRating}, priority: ${bestPriority})`);
        }


        // 優先級 2: 如果所有位置都被占用
        // 則跳過該球員（不能重複分配位置）
        if (
            !assignedPosition
        ) {

            console.log(`    ⏭️  No available positions, skipping player`);
            continue;

        }


        // ====================================================
        // 記錄分配
        // ====================================================

        usedPositions.add(
            assignedPosition
        );

        usedPlayerIds.add(
            playerId
        );

        lineupOrder.push({

            playerId,

            position:
                assignedPosition

        });

        console.log(`    📍 Used positions so far: ${Array.from(usedPositions).join(', ')}`);

        // ====================================================
        // 達到 9 人停止
        // ====================================================

        if (
            lineupOrder.length >= 9
        ) {

            console.log(`    ✋ Reached 9 players, stopping`);
            break;

        }

    }


    // ========================================================
    // 不足 9 人則回傳空
    // ========================================================

    if (
        lineupOrder.length < 9
    ) {

        return [];

    }


    // ========================================================
    // 轉換為標準格式
    // ========================================================

    const result = lineupOrder.map(
        (
            item,
            index
        ) => ({

            playerId:
                item.playerId,

            battingOrder:
                index + 1,

            order:
                index + 1,

            position:
                item.position

        })
    );

    console.log('🎯 Final lineup result:', result.length, 'players');
    console.log('📍 Positions assigned:', result.map(r => r.position).join(', '));

    return result;

}


// ============================================================
// 相容舊 API
// ============================================================

export function buildSmartOrder(
    players = []
) {

    return generateSmartOrder(
        players
    );

}


// ============================================================
// Assign Batting Order
// ============================================================

export function assignBattingOrder(
    players = []
) {

    return generateSmartOrder(
        players
    );

}


// ============================================================
// Assign Positions
// ============================================================

export function assignPositions(
    players = []
) {

    if (
        !Array.isArray(players)
    ) {

        return [];

    }


    return players.map(
        player => ({

            playerId:
                getPlayerId(
                    player
                ),

            position:
                getPlayerPosition(
                    player
                )

        })
    );

}


// ============================================================
// Batting Order Score
// ============================================================

export function getBattingOrderScore(
    player,
    order = 1
) {

    const base =
        getBasicPlayerScore(
            player
        );


    const numericOrder =
        Number(order);


    const orderBonus =
        Number.isFinite(
            numericOrder
        )
            ? Math.max(
                0,
                10 - numericOrder
            )
            : 0;


    return (
        base +
        orderBonus
    );

}


// ============================================================
// Role Score
// ============================================================

export function getRoleScore(
    player,
    role = ''
) {

    return getBasicPlayerScore(
        player
    );

}


// ============================================================
// Position Score
// ============================================================

export function getPlayerPositionScore(
    player,
    position = ''
) {

    if (
        !player ||
        !position
    ) {

        return 0;

    }


    return String(
        getPlayerPosition(player)
    ).toLowerCase() ===
        String(position).toLowerCase()
            ? 10
            : 0;

}


// ============================================================
// Smart Order Summary
// ============================================================

export function getSmartOrderSummary(
    players = []
) {

    const order =
        generateSmartOrder(
            players
        );


    return {

        count:
            order.length,

        complete:
            order.length === 9,

        players:
            order.map(
                item => item.playerId
            ),

        order

    };

}


// ============================================================
// Default Export
// ============================================================

export default {

    generateSmartOrder,

    buildSmartOrder,

    assignBattingOrder,

    assignPositions,

    getBattingOrderScore,

    getRoleScore,

    getPlayerPositionScore,

    getSmartOrderSummary

};
// ============================================================
// Baseball Team Manager Pro
// Player Manager
//
// Final Version
// - Add Player
// - Update Player
// - Remove Player
// - Player Event
// - Lineup Cleanup
// ============================================================

import {
    createPlayer
} from './playerModel.js';

import {
    getPlayers,
    savePlayers
} from './playerService.js';

import {
    getLineups,
    saveLineups
} from '../lineup/lineupService.js';


// ============================================================
// 依背號排序球員資料庫
//
// - 背號視為數字比較（"7" < "14"），非字串排序，
//   避免 "14" 排到 "7" 前面。
// - 沒有背號 / 背號非數字的球員排到最後，
//   彼此之間維持原本的相對順序（stable sort）。
// ============================================================

function sortPlayersByNumber(
    players
) {

    const withIndex =
        players.map(
            (player, index) => (
                { player, index }
            )
        );


    withIndex.sort(
        (a, b) => {

            const numA =
                parseInt(a.player?.number, 10);

            const numB =
                parseInt(b.player?.number, 10);


            const validA =
                !Number.isNaN(numA);

            const validB =
                !Number.isNaN(numB);


            if (
                validA &&
                validB
            ) {

                if (numA !== numB) {

                    return numA - numB;

                }

            } else if (
                validA !==
                validB
            ) {

                // 有效背號排在無效/空背號前面
                return validA ? -1 : 1;

            }


            // 背號相同或都無效時，維持原本順序
            return a.index - b.index;

        }
    );


    return withIndex.map(
        entry => entry.player
    );

}


// ============================================================
// Add Player
// ============================================================

export function addPlayer(
    data = {}
) {

    const players =
        getPlayers();


    const player =
        createPlayer(
            data
        );


    players.push(
        player
    );


    const sortedPlayers =
        sortPlayersByNumber(
            players
        );


    savePlayers(
        sortedPlayers
    );


    // --------------------------------------------------------
    // Notify
    // --------------------------------------------------------

    window.dispatchEvent(
        new CustomEvent(
            'player:added',
            {
                detail: {
                    player,
                    players:
                        sortedPlayers
                }
            }
        )
    );


    return sortedPlayers;

}


// ============================================================
// Update Player
// ============================================================

export function updatePlayer(
    id,
    data = {}
) {

    const players =
        getPlayers();


    const index =
        players.findIndex(
            player =>
                String(
                    player?.id
                ) ===
                String(id)
        );


    if (
        index === -1
    ) {

        return false;

    }


    const oldPlayer =
        players[index];


    const updatedPlayer = {

        ...oldPlayer,

        ...data,

        id:
            oldPlayer.id

    };


    players[index] =
        updatedPlayer;


    // 背號可能被更換／調動，重新依背號排序整個球員資料庫
    const sortedPlayers =
        sortPlayersByNumber(
            players
        );


    savePlayers(
        sortedPlayers
    );


    // --------------------------------------------------------
    // Notify
    // --------------------------------------------------------

    window.dispatchEvent(
        new CustomEvent(
            'player:updated',
            {
                detail: {

                    player:
                        updatedPlayer,

                    oldPlayer,

                    players:
                        sortedPlayers

                }
            }
        )
    );


    return sortedPlayers;

}


// ============================================================
// Remove Player
// ============================================================

export function removePlayer(
    id
) {

    const players =
        getPlayers();


    const removedPlayer =
        players.find(
            player =>
                String(
                    player?.id
                ) ===
                String(id)
        );


    if (
        !removedPlayer
    ) {

        return false;

    }


    // ========================================================
    // 先刪除 Player
    // ========================================================

    const remainingPlayers =
        players.filter(
            player =>
                String(
                    player?.id
                ) !==
                String(id)
        );


    savePlayers(
        remainingPlayers
    );


    // ========================================================
    // 清理 Lineup
    //
    // 如果被刪除球員存在於任何 lineup：
    //
    // playerId → 移除
    //
    // 不直接把其他球員往前補，
    // 避免未經教練確認就改變棒次。
    // ========================================================

    const lineups =
        getLineups();


    let lineupChanged =
        false;


    const cleanedLineups =
        Array.isArray(lineups)
            ? lineups.map(
                lineup => {

                    if (
                        !lineup ||
                        Array.isArray(lineup)
                    ) {

                        return lineup;

                    }


                    if (
                        !Array.isArray(
                            lineup.starters
                        )
                    ) {

                        return lineup;

                    }


                    const originalStarters =
                        lineup.starters;


                    const cleanedStarters =
                        originalStarters.filter(
                            starter => {

                                const starterId =
                                    getStarterId(
                                        starter
                                    );


                                return String(
                                    starterId
                                ) !==
                                String(id);

                            }
                        );


                    if (
                        cleanedStarters.length !==
                        originalStarters.length
                    ) {

                        lineupChanged =
                            true;


                        return {

                            ...lineup,

                            starters:
                                cleanedStarters,

                            updatedAt:
                                new Date()
                                    .toISOString()

                        };

                    }


                    return lineup;

                }
            )
            : [];


    // ========================================================
    // Lineup 有變更才儲存
    // ========================================================

    if (
        lineupChanged
    ) {

        saveLineups(
            cleanedLineups
        );

    }


    // ========================================================
    // Notify Player Removed
    // ========================================================

    window.dispatchEvent(
        new CustomEvent(
            'player:removed',
            {
                detail: {

                    player:
                        removedPlayer,

                    players:
                        remainingPlayers,

                    lineups:
                        cleanedLineups,

                    lineupChanged

                }
            }
        )
    );


    // ========================================================
    // Lineup 同步
    // ========================================================

    if (
        lineupChanged
    ) {

        window.dispatchEvent(
            new CustomEvent(
                'lineup:updated',
                {
                    detail: {

                        lineups:
                            cleanedLineups,

                        reason:
                            'player-removed',

                        playerId:
                            id

                    }
                }
            )
        );


        window.dispatchEvent(
            new CustomEvent(
                'lineup:saved',
                {
                    detail: {

                        lineups:
                            cleanedLineups,

                        reason:
                            'player-removed',

                        playerId:
                            id

                    }
                }
            )
        );

    }


    return remainingPlayers;

}


// ============================================================
// 確保球員資料庫依背號排序
//
// 用於「球員管理」頁面載入時：檢查目前儲存的順序，
// 如果跟依背號排序的結果不一致，直接重新存檔修正。
// 這樣就算是修改此功能「之前」就已存在、順序混亂的舊資料，
// 只要打開球員管理頁面就會自動修正，不需要逐一手動編輯。
//
// 只有在順序真的不同時才會寫入，避免每次開頁都觸發不必要的存檔。
// ============================================================

export function ensurePlayersSortedByNumber() {

    const players =
        getPlayers();


    const sortedPlayers =
        sortPlayersByNumber(
            players
        );


    const isSameOrder =
        players.length ===
            sortedPlayers.length &&
        players.every(
            (player, index) =>
                player?.id ===
                sortedPlayers[index]?.id
        );


    if (isSameOrder) {

        return players;

    }


    savePlayers(
        sortedPlayers
    );


    return sortedPlayers;

}


// ============================================================
// 取得 Starter ID
// ============================================================

function getStarterId(
    starter
) {

    if (
        typeof starter ===
        'string'
    ) {

        return starter;

    }


    if (
        !starter
    ) {

        return '';

    }


    return (
        starter.playerId ??
        starter.playerID ??
        starter.id ??
        starter.player?.id ??
        ''
    );

}


// ============================================================
// Default Export
// ============================================================

export default {

    addPlayer,

    updatePlayer,

    removePlayer,

    ensurePlayersSortedByNumber

};
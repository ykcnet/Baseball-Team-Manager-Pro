// ============================================================
// Baseball Team Manager Pro
// Lineup Validator
//
// Final Version
//
// Lineup 標準格式：
//
// {
//     playerId: "...",
//     battingOrder: 1,
//     order: 1,
//     position: "SS"
// }
//
// 驗證：
// - 必須剛好 9 人
// - 必須有 playerId
// - 球員不可重複
// - 球員必須存在
// - battingOrder 必須為 1~9
// - order 必須與 battingOrder 一致
// - 棒次不可重複
// - 守備位置不可重複
// ============================================================


// ============================================================
// 取得 Player ID
// ============================================================

function getPlayerId(player) {

    return (
        player?.id ??
        player?.playerId ??
        ''
    );

}


// ============================================================
// 取得 Starter Player ID
// ============================================================

function getStarterPlayerId(starter) {

    if (
        typeof starter === 'string'
    ) {

        return starter;

    }


    return (
        starter?.playerId ??
        starter?.playerID ??
        starter?.player?.id ??
        starter?.id ??
        ''
    );

}


// ============================================================
// 取得棒次
// ============================================================

function getBattingOrder(
    starter,
    index
) {

    if (
        typeof starter === 'string'
    ) {

        return index + 1;

    }


    const value =
        starter?.battingOrder ??
        starter?.order ??
        index + 1;


    return Number(value);

}


// ============================================================
// Lineup Validator
// ============================================================

export function validateLineup(
    starters = [],
    players = []
) {

    const errors = [];
    const warnings = [];


    // ========================================================
    // 基本資料型別
    // ========================================================

    if (
        !Array.isArray(starters)
    ) {

        return {

            valid: false,

            errors: [
                '先發名單格式錯誤。'
            ],

            warnings: []

        };

    }


    if (
        !Array.isArray(players)
    ) {

        players = [];

    }


    // ========================================================
    // 必須剛好 9 人
    // ========================================================

    if (
        starters.length !== 9
    ) {

        errors.push(
            `先發名單必須剛好 9 人，目前 ${starters.length} 人。`
        );

    }


    // ========================================================
    // 取得 Player IDs
    // ========================================================

    const playerIds =
        starters.map(
            starter =>
                getStarterPlayerId(
                    starter
                )
        );


    // ========================================================
    // 檢查空 Player ID
    // ========================================================

    playerIds.forEach(
        (
            playerId,
            index
        ) => {

            if (!playerId) {

                errors.push(
                    `第 ${index + 1} 棒尚未選擇球員。`
                );

            }

        }
    );


    // ========================================================
    // 球員不可重複
    // ========================================================

    const usedPlayerIds =
        new Set();


    playerIds.forEach(
        (
            playerId,
            index
        ) => {

            if (!playerId) {

                return;

            }


            const key =
                String(playerId);


            if (
                usedPlayerIds.has(key)
            ) {

                errors.push(
                    `第 ${index + 1} 棒球員與其他棒次重複。`
                );

                return;

            }


            usedPlayerIds.add(key);

        }
    );


    // ========================================================
    // 建立目前 Player Map
    // ========================================================

    const playerMap =
        new Map();


    players.forEach(
        player => {

            const id =
                getPlayerId(
                    player
                );


            if (!id) {

                return;

            }


            playerMap.set(
                String(id),
                player
            );

        }
    );


    // ========================================================
    // 球員必須存在
    // ========================================================

    playerIds.forEach(
        (
            playerId,
            index
        ) => {

            if (!playerId) {

                return;

            }


            if (
                !playerMap.has(
                    String(playerId)
                )
            ) {

                errors.push(
                    `第 ${index + 1} 棒的球員資料不存在。`
                );

            }

        }
    );


    // ========================================================
    // 檢查棒次
    // ========================================================

    const battingOrders = [];


    starters.forEach(
        (
            starter,
            index
        ) => {

            const battingOrder =
                getBattingOrder(
                    starter,
                    index
                );


            battingOrders.push(
                battingOrder
            );


            if (
                !Number.isInteger(
                    battingOrder
                )
            ) {

                errors.push(
                    `第 ${index + 1} 棒的打擊順序格式錯誤。`
                );

                return;

            }


            if (
                battingOrder < 1 ||
                battingOrder > 9
            ) {

                errors.push(
                    `第 ${index + 1} 棒的打擊順序必須介於 1～9。`
                );

            }

        }
    );


    // ========================================================
    // 棒次不可重複
    // ========================================================

    const usedOrders =
        new Set();


    battingOrders.forEach(
        (
            order,
            index
        ) => {

            if (
                !Number.isInteger(order)
            ) {

                return;

            }


            if (
                usedOrders.has(order)
            ) {

                errors.push(
                    `打擊順序 ${order} 重複。`
                );

                return;

            }


            usedOrders.add(order);

        }
    );


    // ========================================================
    // 必須完整包含 1～9
    // ========================================================

    if (
        starters.length === 9
    ) {

        for (
            let order = 1;
            order <= 9;
            order += 1
        ) {

            if (
                !usedOrders.has(order)
            ) {

                errors.push(
                    `缺少第 ${order} 棒。`
                );

            }

        }

    }


    // ========================================================
    // 守備位置不可重複
    //
    // DH 例外：可與野手位置並存，
    // 但 DH 本身仍不可有兩人同時擔任。
    // ========================================================

    const usedPositions =
        new Map();


    starters.forEach(
        (
            starter,
            index
        ) => {

            const position =
                (
                    typeof starter === 'object' &&
                    starter !== null
                        ? starter.position
                        : ''
                ) || '';


            if (!position) {

                return;

            }


            const key =
                String(position)
                    .trim()
                    .toUpperCase();


            if (!key) {

                return;

            }


            if (
                usedPositions.has(key)
            ) {

                const firstIndex =
                    usedPositions.get(key);

                errors.push(
                    `守備位置重複：第 ${firstIndex + 1} 棒與第 ${index + 1} 棒皆為 ${position}。`
                );

                return;

            }


            usedPositions.set(
                key,
                index
            );

        }
    );


    // ========================================================
    // order 必須與 battingOrder 一致
    // ========================================================

    starters.forEach(
        (
            starter,
            index
        ) => {

            if (
                !starter ||
                typeof starter !== 'object'
            ) {

                return;

            }


            const battingOrder =
                Number(
                    starter.battingOrder
                );


            const order =
                Number(
                    starter.order
                );


            if (
                Number.isInteger(
                    battingOrder
                ) &&
                Number.isInteger(
                    order
                ) &&
                battingOrder !== order
            ) {

                errors.push(
                    `第 ${index + 1} 棒的 order 與 battingOrder 不一致。`
                );

            }

        }
    );


    // ========================================================
    // 受傷 / 停賽
    //
    // 只警告，不阻止儲存
    // ========================================================

    playerIds.forEach(
        (
            playerId,
            index
        ) => {

            if (!playerId) {

                return;

            }


            const player =
                playerMap.get(
                    String(playerId)
                );


            if (!player) {

                return;

            }


            const name =
                player.name ||
                player.playerName ||
                `第 ${index + 1} 棒球員`;


            if (
                player.injured === true
            ) {

                warnings.push(
                    `第 ${index + 1} 棒 ${name} 目前受傷。`
                );

            }


            if (
                player.suspended === true
            ) {

                warnings.push(
                    `第 ${index + 1} 棒 ${name} 目前停賽。`
                );

            }

        }
    );


    // ========================================================
    // 結果
    // ========================================================

    return {

        valid:
            errors.length === 0,

        errors,

        warnings

    };

}


// ============================================================
// 取得完整驗證結果
//
// 相容 lineupForm.js
// ============================================================

export function getLineupValidationResult(
    starters = [],
    players = []
) {

    return validateLineup(
        starters,
        players
    );

}


// ============================================================
// Boolean Validator
// ============================================================

export function isValidLineup(
    starters = [],
    players = []
) {

    return validateLineup(
        starters,
        players
    ).valid;

}


// ============================================================
// 取得驗證錯誤
// ============================================================

export function getLineupValidationErrors(
    starters = [],
    players = []
) {

    return validateLineup(
        starters,
        players
    ).errors;

}


// ============================================================
// 取得驗證警告
// ============================================================

export function getLineupValidationWarnings(
    starters = [],
    players = []
) {

    return validateLineup(
        starters,
        players
    ).warnings;

}


// ============================================================
// Default Export
// ============================================================

export default {

    validateLineup,

    getLineupValidationResult,

    isValidLineup,

    getLineupValidationErrors,

    getLineupValidationWarnings

};
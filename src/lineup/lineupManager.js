// ============================================================
// Baseball Team Manager Pro
// Lineup Manager
//
// - 建立 Lineup
// - 更新目前 Lineup
// - 儲存 Lineup
// - 取得目前 Lineup
// - 拖曳交換棒次
// - 刪除球員後清理 Lineup
// ============================================================

import { createLineup } from './lineupModel.js';

import {
    getLineups,
    saveLineups
} from './lineupService.js';


// ============================================================
// 取得目前 Lineup
// ============================================================

export function getCurrentLineup() {

    const lineups = getLineups();

    if (
        !Array.isArray(lineups) ||
        lineups.length === 0
    ) {
        return null;
    }

    const latest =
        lineups[lineups.length - 1];

    if (
        !latest ||
        Array.isArray(latest) ||
        typeof latest !== 'object'
    ) {
        return null;
    }

    return latest;
}


// ============================================================
// 清除目前 Lineup
// ============================================================

export function clearCurrentLineup() {

    const lineups = getLineups();

    if (
        !Array.isArray(lineups) ||
        lineups.length === 0
    ) {
        return false;
    }

    const nextLineups =
        [...lineups];

    // 清除最後一筆的 starters
    const latestIndex =
        nextLineups.length - 1;

    nextLineups[latestIndex] = {
        ...nextLineups[latestIndex],
        starters: [],
        updatedAt:
            new Date().toISOString()
    };

    saveLineups(
        nextLineups
    );

    // ====================================================
    // Event
    // ====================================================

    window.dispatchEvent(
        new CustomEvent(
            'lineup:updated',
            {
                detail: {
                    lineup: [],
                    lineups: nextLineups
                }
            }
        )
    );

    window.dispatchEvent(
        new CustomEvent(
            'lineup:cleared',
            {
                detail: {
                    lineups: nextLineups
                }
            }
        )
    );

    return true;
}


// ============================================================
// 更新目前 Lineup
//
// lineupForm.js 會使用這個 API
// ============================================================

export function updateLineup(
    starters = []
) {

    if (!Array.isArray(starters)) {
        return false;
    }


    const lineups = getLineups();

    const nextLineups =
        Array.isArray(lineups)
            ? [...lineups]
            : [];


    const normalized =
        starters.map(
            (
                starter,
                index
            ) => {

                const order =
                    index + 1;

                if (
                    typeof starter === 'string'
                ) {

                    return {

                        playerId:
                            starter,

                        battingOrder:
                            order,

                        order

                    };

                }


                return {

                    ...(starter || {}),

                    battingOrder:
                        order,

                    order

                };

            }
        );


    const current =
        getCurrentLineup();


    // --------------------------------------------------------
    // 已有 Lineup → 更新最後一筆
    // --------------------------------------------------------

    if (current) {

        nextLineups[
            nextLineups.length - 1
        ] = {

            ...current,

            starters:
                normalized,

            updatedAt:
                new Date().toISOString()

        };

    }


    // --------------------------------------------------------
    // 沒有 Lineup → 建立第一筆
    // --------------------------------------------------------

    else {

        nextLineups.push({

            ...createLineup(),

            starters:
                normalized,

            updatedAt:
                new Date().toISOString()

        });

    }


    // --------------------------------------------------------
    // 儲存
    // --------------------------------------------------------

    saveLineups(
        nextLineups
    );


    // --------------------------------------------------------
    // Event
    // --------------------------------------------------------

    window.dispatchEvent(
        new CustomEvent(
            'lineup:updated',
            {
                detail: {

                    lineup:
                        normalized,

                    lineups:
                        nextLineups

                }
            }
        )
    );


    window.dispatchEvent(
        new CustomEvent(
            'lineup:saved',
            {
                detail: {

                    lineup:
                        normalized,

                    lineups:
                        nextLineups

                }
            }
        )
    );


    return true;
}


// ============================================================
// 建立新的 Lineup
// ============================================================

export function saveLineup(
    starters = []
) {

    if (!Array.isArray(starters)) {
        return false;
    }


    const lineups =
        getLineups();


    const nextLineups =
        Array.isArray(lineups)
            ? [...lineups]
            : [];


    const normalized =
        starters.map(
            (
                starter,
                index
            ) => {

                const order =
                    index + 1;

                if (
                    typeof starter === 'string'
                ) {

                    return {

                        playerId:
                            starter,

                        battingOrder:
                            order,

                        order

                    };

                }


                return {

                    ...(starter || {}),

                    battingOrder:
                        order,

                    order

                };

            }
        );


    nextLineups.push({

        ...createLineup(),

        starters:
            normalized,

        updatedAt:
            new Date().toISOString()

    });


    saveLineups(
        nextLineups
    );


    window.dispatchEvent(
        new CustomEvent(
            'lineup:updated',
            {
                detail: {

                    lineup:
                        normalized,

                    lineups:
                        nextLineups

                }
            }
        )
    );


    window.dispatchEvent(
        new CustomEvent(
            'lineup:saved',
            {
                detail: {

                    lineup:
                        normalized,

                    lineups:
                        nextLineups

                }
            }
        )
    );


    return true;
}


// ============================================================
// 拖曳交換棒次
// ============================================================

export function swapLineupOrder(
    fromIndex,
    toIndex
) {

    const lineup =
        getCurrentLineup();


    if (
        !lineup ||
        !Array.isArray(
            lineup.starters
        )
    ) {

        return false;

    }


    const starters =
        [...lineup.starters];


    if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= starters.length ||
        toIndex >= starters.length ||
        fromIndex === toIndex
    ) {

        return false;

    }


    [
        starters[fromIndex],
        starters[toIndex]
    ] = [
        starters[toIndex],
        starters[fromIndex]
    ];


    const normalized =
        starters.map(
            (
                starter,
                index
            ) => {

                const order =
                    index + 1;


                if (
                    typeof starter === 'string'
                ) {

                    return {

                        playerId:
                            starter,

                        battingOrder:
                            order,

                        order

                    };

                }


                return {

                    ...(starter || {}),

                    battingOrder:
                        order,

                    order

                };

            }
        );


    const lineups =
        getLineups();


    const nextLineups =
        Array.isArray(lineups)
            ? [...lineups]
            : [];


    if (
        nextLineups.length === 0
    ) {

        return false;

    }


    const latestIndex =
        nextLineups.length - 1;


    nextLineups[
        latestIndex
    ] = {

        ...nextLineups[latestIndex],

        starters:
            normalized,

        updatedAt:
            new Date().toISOString()

    };


    saveLineups(
        nextLineups
    );


    window.dispatchEvent(
        new CustomEvent(
            'lineup:swap',
            {
                detail: {

                    fromIndex,

                    toIndex,

                    lineup:
                        normalized

                }
            }
        )
    );


    window.dispatchEvent(
        new CustomEvent(
            'lineup:updated',
            {
                detail: {

                    lineup:
                        normalized,

                    lineups:
                        nextLineups

                }
            }
        )
    );


    window.dispatchEvent(
        new CustomEvent(
            'lineup:saved',
            {
                detail: {

                    lineup:
                        normalized,

                    lineups:
                        nextLineups,

                    reason:
                        'swap'

                }
            }
        )
    );


    return true;
}


// ============================================================
// 刪除球員後清理 Lineup
// ============================================================

export function removePlayerFromLineups(
    playerId
) {

    if (!playerId) {
        return false;
    }


    const lineups =
        getLineups();


    if (
        !Array.isArray(lineups) ||
        lineups.length === 0
    ) {

        return false;

    }


    let changed = false;


    const nextLineups =
        lineups.map(
            lineup => {

                if (
                    !lineup ||
                    !Array.isArray(
                        lineup.starters
                    )
                ) {

                    return lineup;

                }


                const originalLength =
                    lineup.starters.length;


                const filtered =
                    lineup.starters.filter(
                        starter => {

                            const id =
                                typeof starter === 'string'
                                    ? starter
                                    : (
                                        starter?.playerId ??
                                        starter?.id ??
                                        ''
                                    );


                            return String(id) !==
                                String(playerId);

                        }
                    );


                if (
                    filtered.length !==
                    originalLength
                ) {

                    changed = true;

                }


                const normalized =
                    filtered.map(
                        (
                            starter,
                            index
                        ) => {

                            const order =
                                index + 1;


                            if (
                                typeof starter === 'string'
                            ) {

                                return {

                                    playerId:
                                        starter,

                                    battingOrder:
                                        order,

                                    order

                                };

                            }


                            return {

                                ...(starter || {}),

                                battingOrder:
                                    order,

                                order

                            };

                        }
                    );


                return {

                    ...lineup,

                    starters:
                        normalized,

                    updatedAt:
                        changed
                            ? new Date().toISOString()
                            : lineup.updatedAt

                };

            }
        );


    if (!changed) {

        return false;

    }


    saveLineups(
        nextLineups
    );


    window.dispatchEvent(
        new CustomEvent(
            'lineup:updated',
            {
                detail: {

                    lineups:
                        nextLineups

                }
            }
        )
    );


    return true;
}
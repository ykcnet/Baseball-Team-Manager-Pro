// ============================================================
// Baseball Team Manager Pro
// Available Players
// ============================================================

// ============================================================
// 取得球員 ID
// ============================================================

function getPlayerId(player) {

    return (
        player?.id ??
        player?.playerId ??
        ''
    );

}


// ============================================================
// 球員是否可出賽
// ============================================================

export function isPlayerAvailable(player) {

    if (!player) {

        return false;

    }


    if (player.injured === true) {

        return false;

    }


    if (player.suspended === true) {

        return false;

    }


    return true;

}


// ============================================================
// 取得可用球員
// ============================================================

export function getAvailablePlayers(
    players = []
) {

    if (!Array.isArray(players)) {

        return [];

    }


    const result = [];

    const usedIds = new Set();


    players.forEach(
        player => {

            if (
                !isPlayerAvailable(
                    player
                )
            ) {

                return;

            }


            const id =
                getPlayerId(
                    player
                );


            // --------------------------------------------
            // 有 ID → 防止重複
            // --------------------------------------------

            if (id) {

                const key =
                    String(id);


                if (
                    usedIds.has(key)
                ) {

                    return;

                }


                usedIds.add(key);

            }


            result.push(
                player
            );

        }
    );


    return result;

}


// ============================================================
// Default Export
// ============================================================

export default {

    getAvailablePlayers,

    isPlayerAvailable

};
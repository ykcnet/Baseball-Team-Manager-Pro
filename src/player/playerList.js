// ============================================================
// Baseball Team Manager Pro
// Player List
//
// Final Version
// - Player List
// - Edit Player
// - Delete Player
// - Injury / Suspension status
// - Note
// - player:added
// - player:updated
// - player:removed
// - Event Cleanup
// ============================================================

import {
    getPlayers
} from './playerService.js';

import {
    updatePlayer,
    removePlayer,
    ensurePlayersSortedByNumber
} from './playerManager.js';


// ============================================================
// HTML Escape
// ============================================================

function escapeHtml(value) {

    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

}


// ============================================================
// Render Player List
//
// options:
// {
//     onEdit(player)
// }
//
// playerPage 可以利用 onEdit
// 將球員交給 playerForm 編輯。
// ============================================================

export function renderPlayerList(
    container,
    options = {}
) {

    if (!container) {

        return;

    }


    // ========================================================
    // Cleanup 舊事件
    // ========================================================

    if (
        typeof container._playerListCleanup ===
        'function'
    ) {

        container._playerListCleanup();

    }


    // ========================================================
    // Render
    // ========================================================

    function refresh() {

        // 每次載入清單時，順便確保資料庫本身依背號排序
        // （修正這個功能上線前就已存在的舊資料順序）
        const players =
            ensurePlayersSortedByNumber();


        if (
            !Array.isArray(players) ||
            players.length === 0
        ) {

            container.innerHTML = `

                <div class="player-list-empty">

                    <p>
                        尚無球員資料
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML = `

            <div class="player-list">

                ${
                    players
                        .map(
                            player => {

                                const id =
                                    player?.id ??
                                    '';


                                const number =
                                    player?.number ??
                                    player?.jerseyNumber ??
                                    '';


                                const name =
                                    player?.name ??
                                    player?.playerName ??
                                    '未命名球員';


                                const positionsDisplay =
                                    player?.positions && player.positions.length > 0
                                        ? player.positions.map(p => `${p.code}${typeof p.rating === 'number' && p.rating > 0 ? `(${p.rating})` : ''}`).join(', ')
                                        : player?.position ?? '';

                                const overallRating =
                                    typeof player?.rating === 'number' && player.rating > 0
                                        ? player.rating
                                        : null;

                                const injured =
                                    player?.injured === true;


                                const suspended =
                                    player?.suspended === true;


                                const note =
                                    player?.note ??
                                    '';


                                return `

                                    <article
                                        class="
                                            player-card
                                            ${
                                                injured ||
                                                suspended
                                                    ? 'player-card-unavailable'
                                                    : ''
                                            }
                                        "
                                        data-player-id="${escapeHtml(id)}"
                                    >

                                        <div
                                            class="player-card-main"
                                        >

                                            <div
                                                class="player-card-name"
                                            >
                                                <span class="player-card-number">#${escapeHtml(number)}</span>
                                                ${escapeHtml(name)}
                                            </div>


                                            <div
                                                class="player-card-meta"
                                            >

                                                ${
                                                    positionsDisplay
                                                        ? `
                                                            <span
                                                                class="player-card-position"
                                                            >
                                                                ${escapeHtml(positionsDisplay)}
                                                            </span>
                                                          `
                                                        : ''
                                                }

                                                ${
                                                    overallRating
                                                        ? `
                                                            <span class="player-card-rating">評分：${escapeHtml(String(overallRating))}</span>
                                                          `
                                                        : ''
                                                }

                                            </div>

                                        </div>


                                        <div
                                            class="player-card-status"
                                        >

                                            ${
                                                injured
                                                    ? `
                                                        <span
                                                            class="player-status injured"
                                                        >
                                                            ⚠ 受傷
                                                        </span>
                                                    `
                                                    : ''
                                            }


                                            ${
                                                suspended
                                                    ? `
                                                        <span
                                                            class="player-status suspended"
                                                        >
                                                            ⛔ 停賽
                                                        </span>
                                                    `
                                                    : ''
                                            }

                                        </div>


                                        ${
                                            note
                                                ? `
                                                    <div
                                                        class="player-card-note"
                                                    >
                                                        📝
                                                        ${escapeHtml(note)}
                                                    </div>
                                                `
                                                : ''
                                        }


                                        <div
                                            class="player-card-actions"
                                        >

                                            <button
                                                type="button"
                                                class="player-edit-btn"
                                                data-action="edit"
                                                data-player-id="${escapeHtml(id)}"
                                            >
                                                ✏️ 編輯
                                            </button>


                                            <button
                                                type="button"
                                                class="player-delete-btn"
                                                data-action="delete"
                                                data-player-id="${escapeHtml(id)}"
                                            >
                                                🗑️ 刪除
                                            </button>

                                        </div>

                                    </article>

                                `;

                            }
                        )
                        .join('')
                }

            </div>

        `;

    }


    // ========================================================
    // Edit
    // ========================================================

    function handleEdit(
        playerId
    ) {

        const players =
            getPlayers();


        const player =
            players.find(
                item =>
                    String(
                        item?.id
                    ) ===
                    String(playerId)
            );


        if (!player) {

            return;

        }


        if (
            typeof options?.onEdit ===
            'function'
        ) {

            options.onEdit(
                player
            );

            return;

        }


        // 沒有 onEdit 時仍提供事件
        // 給其他模組使用

        container.dispatchEvent(
            new CustomEvent(
                'player:edit',
                {
                    bubbles: true,
                    detail: {
                        player
                    }
                }
            )
        );

    }


    // ========================================================
    // Delete
    // ========================================================

    function handleDelete(
        playerId
    ) {

        const players =
            getPlayers();


        const player =
            players.find(
                item =>
                    String(
                        item?.id
                    ) ===
                    String(playerId)
            );


        if (!player) {

            return;

        }


        const playerName =
            player?.name ||
            '這名球員';


        const confirmed =
            window.confirm(
                `確定要刪除「${playerName}」嗎？\n\n刪除後將無法直接復原。`
            );


        if (!confirmed) {

            return;

        }


        const result =
            removePlayer(
                playerId
            );


        if (
            result === false
        ) {

            return;

        }


        refresh();

    }


    // ========================================================
    // Button Events
    // ========================================================

    function clickHandler(
        event
    ) {

        const button =
            event.target.closest(
                'button[data-action]'
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.action;


        const playerId =
            button.dataset.playerId;


        if (!playerId) {

            return;

        }


        if (
            action === 'edit'
        ) {

            handleEdit(
                playerId
            );

            return;

        }


        if (
            action === 'delete'
        ) {

            handleDelete(
                playerId
            );

        }

    }


    container.addEventListener(
        'click',
        clickHandler
    );


    // ========================================================
    // Player Events
    // ========================================================

    const playerAddedHandler =
        () => {

            refresh();

        };


    const playerUpdatedHandler =
        () => {

            refresh();

        };


    const playerRemovedHandler =
        () => {

            refresh();

        };


    window.addEventListener(
        'player:added',
        playerAddedHandler
    );


    window.addEventListener(
        'player:updated',
        playerUpdatedHandler
    );


    window.addEventListener(
        'player:removed',
        playerRemovedHandler
    );


    // ========================================================
    // Initial Render
    // ========================================================

    refresh();


    // ========================================================
    // Cleanup
    // ========================================================

    container._playerListCleanup =
        () => {

            container.removeEventListener(
                'click',
                clickHandler
            );


            window.removeEventListener(
                'player:added',
                playerAddedHandler
            );


            window.removeEventListener(
                'player:updated',
                playerUpdatedHandler
            );


            window.removeEventListener(
                'player:removed',
                playerRemovedHandler
            );


            container._playerListCleanup =
                null;

        };

}


// ============================================================
// Default Export
// ============================================================

export default {

    renderPlayerList

};
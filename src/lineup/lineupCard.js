// ============================================================
// Baseball Team Manager Pro
// Lineup Card
//
// Final Version
// - playerId → 最新 Player 資料
// - battingOrder / order
// - 9 人先發
// - 拖曳換棒次
// - 拖曳動畫
// - 儲存提示
// - lineup:updated
// - lineup:saved
// - lineup:swap
// - 球員刪除後安全處理
// ============================================================

import {
    getPlayers
} from '../player/playerService.js';

import {
    getCurrentLineup,
    swapLineupOrder
} from './lineupManager.js';


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
        '未命名球員'
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

    // Try new positions format first
    if (
        Array.isArray(player?.positions) &&
        player.positions.length > 0
    ) {
        const validPositions = player.positions.filter(p => p.rating > 0);
        if (validPositions.length > 0) {
            // Sort by rating and return the highest rated position
            validPositions.sort((a, b) => b.rating - a.rating);
            return validPositions[0].code;
        }
    }

    // Fallback to old format
    return (
        player?.position ??
        ''
    );

}


// ============================================================
// Injury / Suspension
// ============================================================

function getPlayerStatus(player) {

    if (!player) {
        return '';
    }

    if (player.injured === true) {
        return '受傷';
    }

    if (player.suspended === true) {
        return '停賽';
    }

    return '';

}


// ============================================================
// Starter Player ID
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
        starter?.id ??
        starter?.player?.id ??
        ''
    );

}


// ============================================================
// Starter Order
// ============================================================

function getStarterOrder(
    starter,
    index
) {

    const order = Number(
        starter?.battingOrder ??
        starter?.order ??
        index + 1
    );

    if (
        Number.isInteger(order) &&
        order >= 1 &&
        order <= 9
    ) {
        return order;
    }

    return index + 1;

}


// ============================================================
// 找 Player
// ============================================================

function findPlayer(
    players,
    playerId
) {

    if (!playerId) {
        return null;
    }

    return (
        players.find(
            player =>
                String(
                    getPlayerId(player)
                ) ===
                String(playerId)
        ) ?? null
    );

}


// ============================================================
// 建立 Card HTML
// ============================================================

function createCardHtml(
    starter,
    player,
    index
) {

    const order =
        getStarterOrder(
            starter,
            index
        );

    const playerId =
        getStarterPlayerId(
            starter
        );


    // --------------------------------------------------------
    // 球員不存在
    // --------------------------------------------------------

    if (!player) {

        return `

            <article
                class="lineup-card-item lineup-card-missing"
                draggable="true"
                data-index="${index}"
                data-player-id="${escapeHtml(playerId)}"
            >

                <div
                    class="lineup-card-drag-handle"
                    title="拖曳調整棒次"
                    aria-label="拖曳調整棒次"
                >
                    ☰
                </div>


                <div
                    class="lineup-card-order"
                >

                    <strong>
                        ${order}
                    </strong>

                    <span>
                        棒
                    </span>

                </div>


                <div
                    class="lineup-card-player"
                >

                    <strong>
                        ⚠ 球員資料不存在
                    </strong>

                    <small>
                        Player ID：
                        ${escapeHtml(playerId)}
                    </small>

                </div>

            </article>

        `;

    }


    const number =
        getPlayerNumber(player);

    const name =
        getPlayerName(player);

    // Use position from starter object if available, otherwise fall back to player's position
    const position =
        starter?.position ??
        getPlayerPosition(player);

    const status =
        getPlayerStatus(player);


    return `

        <article
            class="
                lineup-card-item
                ${
                    status
                        ? 'lineup-card-warning'
                        : ''
                }
            "
            draggable="true"
            data-index="${index}"
            data-player-id="${escapeHtml(playerId)}"
        >

            <div
                class="lineup-card-drag-handle"
                title="拖曳調整棒次"
                aria-label="拖曳調整棒次"
            >
                ☰
            </div>


            <div
                class="lineup-card-order"
            >

                <strong>
                    ${order}
                </strong>

                <span>
                    棒
                </span>

            </div>


            <div
                class="lineup-card-number"
            >

                #${escapeHtml(number)}

            </div>


            <div
                class="lineup-card-player"
            >

                <strong>
                    ${escapeHtml(name)}
                </strong>


                <div
                    class="lineup-card-meta"
                >

                    ${
                        position
                            ? `
                                <span>
                                    ${escapeHtml(position)}
                                </span>
                            `
                            : ''
                    }


                    ${
                        status
                            ? `
                                <span
                                    class="lineup-card-status"
                                >
                                    ⚠ ${escapeHtml(status)}
                                </span>
                            `
                            : ''
                    }

                </div>

            </div>


            <div
                class="lineup-card-drag-indicator"
                aria-hidden="true"
            >
                ↕
            </div>

        </article>

    `;

}


// ============================================================
// 儲存提示
// ============================================================

function showSaveNotice(
    container,
    message = '✓ 先發名單已儲存'
) {

    if (!container) {
        return;
    }


    let notice =
        container.querySelector(
            '.lineup-card-save-notice'
        );


    if (!notice) {

        notice =
            document.createElement(
                'div'
            );

        notice.className =
            'lineup-card-save-notice';

        container.prepend(
            notice
        );

    }


    notice.textContent =
        message;


    notice.classList.remove(
        'show'
    );


    // 強制重新觸發動畫
    void notice.offsetWidth;


    notice.classList.add(
        'show'
    );


    window.clearTimeout(
        notice._hideTimer
    );


    notice._hideTimer =
        window.setTimeout(
            () => {

                notice.classList.remove(
                    'show'
                );

            },
            1800
        );

}


// ============================================================
// 拖曳動畫
// ============================================================

function animateSwap(
    sourceCard,
    targetCard
) {

    if (!sourceCard) {
        return;
    }


    sourceCard.classList.add(
        'lineup-card-dragging'
    );


    if (targetCard) {

        targetCard.classList.add(
            'lineup-card-drop-target'
        );

    }


    window.setTimeout(
        () => {

            sourceCard.classList.remove(
                'lineup-card-dragging'
            );


            if (targetCard) {

                targetCard.classList.remove(
                    'lineup-card-drop-target'
                );

            }

        },
        450
    );

}


// ============================================================
// Render Lineup Card
// ============================================================

export function renderLineupCard(
    container
) {

    if (!container) {
        return;
    }


    // ========================================================
    // Cleanup 舊事件
    // ========================================================

    if (
        typeof container._lineupCardCleanup ===
        'function'
    ) {

        container._lineupCardCleanup();

        container._lineupCardCleanup =
            null;

    }


    // ========================================================
    // 取得 Players
    // ========================================================

    const playersResult =
        getPlayers();


    const players =
        Array.isArray(playersResult)
            ? playersResult
            : [];


    // ========================================================
    // 取得目前 Lineup
    // ========================================================

    const currentLineup =
        getCurrentLineup();


    const starters =
        currentLineup &&
        Array.isArray(
            currentLineup.starters
        )
            ? currentLineup.starters
            : [];


    // ========================================================
    // HTML
    // ========================================================

    container.innerHTML = `

        <section
            class="lineup-card"
        >

            <div
                class="lineup-card-header"
            >

                <div>

                    <h3>
                        ⚾ 先發 Order
                    </h3>

                    <p>
                        拖曳球員即可調整棒次
                    </p>

                </div>


                <button
                    type="button"
                    id="lineupCardEditBtn"
                    class="lineup-card-edit-btn"
                >
                    ✏️ 編輯
                </button>

            </div>


            <div
                class="lineup-card-list"
            >

                ${
                    starters.length > 0

                        ? starters
                            .map(
                                (
                                    starter,
                                    index
                                ) => {

                                    const playerId =
                                        getStarterPlayerId(
                                            starter
                                        );


                                    const player =
                                        findPlayer(
                                            players,
                                            playerId
                                        );


                                    return createCardHtml(
                                        starter,
                                        player,
                                        index
                                    );

                                }
                            )
                            .join('')

                        : `

                            <div
                                class="lineup-card-empty"
                            >

                                <div>
                                    ⚾
                                </div>

                                <strong>
                                    尚未建立先發名單
                                </strong>

                                <p>
                                    請先建立 9 人先發名單
                                </p>

                            </div>

                        `
                }

            </div>


            <div
                class="lineup-card-footer"
            >

                <span>
                    共 ${starters.length} 人
                </span>


                ${
                    starters.length === 9

                        ? `
                            <span
                                class="lineup-card-complete"
                            >
                                ✓ 完整先發
                            </span>
                        `

                        : `
                            <span
                                class="lineup-card-incomplete"
                            >
                                ⚠ 尚未滿 9 人
                            </span>
                        `
                }

            </div>

        </section>

    `;


    // ========================================================
    // Edit Button
    // ========================================================

    const editButton =
        container.querySelector(
            '#lineupCardEditBtn'
        );


    if (editButton) {

        editButton.addEventListener(
            'click',
            () => {

                container.dispatchEvent(
                    new CustomEvent(
                        'lineup:edit',
                        {
                            bubbles: true
                        }
                    )
                );

            }
        );

    }


    // ========================================================
    // Drag & Drop
    // ========================================================

    const cards = [
        ...container.querySelectorAll(
            '.lineup-card-item'
        )
    ];


    let draggedCard =
        null;


    let draggedIndex =
        -1;


    // ========================================================
    // dragstart
    // ========================================================

    function handleDragStart(
        event
    ) {

        draggedCard =
            event.currentTarget;


        draggedIndex =
            Number(
                draggedCard.dataset.index
            );


        draggedCard.classList.add(
            'lineup-card-dragging'
        );


        if (
            event.dataTransfer
        ) {

            event.dataTransfer.effectAllowed =
                'move';


            event.dataTransfer.setData(
                'text/plain',
                String(draggedIndex)
            );

        }

    }


    // ========================================================
    // dragover
    // ========================================================

    function handleDragOver(
        event
    ) {

        event.preventDefault();


        if (
            event.dataTransfer
        ) {

            event.dataTransfer.dropEffect =
                'move';

        }


        const targetCard =
            event.currentTarget;


        if (
            targetCard === draggedCard
        ) {

            return;

        }


        cards.forEach(
            card => {

                card.classList.remove(
                    'lineup-card-drop-target'
                );

            }
        );


        targetCard.classList.add(
            'lineup-card-drop-target'
        );

    }


    // ========================================================
    // dragleave
    // ========================================================

    function handleDragLeave(
        event
    ) {

        event.currentTarget.classList.remove(
            'lineup-card-drop-target'
        );

    }


    // ========================================================
    // drop
    // ========================================================

    function handleDrop(
        event
    ) {

        event.preventDefault();


        const targetCard =
            event.currentTarget;


        const targetIndex =
            Number(
                targetCard.dataset.index
            );


        if (
            draggedIndex < 0 ||
            targetIndex < 0 ||
            draggedIndex === targetIndex
        ) {

            return;

        }


        animateSwap(
            draggedCard,
            targetCard
        );


        // ====================================================
        // Lineup Manager
        // ====================================================

        const result =
            swapLineupOrder(
                draggedIndex,
                targetIndex
            );


        if (!result) {

            showSaveNotice(
                container,
                '❌ 棒次更新失敗'
            );

            return;

        }


        showSaveNotice(
            container,
            '✓ 棒次已更新並儲存'
        );


        // ====================================================
        // 重新 Render
        // ====================================================

        window.setTimeout(
            () => {

                renderLineupCard(
                    container
                );

            },
            280
        );

    }


    // ========================================================
    // dragend
    // ========================================================

    function handleDragEnd() {

        cards.forEach(
            card => {

                card.classList.remove(
                    'lineup-card-dragging'
                );


                card.classList.remove(
                    'lineup-card-drop-target'
                );

            }
        );


        draggedCard =
            null;


        draggedIndex =
            -1;

    }


    // ========================================================
    // Bind Drag Events
    // ========================================================

    cards.forEach(
        card => {

            card.addEventListener(
                'dragstart',
                handleDragStart
            );


            card.addEventListener(
                'dragover',
                handleDragOver
            );


            card.addEventListener(
                'dragleave',
                handleDragLeave
            );


            card.addEventListener(
                'drop',
                handleDrop
            );


            card.addEventListener(
                'dragend',
                handleDragEnd
            );

        }
    );


    // ========================================================
    // 外部 Lineup Event
    // ========================================================

    const updatedHandler =
        () => {

            renderLineupCard(
                container
            );

        };


    const savedHandler =
        event => {

            const message =
                event?.detail?.reason === 'swap'
                    ? '✓ 棒次已儲存'
                    : '✓ 先發名單已儲存';


            showSaveNotice(
                container,
                message
            );


            window.setTimeout(
                () => {

                    renderLineupCard(
                        container
                    );

                },
                150
            );

        };


    const swapHandler =
        () => {

            showSaveNotice(
                container,
                '✓ 棒次已更新'
            );

        };


    const clearedHandler =
        () => {

            showSaveNotice(
                container,
                '✓ 先發名單已清除'
            );

            window.setTimeout(
                () => {

                    renderLineupCard(
                        container
                    );

                },
                150
            );

        };


    document.addEventListener(
        'lineup:updated',
        updatedHandler
    );


    document.addEventListener(
        'lineup:saved',
        savedHandler
    );


    document.addEventListener(
        'lineup:swap',
        swapHandler
    );


    document.addEventListener(
        'lineup:cleared',
        clearedHandler
    );


    // ========================================================
    // Cleanup
    // ========================================================

    container._lineupCardCleanup =
        () => {

            document.removeEventListener(
                'lineup:updated',
                updatedHandler
            );

            document.removeEventListener(
                'lineup:saved',
                savedHandler
            );

            document.removeEventListener(
                'lineup:swap',
                swapHandler
            );

            document.removeEventListener(
                'lineup:cleared',
                clearedHandler
            );

            cards.forEach(
                card => {

                    card.removeEventListener(
                        'dragstart',
                        handleDragStart
                    );

                    card.removeEventListener(
                        'dragover',
                        handleDragOver
                    );

                    card.removeEventListener(
                        'dragleave',
                        handleDragLeave
                    );

                    card.removeEventListener(
                        'drop',
                        handleDrop
                    );

                    card.removeEventListener(
                        'dragend',
                        handleDragEnd
                    );

                }
            );
        };

}

// ============================================================
// Default Export
// ============================================================

export default {

    renderLineupCard

};
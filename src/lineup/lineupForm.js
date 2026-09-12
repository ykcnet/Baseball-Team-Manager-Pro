// ============================================================
// Baseball Team Manager Pro
// Lineup Form
//
// Final Version
//
// - 9-man starting lineup
// - Player selection
// - Duplicate validation
// - Centralized lineupValidator
// - Smart Order AI
// - Injury / suspension warning
// - Lineup Manager persistence
// - lineup:updated
// - lineup:saved
// - lineup:form-saved
// - AI 只建立建議，不直接儲存
// ============================================================

import {
    getPlayers
} from '../player/playerService.js';

import {
    getAvailablePlayers
} from './availablePlayers.js';

import {
    saveLineup,
    updateLineup,
    getCurrentLineup,
    clearCurrentLineup
} from './lineupManager.js';

import {
    getLineupValidationResult
} from './lineupValidator.js';

import {
    generateSmartOrder
} from './smartOrderAI.js';


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
// Get All Player Positions
// ============================================================

function getPlayerPositions(player) {
    if (
        Array.isArray(player?.positions) &&
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
// Player Warning
// ============================================================

function getPlayerWarning(player) {

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
// Player Options
// ============================================================

function renderPlayerOptions(
    players,
    selectedId = ''
) {

    return `

        <option value="">
            請選擇球員
        </option>

        ${
            players
                .map(player => {

                    const id =
                        getPlayerId(player);

                    const name =
                        getPlayerName(player);

                    const number =
                        getPlayerNumber(player);

                    const position =
                        getPlayerPosition(player);

                    const warning =
                        getPlayerWarning(player);

                    // Get position ratings
                    let positionDisplay = '';
                    if (player.positions && player.positions.length > 0) {
                        const validPositions = player.positions.filter(p => p.rating > 0);
                        if (validPositions.length > 0) {
                            positionDisplay = validPositions.map(p => `${p.code}(${p.rating})`).join(', ');
                        }
                    }
                    
                    if (!positionDisplay && position) {
                        positionDisplay = position;
                    }

                    return `

                        <option
                            value="${escapeHtml(id)}"
                            ${
                                String(id) ===
                                String(selectedId)
                                    ? 'selected'
                                    : ''
                            }
                        >
                            #${escapeHtml(number)}
                            ${escapeHtml(name)}
                            ${
                                positionDisplay
                                    ? ` [${escapeHtml(positionDisplay)}]`
                                    : ''
                            }
                            ${
                                warning
                                    ? ` ⚠ ${escapeHtml(warning)}`
                                    : ''
                            }
                        </option>

                    `;

                })
                .join('')
        }

    `;

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
        starter?.player?.id ??
        starter?.id ??
        ''
    );

}


// ============================================================
// Current Starter IDs
// ============================================================

function getCurrentStarterIds() {

    const lineup =
        getCurrentLineup();

    if (
        !lineup ||
        !Array.isArray(lineup.starters)
    ) {
        return [];
    }

    return lineup.starters.map(
        starter =>
            getStarterPlayerId(starter)
    );

}


// ============================================================
// Message
// ============================================================

function showMessage(
    container,
    type,
    messages
) {

    const box =
        container.querySelector(
            '#lineupFormMessage'
        );

    if (!box) {
        return;
    }

    const list =
        Array.isArray(messages)
            ? messages
            : [messages];

    if (
        list.length === 0
    ) {

        box.innerHTML = '';

        box.className =
            'lineup-form-message';

        return;
    }

    let icon = 'ℹ️';

    if (type === 'error') {
        icon = '❌';
    }

    if (type === 'warning') {
        icon = '⚠️';
    }

    if (type === 'success') {
        icon = '✓';
    }

    box.className =
        `lineup-form-message ${type}`;

    box.innerHTML = `

        <span>
            ${icon}
        </span>

        <div>
            ${
                list
                    .map(
                        message =>
                            `<div>${escapeHtml(message)}</div>`
                    )
                    .join('')
            }
        </div>

    `;

}


// ============================================================
// Success
// ============================================================

function showSuccess(container) {

    showMessage(
        container,
        'success',
        '先發名單已成功儲存。'
    );

    window.setTimeout(
        () => {

            showMessage(
                container,
                '',
                []
            );

        },
        1800
    );

}


// ============================================================
// Render Form
// ============================================================

export function renderLineupForm(container) {

    if (!container) {
        return;
    }


    // ========================================================
    // Cleanup
    // ========================================================

    if (
        typeof container._lineupFormCleanup ===
        'function'
    ) {

        container._lineupFormCleanup();

    }


    // ========================================================
    // Players
    // ========================================================

    const allPlayers =
        getPlayers();

    const players =
        getAvailablePlayers(
            allPlayers
        );

    const currentStarterIds =
        getCurrentStarterIds();


    // ========================================================
    // HTML
    // ========================================================

    container.innerHTML = `

        <section class="lineup-form" id="lineupFormSection">

            <div class="lineup-form-header">

                <div>

                    <h3>
                        ⚾ 建立先發名單
                    </h3>

                    <p>
                        請選擇 1～9 棒先發球員
                    </p>

                </div>

                <div class="lineup-form-player-count">

                    可用球員：
                    <strong>
                        ${players.length}
                    </strong>
                    人

                </div>

            </div>


            <div
                id="lineupFormMessage"
                class="lineup-form-message"
                role="status"
                aria-live="polite"
            ></div>


            <div class="lineup-form-list">

                ${Array.from(
                    {
                        length: 9
                    },
                    (_, index) => {

                        const selectedId =
                            currentStarterIds[index] ??
                            '';

                        return `

                            <div
                                class="lineup-form-row"
                                data-order="${index + 1}"
                            >

                                <div
                                    class="lineup-form-order"
                                >

                                    <strong>
                                        ${index + 1}
                                    </strong>

                                    <span>
                                        棒
                                    </span>

                                </div>


                                <select
                                    class="lineup-player-select"
                                    data-order="${index + 1}"
                                >

                                    ${renderPlayerOptions(
                                        players,
                                        selectedId
                                    )}

                                </select>

                                <span
                                    class="lineup-form-status"
                                    data-status-for="${index + 1}"
                                ></span>

                            </div>

                        `;

                    }
                ).join('')}

            </div>


            <div class="lineup-form-actions">

                <button
                    type="button"
                    id="clearAllBtn"
                    class="lineup-form-clear-btn"
                >
                    🗑️ 清除全部
                </button>

                <button
                    type="button"
                    id="autoOrderBtn"
                    class="lineup-form-ai-btn"
                >
                    🤖 AI 建立先發
                </button>


                <button
                    type="button"
                    id="saveLineupBtn"
                    class="lineup-form-save-btn"
                >
                    💾 儲存先發
                </button>

            </div>

        </section>

    `;


    // ========================================================
    // Selects
    // ========================================================

    const selects = [
        ...container.querySelectorAll(
            '.lineup-player-select'
        )
    ];


    // ========================================================
    // Duplicate Warning
    // ========================================================

    function updateDuplicateWarnings() {

        const selected =
            selects.map(
                select =>
                    select.value
            );

        selects.forEach(
            (select, index) => {

                const status =
                    container.querySelector(
                        `[data-status-for="${index + 1}"]`
                    );

                if (!status) {
                    return;
                }

                const value =
                    select.value;

                if (!value) {

                    status.textContent = '';

                    status.className =
                        'lineup-form-status';

                    return;
                }

                const count =
                    selected.filter(
                        id =>
                            id === value
                    ).length;

                if (count > 1) {

                    status.textContent =
                        '⚠ 重複球員';

                    status.className =
                        'lineup-form-status error';

                } else {

                    status.textContent =
                        '✓';

                    status.className =
                        'lineup-form-status ok';

                }

            }
        );

    }


    // ========================================================
    // Selected Starters
    // ========================================================

    function getSelectedStarters() {

        // Get all currently used positions to avoid duplicates
        const usedPositions = new Set();
        const allFieldPositions = ['P', 'C', 'SS', 'CF', '1B', '3B', '2B', 'RF', 'LF'];

        const result = selects.map(
            (select, index) => {

                const playerId =
                    select.value;

                const player =
                    players.find(
                        item =>
                            String(
                                getPlayerId(item)
                            ) ===
                            String(playerId)
                    );

                const order =
                    index + 1;

                // Use AI-assigned position if available
                let position = aiAssignedPositions.get(playerId) || '';

                if (!position && player) {
                    // If no AI assignment, get player's best position
                    const playerPosition = getPlayerPosition(player);
                    
                    // Check if this position is already used
                    if (usedPositions.has(playerPosition)) {
                        // Find an available position from player's positions
                        const playerPositions = getPlayerPositions(player);
                        const availablePosition = playerPositions.find(p => 
                            !usedPositions.has(p.code) && allFieldPositions.includes(p.code)
                        );
                        
                        if (availablePosition) {
                            position = availablePosition.code;
                        } else {
                            // Fallback to first available field position
                            const fallbackPosition = allFieldPositions.find(pos => !usedPositions.has(pos));
                            position = fallbackPosition || playerPosition;
                        }
                    } else {
                        position = playerPosition;
                    }
                }

                // Mark position as used
                if (position) {
                    usedPositions.add(position);
                }

                return {

                    playerId,

                    battingOrder:
                        order,

                    order,

                    position

                };

            }
        );

        return result;

    }


    // ========================================================
    // Validate
    // ========================================================

    function validateCurrentForm() {

        const starters =
            getSelectedStarters();

        const result =
            getLineupValidationResult(
                starters,
                allPlayers
            );

        return {
            starters,
            result
        };

    }


    // ========================================================
    // Save
    // ========================================================

    function handleSave() {

        const {
            starters,
            result
        } =
            validateCurrentForm();


        if (!result.valid) {

            showMessage(
                container,
                'error',
                result.errors
            );

            return;
        }


        const current =
            getCurrentLineup();


        const saved =
            current
                ? updateLineup(starters)
                : saveLineup(starters);


        if (!saved) {

            showMessage(
                container,
                'error',
                '先發名單儲存失敗，請檢查資料。'
            );

            return;
        }


        showSuccess(
            container
        );


        if (
            result.warnings.length > 0
        ) {

            window.setTimeout(
                () => {

                    showMessage(
                        container,
                        'warning',
                        result.warnings
                    );

                },
                1900
            );

        }


        // ====================================================
        // 即時同步事件
        // ====================================================

        window.dispatchEvent(
            new CustomEvent(
                'lineup:updated',
                {
                    detail: {
                        lineup: starters
                    }
                }
            )
        );


        window.dispatchEvent(
            new CustomEvent(
                'lineup:saved',
                {
                    detail: {
                        lineup: starters
                    }
                }
            )
        );


        window.dispatchEvent(
            new CustomEvent(
                'lineup:form-saved',
                {
                    detail: {
                        lineup: starters
                    }
                }
            )
        );

    }


    // ========================================================
    // AI Smart Order
    // ========================================================

    function handleAIOrder() {

        if (
            players.length < 9
        ) {

            showMessage(
                container,
                'error',
                `可用球員不足 9 人，目前只有 ${players.length} 人。`
            );

            return;
        }


        const smartOrder =
            generateSmartOrder(
                allPlayers
            );


        if (
            !Array.isArray(smartOrder) ||
            smartOrder.length !== 9
        ) {

            console.log('❌ Invalid smart order result');
            showMessage(
                container,
                'error',
                'AI 無法建立完整的 9 人先發名單。請確保至少 9 位球員已設定適合棒次。'
            );

            return;
        }


        // ====================================================
        // AI 新格式
        //
        // {
        //     playerId,
        //     battingOrder,
        //     order,
        //     position
        // }
        // ====================================================

        selects.forEach(
            (select, index) => {

                const item =
                    smartOrder[index];

                const playerId =
                    item?.playerId ??
                    '';

                const assignedPosition =
                    item?.position ??
                    '';

                select.value =
                    String(playerId);

                // Store AI-assigned position in the map
                aiAssignedPositions.set(playerId, assignedPosition);

                // Update the option text to show assigned position
                const selectedOption = select.querySelector(`option[value="${playerId}"]`);
                if (selectedOption) {
                    const player = players.find(p => String(getPlayerId(p)) === String(playerId));
                    if (player) {
                        const name = getPlayerName(player);
                        const number = getPlayerNumber(player);
                        selectedOption.textContent = `#${number} ${name} ${assignedPosition}`;
                    }
                }

            }
        );


        updateDuplicateWarnings();


        showMessage(
            container,
            'success',
            'AI 已根據守備評分建立建議先發，請確認後按「儲存先發」。'
        );

    }


    // ========================================================
    // Select Events
    // ========================================================

    const selectHandlers =
        new Map();

    // Store AI-assigned positions globally within the container
    // Retrieve existing assignments if container was previously rendered
    const aiAssignedPositions = container._aiAssignedPositions || new Map();

    const clearAllHandler = () => {
        if (confirm('確定要清除所有先發名單嗎？此操作將清空所有欄位的球員選擇並清除已儲存的先發名單。')) {
            selects.forEach(select => {
                select.value = '';
            });
            aiAssignedPositions.clear(); // Clear AI assignments
            updateDuplicateWarnings();
            
            // Clear the stored lineup
            clearCurrentLineup();
            
            showMessage(
                container,
                'success',
                '已清除所有先發名單'
            );
            
            // Clear message after delay
            window.setTimeout(() => {
                showMessage(container, '', []);
            }, 1500);
        }
    };

    // Clear AI assignment when user manually changes a player
    const manualChangeHandler = (select) => {
        const playerId = select.value;
        if (playerId) {
            // Remove any existing AI assignment for this player
            aiAssignedPositions.delete(playerId);
        }
    };


    selects.forEach(
        select => {

            const handler =
                () => {
                    manualChangeHandler(select);
                    updateDuplicateWarnings();

                    showMessage(
                        container,
                        '',
                        []
                    );

                };


            selectHandlers.set(
                select,
                handler
            );


            select.addEventListener(
                'change',
                handler
            );

            // Update option text if this player has an AI-assigned position
            const existingPlayerId = select.value;
            if (existingPlayerId && aiAssignedPositions.has(existingPlayerId)) {
                const assignedPosition = aiAssignedPositions.get(existingPlayerId);
                const player = players.find(p => String(getPlayerId(p)) === String(existingPlayerId));
                if (player) {
                    const name = getPlayerName(player);
                    const number = getPlayerNumber(player);
                    const selectedOption = select.querySelector(`option[value="${existingPlayerId}"]`);
                    if (selectedOption) {
                        selectedOption.textContent = `#${number} ${name} ${assignedPosition}`;
                    }
                }
            }

        }
    );


    // ========================================================
    // Buttons
    // ========================================================

    const saveButton =
        container.querySelector(
            '#saveLineupBtn'
        );

    const aiButton =
        container.querySelector(
            '#autoOrderBtn'
        );

    const clearAllButton =
        container.querySelector(
            '#clearAllBtn'
        );


    if (saveButton) {
        saveButton.addEventListener(
            'click',
            handleSave
        );
    }


    if (aiButton) {
        aiButton.addEventListener(
            'click',
            handleAIOrder
        );
    }

    if (clearAllButton) {
        clearAllButton.addEventListener('click', clearAllHandler);
    }


    // ========================================================
    // Initial State
    // ========================================================

    updateDuplicateWarnings();


    // ========================================================
    // Cleanup
    // ========================================================

    container._lineupFormCleanup =
        () => {

            selectHandlers.forEach(
                (
                    handler,
                    select
                ) => {

                    select.removeEventListener(
                        'change',
                        handler
                    );

                }
            );


            if (saveButton) {

                saveButton.removeEventListener(
                    'click',
                    handleSave
                );

            }


            if (aiButton) {

                aiButton.removeEventListener(
                    'click',
                    handleAIOrder
                );

            }


            if (clearAllButton) {
                clearAllButton.removeEventListener('click', clearAllHandler);
            }


            container._lineupFormCleanup =
                null;

        };

    // Save the AI positions map to container for persistence
    container._aiAssignedPositions = aiAssignedPositions;

}


// ============================================================
// Default Export
// ============================================================

export default {

    renderLineupForm

};
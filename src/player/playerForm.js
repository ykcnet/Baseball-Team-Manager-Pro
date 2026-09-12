// ============================================================
// Baseball Team Manager Pro
// Player Form
//
// Final Version
// - Add Player
// - Edit Player
// - Jersey Number
// - Player Name
// - Defensive Position
// - Injury Status
// - Suspension Status
// - Note
// - Validation
// - player:added
// - player:updated
// ============================================================

import {
    addPlayer,
    updatePlayer
} from './playerManager.js';
import { loadData, saveData } from '../core/storage.js';


// ============================================================
// Defensive Positions
// ============================================================

const POSITIONS = [
    { code: 'P', name: '投手' },
    { code: 'C', name: '捕手' },
    { code: '1B', name: '一壘手' },
    { code: '2B', name: '二壘手' },
    { code: '3B', name: '三壘手' },
    { code: 'SS', name: '游擊手' },
    { code: 'LF', name: '左外野' },
    { code: 'CF', name: '中外野' },
    { code: 'RF', name: '右外野' },
    { code: 'DH', name: '指定打擊' }
];


// ============================================================
// Batting Orders
// ============================================================

const BATTING_ORDERS = [
    { code: '1', name: '第1棒' },
    { code: '2', name: '第2棒' },
    { code: '3', name: '第3棒' },
    { code: '4', name: '第4棒' },
    { code: '5', name: '第5棒' },
    { code: '6', name: '第6棒' },
    { code: '7', name: '第7棒' },
    { code: '8', name: '第8棒' },
    { code: '9', name: '第9棒' }
];


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
// Render Player Form
//
// options:
// {
//     player: null,
//     onSaved: function
// }
//
// player = null → 新增模式
// player = object → 編輯模式
// ============================================================

export function renderPlayerForm(
    container,
    options = {}
) {

    if (!container) {

        return;

    }


    const player =
        options?.player ?? null;


    const editing =
        Boolean(
            player &&
            player.id
        );


    // ========================================================
    // Form HTML
    // ========================================================

    container.innerHTML = `

        <section
            class="player-form"
            data-mode="${
                editing
                    ? 'edit'
                    : 'add'
            }"
        >

            <div
                class="player-form-header"
            >

                <div>

                    <h3>

                        ${
                            editing
                                ? '✏️ 編輯球員'
                                : '⚾ 新增球員'
                        }

                    </h3>

                    <p>

                        ${
                            editing
                                ? '修改球員資料'
                                : '建立球員基本資料與目前出賽狀態'
                        }

                    </p>

                </div>

            </div>


            <div
                id="playerFormMessage"
                class="player-form-message"
                role="status"
                aria-live="polite"
            ></div>


            <!-- ==================================================
                 Jersey Number
            =================================================== -->

            <div
                class="player-form-field"
            >

                <label
                    for="playerNumber"
                >
                    背號
                </label>

                <input
                    id="playerNumber"
                    type="text"
                    inputmode="numeric"
                    maxlength="3"
                    placeholder="例如：10"
                    autocomplete="off"
                    value="${escapeHtml(
                        player?.number ??
                        player?.jerseyNumber ??
                        ''
                    )}"
                >

            </div>


            <!-- ==================================================
                 Name
            =================================================== -->

            <div
                class="player-form-field"
            >

                <label
                    for="playerName"
                >
                    姓名
                </label>

                <input
                    id="playerName"
                    type="text"
                    maxlength="30"
                    placeholder="請輸入球員姓名"
                    autocomplete="off"
                    value="${escapeHtml(
                        player?.name ??
                        player?.playerName ??
                        ''
                    )}"
                >

            </div>


            <!-- ==================================================
                 Position
            =================================================== -->

            <div
                class="player-form-field"
            >

                <label>
                    守備位置與評分
                </label>

                <div
                    id="positionsGrid"
                    class="positions-grid"
                >

                    ${
                        POSITIONS
                            .map(
                                position => {
                                    const existingPosition = player?.positions?.find(
                                        p => p.code === position.code
                                    );
                                    const rating = existingPosition?.rating || 0;
                                    const isChecked = existingPosition !== undefined;

                                    return `
                                        <div
                                            class="position-item"
                                            data-position="${escapeHtml(position.code)}"
                                        >

                                            <label
                                                class="position-checkbox"
                                            >

                                                <input
                                                    type="checkbox"
                                                    class="position-checkbox-input"
                                                    value="${escapeHtml(position.code)}"
                                                    ${
                                                        isChecked
                                                            ? 'checked'
                                                            : ''
                                                    }
                                                >

                                                <span
                                                    class="position-code"
                                                >
                                                    ${escapeHtml(position.code)}
                                                </span>

                                                <span
                                                    class="position-name"
                                                >
                                                    ${escapeHtml(position.name)}
                                                </span>

                                            </label>

                                            <div
                                                class="position-rating"
                                            >

                                                <label
                                                    class="rating-label"
                                                >
                                                    評分
                                                </label>

                                                <select
                                                    class="rating-select"
                                                    ${
                                                        !isChecked
                                                            ? 'disabled'
                                                            : ''
                                                    }
                                                >

                                                    ${
    Array.from(
        { length: 101 },
        (_, value) => value
    )
    .map(
        value => `
            <option
                value="${value}"
                ${
                    rating === value
                        ? 'selected'
                        : ''
                }
            >
                ${
                    value === 0
                        ? '不會'
                        : `${value} 分`
                }
            </option>
        `
    )
    .join('')
}

                                                </select>

                                            </div>

                                        </div>
                                    `;
                                }
                            )
                            .join('')
                    }

                </div>

                <p
                    class="position-help"
                >
                    可選擇多個守備位置，評分越高代表能力越強（1-5分，0為不會該位置）
                </p>

            </div>


            <!-- ==================================================
                 Batting Order
            =================================================== -->

            <div
                class="player-form-field"
            >

                <label>
                    適合棒次
                </label>

                <div
                    id="battingOrdersGrid"
                    class="positions-grid"
                >

                    ${
                        BATTING_ORDERS
                            .map(
                                order => {
                                    const existingOrder = player?.battingOrders?.find(
                                        o => o.code === order.code
                                    );
                                    const isChecked = existingOrder !== undefined;

                                    return `
                                        <div
                                            class="position-item"
                                            data-order="${escapeHtml(order.code)}"
                                        >

                                            <label
                                                class="position-checkbox"
                                            >

                                                <input
                                                    type="checkbox"
                                                    class="order-checkbox-input"
                                                    value="${escapeHtml(order.code)}"
                                                    ${
                                                        isChecked
                                                            ? 'checked'
                                                            : ''
                                                    }
                                                >

                                                <span
                                                    class="position-code"
                                                >
                                                    ${escapeHtml(order.code)}
                                                </span>

                                                <span
                                                    class="position-name"
                                                >
                                                    ${escapeHtml(order.name)}
                                                </span>

                                            </label>

                                        </div>
                                    `;
                                }
                            )
                            .join('')
                    }

                </div>

                <p
                    class="position-help"
                >
                    可選擇多個棒次，AI建立先發名單時會根據此選擇分配球員到適合的棒次
                </p>

            </div>


            <!-- ==================================================
                 Status
            =================================================== -->

            <div
                class="player-form-status"
            >

                <label>

                    <input
                        id="playerInjured"
                        type="checkbox"
                        ${
                            player?.injured === true
                                ? 'checked'
                                : ''
                        }
                    >

                    <span>
                        受傷
                    </span>

                </label>


                <label>

                    <input
                        id="playerSuspended"
                        type="checkbox"
                        ${
                            player?.suspended === true
                                ? 'checked'
                                : ''
                        }
                    >

                    <span>
                        停賽
                    </span>

                </label>

            </div>


            <!-- ==================================================
                 Statistics (only in edit mode)
            =================================================== -->

            ${
                editing
                    ? `
                    
                    <div
                        class="player-form-field"
                    >

                        <div
                            class="stats-header"
                        >
                            <label>
                                統計數據
                            </label>
                            <button
                                type="button"
                                id="importStatsBtn"
                                class="import-stats-btn"
                            >
                                📥 從比賽紀錄匯入
                            </button>
                        </div>

                        <div
                            class="stats-grid"
                        >

                            <div
                                class="stat-field"
                            >

                                <label
                                    for="battingAverage"
                                >
                                    打擊率
                                </label>

                                <input
                                    id="battingAverage"
                                    type="text"
                                    placeholder=".000"
                                    value="${escapeHtml(
                                        player?.stats?.battingAverage ??
                                        player?.battingAverage ??
                                        ''
                                    )}"
                                >

                            </div>

                            <div
                                class="stat-field"
                            >

                                <label
                                    for="strikeouts"
                                >
                                    三振數
                                </label>

                                <input
                                    id="strikeouts"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value="${escapeHtml(
                                        player?.stats?.strikeouts ??
                                        player?.strikeouts ??
                                        ''
                                    )}"
                                >

                            </div>

                            <div
                                class="stat-field"
                            >

                                <label
                                    for="walks"
                                >
                                    保送數
                                </label>

                                <input
                                    id="walks"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value="${escapeHtml(
                                        player?.stats?.walks ??
                                        player?.walks ??
                                        ''
                                    )}"
                                >

                            </div>

                            <div
                                class="stat-field"
                            >

                                <label
                                    for="stolenBases"
                                >
                                    盜壘
                                </label>

                                <input
                                    id="stolenBases"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value="${escapeHtml(
                                        player?.stats?.stolenBases ??
                                        player?.stolenBases ??
                                        ''
                                    )}"
                                >

                            </div>

                        </div>

                    </div>

                    `
                    : ''
            }


            <!-- ==================================================
                 Note
            =================================================== -->

            <div
                class="player-form-field"
            >

                <label
                    for="playerNote"
                >
                    備註
                </label>

                <textarea
                    id="playerNote"
                    rows="3"
                    maxlength="200"
                    placeholder="球員備註"
                >${escapeHtml(
                    player?.note ??
                    ''
                )}</textarea>

            </div>


            <!-- ==================================================
                 Actions
            =================================================== -->

            <div
                class="player-form-actions"
            >

                <button
                    type="button"
                    id="savePlayerBtn"
                    class="player-form-add-btn"
                >

                    ${
                        editing
                            ? '💾 儲存修改'
                            : '➕ 新增球員'
                    }

                </button>


                ${
                    editing
                        ? `

                            <button
                                type="button"
                                id="cancelEditBtn"
                                class="player-form-cancel-btn"
                            >
                                取消編輯
                            </button>

                        `
                        : ''
                }

            </div>

        </section>

    `;


    // ========================================================
    // Elements
    // ========================================================

    const numberInput =
        container.querySelector(
            '#playerNumber'
        );


    const nameInput =
        container.querySelector(
            '#playerName'
        );


    const positionsContainer =
        container.querySelector(
            '#positionsGrid'
        );

    const battingOrdersContainer =
        container.querySelector(
            '#battingOrdersGrid'
        );


    const injuredInput =
        container.querySelector(
            '#playerInjured'
        );


    const suspendedInput =
        container.querySelector(
            '#playerSuspended'
        );


    const noteInput =
        container.querySelector(
            '#playerNote'
        );

    const importStatsButton =
        container.querySelector(
            '#importStatsBtn'
        );

    const battingAverageInput =
        container.querySelector(
            '#battingAverage'
        );

    const strikeoutsInput =
        container.querySelector(
            '#strikeouts'
        );

    const walksInput =
        container.querySelector(
            '#walks'
        );

    const stolenBasesInput =
        container.querySelector(
            '#stolenBases'
        );


    const saveButton =
        container.querySelector(
            '#savePlayerBtn'
        );


    const cancelButton =
        container.querySelector(
            '#cancelEditBtn'
        );


    const messageBox =
        container.querySelector(
            '#playerFormMessage'
        );

    // ========================================================
    // Position checkbox handlers
    // ========================================================

    const positionHandlers = [];
    
    if (positionsContainer) {
        const checkboxes = positionsContainer.querySelectorAll('.position-checkbox-input');
        
        checkboxes.forEach(checkbox => {
            const handlePositionChange = (e) => {
                const positionItem = e.target.closest('.position-item');
                const ratingSelect = positionItem.querySelector('.rating-select');
                
                if (ratingSelect) {
                    ratingSelect.disabled = !e.target.checked;
                    if (e.target.checked && ratingSelect.value === '0') {
                        ratingSelect.value = '3'; // Default to average rating
                    }
                }
            };
            
            checkbox.addEventListener('change', handlePositionChange);
            positionHandlers.push({ element: checkbox, handler: handlePositionChange });
        });
    }

    // ========================================================
    // Batting order checkbox handlers
    // ========================================================

    const battingOrderHandlers = [];
    
    if (battingOrdersContainer) {
        const checkboxes = battingOrdersContainer.querySelectorAll('.order-checkbox-input');
        
        checkboxes.forEach(checkbox => {
            const handleOrderChange = (e) => {
                // No rating handling needed anymore
            };
            
            checkbox.addEventListener('change', handleOrderChange);
            battingOrderHandlers.push({ element: checkbox, handler: handleOrderChange });
        });
    }


    // ========================================================
    // Import Stats from Game Records
    // ========================================================

    if (importStatsButton && editing) {
        importStatsButton.addEventListener('click', () => {
            try {
                const data = loadData();
                const gameRecords = Array.isArray(data.gameRecords) ? data.gameRecords : [];
                
                if (gameRecords.length === 0) {
                    showMessage('error', '目前沒有比賽紀錄可以匯入');
                    return;
                }
                
                // Find all batting records for this player across all game records
                let totalAtBats = 0;
                let totalHits = 0;
                let totalStrikeouts = 0;
                let totalWalks = 0;
                let totalStolenBases = 0;
                
                gameRecords.forEach(record => {
                    if (record.battingRecords && Array.isArray(record.battingRecords)) {
                        const playerRecord = record.battingRecords.find(
                            br => String(br.playerId) === String(player.id)
                        );
                        
                        if (playerRecord) {
                            totalAtBats += parseInt(playerRecord.atBats) || 0;
                            totalHits += parseInt(playerRecord.hits) || 0;
                            totalStrikeouts += parseInt(playerRecord.strikeouts) || 0;
                            totalWalks += parseInt(playerRecord.walks) || 0;
                            totalStolenBases += parseInt(playerRecord.stolenBases) || 0;
                        }
                    }
                });
                
                // Calculate batting average
                const battingAverage = totalAtBats > 0 
                    ? (totalHits / totalAtBats).toFixed(3) 
                    : '.000';
                
                // Update form fields
                if (battingAverageInput) {
                    battingAverageInput.value = battingAverage;
                }
                if (strikeoutsInput) {
                    strikeoutsInput.value = totalStrikeouts;
                }
                if (walksInput) {
                    walksInput.value = totalWalks;
                }
                if (stolenBasesInput) {
                    stolenBasesInput.value = totalStolenBases;
                }
                
                showMessage('success', `✓ 已從 ${gameRecords.length} 筆比賽紀錄匯入統計數據`);
                
            } catch (error) {
                console.error('匯入統計數據失敗：', error);
                showMessage('error', '匯入統計數據失敗，請稍後再試');
            }
        });
    }

    // ========================================================
    // Message
    // ========================================================

    function showMessage(
        type,
        message
    ) {

        if (!messageBox) {

            return;

        }


        messageBox.className =
            `player-form-message ${type}`;


        messageBox.innerHTML =
            escapeHtml(
                message
            );

    }


    // ========================================================
    // Clear Form
    // ========================================================

    function clearForm() {

        if (numberInput) {

            numberInput.value =
                '';

        }


        if (nameInput) {

            nameInput.value =
                '';

        }


        if (positionsContainer) {
            const checkboxes = positionsContainer.querySelectorAll('.position-checkbox-input');
            const selects = positionsContainer.querySelectorAll('.rating-select');
            
            checkboxes.forEach(cb => cb.checked = false);
            selects.forEach(select => {
                select.value = '0';
                select.disabled = true;
            });
        }

        if (battingOrdersContainer) {
            const checkboxes = battingOrdersContainer.querySelectorAll('.order-checkbox-input');
            checkboxes.forEach(cb => cb.checked = false);
        }


        if (injuredInput) {

            injuredInput.checked =
                false;

        }


        if (suspendedInput) {

            suspendedInput.checked =
                false;

        }


        if (noteInput) {

            noteInput.value =
                '';

        }

    }


    // ========================================================
    // Save
    // ========================================================

    if (saveButton) {

        saveButton.addEventListener(
            'click',
            () => {

                const number =
                    numberInput
                        ?.value
                        ?.trim() ??
                    '';


                const name =
                    nameInput
                        ?.value
                        ?.trim() ??
                    '';


                // Collect positions with ratings
                const positions = [];
                if (positionsContainer) {
                    const positionItems = positionsContainer.querySelectorAll('.position-item');
                    
                    positionItems.forEach(item => {
                        const checkbox = item.querySelector('.position-checkbox-input');
                        const select = item.querySelector('.rating-select');
                        
                        if (checkbox && checkbox.checked && select) {
                            positions.push({
                                code: checkbox.value,
                                rating: parseInt(select.value) || 0
                            });
                        }
                    });
                }

                const position = positions[0]?.code || '';

                // Collect batting orders without ratings
                const battingOrders = [];
                if (battingOrdersContainer) {
                    const orderItems = battingOrdersContainer.querySelectorAll('.position-item');
                    
                    orderItems.forEach(item => {
                        const checkbox = item.querySelector('.order-checkbox-input');
                        
                        if (checkbox && checkbox.checked) {
                            battingOrders.push({
                                code: checkbox.value
                            });
                        }
                    });
                }


                const injured =
                    injuredInput
                        ?.checked ===
                    true;


                const suspended =
                    suspendedInput
                        ?.checked ===
                    true;


                const note =
                    noteInput
                        ?.value
                        ?.trim() ??
                    '';

                // Collect statistics if in edit mode
                let stats = {};
                if (editing) {
                    const battingAverage = battingAverageInput?.value?.trim() || '';
                    const strikeouts = parseInt(strikeoutsInput?.value) || 0;
                    const walks = parseInt(walksInput?.value) || 0;
                    const stolenBases = parseInt(stolenBasesInput?.value) || 0;
                    
                    if (battingAverage || strikeouts > 0 || walks > 0 || stolenBases > 0) {
                        stats = {
                            battingAverage,
                            strikeouts,
                            walks,
                            stolenBases
                        };
                    }
                }


                // ==================================================
                // Validation
                // ==================================================

                if (!number) {

                    showMessage(
                        'error',
                        '請輸入球員背號。'
                    );

                    numberInput?.focus();

                    return;

                }


                if (!name) {

                    showMessage(
                        'error',
                        '請輸入球員姓名。'
                    );

                    nameInput?.focus();

                    return;

                }


                if (positions.length === 0) {
                    showMessage(
                        'error',
                        '請至少選擇一個守備位置並設定評分。'
                    );
                    return;
                }


                const playerData = {

                    number,

                    name,

                    position: positions[0]?.code || position, // Keep single position for compatibility
                    positions,
                    battingOrders,
                    injured,

                    suspended,

                    note

                };

                // Add statistics if in edit mode
                if (editing && Object.keys(stats).length > 0) {
                    playerData.stats = stats;
                }


                // ==================================================
                // Edit
                // ==================================================

                if (editing) {

                    try {

                        const result =
                            updatePlayer(
                                player.id,
                                playerData
                            );


                        if (
                            result ===
                            false
                        ) {

                            showMessage(
                                'error',
                                '找不到要修改的球員。'
                            );

                            return;

                        }


                        showMessage(
                            'success',
                            '✓ 球員資料已成功更新。'
                        );


                        if (
                            typeof options?.onSaved ===
                            'function'
                        ) {

                            options.onSaved(
                                {
                                    mode:
                                        'edit',

                                    playerId:
                                        player.id
                                }
                            );

                        }


                    } catch (error) {

                        console.error(
                            '更新球員失敗：',
                            error
                        );


                        showMessage(
                            'error',
                            '球員資料更新失敗。'
                        );

                    }


                    return;

                }


                // ==================================================
                // Add
                // ==================================================

                try {

                    addPlayer(
                        playerData
                    );


                    showMessage(
                        'success',
                        '✓ 球員已成功新增。'
                    );


                    clearForm();


                    numberInput?.focus();


                    if (
                        typeof options?.onSaved ===
                        'function'
                    ) {

                        options.onSaved(
                            {
                                mode:
                                    'add'
                            }
                        );

                    }


                    window.setTimeout(
                        () => {

                            if (
                                messageBox
                            ) {

                                messageBox.innerHTML =
                                    '';

                                messageBox.className =
                                    'player-form-message';

                            }

                        },
                        1800
                    );


                } catch (error) {

                    console.error(
                        '新增球員失敗：',
                        error
                    );


                    showMessage(
                        'error',
                        '新增球員失敗，請稍後再試。'
                    );

                }

            }
        );

    }


    // ========================================================
    // Cancel Edit
    // ========================================================

    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            () => {

                if (
                    typeof options?.onCancel ===
                    'function'
                ) {

                    options.onCancel();

                    return;

                }


                clearForm();


                showMessage(
                    'success',
                    '已取消編輯。'
                );

            }
        );

    }

    // ========================================================
    // Cleanup handlers
    // ========================================================

    container._playerFormCleanup = () => {
        positionHandlers.forEach(({ element, handler }) => {
            element.removeEventListener('change', handler);
        });
        battingOrderHandlers.forEach(({ element, handler }) => {
            element.removeEventListener('change', handler);
        });
    };

}


// ============================================================
// Default Export
// ============================================================

export default {

    renderPlayerForm

};
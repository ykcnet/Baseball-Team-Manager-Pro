// ============================================================
// Baseball Team Manager Pro
// Lineup Page
//
// Final Version
// - Lineup Form
// - Lineup Card
// - Player 即時同步
// - Lineup 即時同步
// - Lineup Card 編輯
// - Event Cleanup
// ============================================================

import {
    renderLineupForm
} from './lineupForm.js';

import {
    renderLineupCard
} from './lineupCard.js';


// ============================================================
// Render Lineup Page
// ============================================================

export function renderLineupPage(
    container
) {

    if (!container) {

        return;

    }


    // ========================================================
    // 如果頁面之前有註冊事件
    // 先清理
    // ========================================================

    if (
        typeof container._lineupCleanup ===
        'function'
    ) {

        container._lineupCleanup();

    }


    // ========================================================
    // HTML
    // ========================================================

    container.innerHTML = `

        <section
            class="lineup-page"
        >

            <div
                class="lineup-page-header"
            >

                <div>

                    <h2>
                        ⚾ 先發 Order
                    </h2>

                    <p>
                        建立、調整與管理球隊先發名單
                    </p>

                </div>

            </div>


            <div
                id="lineup-form"
                class="lineup-form-container"
            ></div>


            <div
                id="lineup-card"
                class="lineup-card-container"
            ></div>

        </section>

    `;


    // ========================================================
    // 取得容器
    // ========================================================

    const form =
        container.querySelector(
            '#lineup-form'
        );


    const card =
        container.querySelector(
            '#lineup-card'
        );


    if (
        !form ||
        !card
    ) {

        return;

    }


    // ========================================================
    // Render
    // ========================================================

    function refreshForm() {

        renderLineupForm(
            form
        );

    }


    function refreshCard() {

        renderLineupCard(
            card
        );

    }


    function refreshAll() {

        refreshForm();

        refreshCard();

    }


    // ========================================================
    // 初始 Render
    // ========================================================

    refreshAll();


    // ========================================================
    // Player 新增
    // ========================================================

    const playerAddedHandler =
        () => {

            refreshForm();

            refreshCard();

        };


    // ========================================================
    // Player 刪除
    // ========================================================

    const playerRemovedHandler =
        () => {

            refreshForm();

            refreshCard();

        };


    // ========================================================
    // Player 更新
    // ========================================================

    const playerUpdatedHandler =
        () => {

            refreshForm();

            refreshCard();

        };


    // ========================================================
    // Lineup 更新
    // ========================================================

    const lineupUpdatedHandler =
        () => {

            refreshCard();

        };


    // ========================================================
    // Lineup 儲存
    // ========================================================

    const lineupSavedHandler =
        () => {

            refreshCard();

        };


    // ========================================================
    // Lineup Swap
    // ========================================================

    const lineupSwapHandler =
        () => {

            refreshCard();

        };


    // ========================================================
    // Player Events
    // ========================================================

    window.addEventListener(
        'player:added',
        playerAddedHandler
    );


    window.addEventListener(
        'player:removed',
        playerRemovedHandler
    );


    window.addEventListener(
        'player:updated',
        playerUpdatedHandler
    );


    // ========================================================
    // Lineup Events
    // ========================================================

    window.addEventListener(
        'lineup:updated',
        lineupUpdatedHandler
    );


    window.addEventListener(
        'lineup:saved',
        lineupSavedHandler
    );


    window.addEventListener(
        'lineup:swap',
        lineupSwapHandler
    );


    // ========================================================
    // Lineup Card → 編輯
    // ========================================================

    const lineupEditHandler =
        () => {

            refreshForm();


            form.scrollIntoView({

                behavior:
                    'smooth',

                block:
                    'start'

            });

        };


    card.addEventListener(
        'lineup:edit',
        lineupEditHandler
    );


    // ========================================================
    // Cleanup
    // ========================================================

    container._lineupCleanup =
        () => {

            window.removeEventListener(
                'player:added',
                playerAddedHandler
            );


            window.removeEventListener(
                'player:removed',
                playerRemovedHandler
            );


            window.removeEventListener(
                'player:updated',
                playerUpdatedHandler
            );


            window.removeEventListener(
                'lineup:updated',
                lineupUpdatedHandler
            );


            window.removeEventListener(
                'lineup:saved',
                lineupSavedHandler
            );


            window.removeEventListener(
                'lineup:swap',
                lineupSwapHandler
            );


            card.removeEventListener(
                'lineup:edit',
                lineupEditHandler
            );


            container._lineupCleanup =
                null;

        };

}


// ============================================================
// Default Export
// ============================================================

export default {

    renderLineupPage

};
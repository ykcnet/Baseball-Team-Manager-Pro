// ============================================================
// Baseball Team Manager Pro
// Player Page
//
// Final Version
// - Player Form
// - Player List
// - Add Player
// - Edit Player
// - Delete Player
// - Player List ↔ Form synchronization
// - Event Cleanup
// ============================================================

import {
    renderPlayerList
} from './playerList.js';

import {
    renderPlayerForm
} from './playerForm.js';


// ============================================================
// Render Player Page
// ============================================================

export function renderPlayerPage(
    container
) {

    if (!container) {

        return;

    }


    // ========================================================
    // Cleanup previous page
    // ========================================================

    if (
        typeof container._playerPageCleanup ===
        'function'
    ) {

        container._playerPageCleanup();

    }


    // ========================================================
    // HTML
    // ========================================================

    container.innerHTML = `

        <section
            class="player-page"
        >

            <div
                class="player-page-header"
            >

                <div>

                    <h2>
                        ⚾ 球員管理
                    </h2>

                    <p>
                        新增、修改與管理球員資料
                    </p>

                </div>

            </div>


            <div
                id="player-form"
                class="player-form-container"
            ></div>


            <div
                id="player-list"
                class="player-list-container"
            ></div>

        </section>

    `;


    const form =
        container.querySelector(
            '#player-form'
        );


    const list =
        container.querySelector(
            '#player-list'
        );


    if (!form || !list) {

        return;

    }


    // ========================================================
    // Render Form
    // ========================================================

    function renderAddForm() {

        renderPlayerForm(
            form,
            {
                onSaved: () => {

                    renderPlayerList(
                        list,
                        {
                            onEdit:
                                handleEdit
                        }
                    );

                }
            }
        );

    }


    // ========================================================
    // Edit Player
    // ========================================================

    function handleEdit(
        player
    ) {

        if (!player) {

            return;

        }


        renderPlayerForm(
            form,
            {

                player,

                onSaved: () => {

                    renderAddForm();

                    renderPlayerList(
                        list,
                        {
                            onEdit:
                                handleEdit
                        }
                    );

                },


                onCancel: () => {

                    renderAddForm();

                    renderPlayerList(
                        list,
                        {
                            onEdit:
                                handleEdit
                        }
                    );

                }

            }
        );


        form.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

    }


    // ========================================================
    // Initial Render
    // ========================================================

    renderAddForm();


    renderPlayerList(
        list,
        {
            onEdit:
                handleEdit
        }
    );


    // ========================================================
    // Player Added
    // ========================================================

    const playerAddedHandler =
        () => {

            renderPlayerList(
                list,
                {
                    onEdit:
                        handleEdit
                }
            );

        };


    // ========================================================
    // Player Updated
    // ========================================================

    const playerUpdatedHandler =
        () => {

            renderPlayerList(
                list,
                {
                    onEdit:
                        handleEdit
                }
            );

        };


    // ========================================================
    // Player Removed
    // ========================================================

    const playerRemovedHandler =
        () => {

            renderPlayerList(
                list,
                {
                    onEdit:
                        handleEdit
                }
            );

        };


    // ========================================================
    // Event Listener
    // ========================================================

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
    // Cleanup
    // ========================================================

    container._playerPageCleanup =
        () => {

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


            if (
                typeof form?._playerFormCleanup ===
                'function'
            ) {

                form._playerFormCleanup();

            }


            if (
                typeof list?._playerListCleanup ===
                'function'
            ) {

                list._playerListCleanup();

            }


            container._playerPageCleanup =
                null;

        };

}


// ============================================================
// Default Export
// ============================================================

export default {

    renderPlayerPage

};
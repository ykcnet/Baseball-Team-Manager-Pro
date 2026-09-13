import { downloadTeamBackup, restoreTeamBackup, clearAllTeamData } from './teamBackup.js';

function showMessage(container, type, message) {
  const messageBox = container.querySelector('.backup-message');
  messageBox.className = `backup-message ${type}`;
  messageBox.textContent = message;
}

export function renderBackupPanel(container) {
  container.innerHTML = `
    <section class="backup-page">
      <div class="page-intro">
        <div>
          <p class="eyebrow">DATA BACKUP</p>
          <h2>球隊資料備份</h2>
          <p>備份會包含球員、先發名單、比賽資料與比賽事件。</p>
        </div>
        <div class="dashboard-ball" aria-hidden="true">💾</div>
      </div>
      
      <div class="backup-panel" aria-labelledby="backupTitle">
        <div class="backup-panel-header">
          <div>
            <h3 id="backupTitle">備份與還原</h3>
            <p>匯出備份可將球隊資料儲存為 JSON 檔案，匯入備份可還原之前的資料。</p>
          </div>
        </div>
        <div id="backupMessage" class="backup-message" role="status" aria-live="polite"></div>
        <div class="backup-actions">
          <button type="button" id="exportBackupBtn" class="backup-export-btn">⇩ 匯出備份</button>
          <button type="button" id="importBackupBtn" class="backup-import-btn">⇧ 匯入備份</button>
          <input id="backupFileInput" type="file" accept="application/json,.json" hidden>
        </div>
        <p class="backup-note">匯入會取代目前此瀏覽器中的球隊資料，請先匯出現有資料作為備份。</p>
      </div>

      <div class="backup-panel backup-danger-zone" aria-labelledby="clearDataTitle">
        <div class="backup-panel-header">
          <div>
            <h3 id="clearDataTitle">⚠️ 清除所有資料</h3>
            <p>把這台裝置上的球員、先發名單、比賽紀錄全部清空，通常用在要把 App 交給別人使用之前。</p>
          </div>
        </div>
        <button type="button" id="clearAllDataBtn" class="btn-danger">🗑️ 清除所有球員與比賽資料</button>
      </div>
    </section>
  `;

  const exportButton = container.querySelector('#exportBackupBtn');
  const importButton = container.querySelector('#importBackupBtn');
  const fileInput = container.querySelector('#backupFileInput');

  exportButton.addEventListener('click', () => {
    const backup = downloadTeamBackup();
    showMessage(container, 'success', `備份已下載（${backup.data.players.length} 位球員、${backup.data.lineups.length} 份先發）。`);
  });

  importButton.addEventListener('click', () => fileInput.click());

  const clearAllDataBtn = container.querySelector('#clearAllDataBtn');
  clearAllDataBtn.addEventListener('click', () => {
    const confirmed = window.confirm(
      '確定要清除這台裝置上「所有」球員、先發名單、比賽紀錄嗎？\n\n強烈建議先按「匯出備份」保留一份，這個動作無法復原。'
    );

    if (!confirmed) return;

    // 再多一道確認，避免手滑誤刪
    const doubleConfirmed = window.confirm('再次確認：真的要清空所有資料嗎？');
    if (!doubleConfirmed) return;

    clearAllTeamData();
    showMessage(container, 'success', '所有資料已清除，正在重新載入畫面。');
    window.setTimeout(() => window.location.reload(), 650);
  });

  fileInput.addEventListener('change', async () => {
    const [file] = fileInput.files;
    if (!file) return;

    try {
      const result = restoreTeamBackup(await file.text());
      const confirmed = window.confirm(
        `已讀取備份：${result.players} 位球員、${result.lineups} 份先發、${result.games} 場比賽。\n\n匯入會取代目前資料，確定繼續嗎？`
      );

      if (!confirmed) {
        showMessage(container, 'warning', '已取消匯入，現有資料沒有變更。');
        return;
      }

      // restoreTeamBackup already validates the whole file before data is committed.
      // Re-run only after the user has explicitly confirmed the replacement.
      restoreTeamBackup(await file.text());
      showMessage(container, 'success', '資料已匯入，正在重新載入畫面。');
      window.setTimeout(() => window.location.reload(), 650);
    } catch (error) {
      showMessage(container, 'error', error.message || '匯入失敗，請確認備份檔內容。');
    } finally {
      fileInput.value = '';
    }
  });
}

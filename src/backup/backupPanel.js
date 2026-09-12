import { downloadTeamBackup, restoreTeamBackup } from './teamBackup.js';

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

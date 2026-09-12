import { APP_CONFIG } from '../core/config.js';
import { loadData, saveData } from '../core/storage.js';

const BACKUP_FORMAT = 'baseball-team-manager-pro';
const BACKUP_VERSION = 1;
const GAME_EVENTS_KEY = 'btm_game_events';

function readGameEvents() {
  try {
    const events = JSON.parse(localStorage.getItem(GAME_EVENTS_KEY) || '[]');
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
}

function validCollection(value, name) {
  if (!Array.isArray(value)) {
    throw new Error(`備份檔中的 ${name} 格式不正確。`);
  }
  return value;
}

export function createTeamBackup() {
  const data = loadData();

  return {
    format: BACKUP_FORMAT,
    backupVersion: BACKUP_VERSION,
    appVersion: APP_CONFIG.version,
    exportedAt: new Date().toISOString(),
    data: {
      players: Array.isArray(data.players) ? data.players : [],
      lineups: Array.isArray(data.lineups) ? data.lineups : [],
      games: Array.isArray(data.games) ? data.games : [],
      gameEvents: readGameEvents()
    }
  };
}

export function downloadTeamBackup() {
  const backup = createTeamBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `baseball-team-backup-${date}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return backup;
}

export function restoreTeamBackup(rawText) {
  let backup;

  try {
    backup = JSON.parse(rawText);
  } catch {
    throw new Error('無法讀取此檔案，請選擇有效的 JSON 備份檔。');
  }

  if (
    !backup ||
    backup.format !== BACKUP_FORMAT ||
    backup.backupVersion !== BACKUP_VERSION ||
    !backup.data ||
    typeof backup.data !== 'object'
  ) {
    throw new Error('這不是 Baseball Team Manager Pro 的有效備份檔。');
  }

  const restoredData = {
    players: validCollection(backup.data.players, '球員名單'),
    lineups: validCollection(backup.data.lineups, '先發名單'),
    games: validCollection(backup.data.games, '比賽資料')
  };
  const gameEvents = validCollection(backup.data.gameEvents ?? [], '比賽事件');

  saveData(restoredData);
  localStorage.setItem(GAME_EVENTS_KEY, JSON.stringify(gameEvents));

  return {
    players: restoredData.players.length,
    lineups: restoredData.lineups.length,
    games: restoredData.games.length
  };
}

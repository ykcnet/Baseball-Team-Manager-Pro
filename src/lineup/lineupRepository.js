import { loadData, saveData } from '../core/storage.js';

const KEY = 'lineups';

export function loadLineups() {
  const data = loadData();
  return data[KEY] || [];
}

export function saveLineups(lineups) {
  const data = loadData();
  data[KEY] = lineups;
  saveData(data);
}
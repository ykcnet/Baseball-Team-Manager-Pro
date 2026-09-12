import { startApp } from './app.js';
import './css/style.css';
import './css/layout.css';
import './player/playerStyles.css';
import './scoreSheet/scoreSheetStyles.css';
import './backup/backupStyles.css';
import './records/recordQueryStyles.css';

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
  startApp();
}

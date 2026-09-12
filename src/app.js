import { renderHeader } from './components/header.js';
import { renderSidebar } from './components/sidebar.js';
import { initializeApp } from './appInitializer.js';
import { renderDashboard } from './dashboard/dashboardPage.js';

export function startApp() {
  initializeApp();

  const app = document.querySelector('#app');

  if (!app) return;

  app.innerHTML = `
    <div class="app-layout">
      <header id="header"></header>
      <aside id="sidebar"></aside>
      <main id="dashboard" class="content" tabindex="-1"></main>
    </div>
  `;

  renderHeader(document.querySelector('#header'));
  renderSidebar(document.querySelector('#sidebar'));
  renderDashboard(document.querySelector('#dashboard'));
}

window.addEventListener('DOMContentLoaded', startApp);

export function renderSidebar(element) {
  element.innerHTML = `
    <nav class="sidebar-nav" aria-label="主要導覽">
      <p class="sidebar-label">球隊工作區</p>
      <ul>
        <li><button type="button" class="nav-link active" data-page="dashboard"><span>⌂</span>球隊儀表板</button></li>
        <li><button type="button" class="nav-link" data-page="players"><span>♟</span>球員管理</button></li>
        <li><button type="button" class="nav-link" data-page="lineup"><span>⚾</span>先發 Order</button></li>
        <li><button type="button" class="nav-link" data-page="game"><span>▣</span>比賽紀錄查詢</button></li>
        <li><button type="button" class="nav-link" data-page="scoreSheet"><span>📋</span>比賽紀錄</button></li>
        <li><button type="button" class="nav-link" data-page="backup"><span>💾</span>資料備份</button></li>
      </ul>
    </nav>
    <div class="sidebar-footer">資料會安全儲存在這台裝置中</div>
  `;
}

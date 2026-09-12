export function renderHeader(element) {
  element.innerHTML = `
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">⚾</span>
      <div>
        <h1>Baseball Team Manager Pro</h1>
        <p>球隊攻守先發管理系統</p>
      </div>
    </div>
    <div class="header-status"><span></span>球隊管理中心</div>
  `;
}

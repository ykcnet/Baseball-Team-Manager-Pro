(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const d of a)if(d.type==="childList")for(const o of d.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(a){const d={};return a.integrity&&(d.integrity=a.integrity),a.referrerPolicy&&(d.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?d.credentials="include":a.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function i(a){if(a.ep)return;a.ep=!0;const d=e(a);fetch(a.href,d)}})();function Yt(t){t.innerHTML=`
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">⚾</span>
      <div>
        <h1>Baseball Team Manager Pro</h1>
        <p>球隊攻守先發管理系統</p>
      </div>
    </div>
    <div class="header-status"><span></span>球隊管理中心</div>
  `}function Xt(t){t.innerHTML=`
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
  `}function Zt(){"serviceWorker"in navigator&&navigator.serviceWorker.register("./service-worker.js").then(()=>console.log("PWA Service Worker registered")).catch(t=>console.error(t))}function te(){window.addEventListener("beforeinstallprompt",t=>{t.preventDefault()})}function ee(){Zt(),te()}const At={version:"5.2.0",storageKey:"btm_pro_data"};function V(t){localStorage.setItem(At.storageKey,JSON.stringify(t))}function j(){const t=localStorage.getItem(At.storageKey);return t?JSON.parse(t):{}}const Ht="players";function U(){return j()[Ht]||[]}function ht(t){const n=j();n[Ht]=t,V(n)}function ne(t={}){var n;return{id:t.id??crypto.randomUUID(),number:t.number||"",name:t.name||"",position:t.position||t.positions&&((n=t.positions[0])==null?void 0:n.code)||"P",positions:Array.isArray(t.positions)?t.positions:[],batting:typeof t.batting=="number"?t.batting:0,defense:typeof t.defense=="number"?t.defense:0,speed:typeof t.speed=="number"?t.speed:0,rating:typeof t.rating=="number"?t.rating:0,injured:t.injured===!0,suspended:t.suspended===!0,note:t.note||""}}const Mt="lineups";function st(){return j()[Mt]||[]}function ut(t){const n=j();n[Mt]=t,V(n)}function Et(t){const n=t.map((e,i)=>({player:e,index:i}));return n.sort((e,i)=>{var l,c;const a=parseInt((l=e.player)==null?void 0:l.number,10),d=parseInt((c=i.player)==null?void 0:c.number,10),o=!Number.isNaN(a),s=!Number.isNaN(d);if(o&&s){if(a!==d)return a-d}else if(o!==s)return o?-1:1;return e.index-i.index}),n.map(e=>e.player)}function ie(t={}){const n=U(),e=ne(t);n.push(e);const i=Et(n);return ht(i),window.dispatchEvent(new CustomEvent("player:added",{detail:{player:e,players:i}})),i}function se(t,n={}){const e=U(),i=e.findIndex(s=>String(s==null?void 0:s.id)===String(t));if(i===-1)return!1;const a=e[i],d={...a,...n,id:a.id};e[i]=d;const o=Et(e);return ht(o),window.dispatchEvent(new CustomEvent("player:updated",{detail:{player:d,oldPlayer:a,players:o}})),o}function ae(t){const n=U(),e=n.find(s=>String(s==null?void 0:s.id)===String(t));if(!e)return!1;const i=n.filter(s=>String(s==null?void 0:s.id)!==String(t));ht(i);const a=st();let d=!1;const o=Array.isArray(a)?a.map(s=>{if(!s||Array.isArray(s)||!Array.isArray(s.starters))return s;const l=s.starters,c=l.filter(r=>{const p=oe(r);return String(p)!==String(t)});return c.length!==l.length?(d=!0,{...s,starters:c,updatedAt:new Date().toISOString()}):s}):[];return d&&ut(o),window.dispatchEvent(new CustomEvent("player:removed",{detail:{player:e,players:i,lineups:o,lineupChanged:d}})),d&&(window.dispatchEvent(new CustomEvent("lineup:updated",{detail:{lineups:o,reason:"player-removed",playerId:t}})),window.dispatchEvent(new CustomEvent("lineup:saved",{detail:{lineups:o,reason:"player-removed",playerId:t}}))),i}function re(){const t=U(),n=Et(t);return t.length===n.length&&t.every((i,a)=>{var d;return(i==null?void 0:i.id)===((d=n[a])==null?void 0:d.id)})?t:(ht(n),n)}function oe(t){var n;return typeof t=="string"?t:t?t.playerId??t.playerID??t.id??((n=t.player)==null?void 0:n.id)??"":""}function W(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function J(t,n={}){if(!t)return;typeof t._playerListCleanup=="function"&&t._playerListCleanup();function e(){const c=re();if(!Array.isArray(c)||c.length===0){t.innerHTML=`

                <div class="player-list-empty">

                    <p>
                        尚無球員資料
                    </p>

                </div>

            `;return}t.innerHTML=`

            <div class="player-list">

                ${c.map(r=>{const p=(r==null?void 0:r.id)??"",m=(r==null?void 0:r.number)??(r==null?void 0:r.jerseyNumber)??"",v=(r==null?void 0:r.name)??(r==null?void 0:r.playerName)??"未命名球員",h=r!=null&&r.positions&&r.positions.length>0?r.positions.map(w=>`${w.code}${typeof w.rating=="number"&&w.rating>0?`(${w.rating})`:""}`).join(", "):(r==null?void 0:r.position)??"",b=typeof(r==null?void 0:r.rating)=="number"&&r.rating>0?r.rating:null,E=(r==null?void 0:r.injured)===!0,g=(r==null?void 0:r.suspended)===!0,f=(r==null?void 0:r.note)??"";return`

                                    <article
                                        class="
                                            player-card
                                            ${E||g?"player-card-unavailable":""}
                                        "
                                        data-player-id="${W(p)}"
                                    >

                                        <div
                                            class="player-card-main"
                                        >

                                            <div
                                                class="player-card-name"
                                            >
                                                <span class="player-card-number">#${W(m)}</span>
                                                ${W(v)}
                                            </div>


                                            <div
                                                class="player-card-meta"
                                            >

                                                ${h?`
                                                            <span
                                                                class="player-card-position"
                                                            >
                                                                ${W(h)}
                                                            </span>
                                                          `:""}

                                                ${b?`
                                                            <span class="player-card-rating">評分：${W(String(b))}</span>
                                                          `:""}

                                            </div>

                                        </div>


                                        <div
                                            class="player-card-status"
                                        >

                                            ${E?`
                                                        <span
                                                            class="player-status injured"
                                                        >
                                                            ⚠ 受傷
                                                        </span>
                                                    `:""}


                                            ${g?`
                                                        <span
                                                            class="player-status suspended"
                                                        >
                                                            ⛔ 停賽
                                                        </span>
                                                    `:""}

                                        </div>


                                        ${f?`
                                                    <div
                                                        class="player-card-note"
                                                    >
                                                        📝
                                                        ${W(f)}
                                                    </div>
                                                `:""}


                                        <div
                                            class="player-card-actions"
                                        >

                                            <button
                                                type="button"
                                                class="player-edit-btn"
                                                data-action="edit"
                                                data-player-id="${W(p)}"
                                            >
                                                ✏️ 編輯
                                            </button>


                                            <button
                                                type="button"
                                                class="player-delete-btn"
                                                data-action="delete"
                                                data-player-id="${W(p)}"
                                            >
                                                🗑️ 刪除
                                            </button>

                                        </div>

                                    </article>

                                `}).join("")}

            </div>

        `}function i(c){const p=U().find(m=>String(m==null?void 0:m.id)===String(c));if(p){if(typeof(n==null?void 0:n.onEdit)=="function"){n.onEdit(p);return}t.dispatchEvent(new CustomEvent("player:edit",{bubbles:!0,detail:{player:p}}))}}function a(c){const p=U().find(b=>String(b==null?void 0:b.id)===String(c));if(!p)return;const m=(p==null?void 0:p.name)||"這名球員";!window.confirm(`確定要刪除「${m}」嗎？

刪除後將無法直接復原。`)||ae(c)===!1||e()}function d(c){const r=c.target.closest("button[data-action]");if(!r)return;const p=r.dataset.action,m=r.dataset.playerId;if(m){if(p==="edit"){i(m);return}p==="delete"&&a(m)}}t.addEventListener("click",d);const o=()=>{e()},s=()=>{e()},l=()=>{e()};window.addEventListener("player:added",o),window.addEventListener("player:updated",s),window.addEventListener("player:removed",l),e(),t._playerListCleanup=()=>{t.removeEventListener("click",d),window.removeEventListener("player:added",o),window.removeEventListener("player:updated",s),window.removeEventListener("player:removed",l),t._playerListCleanup=null}}const le=[{code:"P",name:"投手"},{code:"C",name:"捕手"},{code:"1B",name:"一壘手"},{code:"2B",name:"二壘手"},{code:"3B",name:"三壘手"},{code:"SS",name:"游擊手"},{code:"LF",name:"左外野"},{code:"CF",name:"中外野"},{code:"RF",name:"右外野"},{code:"DH",name:"指定打擊"}],de=[{code:"1",name:"第1棒"},{code:"2",name:"第2棒"},{code:"3",name:"第3棒"},{code:"4",name:"第4棒"},{code:"5",name:"第5棒"},{code:"6",name:"第6棒"},{code:"7",name:"第7棒"},{code:"8",name:"第8棒"},{code:"9",name:"第9棒"}];function T(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function xt(t,n={}){var S,A,B,k;if(!t)return;const e=(n==null?void 0:n.player)??null,i=!!(e&&e.id);t.innerHTML=`

        <section
            class="player-form"
            data-mode="${i?"edit":"add"}"
        >

            <div
                class="player-form-header"
            >

                <div>

                    <h3>

                        ${i?"✏️ 編輯球員":"⚾ 新增球員"}

                    </h3>

                    <p>

                        ${i?"修改球員資料":"建立球員基本資料與目前出賽狀態"}

                    </p>

                </div>

            </div>


            <div
                id="playerFormMessage"
                class="player-form-message"
                role="status"
                aria-live="polite"
            ></div>


            <!-- ==================================================
                 Jersey Number
            =================================================== -->

            <div
                class="player-form-field"
            >

                <label
                    for="playerNumber"
                >
                    背號
                </label>

                <input
                    id="playerNumber"
                    type="text"
                    inputmode="numeric"
                    maxlength="3"
                    placeholder="例如：10"
                    autocomplete="off"
                    value="${T((e==null?void 0:e.number)??(e==null?void 0:e.jerseyNumber)??"")}"
                >

            </div>


            <!-- ==================================================
                 Name
            =================================================== -->

            <div
                class="player-form-field"
            >

                <label
                    for="playerName"
                >
                    姓名
                </label>

                <input
                    id="playerName"
                    type="text"
                    maxlength="30"
                    placeholder="請輸入球員姓名"
                    autocomplete="off"
                    value="${T((e==null?void 0:e.name)??(e==null?void 0:e.playerName)??"")}"
                >

            </div>


            <!-- ==================================================
                 Position
            =================================================== -->

            <div
                class="player-form-field"
            >

                <label>
                    守備位置與評分
                </label>

                <div
                    id="positionsGrid"
                    class="positions-grid"
                >

                    ${le.map(q=>{var R;const L=(R=e==null?void 0:e.positions)==null?void 0:R.find(C=>C.code===q.code),I=(L==null?void 0:L.rating)||0,P=L!==void 0;return`
                                        <div
                                            class="position-item"
                                            data-position="${T(q.code)}"
                                        >

                                            <label
                                                class="position-checkbox"
                                            >

                                                <input
                                                    type="checkbox"
                                                    class="position-checkbox-input"
                                                    value="${T(q.code)}"
                                                    ${P?"checked":""}
                                                >

                                                <span
                                                    class="position-code"
                                                >
                                                    ${T(q.code)}
                                                </span>

                                                <span
                                                    class="position-name"
                                                >
                                                    ${T(q.name)}
                                                </span>

                                            </label>

                                            <div
                                                class="position-rating"
                                            >

                                                <label
                                                    class="rating-label"
                                                >
                                                    評分
                                                </label>

                                                <select
                                                    class="rating-select"
                                                    ${P?"":"disabled"}
                                                >

                                                    ${Array.from({length:101},(C,F)=>F).map(C=>`
            <option
                value="${C}"
                ${I===C?"selected":""}
            >
                ${C===0?"不會":`${C} 分`}
            </option>
        `).join("")}

                                                </select>

                                            </div>

                                        </div>
                                    `}).join("")}

                </div>

                <p
                    class="position-help"
                >
                    可選擇多個守備位置，評分越高代表能力越強（1-5分，0為不會該位置）
                </p>

            </div>


            <!-- ==================================================
                 Batting Order
            =================================================== -->

            <div
                class="player-form-field"
            >

                <label>
                    適合棒次
                </label>

                <div
                    id="battingOrdersGrid"
                    class="positions-grid"
                >

                    ${de.map(q=>{var P;const I=((P=e==null?void 0:e.battingOrders)==null?void 0:P.find(R=>R.code===q.code))!==void 0;return`
                                        <div
                                            class="position-item"
                                            data-order="${T(q.code)}"
                                        >

                                            <label
                                                class="position-checkbox"
                                            >

                                                <input
                                                    type="checkbox"
                                                    class="order-checkbox-input"
                                                    value="${T(q.code)}"
                                                    ${I?"checked":""}
                                                >

                                                <span
                                                    class="position-code"
                                                >
                                                    ${T(q.code)}
                                                </span>

                                                <span
                                                    class="position-name"
                                                >
                                                    ${T(q.name)}
                                                </span>

                                            </label>

                                        </div>
                                    `}).join("")}

                </div>

                <p
                    class="position-help"
                >
                    可選擇多個棒次，AI建立先發名單時會根據此選擇分配球員到適合的棒次
                </p>

            </div>


            <!-- ==================================================
                 Status
            =================================================== -->

            <div
                class="player-form-status"
            >

                <label>

                    <input
                        id="playerInjured"
                        type="checkbox"
                        ${(e==null?void 0:e.injured)===!0?"checked":""}
                    >

                    <span>
                        受傷
                    </span>

                </label>


                <label>

                    <input
                        id="playerSuspended"
                        type="checkbox"
                        ${(e==null?void 0:e.suspended)===!0?"checked":""}
                    >

                    <span>
                        停賽
                    </span>

                </label>

            </div>


            <!-- ==================================================
                 Statistics (only in edit mode)
            =================================================== -->

            ${i?`
                    
                    <div
                        class="player-form-field"
                    >

                        <div
                            class="stats-header"
                        >
                            <label>
                                統計數據
                            </label>
                            <button
                                type="button"
                                id="importStatsBtn"
                                class="import-stats-btn"
                            >
                                📥 從比賽紀錄匯入
                            </button>
                        </div>

                        <div
                            class="stats-grid"
                        >

                            <div
                                class="stat-field"
                            >

                                <label
                                    for="battingAverage"
                                >
                                    打擊率
                                </label>

                                <input
                                    id="battingAverage"
                                    type="text"
                                    placeholder=".000"
                                    value="${T(((S=e==null?void 0:e.stats)==null?void 0:S.battingAverage)??(e==null?void 0:e.battingAverage)??"")}"
                                >

                            </div>

                            <div
                                class="stat-field"
                            >

                                <label
                                    for="strikeouts"
                                >
                                    三振數
                                </label>

                                <input
                                    id="strikeouts"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value="${T(((A=e==null?void 0:e.stats)==null?void 0:A.strikeouts)??(e==null?void 0:e.strikeouts)??"")}"
                                >

                            </div>

                            <div
                                class="stat-field"
                            >

                                <label
                                    for="walks"
                                >
                                    保送數
                                </label>

                                <input
                                    id="walks"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value="${T(((B=e==null?void 0:e.stats)==null?void 0:B.walks)??(e==null?void 0:e.walks)??"")}"
                                >

                            </div>

                            <div
                                class="stat-field"
                            >

                                <label
                                    for="stolenBases"
                                >
                                    盜壘
                                </label>

                                <input
                                    id="stolenBases"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value="${T(((k=e==null?void 0:e.stats)==null?void 0:k.stolenBases)??(e==null?void 0:e.stolenBases)??"")}"
                                >

                            </div>

                        </div>

                    </div>

                    `:""}


            <!-- ==================================================
                 Note
            =================================================== -->

            <div
                class="player-form-field"
            >

                <label
                    for="playerNote"
                >
                    備註
                </label>

                <textarea
                    id="playerNote"
                    rows="3"
                    maxlength="200"
                    placeholder="球員備註"
                >${T((e==null?void 0:e.note)??"")}</textarea>

            </div>


            <!-- ==================================================
                 Actions
            =================================================== -->

            <div
                class="player-form-actions"
            >

                <button
                    type="button"
                    id="savePlayerBtn"
                    class="player-form-add-btn"
                >

                    ${i?"💾 儲存修改":"➕ 新增球員"}

                </button>


                ${i?`

                            <button
                                type="button"
                                id="cancelEditBtn"
                                class="player-form-cancel-btn"
                            >
                                取消編輯
                            </button>

                        `:""}

            </div>

        </section>

    `;const a=t.querySelector("#playerNumber"),d=t.querySelector("#playerName"),o=t.querySelector("#positionsGrid"),s=t.querySelector("#battingOrdersGrid"),l=t.querySelector("#playerInjured"),c=t.querySelector("#playerSuspended"),r=t.querySelector("#playerNote"),p=t.querySelector("#importStatsBtn"),m=t.querySelector("#battingAverage"),v=t.querySelector("#strikeouts"),h=t.querySelector("#walks"),b=t.querySelector("#stolenBases"),E=t.querySelector("#savePlayerBtn"),g=t.querySelector("#cancelEditBtn"),f=t.querySelector("#playerFormMessage"),w=[];o&&o.querySelectorAll(".position-checkbox-input").forEach(L=>{const I=P=>{const C=P.target.closest(".position-item").querySelector(".rating-select");C&&(C.disabled=!P.target.checked,P.target.checked&&C.value==="0"&&(C.value="3"))};L.addEventListener("change",I),w.push({element:L,handler:I})});const u=[];s&&s.querySelectorAll(".order-checkbox-input").forEach(L=>{const I=P=>{};L.addEventListener("change",I),u.push({element:L,handler:I})}),p&&i&&p.addEventListener("click",()=>{try{const q=j(),L=Array.isArray(q.gameRecords)?q.gameRecords:[];if(L.length===0){y("error","目前沒有比賽紀錄可以匯入");return}let I=0,P=0,R=0,C=0,F=0;L.forEach(H=>{if(H.battingRecords&&Array.isArray(H.battingRecords)){const x=H.battingRecords.find(Z=>String(Z.playerId)===String(e.id));x&&(I+=parseInt(x.atBats)||0,P+=parseInt(x.hits)||0,R+=parseInt(x.strikeouts)||0,C+=parseInt(x.walks)||0,F+=parseInt(x.stolenBases)||0)}});const X=I>0?(P/I).toFixed(3):".000";m&&(m.value=X),v&&(v.value=R),h&&(h.value=C),b&&(b.value=F),y("success",`✓ 已從 ${L.length} 筆比賽紀錄匯入統計數據`)}catch(q){console.error("匯入統計數據失敗：",q),y("error","匯入統計數據失敗，請稍後再試")}});function y(q,L){f&&(f.className=`player-form-message ${q}`,f.innerHTML=T(L))}function $(){if(a&&(a.value=""),d&&(d.value=""),o){const q=o.querySelectorAll(".position-checkbox-input"),L=o.querySelectorAll(".rating-select");q.forEach(I=>I.checked=!1),L.forEach(I=>{I.value="0",I.disabled=!0})}s&&s.querySelectorAll(".order-checkbox-input").forEach(L=>L.checked=!1),l&&(l.checked=!1),c&&(c.checked=!1),r&&(r.value="")}E&&E.addEventListener("click",()=>{var Z,It,Pt,Ct,Rt,Tt;const q=((Z=a==null?void 0:a.value)==null?void 0:Z.trim())??"",L=((It=d==null?void 0:d.value)==null?void 0:It.trim())??"",I=[];o&&o.querySelectorAll(".position-item").forEach(z=>{const M=z.querySelector(".position-checkbox-input"),at=z.querySelector(".rating-select");M&&M.checked&&at&&I.push({code:M.value,rating:parseInt(at.value)||0})});const P=((Pt=I[0])==null?void 0:Pt.code)||"",R=[];s&&s.querySelectorAll(".position-item").forEach(z=>{const M=z.querySelector(".order-checkbox-input");M&&M.checked&&R.push({code:M.value})});const C=(l==null?void 0:l.checked)===!0,F=(c==null?void 0:c.checked)===!0,X=((Ct=r==null?void 0:r.value)==null?void 0:Ct.trim())??"";let H={};if(i){const _=((Rt=m==null?void 0:m.value)==null?void 0:Rt.trim())||"",z=parseInt(v==null?void 0:v.value)||0,M=parseInt(h==null?void 0:h.value)||0,at=parseInt(b==null?void 0:b.value)||0;(_||z>0||M>0||at>0)&&(H={battingAverage:_,strikeouts:z,walks:M,stolenBases:at})}if(!q){y("error","請輸入球員背號。"),a==null||a.focus();return}if(!L){y("error","請輸入球員姓名。"),d==null||d.focus();return}if(I.length===0){y("error","請至少選擇一個守備位置並設定評分。");return}const x={number:q,name:L,position:((Tt=I[0])==null?void 0:Tt.code)||P,positions:I,battingOrders:R,injured:C,suspended:F,note:X};if(i&&Object.keys(H).length>0&&(x.stats=H),i){try{if(se(e.id,x)===!1){y("error","找不到要修改的球員。");return}y("success","✓ 球員資料已成功更新。"),typeof(n==null?void 0:n.onSaved)=="function"&&n.onSaved({mode:"edit",playerId:e.id})}catch(_){console.error("更新球員失敗：",_),y("error","球員資料更新失敗。")}return}try{ie(x),y("success","✓ 球員已成功新增。"),$(),a==null||a.focus(),typeof(n==null?void 0:n.onSaved)=="function"&&n.onSaved({mode:"add"}),window.setTimeout(()=>{f&&(f.innerHTML="",f.className="player-form-message")},1800)}catch(_){console.error("新增球員失敗：",_),y("error","新增球員失敗，請稍後再試。")}}),g&&g.addEventListener("click",()=>{if(typeof(n==null?void 0:n.onCancel)=="function"){n.onCancel();return}$(),y("success","已取消編輯。")}),t._playerFormCleanup=()=>{w.forEach(({element:q,handler:L})=>{q.removeEventListener("change",L)}),u.forEach(({element:q,handler:L})=>{q.removeEventListener("change",L)})}}function Nt(t){if(!t)return;typeof t._playerPageCleanup=="function"&&t._playerPageCleanup(),t.innerHTML=`

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

    `;const n=t.querySelector("#player-form"),e=t.querySelector("#player-list");if(!n||!e)return;function i(){xt(n,{onSaved:()=>{J(e,{onEdit:a})}})}function a(l){l&&(xt(n,{player:l,onSaved:()=>{i(),J(e,{onEdit:a})},onCancel:()=>{i(),J(e,{onEdit:a})}}),n.scrollIntoView({behavior:"smooth",block:"start"}))}i(),J(e,{onEdit:a});const d=()=>{J(e,{onEdit:a})},o=()=>{J(e,{onEdit:a})},s=()=>{J(e,{onEdit:a})};window.addEventListener("player:added",d),window.addEventListener("player:updated",o),window.addEventListener("player:removed",s),t._playerPageCleanup=()=>{window.removeEventListener("player:added",d),window.removeEventListener("player:updated",o),window.removeEventListener("player:removed",s),typeof(n==null?void 0:n._playerFormCleanup)=="function"&&n._playerFormCleanup(),typeof(e==null?void 0:e._playerListCleanup)=="function"&&e._playerListCleanup(),t._playerPageCleanup=null}}function ce(t){return(t==null?void 0:t.id)??(t==null?void 0:t.playerId)??""}function ue(t){return!(!t||t.injured===!0||t.suspended===!0)}function Dt(t=[]){if(!Array.isArray(t))return[];const n=[],e=new Set;return t.forEach(i=>{if(!ue(i))return;const a=ce(i);if(a){const d=String(a);if(e.has(d))return;e.add(d)}n.push(i)}),n}function Ft(){return{id:crypto.randomUUID(),starters:Array(9).fill(null),dh:null,createdAt:new Date().toISOString()}}function Y(){const t=st();if(!Array.isArray(t)||t.length===0)return null;const n=t[t.length-1];return!n||Array.isArray(n)||typeof n!="object"?null:n}function pe(){const t=st();if(!Array.isArray(t)||t.length===0)return!1;const n=[...t],e=n.length-1;return n[e]={...n[e],starters:[],updatedAt:new Date().toISOString()},ut(n),window.dispatchEvent(new CustomEvent("lineup:updated",{detail:{lineup:[],lineups:n}})),window.dispatchEvent(new CustomEvent("lineup:cleared",{detail:{lineups:n}})),!0}function fe(t=[]){if(!Array.isArray(t))return!1;const n=st(),e=Array.isArray(n)?[...n]:[],i=t.map((d,o)=>{const s=o+1;return typeof d=="string"?{playerId:d,battingOrder:s,order:s}:{...d||{},battingOrder:s,order:s}}),a=Y();return a?e[e.length-1]={...a,starters:i,updatedAt:new Date().toISOString()}:e.push({...Ft(),starters:i,updatedAt:new Date().toISOString()}),ut(e),window.dispatchEvent(new CustomEvent("lineup:updated",{detail:{lineup:i,lineups:e}})),window.dispatchEvent(new CustomEvent("lineup:saved",{detail:{lineup:i,lineups:e}})),!0}function me(t=[]){if(!Array.isArray(t))return!1;const n=st(),e=Array.isArray(n)?[...n]:[],i=t.map((a,d)=>{const o=d+1;return typeof a=="string"?{playerId:a,battingOrder:o,order:o}:{...a||{},battingOrder:o,order:o}});return e.push({...Ft(),starters:i,updatedAt:new Date().toISOString()}),ut(e),window.dispatchEvent(new CustomEvent("lineup:updated",{detail:{lineup:i,lineups:e}})),window.dispatchEvent(new CustomEvent("lineup:saved",{detail:{lineup:i,lineups:e}})),!0}function ge(t,n){const e=Y();if(!e||!Array.isArray(e.starters))return!1;const i=[...e.starters];if(t<0||n<0||t>=i.length||n>=i.length||t===n)return!1;[i[t],i[n]]=[i[n],i[t]];const a=i.map((l,c)=>{const r=c+1;return typeof l=="string"?{playerId:l,battingOrder:r,order:r}:{...l||{},battingOrder:r,order:r}}),d=st(),o=Array.isArray(d)?[...d]:[];if(o.length===0)return!1;const s=o.length-1;return o[s]={...o[s],starters:a,updatedAt:new Date().toISOString()},ut(o),window.dispatchEvent(new CustomEvent("lineup:swap",{detail:{fromIndex:t,toIndex:n,lineup:a}})),window.dispatchEvent(new CustomEvent("lineup:updated",{detail:{lineup:a,lineups:o}})),window.dispatchEvent(new CustomEvent("lineup:saved",{detail:{lineup:a,lineups:o,reason:"swap"}})),!0}function he(t){return(t==null?void 0:t.id)??(t==null?void 0:t.playerId)??""}function ve(t){var n;return typeof t=="string"?t:(t==null?void 0:t.playerId)??(t==null?void 0:t.playerID)??((n=t==null?void 0:t.player)==null?void 0:n.id)??(t==null?void 0:t.id)??""}function ye(t,n){if(typeof t=="string")return n+1;const e=(t==null?void 0:t.battingOrder)??(t==null?void 0:t.order)??n+1;return Number(e)}function be(t=[],n=[]){const e=[],i=[];if(!Array.isArray(t))return{valid:!1,errors:["先發名單格式錯誤。"],warnings:[]};Array.isArray(n)||(n=[]),t.length!==9&&e.push(`先發名單必須剛好 9 人，目前 ${t.length} 人。`);const a=t.map(r=>ve(r));a.forEach((r,p)=>{r||e.push(`第 ${p+1} 棒尚未選擇球員。`)});const d=new Set;a.forEach((r,p)=>{if(!r)return;const m=String(r);if(d.has(m)){e.push(`第 ${p+1} 棒球員與其他棒次重複。`);return}d.add(m)});const o=new Map;n.forEach(r=>{const p=he(r);p&&o.set(String(p),r)}),a.forEach((r,p)=>{r&&(o.has(String(r))||e.push(`第 ${p+1} 棒的球員資料不存在。`))});const s=[];t.forEach((r,p)=>{const m=ye(r,p);if(s.push(m),!Number.isInteger(m)){e.push(`第 ${p+1} 棒的打擊順序格式錯誤。`);return}(m<1||m>9)&&e.push(`第 ${p+1} 棒的打擊順序必須介於 1～9。`)});const l=new Set;if(s.forEach((r,p)=>{if(Number.isInteger(r)){if(l.has(r)){e.push(`打擊順序 ${r} 重複。`);return}l.add(r)}}),t.length===9)for(let r=1;r<=9;r+=1)l.has(r)||e.push(`缺少第 ${r} 棒。`);const c=new Map;return t.forEach((r,p)=>{const m=(typeof r=="object"&&r!==null?r.position:"")||"";if(!m)return;const v=String(m).trim().toUpperCase();if(v){if(c.has(v)){const h=c.get(v);e.push(`守備位置重複：第 ${h+1} 棒與第 ${p+1} 棒皆為 ${m}。`);return}c.set(v,p)}}),t.forEach((r,p)=>{if(!r||typeof r!="object")return;const m=Number(r.battingOrder),v=Number(r.order);Number.isInteger(m)&&Number.isInteger(v)&&m!==v&&e.push(`第 ${p+1} 棒的 order 與 battingOrder 不一致。`)}),a.forEach((r,p)=>{if(!r)return;const m=o.get(String(r));if(!m)return;const v=m.name||m.playerName||`第 ${p+1} 棒球員`;m.injured===!0&&i.push(`第 ${p+1} 棒 ${v} 目前受傷。`),m.suspended===!0&&i.push(`第 ${p+1} 棒 ${v} 目前停賽。`)}),{valid:e.length===0,errors:e,warnings:i}}function Se(t=[],n=[]){return be(t,n)}function Q(t){return(t==null?void 0:t.id)??(t==null?void 0:t.playerId)??""}function yt(t){return(t==null?void 0:t.name)??(t==null?void 0:t.playerName)??""}function $e(t){return(t==null?void 0:t.number)??(t==null?void 0:t.jerseyNumber)??""}function pt(t){if(Array.isArray(t==null?void 0:t.positions)&&t.positions.length>0)return t.positions.map(e=>({code:e.code,rating:e.rating||0})).filter(e=>!!e.code&&e.rating>0);const n=(t==null?void 0:t.position)??"";return n?[{code:n,rating:3}]:[]}function ct(t){let n=0;Q(t)&&(n+=10),yt(t).trim()&&(n+=5),String($e(t)).trim()&&(n+=2),t!=null&&t.position&&(n+=1);const e=pt(t),i=e.length>0?e.reduce((a,d)=>a+d.rating,0)/e.length:0;if(n+=i*3,t.stats){const a=parseFloat(t.stats.battingAverage)||0;n+=a*10;const d=t.stats.strikeouts||0,o=t.stats.atBats||1,s=d/o;n-=s*5;const c=(t.stats.walks||0)/o;n+=c*3;const r=t.stats.stolenBases||0;n+=r*.5}return n}function we(t=[]){return[...t].sort((n,e)=>{const i=ct(n),a=ct(e);if(i!==a)return a-i;const d=yt(n),o=yt(e);return d.localeCompare(o,"zh-Hant")})}function _t(t=[]){if(!Array.isArray(t))return[];const n=Dt(t);console.log("📊 Available players:",n.length);const e=n.filter(u=>u.battingOrders&&u.battingOrders.length>0);if(console.log("🎯 Players with batting orders:",e.length),console.log("🎯 Players with batting orders details:",e.map(u=>({id:u.id,name:u.name,battingOrders:u.battingOrders}))),e.length<9)return console.log("❌ Not enough players with batting orders:",e.length),[];const i=we(e),a=["P","C","SS","CF","1B","3B","2B","RF","LF","DH"],d={};for(const u of a){let y=null,$=-1,S=-1;for(const A of i){const k=pt(A).find(q=>q.code===u);if(k&&k.rating>0){const q=ct(A);(k.rating>$||k.rating===$&&q>S)&&(y=A,$=k.rating,S=q)}}y&&(d[u]={player:y,rating:$,score:S})}const o={},s={};for(const u of a){const y=d[u];if(!y)continue;const $=Q(y.player);if(o[$]){const S=o[$],A=d[S];y.rating>A.rating&&(delete s[S],s[u]=$,o[$]=u)}else s[u]=$,o[$]=u}const l=new Set(Object.values(s)),c=new Set(Object.keys(s));for(const u of a){if(c.has(u))continue;let y=null,$=-1;for(const S of i){const A=Q(S);if(l.has(A))continue;const k=pt(S).find(q=>q.code===u);k&&k.rating>0&&k.rating>$&&(y=S,$=k.rating)}if(y){const S=Q(y);s[u]=S,l.add(S),c.add(u)}}if(Object.keys(s).length<9){const u=a.filter(y=>!c.has(y));for(const y of i){const $=Q(y);if(l.has($))continue;if(u.length===0)break;const A=pt(y).find(B=>u.includes(B.code));if(A){const B=A.code;s[B]=$,l.add($),c.add(B),u.splice(u.indexOf(B),1)}}}const r=[];for(const u of a)s[u]&&r.push({playerId:s[u],position:u});if(r.length<9)return[];const p={};if(r.forEach(u=>{p[u.position]=(p[u.position]||0)+1}),Object.entries(p).filter(([u,y])=>y>1).length>0)return[];const v=["1","2","3","4","5","6","7","8","9"],h=new Set,b=new Set;console.log("🔄 Step 5: Assigning batting orders based on player preferences");const E={};r.forEach(u=>{E[u.playerId]=u.position});const g=[];for(const u of v){let y=null,$=null;for(const S of r){const A=S.playerId,B=i.find(k=>String(Q(k))===String(A));!B||!B.battingOrders||B.battingOrders.length===0||B.battingOrders.some(k=>k.code===u)&&(b.has(A)||(!y||ct(B)>ct(y))&&(y=B,$=A))}if(y&&$){const S=E[$];h.add(u),b.add($),g.push({playerId:$,battingOrder:parseInt(u),order:parseInt(u),position:S}),console.log(`    ✅ Batting order ${u}: Player ${y.name} (position: ${S})`)}else console.log(`    ❌ No suitable player found for batting order ${u}`)}const f=r.filter(u=>!b.has(u.playerId));for(const u of f){const y=u.playerId,$=i.find(A=>String(Q(A))===String(y));let S=1;for(;h.has(String(S));)S++,S>9&&(S=1);h.add(String(S)),b.add(y),g.push({playerId:y,battingOrder:S,order:S,position:u.position}),console.log(`    � Fallback: Player ${$.name} assigned to batting order ${S}`)}const w=g.sort((u,y)=>u.battingOrder-y.battingOrder);return console.log("📋 Final batting order assignment:",w.map(u=>({battingOrder:u.battingOrder,position:u.position}))),w}function nt(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function ft(t){return(t==null?void 0:t.id)??(t==null?void 0:t.playerId)??""}function bt(t){return(t==null?void 0:t.name)??(t==null?void 0:t.playerName)??"未命名球員"}function St(t){return(t==null?void 0:t.number)??(t==null?void 0:t.jerseyNumber)??""}function Ut(t){if(Array.isArray(t==null?void 0:t.positions)&&t.positions.length>0){const n=t.positions.filter(e=>e.rating>0);if(n.length>0)return n.sort((e,i)=>i.rating-e.rating),n[0].code}return(t==null?void 0:t.position)??""}function Ae(t){if(Array.isArray(t==null?void 0:t.positions)&&t.positions.length>0)return t.positions.map(e=>({code:e.code,rating:e.rating||0})).filter(e=>!!e.code&&e.rating>0);const n=(t==null?void 0:t.position)??"";return n?[{code:n,rating:3}]:[]}function Ee(t){return t?t.injured===!0?"受傷":t.suspended===!0?"停賽":"":""}function qe(t,n=""){return`

        <option value="">
            請選擇球員
        </option>

        ${t.map(e=>{const i=ft(e),a=bt(e),d=St(e),o=Ut(e),s=Ee(e);let l="";if(e.positions&&e.positions.length>0){const c=e.positions.filter(r=>r.rating>0);c.length>0&&(l=c.map(r=>`${r.code}(${r.rating})`).join(", "))}return!l&&o&&(l=o),`

                        <option
                            value="${nt(i)}"
                            ${String(i)===String(n)?"selected":""}
                        >
                            #${nt(d)}
                            ${nt(a)}
                            ${l?` [${nt(l)}]`:""}
                            ${s?` ⚠ ${nt(s)}`:""}
                        </option>

                    `}).join("")}

    `}function Be(t){var n;return typeof t=="string"?t:(t==null?void 0:t.playerId)??(t==null?void 0:t.playerID)??((n=t==null?void 0:t.player)==null?void 0:n.id)??(t==null?void 0:t.id)??""}function Le(){const t=Y();return!t||!Array.isArray(t.starters)?[]:t.starters.map(n=>Be(n))}function O(t,n,e){const i=t.querySelector("#lineupFormMessage");if(!i)return;const a=Array.isArray(e)?e:[e];if(a.length===0){i.innerHTML="",i.className="lineup-form-message";return}let d="ℹ️";n==="error"&&(d="❌"),n==="warning"&&(d="⚠️"),n==="success"&&(d="✓"),i.className=`lineup-form-message ${n}`,i.innerHTML=`

        <span>
            ${d}
        </span>

        <div>
            ${a.map(o=>`<div>${nt(o)}</div>`).join("")}
        </div>

    `}function ke(t){O(t,"success","先發名單已成功儲存。"),window.setTimeout(()=>{O(t,"",[])},1800)}function Ie(t){if(!t)return;typeof t._lineupFormCleanup=="function"&&t._lineupFormCleanup();const n=U(),e=Dt(n),i=Le();t.innerHTML=`

        <section class="lineup-form" id="lineupFormSection">

            <div class="lineup-form-header">

                <div>

                    <h3>
                        ⚾ 建立先發名單
                    </h3>

                    <p>
                        請選擇 1～9 棒先發球員
                    </p>

                </div>

                <div class="lineup-form-player-count">

                    可用球員：
                    <strong>
                        ${e.length}
                    </strong>
                    人

                </div>

            </div>


            <div
                id="lineupFormMessage"
                class="lineup-form-message"
                role="status"
                aria-live="polite"
            ></div>


            <div class="lineup-form-list">

                ${Array.from({length:9},(g,f)=>{const w=i[f]??"";return`

                            <div
                                class="lineup-form-row"
                                data-order="${f+1}"
                            >

                                <div
                                    class="lineup-form-order"
                                >

                                    <strong>
                                        ${f+1}
                                    </strong>

                                    <span>
                                        棒
                                    </span>

                                </div>


                                <select
                                    class="lineup-player-select"
                                    data-order="${f+1}"
                                >

                                    ${qe(e,w)}

                                </select>

                                <span
                                    class="lineup-form-status"
                                    data-status-for="${f+1}"
                                ></span>

                            </div>

                        `}).join("")}

            </div>


            <div class="lineup-form-actions">

                <button
                    type="button"
                    id="clearAllBtn"
                    class="lineup-form-clear-btn"
                >
                    🗑️ 清除全部
                </button>

                <button
                    type="button"
                    id="autoOrderBtn"
                    class="lineup-form-ai-btn"
                >
                    🤖 AI 建立先發
                </button>


                <button
                    type="button"
                    id="saveLineupBtn"
                    class="lineup-form-save-btn"
                >
                    💾 儲存先發
                </button>

            </div>

        </section>

    `;const a=[...t.querySelectorAll(".lineup-player-select")];function d(){const g=a.map(f=>f.value);a.forEach((f,w)=>{const u=t.querySelector(`[data-status-for="${w+1}"]`);if(!u)return;const y=f.value;if(!y){u.textContent="",u.className="lineup-form-status";return}g.filter(S=>S===y).length>1?(u.textContent="⚠ 重複球員",u.className="lineup-form-status error"):(u.textContent="✓",u.className="lineup-form-status ok")})}function o(){const g=new Set,f=["P","C","SS","CF","1B","3B","2B","RF","LF"];return a.map((u,y)=>{const $=u.value,S=e.find(k=>String(ft(k))===String($)),A=y+1;let B=p.get($)||"";if(!B&&S){const k=Ut(S);if(g.has(k)){const L=Ae(S).find(I=>!g.has(I.code)&&f.includes(I.code));L?B=L.code:B=f.find(P=>!g.has(P))||k}else B=k}return B&&g.add(B),{playerId:$,battingOrder:A,order:A,position:B}})}function s(){const g=o(),f=Se(g,n);return{starters:g,result:f}}function l(){const{starters:g,result:f}=s();if(!f.valid){O(t,"error",f.errors);return}if(!(Y()?fe(g):me(g))){O(t,"error","先發名單儲存失敗，請檢查資料。");return}ke(t),f.warnings.length>0&&window.setTimeout(()=>{O(t,"warning",f.warnings)},1900),window.dispatchEvent(new CustomEvent("lineup:updated",{detail:{lineup:g}})),window.dispatchEvent(new CustomEvent("lineup:saved",{detail:{lineup:g}})),window.dispatchEvent(new CustomEvent("lineup:form-saved",{detail:{lineup:g}}))}function c(){if(e.length<9){O(t,"error",`可用球員不足 9 人，目前只有 ${e.length} 人。`);return}const g=_t(n);if(!Array.isArray(g)||g.length!==9){console.log("❌ Invalid smart order result"),O(t,"error","AI 無法建立完整的 9 人先發名單。請確保至少 9 位球員已設定適合棒次。");return}a.forEach((f,w)=>{const u=g[w],y=(u==null?void 0:u.playerId)??"",$=(u==null?void 0:u.position)??"";f.value=String(y),p.set(y,$);const S=f.querySelector(`option[value="${y}"]`);if(S){const A=e.find(B=>String(ft(B))===String(y));if(A){const B=bt(A),k=St(A);S.textContent=`#${k} ${B} ${$}`}}}),d(),O(t,"success","AI 已根據守備評分建立建議先發，請確認後按「儲存先發」。")}const r=new Map,p=t._aiAssignedPositions||new Map,m=()=>{confirm("確定要清除所有先發名單嗎？此操作將清空所有欄位的球員選擇並清除已儲存的先發名單。")&&(a.forEach(g=>{g.value=""}),p.clear(),d(),pe(),O(t,"success","已清除所有先發名單"),window.setTimeout(()=>{O(t,"",[])},1500))},v=g=>{const f=g.value;f&&p.delete(f)};a.forEach(g=>{const f=()=>{v(g),d(),O(t,"",[])};r.set(g,f),g.addEventListener("change",f);const w=g.value;if(w&&p.has(w)){const u=p.get(w),y=e.find($=>String(ft($))===String(w));if(y){const $=bt(y),S=St(y),A=g.querySelector(`option[value="${w}"]`);A&&(A.textContent=`#${S} ${$} ${u}`)}}});const h=t.querySelector("#saveLineupBtn"),b=t.querySelector("#autoOrderBtn"),E=t.querySelector("#clearAllBtn");h&&h.addEventListener("click",l),b&&b.addEventListener("click",c),E&&E.addEventListener("click",m),d(),t._lineupFormCleanup=()=>{r.forEach((g,f)=>{f.removeEventListener("change",g)}),h&&h.removeEventListener("click",l),b&&b.removeEventListener("click",c),E&&E.removeEventListener("click",m),t._lineupFormCleanup=null},t._aiAssignedPositions=p}function K(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function Pe(t){return(t==null?void 0:t.id)??(t==null?void 0:t.playerId)??""}function Ce(t){return(t==null?void 0:t.name)??(t==null?void 0:t.playerName)??"未命名球員"}function Re(t){return(t==null?void 0:t.number)??(t==null?void 0:t.jerseyNumber)??""}function Te(t){if(Array.isArray(t==null?void 0:t.positions)&&t.positions.length>0){const n=t.positions.filter(e=>e.rating>0);if(n.length>0)return n.sort((e,i)=>i.rating-e.rating),n[0].code}return(t==null?void 0:t.position)??""}function xe(t){return t?t.injured===!0?"受傷":t.suspended===!0?"停賽":"":""}function Wt(t){var n;return typeof t=="string"?t:(t==null?void 0:t.playerId)??(t==null?void 0:t.playerID)??(t==null?void 0:t.id)??((n=t==null?void 0:t.player)==null?void 0:n.id)??""}function Ne(t,n){const e=Number((t==null?void 0:t.battingOrder)??(t==null?void 0:t.order)??n+1);return Number.isInteger(e)&&e>=1&&e<=9?e:n+1}function Oe(t,n){return n?t.find(e=>String(Pe(e))===String(n))??null:null}function je(t,n,e){const i=Ne(t,e),a=Wt(t);if(!n)return`

            <article
                class="lineup-card-item lineup-card-missing"
                draggable="true"
                data-index="${e}"
                data-player-id="${K(a)}"
            >

                <div
                    class="lineup-card-drag-handle"
                    title="拖曳調整棒次"
                    aria-label="拖曳調整棒次"
                >
                    ☰
                </div>


                <div
                    class="lineup-card-order"
                >

                    <strong>
                        ${i}
                    </strong>

                    <span>
                        棒
                    </span>

                </div>


                <div
                    class="lineup-card-player"
                >

                    <strong>
                        ⚠ 球員資料不存在
                    </strong>

                    <small>
                        Player ID：
                        ${K(a)}
                    </small>

                </div>

            </article>

        `;const d=Re(n),o=Ce(n),s=(t==null?void 0:t.position)??Te(n),l=xe(n);return`

        <article
            class="
                lineup-card-item
                ${l?"lineup-card-warning":""}
            "
            draggable="true"
            data-index="${e}"
            data-player-id="${K(a)}"
        >

            <div
                class="lineup-card-drag-handle"
                title="拖曳調整棒次"
                aria-label="拖曳調整棒次"
            >
                ☰
            </div>


            <div
                class="lineup-card-order"
            >

                <strong>
                    ${i}
                </strong>

                <span>
                    棒
                </span>

            </div>


            <div
                class="lineup-card-number"
            >

                #${K(d)}

            </div>


            <div
                class="lineup-card-player"
            >

                <strong>
                    ${K(o)}
                </strong>


                <div
                    class="lineup-card-meta"
                >

                    ${s?`
                                <span>
                                    ${K(s)}
                                </span>
                            `:""}


                    ${l?`
                                <span
                                    class="lineup-card-status"
                                >
                                    ⚠ ${K(l)}
                                </span>
                            `:""}

                </div>

            </div>


            <div
                class="lineup-card-drag-indicator"
                aria-hidden="true"
            >
                ↕
            </div>

        </article>

    `}function rt(t,n="✓ 先發名單已儲存"){if(!t)return;let e=t.querySelector(".lineup-card-save-notice");e||(e=document.createElement("div"),e.className="lineup-card-save-notice",t.prepend(e)),e.textContent=n,e.classList.remove("show"),e.offsetWidth,e.classList.add("show"),window.clearTimeout(e._hideTimer),e._hideTimer=window.setTimeout(()=>{e.classList.remove("show")},1800)}function He(t,n){t&&(t.classList.add("lineup-card-dragging"),n&&n.classList.add("lineup-card-drop-target"),window.setTimeout(()=>{t.classList.remove("lineup-card-dragging"),n&&n.classList.remove("lineup-card-drop-target")},450))}function dt(t){if(!t)return;typeof t._lineupCardCleanup=="function"&&(t._lineupCardCleanup(),t._lineupCardCleanup=null);const n=U(),e=Array.isArray(n)?n:[],i=Y(),a=i&&Array.isArray(i.starters)?i.starters:[];t.innerHTML=`

        <section
            class="lineup-card"
        >

            <div
                class="lineup-card-header"
            >

                <div>

                    <h3>
                        ⚾ 先發 Order
                    </h3>

                    <p>
                        拖曳球員即可調整棒次
                    </p>

                </div>


                <button
                    type="button"
                    id="lineupCardEditBtn"
                    class="lineup-card-edit-btn"
                >
                    ✏️ 編輯
                </button>

            </div>


            <div
                class="lineup-card-list"
            >

                ${a.length>0?a.map((f,w)=>{const u=Wt(f),y=Oe(e,u);return je(f,y,w)}).join(""):`

                            <div
                                class="lineup-card-empty"
                            >

                                <div>
                                    ⚾
                                </div>

                                <strong>
                                    尚未建立先發名單
                                </strong>

                                <p>
                                    請先建立 9 人先發名單
                                </p>

                            </div>

                        `}

            </div>


            <div
                class="lineup-card-footer"
            >

                <span>
                    共 ${a.length} 人
                </span>


                ${a.length===9?`
                            <span
                                class="lineup-card-complete"
                            >
                                ✓ 完整先發
                            </span>
                        `:`
                            <span
                                class="lineup-card-incomplete"
                            >
                                ⚠ 尚未滿 9 人
                            </span>
                        `}

            </div>

        </section>

    `;const d=t.querySelector("#lineupCardEditBtn");d&&d.addEventListener("click",()=>{t.dispatchEvent(new CustomEvent("lineup:edit",{bubbles:!0}))});const o=[...t.querySelectorAll(".lineup-card-item")];let s=null,l=-1;function c(f){s=f.currentTarget,l=Number(s.dataset.index),s.classList.add("lineup-card-dragging"),f.dataTransfer&&(f.dataTransfer.effectAllowed="move",f.dataTransfer.setData("text/plain",String(l)))}function r(f){f.preventDefault(),f.dataTransfer&&(f.dataTransfer.dropEffect="move");const w=f.currentTarget;w!==s&&(o.forEach(u=>{u.classList.remove("lineup-card-drop-target")}),w.classList.add("lineup-card-drop-target"))}function p(f){f.currentTarget.classList.remove("lineup-card-drop-target")}function m(f){f.preventDefault();const w=f.currentTarget,u=Number(w.dataset.index);if(l<0||u<0||l===u)return;if(He(s,w),!ge(l,u)){rt(t,"❌ 棒次更新失敗");return}rt(t,"✓ 棒次已更新並儲存"),window.setTimeout(()=>{dt(t)},280)}function v(){o.forEach(f=>{f.classList.remove("lineup-card-dragging"),f.classList.remove("lineup-card-drop-target")}),s=null,l=-1}o.forEach(f=>{f.addEventListener("dragstart",c),f.addEventListener("dragover",r),f.addEventListener("dragleave",p),f.addEventListener("drop",m),f.addEventListener("dragend",v)});const h=()=>{dt(t)},b=f=>{var u;const w=((u=f==null?void 0:f.detail)==null?void 0:u.reason)==="swap"?"✓ 棒次已儲存":"✓ 先發名單已儲存";rt(t,w),window.setTimeout(()=>{dt(t)},150)},E=()=>{rt(t,"✓ 棒次已更新")},g=()=>{rt(t,"✓ 先發名單已清除"),window.setTimeout(()=>{dt(t)},150)};document.addEventListener("lineup:updated",h),document.addEventListener("lineup:saved",b),document.addEventListener("lineup:swap",E),document.addEventListener("lineup:cleared",g),t._lineupCardCleanup=()=>{document.removeEventListener("lineup:updated",h),document.removeEventListener("lineup:saved",b),document.removeEventListener("lineup:swap",E),document.removeEventListener("lineup:cleared",g),o.forEach(f=>{f.removeEventListener("dragstart",c),f.removeEventListener("dragover",r),f.removeEventListener("dragleave",p),f.removeEventListener("drop",m),f.removeEventListener("dragend",v)})}}function vt(t){if(!t)return;typeof t._lineupCleanup=="function"&&t._lineupCleanup(),t.innerHTML=`

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

    `;const n=t.querySelector("#lineup-form"),e=t.querySelector("#lineup-card");if(!n||!e)return;function i(){Ie(n)}function a(){dt(e)}function d(){i(),a()}d();const o=()=>{i(),a()},s=()=>{i(),a()},l=()=>{i(),a()},c=()=>{a()},r=()=>{a()},p=()=>{a()};window.addEventListener("player:added",o),window.addEventListener("player:removed",s),window.addEventListener("player:updated",l),window.addEventListener("lineup:updated",c),window.addEventListener("lineup:saved",r),window.addEventListener("lineup:swap",p);const m=()=>{i(),n.scrollIntoView({behavior:"smooth",block:"start"})};e.addEventListener("lineup:edit",m),t._lineupCleanup=()=>{window.removeEventListener("player:added",o),window.removeEventListener("player:removed",s),window.removeEventListener("player:updated",l),window.removeEventListener("lineup:updated",c),window.removeEventListener("lineup:saved",r),window.removeEventListener("lineup:swap",p),e.removeEventListener("lineup:edit",m),t._lineupCleanup=null}}function $t(t){const n=j(),e=Array.isArray(n.players)?n.players:[];Array.isArray(n.scoreSheets)&&n.scoreSheets,t.innerHTML=`
    <section class="score-sheet-page">
      <div class="score-sheet-page-header">
        <div>
          <h2>📋 比賽紀錄</h2>
          <p>建立完整的比賽紀錄，包含打擊、投手和局數統計</p>
        </div>
      </div>

      <div class="score-sheet-actions">
        <button type="button" id="newScoreSheetBtn" class="btn-primary">📝 新增比賽紀錄</button>
        <button type="button" id="viewHistoryBtn" class="btn-secondary">📚 查看歷史紀錄</button>
      </div>

      <div id="scoreSheetContent">
        ${qt(e)}
      </div>
    </section>
  `,Lt(t,e);const i=t.querySelector("#newScoreSheetBtn");i&&i.addEventListener("click",()=>{$t(t)});const a=t.querySelector("#viewHistoryBtn");a&&a.addEventListener("click",()=>{Gt(t,e)})}function N(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Gt(t,n){const e=j(),i=Array.isArray(e.scoreSheets)?e.scoreSheets:[],a=t.querySelector("#scoreSheetContent");if(!a)return;if(i.length===0){a.innerHTML=`
      <div class="score-sheet-history-empty">
        <p>目前還沒有任何比賽紀錄。</p>
      </div>
    `;return}const d=[...i].sort((o,s)=>{var r,p;const l=((r=o==null?void 0:o.gameInfo)==null?void 0:r.gameDate)||(o==null?void 0:o.createdAt)||"";return(((p=s==null?void 0:s.gameInfo)==null?void 0:p.gameDate)||(s==null?void 0:s.createdAt)||"").localeCompare(l)});a.innerHTML=`
    <div class="score-sheet-history-list">
      ${d.map(o=>{const s=o.gameInfo||{},l=s.homeAway==="away"?"客場":"主場",c=Array.isArray(o.battingRecords)&&o.battingRecords.length>0;return`
          <div class="score-sheet-history-item" data-sheet-id="${N(o.id)}">
            <div class="score-sheet-history-info">
              <strong>vs. ${N(s.opponent||"未指定對手")}</strong>
              <span>${N(s.gameDate||"")}・${l}</span>
              ${c?"":'<span class="score-sheet-draft-badge">尚未填寫詳細數據</span>'}
            </div>
            <div class="score-sheet-history-actions">
              <button type="button" class="btn-secondary score-sheet-edit-btn" data-sheet-id="${N(o.id)}">${c?"編輯":"繼續填寫"}</button>
              <button type="button" class="btn-danger score-sheet-delete-btn" data-sheet-id="${N(o.id)}">刪除</button>
            </div>
          </div>
        `}).join("")}
    </div>
  `,a.querySelectorAll(".score-sheet-edit-btn").forEach(o=>{o.addEventListener("click",()=>{const s=o.dataset.sheetId,l=i.find(c=>c.id===s);a.innerHTML=qt(n,l||null),Lt(t,n)})}),a.querySelectorAll(".score-sheet-delete-btn").forEach(o=>{o.addEventListener("click",()=>{var v;const s=o.dataset.sheetId,l=i.find(h=>h.id===s);if(!l)return;const c=((v=l.gameInfo)==null?void 0:v.opponent)||"未指定對手";if(!confirm(`確定要刪除這場比賽紀錄嗎？（vs. ${c}）
此操作無法復原，相關的球員累計數據也會一併扣除。`))return;const p=j(),m=(p.scoreSheets||[]).find(h=>h.id===s);m&&Jt(m,p),p.scoreSheets=(p.scoreSheets||[]).filter(h=>h.id!==s),V(p),Gt(t,n)})})}function qt(t,n=null){const e=(n==null?void 0:n.gameInfo)||{},i=Array.isArray(n==null?void 0:n.inningRecords)?n.inningRecords:null,a=(i==null?void 0:i[0])||[],d=(i==null?void 0:i[1])||[];return`
    <div class="score-sheet-form" data-linked-sheet-id="${n?N(n.id):""}">
      <h3>基本比賽資訊</h3>
      <div class="form-grid">
        <div class="form-field">
          <label for="teamName">球隊名稱</label>
          <input type="text" id="teamName" placeholder="輸入球隊名稱" value="${N(e.teamName||"")}">
        </div>
        <div class="form-field">
          <label for="opponent">對手球隊</label>
          <input type="text" id="opponent" placeholder="輸入對手名稱" value="${N(e.opponent||"")}">
        </div>
        <div class="form-field">
          <label for="gameDate">比賽日期</label>
          <input type="date" id="gameDate" value="${N(e.gameDate||"")}">
        </div>
        <div class="form-field">
          <label for="venue">比賽地點</label>
          <input type="text" id="venue" placeholder="輸入比賽地點" value="${N(e.venue||"")}">
        </div>
        <div class="form-field">
          <label for="gameName">比賽名稱</label>
          <input type="text" id="gameName" placeholder="輸入比賽名稱" value="${N(e.gameName||"")}">
        </div>
        <div class="form-field">
          <label for="homeAway">主客場</label>
          <select id="homeAway">
            <option value="home" ${e.homeAway!=="away"?"selected":""}>主場</option>
            <option value="away" ${e.homeAway==="away"?"selected":""}>客場</option>
          </select>
        </div>
      </div>

      <h3>局數紀錄表</h3>
      <div class="inning-section">
        <table class="inning-table">
          <thead>
            <tr>
              <th>球隊</th>
              ${Array.from({length:9},(o,s)=>`<th>${s+1}</th>`).join("")}
              <th>R</th>
              <th>H</th>
              <th>E</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>先攻 (客)</td>
              ${Array.from({length:12},(o,s)=>`<td><input type="number" class="inning-input" min="0" value="${Number.isFinite(a[s])?a[s]:0}"></td>`).join("")}
            </tr>
            <tr>
              <td>後攻 (主)</td>
              ${Array.from({length:12},(o,s)=>`<td><input type="number" class="inning-input" min="0" value="${Number.isFinite(d[s])?d[s]:0}"></td>`).join("")}
            </tr>
          </tbody>
        </table>
      </div>

      <h3>打擊與守備表現紀錄區</h3>
      <div class="coach-substitution-section">
        <h4>教練調度模式</h4>
        <div class="coach-substitution-form">
          <div class="form-field">
            <label for="outPlayerNumber">下場球員背號</label>
            <input type="number" id="outPlayerNumber" placeholder="輸入背號" min="1">
          </div>
          <div class="form-field">
            <label for="inPlayerNumber">上場球員背號</label>
            <input type="number" id="inPlayerNumber" placeholder="輸入背號" min="1">
          </div>
          <div class="form-field">
            <label for="substitutionType">替換類型</label>
            <select id="substitutionType">
              <option value="substitute-batting">代打</option>
              <option value="substitute-running">代跑</option>
              <option value="defensive-replacement">守備替換</option>
              <option value="injury">受傷退場</option>
            </select>
          </div>
          <button type="button" id="executeSubstitutionBtn" class="btn-primary">執行調度</button>
        </div>
        <div class="coach-substitution-form">
          <div class="form-field">
            <label for="positionChange">守備位置調動</label>
            <input type="text" id="positionChange" placeholder="例如: 1-2-6-1 (使用數字代碼)">
          </div>
          <button type="button" id="executePositionChangeBtn" class="btn-secondary">執行守備調動</button>
        </div>
        <div class="position-code-legend">
          <p>守備位置代碼：1-投手 2-捕手 3-一壘手 4-二壘手 5-三壘手 6-游擊手 7-左外野 8-中外野 9-右外野</p>
        </div>
      </div>
      <div class="batting-section">
        <div class="lineup-selector">
          <label for="useLineup">使用先發名單：</label>
          <select id="useLineup">
            <option value="current">使用當前先發名單</option>
            <option value="custom">自選球員</option>
          </select>
        </div>
        <table class="batting-table">
          <thead>
            <tr>
              <th>棒次</th>
              <th>身分</th>
              <th>背號</th>
              <th>姓名</th>
              <th>守位</th>
              ${Array.from({length:9},(o,s)=>`<th>${s+1}</th>`).join("")}
              <th>AB<br>打數</th>
              <th>R<br>得分</th>
              <th>H<br>安打</th>
              <th>RBI<br>打點</th>
              <th>BB/HP<br>四死</th>
              <th>SO<br>三振</th>
              <th>SB<br>盜壘</th>
              <th>E<br>失誤</th>
              <th>AVG<br>打擊率</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="battingRecordBody">
            ${mt(t,[],(n==null?void 0:n.battingRecords)||null)}
          </tbody>
          <tfoot>
            <tr class="team-total-row">
              <td colspan="5"><strong>團隊打擊與守備總計</strong></td>
              ${Array.from({length:9},()=>"<td></td>").join("")}
              <td id="teamTotalAtBats">0</td>
              <td id="teamTotalRuns">0</td>
              <td id="teamTotalHits">0</td>
              <td id="teamTotalRBI">0</td>
              <td id="teamTotalWalks">0</td>
              <td id="teamTotalStrikeouts">0</td>
              <td id="teamTotalStolenBases">0</td>
              <td id="teamTotalErrors">0</td>
              <td id="teamBattingAverage">.000</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <h3>投手表現紀錄專區</h3>
      <div class="pitching-section">
        <table class="pitching-table">
          <thead>
            <tr>
              <th>順序</th>
              <th>姓名</th>
              <th>背號</th>
              <th>IP<br>局數</th>
              <th>BF<br>人次</th>
              <th>NP<br>球數</th>
              <th>H<br>被安打</th>
              <th>R<br>失分</th>
              <th>ER<br>自責分</th>
              <th>BB<br>四死</th>
              <th>SO<br>三振</th>
              <th>HR<br>被轟</th>
              <th>ERA<br>防禦率</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="pitchingRecordBody">
            ${gt(t,[],(n==null?void 0:n.pitchingRecords)||null)}
          </tbody>
          <tfoot>
            <tr class="team-total-row">
              <td colspan="3"><strong>團隊投手總計</strong></td>
              <td id="teamTotalInnings">0</td>
              <td id="teamTotalBattersFaced">0</td>
              <td id="teamTotalPitches">0</td>
              <td id="teamTotalHitsAllowed">0</td>
              <td id="teamTotalRunsAllowed">0</td>
              <td id="teamTotalEarnedRuns">0</td>
              <td id="teamTotalPitchingWalks">0</td>
              <td id="teamTotalPitchingStrikeouts">0</td>
              <td id="teamTotalHomeRuns">0</td>
              <td id="teamERA">0.00</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <button type="button" id="addPitchingRecordBtn" class="btn-small">+ 新增投手記錄</button>
      </div>

      <div class="form-actions">
        <button type="button" id="saveScoreSheetBtn" class="btn-primary">💾 儲存比賽紀錄</button>
        <button type="button" id="clearScoreSheetBtn" class="btn-secondary">🗑️ 清空表單</button>
      </div>
    </div>
  `}function mt(t,n,e=null){if(Array.isArray(e)&&e.length>0)return e.map((i,a)=>{const d=a+1,o=Array.isArray(i.inningResults)?i.inningResults:[];return`
        <tr data-batting-order="${d}">
          <td>${d}</td>
          <td>
            <select class="identity-select" data-field="identity">
              <option value="starter" ${i.identity==="starter"||!i.identity?"selected":""}>先發</option>
              <option value="substitute-batting" ${i.identity==="substitute-batting"?"selected":""}>代打</option>
              <option value="substitute-running" ${i.identity==="substitute-running"?"selected":""}>代跑</option>
              <option value="defensive-replacement" ${i.identity==="defensive-replacement"?"selected":""}>守備替換</option>
              <option value="injury" ${i.identity==="injury"?"selected":""}>受傷退場</option>
            </select>
          </td>
          <td class="jersey-cell">
            <select class="player-select" data-field="playerId">
              <option value="">選擇球員</option>
              ${t.map(s=>`<option value="${s.id}" ${String(s.id)===String(i.playerId)?"selected":""}>#${s.number} ${s.name}</option>`).join("")}
            </select>
          </td>
          <td class="player-name"></td>
          <td>
            <select class="position-select" data-field="position">
              <option value="">選擇守位</option>
              ${["投手","捕手","一壘手","二壘手","三壘手","游擊手","左外野","中外野","右外野","指定打擊"].map(s=>`<option value="${s}" ${i.position===s?"selected":""}>${s}</option>`).join("")}
            </select>
          </td>
          ${Array.from({length:9},(s,l)=>`
            <td><input type="text" class="inning-result-input" data-inning="${l+1}" placeholder="輸入結果" value="${N(o[l]||"")}"></td>
          `).join("")}
          <td><input type="number" class="stat-input" data-field="atBats" min="0" value="${i.atBats||0}"></td>
          <td><input type="number" class="stat-input" data-field="runs" min="0" value="${i.runs||0}"></td>
          <td><input type="number" class="stat-input" data-field="hits" min="0" value="${i.hits||0}"></td>
          <td><input type="number" class="stat-input" data-field="rbi" min="0" value="${i.rbi||0}"></td>
          <td><input type="number" class="stat-input" data-field="walks" min="0" value="${i.walks||0}"></td>
          <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="${i.strikeouts||0}"></td>
          <td><input type="number" class="stat-input" data-field="stolenBases" min="0" value="${i.stolenBases||0}"></td>
          <td><input type="number" class="stat-input" data-field="errors" min="0" value="${i.errors||0}"></td>
          <td class="batting-average">.000</td>
        </tr>
      `}).join("");if(n.length===0){let i="";for(let a=1;a<=9;a++)i+=`
        <tr data-batting-order="${a}">
          <td>${a}</td>
          <td>
            <select class="identity-select" data-field="identity">
              <option value="starter">先發</option>
              <option value="substitute-batting">代打</option>
              <option value="substitute-running">代跑</option>
              <option value="defensive-replacement">守備替換</option>
              <option value="injury">受傷退場</option>
            </select>
          </td>
          <td class="jersey-cell">
            <select class="player-select" data-field="playerId">
              <option value="">選擇球員</option>
              ${t.map(d=>`<option value="${d.id}">#${d.number} ${d.name}</option>`).join("")}
            </select>
          </td>
          <td class="player-name"></td>
          <td>
            <select class="position-select" data-field="position">
              <option value="">選擇守位</option>
              <option value="投手">投手</option>
              <option value="捕手">捕手</option>
              <option value="一壘手">一壘手</option>
              <option value="二壘手">二壘手</option>
              <option value="三壘手">三壘手</option>
              <option value="游擊手">游擊手</option>
              <option value="左外野">左外野</option>
              <option value="中外野">中外野</option>
              <option value="右外野">右外野</option>
              <option value="指定打擊">指定打擊</option>
            </select>
          </td>
          ${Array.from({length:9},(d,o)=>`
            <td><input type="text" class="inning-result-input" data-inning="${o+1}" placeholder="輸入結果"></td>
          `).join("")}
          <td><input type="number" class="stat-input" data-field="atBats" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="runs" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="rbi" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="walks" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="stolenBases" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="errors" min="0" value="0"></td>
          <td class="batting-average">.000</td>
        </tr>
      `;return i}return n.map((i,a)=>{const d=a+1,o=t.find(p=>String(p.id)===String(i.playerId)),s=(o==null?void 0:o.name)||(o==null?void 0:o.playerName)||"",l=(o==null?void 0:o.number)||(o==null?void 0:o.jerseyNumber)||"",c=typeof i=="object"?i.position:"";return`
      <tr data-batting-order="${d}">
        <td>${d}</td>
        <td>先發</td>
        <td>${l}</td>
        <td class="player-name">${s}</td>
        <td class="position-cell">${c==="P"?"投手":c==="C"?"捕手":c==="1B"?"一壘手":c==="2B"?"二壘手":c==="3B"?"三壘手":c==="SS"?"游擊手":c==="LF"?"左外野":c==="CF"?"中外野":c==="RF"?"右外野":c==="DH"?"指定打擊":c}</td>
        ${Array.from({length:9},(p,m)=>`
          <td><input type="text" class="inning-result-input" data-inning="${m+1}" placeholder="輸入結果"></td>
        `).join("")}
        <td><input type="number" class="stat-input" data-field="atBats" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="runs" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="rbi" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="stolenBases" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="errors" min="0" value="0"></td>
        <td class="batting-average">.000</td>
        <td>
          <button type="button" class="btn-small add-substitute-btn" data-batting-order="${d}">+ 替換</button>
        </td>
      </tr>
    `}).join("")}function gt(t,n,e=null){if(Array.isArray(e)&&e.length>0){const o=t.filter(s=>{var l;return s.position==="投手"||s.position==="P"||((l=s.positions)==null?void 0:l.some(c=>c.code==="P"||c.code==="投手"))});return e.map((s,l)=>{const c=s.pitcherType==="starter"?"先發":`第 ${l+1} 任`;return`
        <tr data-pitcher-type="${s.pitcherType||(l===0?"starter":"relief")}" data-pitcher-id="${N(s.playerId||"")}">
          <td>${c}</td>
          <td>
            <select class="pitcher-select" data-field="playerId">
              <option value="">選擇投手</option>
              ${o.map(r=>`<option value="${r.id}" ${String(r.id)===String(s.playerId)?"selected":""}>${r.name}</option>`).join("")}
            </select>
          </td>
          <td class="pitcher-number"></td>
          <td><input type="number" class="pitching-input" data-field="innings" min="0" step="0.1" value="${s.innings||0}"></td>
          <td><input type="number" class="pitching-input" data-field="battersFaced" min="0" value="${s.battersFaced||0}"></td>
          <td><input type="number" class="pitching-input" data-field="pitches" min="0" value="${s.pitches||0}"></td>
          <td><input type="number" class="pitching-input" data-field="hitsAllowed" min="0" value="${s.hitsAllowed||0}"></td>
          <td><input type="number" class="pitching-input" data-field="runsAllowed" min="0" value="${s.runsAllowed||0}"></td>
          <td><input type="number" class="pitching-input" data-field="earnedRuns" min="0" value="${s.earnedRuns||0}"></td>
          <td><input type="number" class="pitching-input" data-field="walks" min="0" value="${s.walks||0}"></td>
          <td><input type="number" class="pitching-input" data-field="strikeouts" min="0" value="${s.strikeouts||0}"></td>
          <td><input type="number" class="pitching-input" data-field="homeRuns" min="0" value="${s.homeRuns||0}"></td>
          <td class="era">0.00</td>
        </tr>
      `}).join("")}const i=t.filter(o=>{var s;return o.position==="投手"||o.position==="P"||((s=o.positions)==null?void 0:s.some(l=>l.code==="P"||l.code==="投手"))});let a=null;if(n&&n.length===9){const o=n.find(s=>{const l=typeof s=="object"?s.position:"";return l==="P"||l==="投手"});if(o){const s=typeof o=="string"?o:o.playerId;a=i.find(l=>String(l.id)===String(s))}}let d="";a?d+=`
      <tr data-pitcher-type="starter" data-pitcher-id="${a.id}">
        <td>先發</td>
        <td>${a.name}</td>
        <td>${a.number}</td>
        <td><input type="number" class="pitching-input" data-field="innings" min="0" step="0.1" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="battersFaced" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="pitches" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="hitsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="runsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="earnedRuns" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="homeRuns" min="0" value="0"></td>
        <td class="era">0.00</td>
      </tr>
    `:d+=`
      <tr data-pitcher-type="starter" data-pitcher-id="">
        <td>先發</td>
        <td>
          <select class="pitcher-select" data-field="playerId">
            <option value="">選擇投手</option>
            ${i.map(o=>`<option value="${o.id}">${o.name}</option>`).join("")}
          </select>
        </td>
        <td class="pitcher-number"></td>
        <td><input type="number" class="pitching-input" data-field="innings" min="0" step="0.1" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="battersFaced" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="pitches" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="hitsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="runsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="earnedRuns" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="homeRuns" min="0" value="0"></td>
        <td class="era">0.00</td>
      </tr>
    `;for(let o=2;o<=4;o++)d+=`
      <tr data-pitcher-type="relief" data-pitcher-id="">
        <td>第 ${o} 任</td>
        <td>
          <select class="pitcher-select" data-field="playerId">
            <option value="">選擇投手</option>
            ${i.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}
          </select>
        </td>
        <td class="pitcher-number"></td>
        <td><input type="number" class="pitching-input" data-field="innings" min="0" step="0.1" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="battersFaced" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="pitches" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="hitsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="runsAllowed" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="earnedRuns" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="pitching-input" data-field="homeRuns" min="0" value="0"></td>
        <td class="era">0.00</td>
      </tr>
    `;return d}const Me=Object.freeze({1:"投手",2:"捕手",3:"一壘手",4:"二壘手",5:"三壘手",6:"游擊手",7:"左外野",8:"中外野",9:"右外野",DH:"指定打擊"}),De=Object.freeze({1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",p:"1",pitcher:"1",投手:"1",c:"2",catcher:"2",捕手:"2","1b":"3",一壘:"3",一壘手:"3","2b":"4",二壘:"4",二壘手:"4","3b":"5",三壘:"5",三壘手:"5",ss:"6",游擊:"6",游擊手:"6",lf:"7",左外:"7",左外野:"7",cf:"8",中外:"8",中外野:"8",rf:"9",右外:"9",右外野:"9",dh:"DH",指定打擊:"DH"});function Bt(t){if(typeof t!="string")return"";const n=t.trim().toLowerCase();return De[n]||""}function it(t){return Me[t]||""}function Fe(t){return typeof t!="string"?[]:t.split(/[\s,，、\-]+/).map(n=>n.trim()).filter(Boolean).map(n=>Bt(n)).filter(Boolean)}function _e(t){const n=t.querySelector(".position-cell");return n||Array.from(t.querySelectorAll("td")).slice(2).find(i=>Bt(i.textContent))}function zt(t){const n=t.querySelector(".position-select"),e=t.querySelector(".player-select"),i=_e(t),a=Bt((n==null?void 0:n.value)||(i==null?void 0:i.textContent)||"");return{row:t,positionCode:a,positionSelect:n,positionCell:i,playerSelect:e}}function Ue(t,n){const e=it(n);e&&(t.positionSelect?t.positionSelect.value=e:t.positionCell&&(t.positionCell.textContent=e),t.positionCode=n)}function We(t){const n=zt(t);return it(n.positionCode)}function Lt(t,n){const e=t.querySelector("#gameDate");e&&(e.value=new Date().toISOString().split("T")[0]);const i=t.querySelector("#useLineup");if(i&&i.value==="current"){const l=Y(),c=l&&Array.isArray(l.starters)?l.starters:[],r=t.querySelector("#battingRecordBody");r&&(r.innerHTML=mt(n,c));const p=t.querySelector("#pitchingRecordBody");p&&(p.innerHTML=gt(n,c)),setTimeout(()=>{tt(t,n)},100)}G(t),et(t),i&&i.addEventListener("change",l=>{if(l.target.value==="current"){const c=Y(),r=c&&Array.isArray(c.starters)?c.starters:[],p=t.querySelector("#battingRecordBody");p&&(p.innerHTML=mt(n,r));const m=t.querySelector("#pitchingRecordBody");m&&(m.innerHTML=gt(n,r)),G(t),et(t),setTimeout(()=>{tt(t,n)},100)}else{const c=t.querySelector("#battingRecordBody");c&&(c.innerHTML=mt(n,[]));const r=t.querySelector("#pitchingRecordBody");r&&(r.innerHTML=gt(n,[])),G(t),et(t),setTimeout(()=>{tt(t,n)},100)}}),t.addEventListener("input",l=>{var c,r;if(l.target.classList.contains("stat-input")&&l.target.dataset.field==="atBats"||l.target.classList.contains("stat-input")&&l.target.dataset.field==="hits"){const p=l.target.closest("tr");if(p){const m=parseInt((c=p.querySelector('[data-field="atBats"]'))==null?void 0:c.value)||0,v=parseInt((r=p.querySelector('[data-field="hits"]'))==null?void 0:r.value)||0,h=p.querySelector(".batting-average");h&&(h.textContent=m>0?(v/m).toFixed(3):".000"),G(t)}}l.target.classList.contains("stat-input")&&G(t)}),t.addEventListener("input",l=>{var c,r;if(l.target.classList.contains("pitching-input")&&l.target.dataset.field==="innings"||l.target.classList.contains("pitching-input")&&l.target.dataset.field==="earnedRuns"){const p=l.target.closest("tr");if(p){const m=parseFloat((c=p.querySelector('[data-field="innings"]'))==null?void 0:c.value)||0,v=parseInt((r=p.querySelector('[data-field="earnedRuns"]'))==null?void 0:r.value)||0,h=p.querySelector(".era");h&&(h.textContent=m>0?(v/m*9).toFixed(2):"0.00"),et(t)}}l.target.classList.contains("pitching-input")&&et(t)}),t.addEventListener("change",l=>{if(l.target.classList.contains("player-select")){const c=l.target.closest("tr");if(c){const r=n.find(v=>String(v.id)===l.target.value),p=c.querySelector(".player-name");p&&(p.textContent=(r==null?void 0:r.name)||"");const m=c.querySelector(".jersey-cell");if(m&&r){m.innerHTML=`
            <span class="jersey-number">${r.number||r.jerseyNumber||""}</span>
            <button type="button" class="edit-jersey-btn" title="修改球員">✏️</button>
            <select class="player-select" data-field="playerId" style="display: none;">
              <option value="">選擇球員</option>
              ${n.map(E=>`<option value="${E.id}" ${String(E.id)===String(r.id)?"selected":""}>#${E.number} ${E.name}</option>`).join("")}
            </select>
          `;const v=m.querySelector(".edit-jersey-btn"),h=m.querySelector(".player-select"),b=m.querySelector(".jersey-number");v&&h&&b&&(v.addEventListener("click",()=>{b.style.display="none",v.style.display="none",h.style.display="inline",h.focus()}),h.addEventListener("change",E=>{const g=n.find(f=>String(f.id)===E.target.value);g&&(b.textContent=g.number||g.jerseyNumber||"",p.textContent=g.name||"",b.style.display="inline",v.style.display="inline",h.style.display="none",h.innerHTML=`
                  <option value="">選擇球員</option>
                  ${n.map(f=>`<option value="${f.id}" ${String(f.id)===String(g.id)?"selected":""}>#${f.number} ${f.name}</option>`).join("")}
                `)}))}}}if(l.target.classList.contains("pitcher-select")){const c=l.target.closest("tr");if(c){const r=n.find(m=>String(m.id)===l.target.value),p=c.querySelector(".pitcher-number");p&&(p.textContent=(r==null?void 0:r.number)||""),tt(t,n,l.target.value)}}});const a=t.querySelector("#saveScoreSheetBtn");a&&a.addEventListener("click",()=>{ze(t)});const d=t.querySelector("#clearScoreSheetBtn");d&&d.addEventListener("click",()=>{confirm("確定要清空表單嗎？")&&(t.querySelector("#scoreSheetContent").innerHTML=qt(n),Lt(t,n))}),t.addEventListener("click",l=>{if(l.target.classList.contains("add-substitute-btn")){const c=l.target.dataset.battingOrder,r=t.querySelector("#battingRecordBody");if(r&&c){const p=document.createElement("tr");p.className="substitute-player-row",p.dataset.battingOrder=c,p.innerHTML=`
          <td>${c}</td>
          <td>
            <select class="identity-select" data-field="identity">
              <option value="substitute-batting">代打</option>
              <option value="substitute-running">代跑</option>
              <option value="defensive-replacement">守備替換</option>
              <option value="injury">受傷退場</option>
            </select>
          </td>
          <td class="jersey-cell">
            <select class="player-select" data-field="playerId">
              <option value="">選擇球員</option>
              ${n.map(g=>`<option value="${g.id}">#${g.number} ${g.name}</option>`).join("")}
            </select>
          </td>
          <td class="player-name"></td>
          <td>
            <select class="position-select" data-field="position">
              <option value="">選擇守位</option>
              <option value="投手">投手</option>
              <option value="捕手">捕手</option>
              <option value="一壘手">一壘手</option>
              <option value="二壘手">二壘手</option>
              <option value="三壘手">三壘手</option>
              <option value="游擊手">游擊手</option>
              <option value="左外野">左外野</option>
              <option value="中外野">中外野</option>
              <option value="右外野">右外野</option>
              <option value="指定打擊">指定打擊</option>
            </select>
          </td>
          ${Array.from({length:9},(g,f)=>`
            <td><input type="text" class="inning-result-input" data-inning="${f+1}" placeholder="輸入結果"></td>
          `).join("")}
          <td><input type="number" class="stat-input" data-field="atBats" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="runs" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="rbi" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="walks" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="stolenBases" min="0" value="0"></td>
          <td><input type="number" class="stat-input" data-field="errors" min="0" value="0"></td>
          <td class="batting-average">.000</td>
          <td>
            <button type="button" class="btn-small remove-row-btn" data-action="remove">刪除</button>
          </td>
        `;const m=r.querySelectorAll(`tr[data-batting-order="${c}"]`);if(m.length>0){const g=m[m.length-1];g.parentNode.insertBefore(p,g.nextSibling)}else{const g=r.querySelector(`tr[data-batting-order="${c}"]`);g?g.parentNode.insertBefore(p,g.nextSibling):r.appendChild(p)}const v=p.querySelector(".player-select"),h=p.querySelector(".player-name"),b=p.querySelector(".jersey-cell");v&&h&&b&&v.addEventListener("change",g=>{const f=n.find(w=>String(w.id)===g.target.value);if(f){h.textContent=(f==null?void 0:f.name)||"",b.innerHTML=`
                <span class="jersey-number">${f.number||f.jerseyNumber||""}</span>
                <button type="button" class="edit-jersey-btn" title="修改球員">✏️</button>
                <select class="player-select" data-field="playerId" style="display: none;">
                  <option value="">選擇球員</option>
                  ${n.map($=>`<option value="${$.id}" ${String($.id)===String(f.id)?"selected":""}>#${$.number} ${$.name}</option>`).join("")}
                </select>
              `;const w=b.querySelector(".edit-jersey-btn"),u=b.querySelector(".player-select"),y=b.querySelector(".jersey-number");w&&u&&y&&(w.addEventListener("click",()=>{y.style.display="none",w.style.display="none",u.style.display="inline",u.focus()}),u.addEventListener("change",$=>{const S=n.find(A=>String(A.id)===$.target.value);S&&(y.textContent=S.number||S.jerseyNumber||"",h.textContent=S.name||"",y.style.display="inline",w.style.display="inline",u.style.display="none",u.innerHTML=`
                      <option value="">選擇球員</option>
                      ${n.map(A=>`<option value="${A.id}" ${String(A.id)===String(S.id)?"selected":""}>#${A.number} ${A.name}</option>`).join("")}
                    `)}))}});const E=p.querySelector(".remove-row-btn");E&&E.addEventListener("click",()=>{confirm("確定要刪除這個替換記錄嗎？")&&(p.remove(),G(t))})}}});const o=t.querySelector("#addPitchingRecordBtn");o&&o.addEventListener("click",()=>{const l=t.querySelector("#pitchingRecordBody");if(l){const r=l.querySelectorAll("tr").length+1,p=n.filter(b=>{var E;return b.position==="投手"||b.position==="P"||((E=b.positions)==null?void 0:E.some(g=>g.code==="P"||g.code==="投手"))}),m=document.createElement("tr");m.className="relief-pitcher-row",m.dataset.pitcherType="relief",m.dataset.pitcherId="",m.innerHTML=`
          <td>第 ${r} 任</td>
          <td>
            <select class="pitcher-select" data-field="playerId">
              <option value="">選擇投手</option>
              ${p.map(b=>`<option value="${b.id}">${b.name}</option>`).join("")}
            </select>
          </td>
          <td class="pitcher-number"></td>
          <td><input type="number" class="pitching-input" data-field="innings" min="0" step="0.1" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="battersFaced" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="pitches" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="hitsAllowed" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="runsAllowed" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="earnedRuns" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="walks" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="strikeouts" min="0" value="0"></td>
          <td><input type="number" class="pitching-input" data-field="homeRuns" min="0" value="0"></td>
          <td class="era">0.00</td>
          <td>
            <button type="button" class="btn-small remove-pitcher-btn" data-action="remove">刪除</button>
          </td>
        `;const v=l.querySelector("tr:last-child");v?v.parentNode.insertBefore(m,v.nextSibling):l.appendChild(m),tt(t,n);const h=m.querySelector(".remove-pitcher-btn");h&&h.addEventListener("click",()=>{confirm("確定要刪除這個投手記錄嗎？")&&(m.remove(),et(t),tt(t,n))})}});const s=t.querySelector("#executeSubstitutionBtn");s&&s.addEventListener("click",()=>{const l=t.querySelector("#outPlayerNumber").value,c=t.querySelector("#inPlayerNumber").value,r=t.querySelector("#substitutionType").value;if(!l||!c){alert("請輸入下場和上場球員的背號");return}const p=t.querySelector("#battingRecordBody");if(!p)return;const m=p.querySelectorAll("tr");let v=null,h=null;for(const S of m){const A=S.querySelectorAll("td");for(const B of A)if(B.textContent.trim().replace(/[^\d]/g,"")===l){v=S,h=S.dataset.battingOrder;break}if(v)break}if(!v||!h){alert(`找不到背號 ${l} 的球員`);return}const b=n.find(S=>String(S.number)===c||String(S.jerseyNumber)===c);if(!b){alert(`找不到背號 ${c} 的球員`);return}const E=document.createElement("tr");E.className="substitute-player-row",E.dataset.battingOrder=h,E.innerHTML=`
        <td>${h}</td>
        <td>
          <select class="identity-select" data-field="identity">
            <option value="substitute-batting" ${r==="substitute-batting"?"selected":""}>代打</option>
            <option value="substitute-running" ${r==="substitute-running"?"selected":""}>代跑</option>
            <option value="defensive-replacement" ${r==="defensive-replacement"?"selected":""}>守備替換</option>
            <option value="injury" ${r==="injury"?"selected":""}>受傷退場</option>
          </select>
        </td>
        <td class="jersey-cell">
          <span class="jersey-number">${b.number||b.jerseyNumber||""}</span>
          <button type="button" class="edit-jersey-btn" title="修改球員">✏️</button>
          <select class="player-select" data-field="playerId" style="display: none;">
            <option value="">選擇球員</option>
            ${n.map(S=>`<option value="${S.id}" ${String(S.id)===String(b.id)?"selected":""}>#${S.number} ${S.name}</option>`).join("")}
          </select>
        </td>
        <td class="player-name">${b.name||""}</td>
        <td>
          <select class="position-select" data-field="position">
            <option value="">選擇守位</option>
            <option value="投手">投手</option>
            <option value="捕手">捕手</option>
            <option value="一壘手">一壘手</option>
            <option value="二壘手">二壘手</option>
            <option value="三壘手">三壘手</option>
            <option value="游擊手">游擊手</option>
            <option value="左外野">左外野</option>
            <option value="中外野">中外野</option>
            <option value="右外野">右外野</option>
            <option value="指定打擊">指定打擊</option>
          </select>
        </td>
        ${Array.from({length:9},(S,A)=>`
          <td><input type="text" class="inning-result-input" data-inning="${A+1}" placeholder="輸入結果"></td>
        `).join("")}
        <td><input type="number" class="stat-input" data-field="atBats" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="runs" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="hits" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="rbi" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="walks" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="strikeouts" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="stolenBases" min="0" value="0"></td>
        <td><input type="number" class="stat-input" data-field="errors" min="0" value="0"></td>
        <td class="batting-average">.000</td>
        <td>
          <button type="button" class="btn-small remove-row-btn" data-action="remove">刪除</button>
        </td>
      `;const g=p.querySelectorAll(`tr[data-batting-order="${h}"]`);if(g.length>0){const S=g[g.length-1];S.parentNode.insertBefore(E,S.nextSibling)}else v.parentNode.insertBefore(E,v.nextSibling);const f=E.querySelector(".edit-jersey-btn"),w=E.querySelector(".player-select"),u=E.querySelector(".jersey-number"),y=E.querySelector(".player-name");f&&w&&u&&(f.addEventListener("click",()=>{u.style.display="none",f.style.display="none",w.style.display="inline",w.focus()}),w.addEventListener("change",S=>{const A=n.find(B=>String(B.id)===S.target.value);A&&(u.textContent=A.number||A.jerseyNumber||"",y.textContent=A.name||"",u.style.display="inline",f.style.display="inline",w.style.display="none",w.innerHTML=`
              <option value="">選擇球員</option>
              ${n.map(B=>`<option value="${B.id}" ${String(B.id)===String(A.id)?"selected":""}>#${B.number} ${B.name}</option>`).join("")}
            `)}));const $=E.querySelector(".remove-row-btn");$&&$.addEventListener("click",()=>{confirm("確定要刪除這個替換記錄嗎？")&&(E.remove(),G(t))}),t.querySelector("#outPlayerNumber").value="",t.querySelector("#inPlayerNumber").value="",G(t),alert(`成功執行調度：背號 ${l} 下場，背號 ${c} 上場`)}),t.addEventListener("click",l=>{if(l.target.id!=="executePositionChangeBtn")return;const c=t.querySelector("#positionChange");if(!c){alert("找不到守備位置調動輸入框");return}const r=Fe(c.value);if(r.length<2){alert("請輸入至少兩個守備位置代碼，例如 1-2-6-1");return}const p=r.find(g=>!it(g)||g==="DH");if(p){alert(`無效的守備位置代碼: ${p}`);return}const m=t.querySelector("#battingRecordBody");if(!m)return;const v={};m.querySelectorAll("tr").forEach(g=>{const f=zt(g);f.positionCode&&f.positionCode!=="DH"&&(v[f.positionCode]=f)});const b=[...new Set(r.slice(0,-1))].filter(g=>!v[g]);if(b.length>0){const g=b.map(f=>`${f}(${it(f)})`).join("、");alert(`無法執行守備調動：找不到 ${g} 的球員
請確認目前場上球員已有對應守位`);return}const E=[];for(let g=0;g<r.length-1;g++){const f=r[g],w=r[g+1],u=v[f];Ue(u,w),E.push(`位置 ${f}(${it(f)}) → ${w}(${it(w)})`)}c.value="",alert(`成功執行守備調動：
${E.join(`
`)}`)})}function tt(t,n,e){const i=t.querySelectorAll(".pitcher-select"),a=new Set;i.forEach(d=>{d.value&&a.add(d.value)}),i.forEach(d=>{const o=d.value;d.closest("td"),d.innerHTML=`
      <option value="">選擇投手</option>
      ${n.filter(s=>!a.has(String(s.id))||String(s.id)===o).map(s=>`<option value="${s.id}" ${String(s.id)===o?"selected":""}>${s.name}</option>`).join("")}
    `})}function G(t){const n=t.querySelectorAll("#battingRecordBody tr");let e=0,i=0,a=0,d=0,o=0,s=0,l=0,c=0;n.forEach(u=>{var y,$,S,A,B,k,q,L;e+=parseInt((y=u.querySelector('[data-field="atBats"]'))==null?void 0:y.value)||0,i+=parseInt(($=u.querySelector('[data-field="runs"]'))==null?void 0:$.value)||0,a+=parseInt((S=u.querySelector('[data-field="hits"]'))==null?void 0:S.value)||0,d+=parseInt((A=u.querySelector('[data-field="rbi"]'))==null?void 0:A.value)||0,o+=parseInt((B=u.querySelector('[data-field="walks"]'))==null?void 0:B.value)||0,s+=parseInt((k=u.querySelector('[data-field="strikeouts"]'))==null?void 0:k.value)||0,l+=parseInt((q=u.querySelector('[data-field="stolenBases"]'))==null?void 0:q.value)||0,c+=parseInt((L=u.querySelector('[data-field="errors"]'))==null?void 0:L.value)||0});const r=e>0?(a/e).toFixed(3):".000",p=t.querySelector("#teamTotalAtBats"),m=t.querySelector("#teamTotalRuns"),v=t.querySelector("#teamTotalHits"),h=t.querySelector("#teamTotalRBI"),b=t.querySelector("#teamTotalWalks"),E=t.querySelector("#teamTotalStrikeouts"),g=t.querySelector("#teamTotalStolenBases"),f=t.querySelector("#teamTotalErrors"),w=t.querySelector("#teamBattingAverage");p&&(p.textContent=e),m&&(m.textContent=i),v&&(v.textContent=a),h&&(h.textContent=d),b&&(b.textContent=o),E&&(E.textContent=s),g&&(g.textContent=l),f&&(f.textContent=c),w&&(w.textContent=r)}function et(t){const n=t.querySelectorAll("#pitchingRecordBody tr");let e=0,i=0,a=0,d=0,o=0,s=0,l=0,c=0,r=0;n.forEach($=>{var S,A,B,k,q,L,I,P,R;e+=parseFloat((S=$.querySelector('[data-field="innings"]'))==null?void 0:S.value)||0,i+=parseInt((A=$.querySelector('[data-field="battersFaced"]'))==null?void 0:A.value)||0,a+=parseInt((B=$.querySelector('[data-field="pitches"]'))==null?void 0:B.value)||0,d+=parseInt((k=$.querySelector('[data-field="hitsAllowed"]'))==null?void 0:k.value)||0,o+=parseInt((q=$.querySelector('[data-field="runsAllowed"]'))==null?void 0:q.value)||0,s+=parseInt((L=$.querySelector('[data-field="earnedRuns"]'))==null?void 0:L.value)||0,l+=parseInt((I=$.querySelector('[data-field="walks"]'))==null?void 0:I.value)||0,c+=parseInt((P=$.querySelector('[data-field="strikeouts"]'))==null?void 0:P.value)||0,r+=parseInt((R=$.querySelector('[data-field="homeRuns"]'))==null?void 0:R.value)||0});const p=e>0?(s/e*9).toFixed(2):"0.00",m=t.querySelector("#teamTotalInnings"),v=t.querySelector("#teamTotalBattersFaced"),h=t.querySelector("#teamTotalPitches"),b=t.querySelector("#teamTotalHitsAllowed"),E=t.querySelector("#teamTotalRunsAllowed"),g=t.querySelector("#teamTotalEarnedRuns"),f=t.querySelector("#teamTotalPitchingWalks"),w=t.querySelector("#teamTotalPitchingStrikeouts"),u=t.querySelector("#teamTotalHomeRuns"),y=t.querySelector("#teamERA");m&&(m.textContent=e.toFixed(1)),v&&(v.textContent=i),h&&(h.textContent=a),b&&(b.textContent=d),E&&(E.textContent=o),g&&(g.textContent=s),f&&(f.textContent=l),w&&(w.textContent=c),u&&(u.textContent=r),y&&(y.textContent=p)}function Ge(t){const n=new Map,e=[];return t.forEach((i,a)=>{const d=(i.position||"").trim();if(!d)return;const o=d.toUpperCase();n.has(o)?e.push({position:d,firstBattingOrder:n.get(o)+1,battingOrder:a+1}):n.set(o,a)}),e}function ze(t){var n,e,i,a,d,o,s;try{const l=j(),c={teamName:((n=t.querySelector("#teamName"))==null?void 0:n.value)||"",opponent:((e=t.querySelector("#opponent"))==null?void 0:e.value)||"",gameDate:((i=t.querySelector("#gameDate"))==null?void 0:i.value)||"",venue:((a=t.querySelector("#venue"))==null?void 0:a.value)||"",gameName:((d=t.querySelector("#gameName"))==null?void 0:d.value)||"",homeAway:((o=t.querySelector("#homeAway"))==null?void 0:o.value)||"home"},r=t.querySelectorAll(".inning-table tbody tr"),p=[];r.forEach(u=>{const y=u.querySelectorAll(".inning-input"),$=Array.from(y).map(S=>parseInt(S.value)||0);p.push($)});const m=t.querySelectorAll("#battingRecordBody tr"),v=[];m.forEach(u=>{var k,q,L,I,P,R,C,F,X,H,x;const y=((k=u.querySelector(".player-select"))==null?void 0:k.value)||"",$=((q=u.querySelector(".identity-select"))==null?void 0:q.value)||"starter",S=((L=u.querySelector(".position-select"))==null?void 0:L.value)||We(u),A=u.querySelectorAll(".stat-input"),B=Array.from(u.querySelectorAll(".inning-result-input")).map(Z=>Z.value||"");v.push({playerId:y,identity:$,position:S,atBats:parseInt((I=u.querySelector('[data-field="atBats"]'))==null?void 0:I.value)||0,runs:parseInt((P=u.querySelector('[data-field="runs"]'))==null?void 0:P.value)||0,hits:parseInt((R=u.querySelector('[data-field="hits"]'))==null?void 0:R.value)||0,rbi:parseInt((C=u.querySelector('[data-field="rbi"]'))==null?void 0:C.value)||0,walks:parseInt((F=u.querySelector('[data-field="walks"]'))==null?void 0:F.value)||0,strikeouts:parseInt((X=u.querySelector('[data-field="strikeouts"]'))==null?void 0:X.value)||0,stolenBases:parseInt((H=u.querySelector('[data-field="stolenBases"]'))==null?void 0:H.value)||0,errors:parseInt((x=u.querySelector('[data-field="errors"]'))==null?void 0:x.value)||0,inningResults:B})});const h=t.querySelectorAll("#pitchingRecordBody tr"),b=[];h.forEach(u=>{var S,A,B,k,q,L,I,P,R,C;const y=((S=u.querySelector(".pitcher-select"))==null?void 0:S.value)||"",$=u.dataset.pitcherType||"starter";b.push({playerId:y,pitcherType:$,innings:parseFloat((A=u.querySelector('[data-field="innings"]'))==null?void 0:A.value)||0,battersFaced:parseInt((B=u.querySelector('[data-field="battersFaced"]'))==null?void 0:B.value)||0,pitches:parseInt((k=u.querySelector('[data-field="pitches"]'))==null?void 0:k.value)||0,hitsAllowed:parseInt((q=u.querySelector('[data-field="hitsAllowed"]'))==null?void 0:q.value)||0,runsAllowed:parseInt((L=u.querySelector('[data-field="runsAllowed"]'))==null?void 0:L.value)||0,earnedRuns:parseInt((I=u.querySelector('[data-field="earnedRuns"]'))==null?void 0:I.value)||0,walks:parseInt((P=u.querySelector('[data-field="walks"]'))==null?void 0:P.value)||0,strikeouts:parseInt((R=u.querySelector('[data-field="strikeouts"]'))==null?void 0:R.value)||0,homeRuns:parseInt((C=u.querySelector('[data-field="homeRuns"]'))==null?void 0:C.value)||0})});const E=Ge(v);if(E.length>0){const u=E.map(y=>`第 ${y.firstBattingOrder} 棒與第 ${y.battingOrder} 棒皆為「${y.position}」`);alert(`守備位置重複，請修正後再儲存：
${u.join(`
`)}`);return}const g=((s=t.querySelector(".score-sheet-form"))==null?void 0:s.dataset.linkedSheetId)||"",f={id:g||(typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`ss_${Date.now()}`),gameInfo:c,inningRecords:p,battingRecords:v,pitchingRecords:b,createdAt:new Date().toISOString()};Array.isArray(l.scoreSheets)||(l.scoreSheets=[]);const w=g?l.scoreSheets.findIndex(u=>u&&u.id===g):-1;w!==-1?(Jt(l.scoreSheets[w],l),f.createdAt=l.scoreSheets[w].createdAt||f.createdAt,l.scoreSheets[w]=f):l.scoreSheets.push(f),V(l),alert("比賽紀錄已儲存！"),Je(f,l),V(l)}catch(l){console.error("儲存比賽紀錄失敗：",l),alert("儲存比賽紀錄失敗，請稍後再試")}}function Jt(t,n){Array.isArray(n.players)&&((t.battingRecords||[]).forEach(e=>{if(!e.playerId)return;const i=n.players.find(a=>String(a.id)===String(e.playerId));!i||!i.stats||(i.stats.atBats=Math.max(0,(i.stats.atBats||0)-(e.atBats||0)),i.stats.hits=Math.max(0,(i.stats.hits||0)-(e.hits||0)),i.stats.rbi=Math.max(0,(i.stats.rbi||0)-(e.rbi||0)),i.stats.runs=Math.max(0,(i.stats.runs||0)-(e.runs||0)),i.stats.walks=Math.max(0,(i.stats.walks||0)-(e.walks||0)),i.stats.strikeouts=Math.max(0,(i.stats.strikeouts||0)-(e.strikeouts||0)),i.stats.stolenBases=Math.max(0,(i.stats.stolenBases||0)-(e.stolenBases||0)),i.stats.battingAverage=i.stats.atBats>0?(i.stats.hits/i.stats.atBats).toFixed(3):".000")}),(t.pitchingRecords||[]).forEach(e=>{if(!e.playerId)return;const i=n.players.find(a=>String(a.id)===String(e.playerId));!i||!i.pitchingStats||(i.pitchingStats.innings=Math.max(0,(i.pitchingStats.innings||0)-(e.innings||0)),i.pitchingStats.pitches=Math.max(0,(i.pitchingStats.pitches||0)-(e.pitches||0)),i.pitchingStats.hitsAllowed=Math.max(0,(i.pitchingStats.hitsAllowed||0)-(e.hitsAllowed||0)),i.pitchingStats.runsAllowed=Math.max(0,(i.pitchingStats.runsAllowed||0)-(e.runsAllowed||0)),i.pitchingStats.earnedRuns=Math.max(0,(i.pitchingStats.earnedRuns||0)-(e.earnedRuns||0)),i.pitchingStats.walks=Math.max(0,(i.pitchingStats.walks||0)-(e.walks||0)),i.pitchingStats.strikeouts=Math.max(0,(i.pitchingStats.strikeouts||0)-(e.strikeouts||0)),i.pitchingStats.homeRuns=Math.max(0,(i.pitchingStats.homeRuns||0)-(e.homeRuns||0)),i.pitchingStats.era=i.pitchingStats.innings>0?(i.pitchingStats.earnedRuns/i.pitchingStats.innings*9).toFixed(2):"0.00")}))}function Je(t,n){Array.isArray(n.players)&&(t.battingRecords.forEach(e=>{if(!e.playerId)return;const i=n.players.find(a=>String(a.id)===String(e.playerId));i&&(i.stats||(i.stats={}),i.stats.atBats=(i.stats.atBats||0)+e.atBats,i.stats.hits=(i.stats.hits||0)+e.hits,i.stats.rbi=(i.stats.rbi||0)+e.rbi,i.stats.runs=(i.stats.runs||0)+e.runs,i.stats.walks=(i.stats.walks||0)+e.walks,i.stats.strikeouts=(i.stats.strikeouts||0)+e.strikeouts,i.stats.stolenBases=(i.stats.stolenBases||0)+e.stolenBases,i.stats.atBats>0&&(i.stats.battingAverage=(i.stats.hits/i.stats.atBats).toFixed(3)))}),t.pitchingRecords.forEach(e=>{if(!e.playerId)return;const i=n.players.find(a=>String(a.id)===String(e.playerId));i&&(i.pitchingStats||(i.pitchingStats={}),i.pitchingStats.innings=(i.pitchingStats.innings||0)+e.innings,i.pitchingStats.pitches=(i.pitchingStats.pitches||0)+e.pitches,i.pitchingStats.hitsAllowed=(i.pitchingStats.hitsAllowed||0)+e.hitsAllowed,i.pitchingStats.runsAllowed=(i.pitchingStats.runsAllowed||0)+e.runsAllowed,i.pitchingStats.earnedRuns=(i.pitchingStats.earnedRuns||0)+e.earnedRuns,i.pitchingStats.walks=(i.pitchingStats.walks||0)+e.walks,i.pitchingStats.strikeouts=(i.pitchingStats.strikeouts||0)+e.strikeouts,i.pitchingStats.homeRuns=(i.pitchingStats.homeRuns||0)+e.homeRuns,i.pitchingStats.innings>0&&(i.pitchingStats.era=(i.pitchingStats.earnedRuns/i.pitchingStats.innings*9).toFixed(2)))}))}function Ot(t){const n=j(),e=Array.isArray(n.players)?n.players:[],i=Array.isArray(n.scoreSheets)?n.scoreSheets:[];t.innerHTML=`
    <section class="record-query-page">
      <div class="record-query-header">
        <div>
          <h2>📖 比賽紀錄查詢</h2>
          <p>查詢歷史比賽結果，以及球員累積的打擊與投手數據</p>
        </div>
      </div>

      <div class="record-query-tabs">
        <button type="button" class="record-query-tab active" data-tab="games">⚾ 比賽紀錄</button>
        <button type="button" class="record-query-tab" data-tab="players">🧢 球員紀錄</button>
      </div>

      <div id="recordQueryGames" class="record-query-panel active"></div>
      <div id="recordQueryPlayers" class="record-query-panel"></div>
    </section>
  `,Qe(t.querySelector("#recordQueryGames"),i,e),Ye(t.querySelector("#recordQueryPlayers"),e,i),t.querySelectorAll(".record-query-tab").forEach(a=>{a.addEventListener("click",()=>{t.querySelectorAll(".record-query-tab").forEach(o=>o.classList.remove("active")),t.querySelectorAll(".record-query-panel").forEach(o=>o.classList.remove("active")),a.classList.add("active");const d=a.dataset.tab==="games"?"#recordQueryGames":"#recordQueryPlayers";t.querySelector(d).classList.add("active")})})}function D(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ke(t){const n=Array.isArray(t.inningRecords)?t.inningRecords:[],e=Array.isArray(n[0])?n[0]:[],i=Array.isArray(n[1])?n[1]:[],a=s=>s.slice(0,9).reduce((l,c)=>l+(Number(c)||0),0),d=Number(e[9])||a(e),o=Number(i[9])||a(i);return{away:d,home:o}}function Qe(t,n,e){if(!t)return;if(n.length===0){t.innerHTML='<div class="record-query-empty">目前還沒有任何比賽紀錄，先到「比賽紀錄」建立第一場吧。</div>';return}const i=[...n].sort((a,d)=>{var l,c;const o=((l=a==null?void 0:a.gameInfo)==null?void 0:l.gameDate)||(a==null?void 0:a.createdAt)||"";return(((c=d==null?void 0:d.gameInfo)==null?void 0:c.gameDate)||(d==null?void 0:d.createdAt)||"").localeCompare(o)});t.innerHTML=`
    <div class="record-query-game-list">
      ${i.map((a,d)=>{const o=a.gameInfo||{},s=Array.isArray(a.battingRecords)&&a.battingRecords.length>0,l=o.homeAway!=="away",{away:c,home:r}=Ke(a),p=l?r:c,m=l?c:r,v=Array.isArray(a.inningRecords)&&a.inningRecords.length>0,h=v?p>m?"勝":p<m?"敗":"平":"";return`
          <div class="record-query-game-item">
            <div class="record-query-game-summary">
              ${h?`<span class="record-query-result ${h==="勝"?"win":h==="敗"?"loss":h==="平"?"tie":""}">${h}</span>`:'<span class="record-query-result"></span>'}
              <div class="record-query-game-info">
                <strong>vs. ${D(o.opponent||"未指定對手")}</strong>
                <span>${D(o.gameDate||"")}・${l?"主場":"客場"}</span>
              </div>
              <div class="record-query-game-score">${v?`${p} : ${m}`:"—"}</div>
              ${s?"":'<span class="score-sheet-draft-badge">尚未填寫詳細數據</span>'}
              <button type="button" class="btn-secondary record-query-toggle-btn" data-index="${d}">詳細數據</button>
            </div>
            <div class="record-query-game-detail" id="recordQueryDetail${d}" hidden>
              ${Ve(a,e)}
            </div>
          </div>
        `}).join("")}
    </div>
  `,t.querySelectorAll(".record-query-toggle-btn").forEach(a=>{a.addEventListener("click",()=>{const d=document.getElementById(`recordQueryDetail${a.dataset.index}`);d&&(d.hidden=!d.hidden,a.textContent=d.hidden?"詳細數據":"收合")})})}function Ve(t,n){const e=s=>n.find(l=>String(l.id)===String(s)),i=Array.isArray(t.battingRecords)?t.battingRecords:[],a=Array.isArray(t.pitchingRecords)?t.pitchingRecords:[],d=i.map(s=>{const l=e(s.playerId),c=s.atBats>0?(s.hits/s.atBats).toFixed(3):".000";return`
      <tr>
        <td>${D((l==null?void 0:l.name)||"未知球員")}</td>
        <td>#${D((l==null?void 0:l.number)||"")}</td>
        <td>${s.atBats||0}</td>
        <td>${s.hits||0}</td>
        <td>${s.rbi||0}</td>
        <td>${s.runs||0}</td>
        <td>${s.walks||0}</td>
        <td>${s.strikeouts||0}</td>
        <td>${c}</td>
      </tr>
    `}).join(""),o=a.map(s=>{const l=e(s.playerId),c=s.innings>0?(s.earnedRuns/s.innings*9).toFixed(2):"0.00";return`
      <tr>
        <td>${D((l==null?void 0:l.name)||"未知球員")}</td>
        <td>#${D((l==null?void 0:l.number)||"")}</td>
        <td>${s.innings||0}</td>
        <td>${s.hitsAllowed||0}</td>
        <td>${s.runsAllowed||0}</td>
        <td>${s.earnedRuns||0}</td>
        <td>${s.walks||0}</td>
        <td>${s.strikeouts||0}</td>
        <td>${c}</td>
      </tr>
    `}).join("");return`
    ${d?`
      <table class="record-query-table">
        <thead><tr><th>球員</th><th>背號</th><th>打數</th><th>安打</th><th>打點</th><th>得分</th><th>保送</th><th>三振</th><th>打擊率</th></tr></thead>
        <tbody>${d}</tbody>
      </table>
    `:'<p class="record-query-empty-inline">尚無打擊數據</p>'}
    ${o?`
      <table class="record-query-table">
        <thead><tr><th>投手</th><th>背號</th><th>局數</th><th>被安打</th><th>失分</th><th>自責分</th><th>保送</th><th>三振</th><th>防禦率</th></tr></thead>
        <tbody>${o}</tbody>
      </table>
    `:'<p class="record-query-empty-inline">尚無投手數據</p>'}
  `}function Ye(t,n,e){if(!t)return;t.innerHTML=`
    <div class="record-query-search">
      <input type="text" id="playerRecordSearch" placeholder="搜尋姓名或背號">
    </div>
    <div id="playerRecordTables"></div>
  `;const i=new Map;e.forEach(o=>{(Array.isArray(o.battingRecords)?o.battingRecords:[]).forEach(s=>{s.playerId&&i.set(s.playerId,(i.get(s.playerId)||0)+1)})});const a=t.querySelector("#playerRecordTables"),d=(o="")=>{const s=o.trim().toLowerCase(),l=n.filter(v=>s?String(v.name||"").toLowerCase().includes(s)||String(v.number||"").includes(s):!0),c=l.filter(v=>v.stats&&v.stats.atBats>0),r=l.filter(v=>v.pitchingStats&&v.pitchingStats.innings>0),p=c.length===0?'<p class="record-query-empty-inline">尚無符合的打擊紀錄</p>':`
        <table class="record-query-table">
          <thead>
            <tr><th>背號</th><th>姓名</th><th>出賽</th><th>打數</th><th>安打</th><th>打點</th><th>得分</th><th>保送</th><th>三振</th><th>盜壘</th><th>打擊率</th></tr>
          </thead>
          <tbody>
            ${c.map(v=>{const h=v.stats||{},b=h.battingAverage||(h.atBats>0?(h.hits/h.atBats).toFixed(3):".000");return`
                <tr>
                  <td>#${D(v.number||"")}</td>
                  <td>${D(v.name||"")}</td>
                  <td>${i.get(v.id)||0}</td>
                  <td>${h.atBats||0}</td>
                  <td>${h.hits||0}</td>
                  <td>${h.rbi||0}</td>
                  <td>${h.runs||0}</td>
                  <td>${h.walks||0}</td>
                  <td>${h.strikeouts||0}</td>
                  <td>${h.stolenBases||0}</td>
                  <td>${b}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      `,m=r.length===0?'<p class="record-query-empty-inline">尚無符合的投手紀錄</p>':`
        <table class="record-query-table">
          <thead>
            <tr><th>背號</th><th>姓名</th><th>局數</th><th>被安打</th><th>失分</th><th>自責分</th><th>保送</th><th>三振</th><th>防禦率</th></tr>
          </thead>
          <tbody>
            ${r.map(v=>{const h=v.pitchingStats||{},b=h.era||(h.innings>0?(h.earnedRuns/h.innings*9).toFixed(2):"0.00");return`
                <tr>
                  <td>#${D(v.number||"")}</td>
                  <td>${D(v.name||"")}</td>
                  <td>${h.innings||0}</td>
                  <td>${h.hitsAllowed||0}</td>
                  <td>${h.runsAllowed||0}</td>
                  <td>${h.earnedRuns||0}</td>
                  <td>${h.walks||0}</td>
                  <td>${h.strikeouts||0}</td>
                  <td>${b}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      `;a.innerHTML=`
      <h3>打擊紀錄</h3>
      ${p}
      <h3>投手紀錄</h3>
      ${m}
    `};d(),t.querySelector("#playerRecordSearch").addEventListener("input",o=>{d(o.target.value)})}const Kt="baseball-team-manager-pro",Qt=1,kt="btm_game_events";function Xe(){try{const t=JSON.parse(localStorage.getItem(kt)||"[]");return Array.isArray(t)?t:[]}catch{return[]}}function ot(t,n){if(!Array.isArray(t))throw new Error(`備份檔中的 ${n} 格式不正確。`);return t}function Ze(){const t=j();return{format:Kt,backupVersion:Qt,appVersion:At.version,exportedAt:new Date().toISOString(),data:{players:Array.isArray(t.players)?t.players:[],lineups:Array.isArray(t.lineups)?t.lineups:[],games:Array.isArray(t.games)?t.games:[],scoreSheets:Array.isArray(t.scoreSheets)?t.scoreSheets:[],gameEvents:Xe()}}}function tn(){const t=Ze(),n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),e=URL.createObjectURL(n),i=document.createElement("a"),a=new Date().toISOString().slice(0,10);return i.href=e,i.download=`baseball-team-backup-${a}.json`,document.body.append(i),i.click(),i.remove(),URL.revokeObjectURL(e),t}function jt(t){let n;try{n=JSON.parse(t)}catch{throw new Error("無法讀取此檔案，請選擇有效的 JSON 備份檔。")}if(!n||n.format!==Kt||n.backupVersion!==Qt||!n.data||typeof n.data!="object")throw new Error("這不是 Baseball Team Manager Pro 的有效備份檔。");const e={players:ot(n.data.players,"球員名單"),lineups:ot(n.data.lineups,"先發名單"),games:ot(n.data.games,"比賽資料"),scoreSheets:ot(n.data.scoreSheets??[],"比賽紀錄")},i=ot(n.data.gameEvents??[],"比賽事件");return V(e),localStorage.setItem(kt,JSON.stringify(i)),{players:e.players.length,lineups:e.lineups.length,games:e.games.length,scoreSheets:e.scoreSheets.length}}function en(){V({players:[],lineups:[],games:[],scoreSheets:[]}),localStorage.setItem(kt,JSON.stringify([]))}function lt(t,n,e){const i=t.querySelector(".backup-message");i.className=`backup-message ${n}`,i.textContent=e}function nn(t){t.innerHTML=`
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
  `;const n=t.querySelector("#exportBackupBtn"),e=t.querySelector("#importBackupBtn"),i=t.querySelector("#backupFileInput");n.addEventListener("click",()=>{const d=tn();lt(t,"success",`備份已下載（${d.data.players.length} 位球員、${d.data.lineups.length} 份先發）。`)}),e.addEventListener("click",()=>i.click()),t.querySelector("#clearAllDataBtn").addEventListener("click",()=>{!window.confirm(`確定要清除這台裝置上「所有」球員、先發名單、比賽紀錄嗎？

強烈建議先按「匯出備份」保留一份，這個動作無法復原。`)||!window.confirm("再次確認：真的要清空所有資料嗎？")||(en(),lt(t,"success","所有資料已清除，正在重新載入畫面。"),window.setTimeout(()=>window.location.reload(),650))}),i.addEventListener("change",async()=>{const[d]=i.files;if(d)try{const o=jt(await d.text());if(!window.confirm(`已讀取備份：${o.players} 位球員、${o.lineups} 份先發、${o.games} 場比賽。

匯入會取代目前資料，確定繼續嗎？`)){lt(t,"warning","已取消匯入，現有資料沒有變更。");return}jt(await d.text()),lt(t,"success","資料已匯入，正在重新載入畫面。"),window.setTimeout(()=>window.location.reload(),650)}catch(o){lt(t,"error",o.message||"匯入失敗，請確認備份檔內容。")}finally{i.value=""}})}function Vt(t){t.innerHTML=`
    <section class="dashboard dashboard-new">
      <header class="dashboard-hero">
        <div class="hero-content">
          <h1>⚾ Baseball Team Manager Pro</h1>
          <p class="lead">管理你的球隊：球員資料、先發名單與比賽日運作，一處完成。</p>
        </div>
        <div class="hero-actions">
          <button id="aiSuggestBtn" class="btn-primary">AI 建議先發</button>
        </div>
      </header>

      <section class="dashboard-cards">
        <div class="card" id="card-players">
          <h3>球員管理</h3>
          <p>新增、編輯與維護球員資料與守備評分。</p>
          <button id="playersBtn" class="card-btn">前往</button>
        </div>

        <div class="card" id="card-lineup">
          <h3>先發 Order</h3>
          <p>建立今日 9 人先發與儲存多套先發方案。</p>
          <button id="lineupBtn" class="card-btn">前往</button>
        </div>

        <div class="card" id="card-game">
          <h3>🔍 比賽紀錄查詢</h3>
          <p>查詢已存檔的比賽紀錄，或查詢單一球員的累計打擊／投手數據。</p>
          <button id="gameBtn" class="card-btn">前往</button>
        </div>

        <div class="card" id="card-scoreSheet">
          <h3>比賽紀錄</h3>
          <p>建立完整的比賽紀錄，包含打擊、投手和局數統計。</p>
          <button id="scoreSheetBtn" class="card-btn">前往</button>
        </div>
      </section>

      <section id="dashboard-content" class="dashboard-content">
        <!-- AI 建議結果會顯示於此 -->
      </section>
    </section>
  `;const n=l=>{document.querySelectorAll(".nav-link").forEach(c=>{c.classList.toggle("active",c.dataset.page===l)})},e=t.querySelector("#playersBtn");e&&(e.onclick=()=>{n("players"),Nt(t)});const i=t.querySelector("#lineupBtn");i&&(i.onclick=()=>{n("lineup"),vt(t)});const a=t.querySelector("#gameBtn");a&&(a.onclick=()=>{n("game"),Ot(t)});const d=t.querySelector("#scoreSheetBtn");d&&(d.onclick=()=>{n("scoreSheet");try{$t(t)}catch(l){console.error("Error rendering score sheet page:",l),t.innerHTML='<div class="error-message">比賽紀錄頁面載入失敗</div>'}}),document.querySelectorAll(".nav-link:not([disabled])").forEach(l=>{l.addEventListener("click",()=>{const{page:c}=l.dataset;if(n(c),c==="dashboard"&&Vt(t),c==="players"&&Nt(t),c==="lineup"&&vt(t),c==="game"&&Ot(t),c==="scoreSheet")try{$t(t)}catch(r){console.error("Error rendering score sheet page:",r),t.innerHTML='<div class="error-message">比賽紀錄頁面載入失敗</div>'}c==="backup"&&(t.innerHTML='<div id="backup-panel" class="backup-page"></div>',nn(t.querySelector("#backup-panel")))})});const o=t.querySelector("#aiSuggestBtn"),s=t.querySelector("#dashboard-content");o&&s&&o.addEventListener("click",()=>{const l=U(),c=_t(l);if(!Array.isArray(c)||c.length===0){s.innerHTML='<div class="ai-suggestion">無可用建議（請確認已有足夠可用球員）</div>';return}const r=new Map;l.forEach(v=>{const h=v.id||v.playerId;h&&r.set(String(h),v)});const p=`
        <div class="ai-suggestion">
          <h3>AI 建議先發</h3>
          <ol>
            ${c.map((v,h)=>{const b=r.get(String(v.playerId)),E=(b==null?void 0:b.name)||(b==null?void 0:b.playerName)||(b==null?void 0:b.number)||"未知",g=(b==null?void 0:b.number)||(b==null?void 0:b.jerseyNumber)||"",f=v.position||"";return`
                <li>
                  <strong>#${g} ${E}</strong>
                  <div class="small">守備位置：${f}</div>
                </li>
              `}).join("")}
          </ol>
          <div class="ai-actions">
            <button id="openLineupFromAI" class="card-btn">在先發頁查看</button>
          </div>
        </div>
      `;s.innerHTML=p;const m=t.querySelector("#openLineupFromAI");m&&(m.onclick=()=>{n("lineup"),vt(t)})})}function wt(){ee();const t=document.querySelector("#app");t&&(t.innerHTML=`
    <div class="app-layout">
      <header id="header"></header>
      <aside id="sidebar"></aside>
      <main id="dashboard" class="content" tabindex="-1"></main>
    </div>
  `,Yt(document.querySelector("#header")),Xt(document.querySelector("#sidebar")),Vt(document.querySelector("#dashboard")))}window.addEventListener("DOMContentLoaded",wt);document.readyState==="loading"?window.addEventListener("DOMContentLoaded",wt,{once:!0}):wt();

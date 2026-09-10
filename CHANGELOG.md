## Beta 2.12.13 Rev C｜2026-09-10｜完整稽核版
- 所有加入行程入口跨頁統一為 `＋ Day X`：一般景點、線上搜尋、搜尋預覽、景點詳情、機場、換錢／T-money／WOWPASS。
- 搜尋後新增明確「清除搜尋・回景點」，完整清除文字、結果、paging 與地圖搜尋 pins。
- 修正手機 Day X 舊 CSS 可能只顯示「＋」及搜尋框加入清除 X 後的欄位排版。
- 修正換錢／T-money／WOWPASS 的「搜尋我附近」按鈕原本未綁定事件；現在會定位並重新查詢。
- 手機「更多」新增「資料備份／還原」，並修正教學／分享頁備份路徑文字。
- reset-pwa 改為只解除 busan-travel-map scope 的 Service Worker，避免影響同網域其他 GitHub Pages 專案。
- PWA 安裝 prompt 使用 canonical 保存變數；補 Leaflet 1.9.4 官方 CSS 與 JS SRI，強化 OSM fallback。
- 完整靜態／跨頁稽核 55 / 55 PASS。

## Beta 2.12.12｜2026-09-10｜Mobile Search / Detail UX
- 手機點選搜尋結果或既有景點後，第一層搜尋 Bottom Sheet 自動隱藏，避免遮住 Naver 導航、加入 Day 等詳情操作。
- 詳情關閉後恢復搜尋面板；搜尋結果區取消會遮住清單的 sticky 控制列。

## Beta 2.12.11｜2026-09-10｜Bottom Sheet Root Cause
- 將手機 Bottom Sheet／PWA 初始化移回主 async IIFE、並在 buildShell211() 完成後綁定，排除先前 DOM 尚未建立就綁事件的時序／scope 問題。

# Beta 2.12.9｜Launch Fix（2026-09-09）

- 修正手機「景點」第一層搜尋面板無法跟隨手指拖曳的根因。
- 根因：2.12.8 CSS 將面板高度設為 `height:46vh!important`，拖曳 JavaScript 卻只寫一般 inline `height`，因此 CSS 永遠覆蓋手勢計算出的高度；只有「展開」按鈕切 class 時才會改變高度。
- 面板高度改為單一 CSS variable `--spots-sheet-h` 管理，拖曳、吸附、展開按鈕全部走同一套高度來源，不再互相覆蓋。
- Samsung / Android Chrome 優先使用 Touch Events；拖曳事件以 document capture 追蹤，即使手指離開把手區仍會持續。
- 把手加高到 50px，並保留「展開／縮小」作為可靠備援。
- 吸附三段：27%（看地圖）、46%（一般）、78%（看清單）。
- 搜尋結果、既有景點、照片、20→40→60、收藏／加入 Day、地圖預覽與 2.12.8 穩定地圖架構均保留。
- PWA 維持 non-caching navigation 策略，避免明日上線前再次被舊首頁快取卡住。

## Beta 2.12.12｜2026-09-10｜Launch Candidate
- 重新審視 2.12.2～2.12.9 手機 Bottom Sheet 事件路徑；修正「有 touch capability 就只綁 Touch Events」的脆弱判斷。
- 改成 Pointer Events 主路徑 + Touch fallback，兩者同時支援並去重。
- Bottom Sheet 拖曳事件改用 document capture 委派；DOM mount / viewport resize 後不需重新綁定。
- 拖曳高度以 CSS variable + inline `height: ... !important` 同步，排除既有 mobile CSS 權重衝突。
- 新增「看地圖」按鈕；手勢失敗時仍可一鍵縮成 27% 地圖模式，並保留 46% / 78% 三段吸附。
- Service Worker 恢復 navigation fetch handler 以滿足 Chromium PWA installability，同時對 navigation 強制 `cache: no-store`，不快取 index.html。
- PWA 安裝按鈕等待 Service Worker ready 後再次檢查 beforeinstallprompt；無原生提示時顯示 Chrome / 內建瀏覽器正確操作方式。


## Beta 2.12.12｜2026-09-10
- 手機點選搜尋結果或既有景點後，第一層搜尋 Bottom Sheet 自動隱藏，避免遮住 Naver 導航、加入 Day 等詳情操作。
- 詳情關閉後可回到原搜尋高度；新增「← 回搜尋結果」浮動入口。
- 線上搜尋結果模式隱藏重複的篩選列／加入模式列，釋放清單高度。
- 手機搜尋結果分頁按鈕取消 sticky 覆蓋，清單固定從第一筆開始顯示。
- 搜尋結果底部控制列精簡，避免大量結果時遮住店家卡片。

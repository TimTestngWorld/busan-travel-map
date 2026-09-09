# Beta 2.12.12｜Launch Root-Cause Fix（2026-09-10）

- 找到 2.12.2～2.12.10 手機搜尋面板一直修不好的真正根因：主程式在 `async IIFE` 內，但後續拖曳／PWA 修補碼被附加在 IIFE 外。主程式前段 `await` 時，外部修補碼已先執行，當時 `spotsMobile211` 尚未建立；而且 IIFE 內的 `map`、`showSpotsMobile211` 等也不在 `window`，所以修補碼實際沒有綁到正式面板。
- 2.12.12 將手機 Bottom Sheet 與安裝 App 初始化移回主 async IIFE 內，並在 `buildShell211()` 完成後直接綁定。
- 直接對既有 handle/head 綁 Pointer + Touch fallback；高度使用 inline `!important` + CSS variable；加入「看地圖／展開」備援按鈕。
- PWA navigation 維持 network/no-store，不 cache `index.html`。

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

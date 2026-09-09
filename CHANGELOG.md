# Beta 2.12.9｜Launch Fix（2026-09-09）

- 修正手機「景點」第一層搜尋面板無法跟隨手指拖曳的根因。
- 根因：2.12.8 CSS 將面板高度設為 `height:46vh!important`，拖曳 JavaScript 卻只寫一般 inline `height`，因此 CSS 永遠覆蓋手勢計算出的高度；只有「展開」按鈕切 class 時才會改變高度。
- 面板高度改為單一 CSS variable `--spots-sheet-h` 管理，拖曳、吸附、展開按鈕全部走同一套高度來源，不再互相覆蓋。
- Samsung / Android Chrome 優先使用 Touch Events；拖曳事件以 document capture 追蹤，即使手指離開把手區仍會持續。
- 把手加高到 50px，並保留「展開／縮小」作為可靠備援。
- 吸附三段：27%（看地圖）、46%（一般）、78%（看清單）。
- 搜尋結果、既有景點、照片、20→40→60、收藏／加入 Day、地圖預覽與 2.12.8 穩定地圖架構均保留。
- PWA 維持 non-caching navigation 策略，避免明日上線前再次被舊首頁快取卡住。

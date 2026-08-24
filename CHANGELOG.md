# 旅遊地圖｜歷代版本更新紀錄

> 這份檔案可直接放在 GitHub 專案根目錄。後續每個 Beta 版本都往最上方追加。

## Beta 2.9 — App Dashboard・Smart Labels（2026-08-24）

**定位：把「地圖工具」往真正旅行 App 的操作方式推進。**

- 新增首頁 Dashboard，使用者先選要做的事，不再直接進入 81 點滿版地圖。
- Dashboard 提供：我的行程、景點地圖、找景點、我的景點；分帳與分享先顯示 Beta 2.10 預告。
- Dashboard 顯示景點總數、已排行程、想去、已去摘要。
- 景點標籤新增 `自動／全部／關閉` 三種模式；預設自動。
- 自動模式依縮放層級逐步顯示標籤，縮小時只留圖釘，降低畫面雜訊。
- 點選中的景點保留高亮與名稱。
- 景點詳情、結果清單、Day 行程、編輯表單、按鈕等文字全面放大。
- 頂端工具列精簡，次要工具移至 Dashboard／更多。
- 使用教學不再每次首次載入時自動蓋住畫面，改為需要時開啟。
- 完整保留 Beta 2.8 的 Local First、IndexedDB、自訂景點與 Google Places / Supabase Proxy。

## Beta 2.8 — 公版核心・Local First（2026-08-22）

**定位：把釜山單一版本拆成可延伸其他城市的資料架構，並把個人資料留在本機。**

- 景點主資料從 `index.html` 拆到 `data/poi-data.json`。
- 城市、地圖中心、區域、顏色、View、Day 數量等搬到 `data/city.json`。
- 81 個釜山景點完整保留。
- 個人 Day、想去／已去、行程備註等改為 IndexedDB 優先保存，並保留 localStorage 相容鏡像。
- 可自動讀取舊版 localStorage 旅程資料。
- 新增「我的景點」：使用者可在前台新增／修改／刪除只存在本機的景點。
- 自訂景點可加入 Day、設定狀態、使用 Google Places 實景照片。
- 保留 JSON 備份／匯入作為技術備援。

## Beta 2.7 — Supabase Places Proxy（2026-08-21）

**定位：把 Google API Key 從瀏覽器移到後端。**

- 移除前端手動貼 Google API Key 的方式。
- 新增 Supabase Edge Function `place-photos`。
- Google Places API Key 改放 Supabase Secret `GOOGLE_MAPS_API_KEY`。
- GitHub Pages 前端只保存 Supabase Project URL / Publishable Key。
- Google Places 改走 Supabase Proxy 取得地點與實景照片。
- 保留 Place ID 快取，避免每次重新做 Text Search。
- 實景照片補上 Google / 作者 attribution 與來源地點連結。

## Beta 2.6 — Google Places 實景照片

**定位：第一次把 Google Places 店景／料理實景照片接進景點卡。**

- 景點卡加入 Google Places 實景照片。
- 可取得餐廳／咖啡廳／景點的店景與料理照片。
- 當時 Google API Key 仍由瀏覽器端設定，因此後續 Beta 2.7 改成 Supabase Secret 架構。

## Beta 2.5 — 81 景點地圖基準版

**定位：後續版本的主要地圖與旅遊功能基礎。**

- 建立釜山 81 景點地圖與 1～8 區域 View。
- 景點標籤、分類與區域配色。
- 景點搜尋及類別／狀態／Day／距離等交叉篩選。
- 我的行程、旅行狀態、地圖定位與景點資訊卡。
- 金海機場攻略、換錢所、旅行模式等旅行工具。
- 地圖 PNG 匯出與基本備份／匯入流程。

---

## 接下來

- **Beta 2.10**：分帳＋匯率＋Day 行程 PNG＋旅行分享碼＋手機 Share Sheet。
- **Beta 2.11**：Travel Map Manager，讓 NAVER HAR／Excel／CSV 更新景點與 GitHub 部署包自動化。
- **Beta 3.0**：PWA，加入主畫面、App icon、全螢幕與離線 App shell。

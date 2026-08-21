# Beta 2.8 旅遊地圖｜公版核心・Local First

這版以 2026/08/21 已部署成功的 Beta 2.7 為基準，保留原 Supabase Places Proxy 與 `app-config.js` 既有設定。

## 這版完成

- 景點主資料從 `index.html` 拆出到 `data/poi-data.json`。
- 城市/區域/地圖中心/機場/Day 數量從 `data/city.json` 控制。
- 原本 81 個釜山景點完整保留。
- 個人 Day、狀態、行程備註改成 **IndexedDB 優先**，並保留 localStorage 相容鏡像。
- 首次開啟會自動讀取 Beta 2.7 的 `busan80_trip_state_v2`，搬到 Beta 2.8 Local First 儲存。
- 「更多 → ➕ 我的景點」可在前台新增/修改/刪除本機景點。
- 自訂景點可直接排 Day、標記想去/已去、使用 Google Places 實景照片（若 Google 能找到）。
- 備份 JSON 仍保留，但現在會包含 `customPlaces`。Beta 2.9 才新增真正給一般人用的分享碼與 Day 行程圖。

## GitHub 部署

請把本資料夾內容放在 GitHub Pages repository 根目錄：

```text
index.html
app-config.js
data/
  city.json
  poi-data.json
supabase/
QA.json
```

`app-config.js` 已沿用你目前部署版的 Supabase Project URL / Publishable Key。
Google API Key 仍只存在 Supabase Secret，不在此 ZIP。

## 公版怎麼換城市

Beta 2.8 已先把核心資料抽離，但機場攻略、換錢所等「釜山專屬工具頁」仍留在 `index.html`，預計後續版本再模組化。
如果只想換「地圖景點資料」，先改：

1. `data/city.json`：城市名稱、中心、區域、顏色、Views、機場。
2. `data/poi-data.json`：景點清單。

Beta 2.10 的 Travel Map Manager 會讓這兩個檔案由 GUI 自動產生，不需要手改 JSON。

## 注意

- 不要直接雙擊 `index.html` 測試，瀏覽器對 `file://` 讀 JSON 會有限制；請用 GitHub Pages 或本機 HTTP server。
- 自訂景點只存在目前瀏覽器/裝置；清除網站資料仍可能刪除，所以保留「備份旅程狀態」。
- Google Places 照片不做永久離線 cache。

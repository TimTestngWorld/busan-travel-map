# Roadmap｜Beta 2.8 → 3.0

## Beta 2.8（本版）
公版核心資料拆分 + Local First + 前台自訂景點。

## Beta 2.9
- Day 行程圖：真正輸出 PNG/JPEG 圖片，不是 Markdown。
- 預設 16:9 1920×1080，建議 35% 行程清單 + 65% 地圖。
- 地圖標記改成 ①②③… 對應行程順序。
- 旅行分享碼：複製文字、貼上匯入。
- Web Share API：手機可直接叫出 Share Sheet，交給 LINE / Messenger / AirDrop 等可用 App。

## Beta 2.10
Travel Map Manager（Python GUI / 最後可包成 EXE）：
- 新增/修改/刪除景點
- NAVER HAR / CSV / Excel 匯入
- Diff（新增/修改/相同/疑似重複）
- 產生 `city.json` + `poi-data.json`
- 產生 GitHub 部署包 ZIP
- 自動保存歷代版本

建議 Manager 目錄：
```text
Travel Map Manager/
├─ TravelMapManager.exe
├─ 工作資料/
├─ 匯入資料/
└─ 旅遊地圖歷代Beta版/
   ├─ Beta2_8_旅遊地圖_GitHub佈署版_20260822/
   ├─ Beta2_8_旅遊地圖_GitHub佈署版_20260822.zip
   └─ ...
```

若同一天重複輸出，建議自動加 `_R2`, `_R3`，避免覆蓋舊版。

## Beta 3.0
PWA：manifest、App icon、全螢幕、Service Worker、App shell/靜態資料離線；Google Places 照片維持連線即時載入。

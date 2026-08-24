# Roadmap｜Beta 2.9 → 3.0

## Beta 2.9（本版）
App 化 UI / UX：首頁儀表板、智慧標籤、字體放大、工具重新分類。

## Beta 2.10｜旅行工具與分享
- 旅行分帳：旅伴、付款人、參與者、平均／自訂分法。
- 匯率：旅行幣別 ↔ 本國幣別；可手動設定，離線可用；每筆交易保存當時匯率。
- 最終結算：計算誰應付誰，盡量降低轉帳次數。
- Day 行程圖：真正輸出 1920×1080 PNG；預設 35% 清單 + 65% 地圖；①②③ 對應順序。
- 旅行分享碼：一鍵複製、一鍵貼上匯入，可選合併或覆蓋。
- Web Share API：手機支援時直接叫出 Share Sheet，交給 LINE / Messenger / AirDrop 等 App。

## Beta 2.11｜Travel Map Manager
Python GUI（最後可包 EXE）：
- 新增／修改／刪除景點。
- NAVER HAR／CSV／Excel 匯入。
- Diff：新增／修改／相同／疑似重複。
- 產生 `city.json` + `poi-data.json`。
- 自動輸出 GitHub 部署資料夾與 ZIP。
- 自動保留版本到：

```text
Travel Map Manager/
└─ 旅遊地圖歷代Beta版/
   ├─ Beta2_11_釜山旅遊地圖_GitHub佈署版_YYYYMMDD/
   ├─ Beta2_11_釜山旅遊地圖_GitHub佈署版_YYYYMMDD.zip
   └─ 同日重複產出自動加 _R2 / _R3
```

## Beta 3.0｜PWA
- manifest / App icon。
- Android / iOS 加入主畫面。
- Standalone 全螢幕。
- Service Worker / App shell / 靜態景點資料離線。
- IndexedDB 行程與個人資料離線。
- Google Places 實景照片維持有網路時即時載入，不做永久照片快取。

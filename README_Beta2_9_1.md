# Beta 2.9.1｜介面修正版與 Naver 快速新增

## 本版重點

- 首頁四個統計區塊可直接點擊：全部景點、Day 行程、想去、已去。
- 「景點地圖」與「找景點」整合為「探索景點」。
- 首頁不再寫死景點數量，新增私人景點後會自動更新。
- 「我的景點」改成 Naver Map 連結優先：貼上 `naver.me` 或 `map.naver.com` 地點連結後，自動讀取名稱、地址與位置。
- 分類預設自動判斷；仍可手動選擇。
- 區域預設自動判斷；仍可手動選擇。
- 經緯度移到「定位進階設定」，不再要求一般使用者手動查座標。
- 移除首頁與新增景點畫面中的開發版本說明、未來版本提示等非使用者資訊。

## 部署注意

本版更新了 `supabase/functions/place-photos/index.ts`。GitHub 更新完成後，Supabase Edge Function `place-photos` 也要用本包的新 `index.ts` 重新 Deploy 一次，Naver Map 連結自動讀取才會生效。

現有的 `GOOGLE_MAPS_API_KEY` 與 `ALLOWED_ORIGIN` Secrets 不需要重建。

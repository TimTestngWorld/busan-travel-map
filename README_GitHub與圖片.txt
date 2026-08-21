釜山 81 景點旅行地圖 Beta 2.5｜GitHub / 圖片上傳說明

【這版首頁】
- 預設簡潔：桌機右側景點面板先收起。
- 主要按鈕：區域 / 我的位罝 / 金海機場 / 換錢所 / 我的行程 / 更多。
- 次要功能：旅行模式、HOT/OSM 底圖、顯示結果、匯出 PNG 收進「更多」。
- 第一次開啟會有 30 秒教學；之後可按地圖右下角 ? 再打開。
- 景點詳情除了按 X，也可以直接點地圖空白處關閉。

【換錢所】
- 「💱 換錢所」會嘗試用 Overpass API 讀取 OpenStreetMap 目前標記為 amenity=bureau_de_change 的釜山換錢所。
- 另附 2026 可查證的南浦、西面、釜山站、廣安、海雲台、金海機場等重點換錢所清單。
- OSM 不是商家完整名錄，因此 APP 明確不宣稱「百分之百所有店家」。
- 個別精選換錢所按「地圖定位」時才使用 Nominatim 依地址定位，避免一次大量查詢。

【GitHub Pages 要怎麼放景點圖片】
HTML 其實已經寫好圖片路徑。真正要做的是把圖片檔案也上傳到 Repository：

repo 根目錄/
  index.html
  photo_manifest.json
  images/
    35317398/
      01.webp
      02.webp
    2049577038/
      01.webp
      02.webp
    custom/
      G14/
        01.webp
        02.webp

- 有 NAVER Place ID 的景點：images/<sid>/01.webp、02.webp
- G14 黃老師民宿沒有 NAVER sid：images/custom/G14/01.webp、02.webp
- HTML 使用 loading="lazy"，只有點開景點才下載照片。
- GitHub Pages 不會自動解壓 ZIP；請先在電腦解壓，再把 index.html、photo_manifest.json、images/ 一起上傳到 repo。
- 目前這個 ZIP 只有圖片「資料夾規格」，還沒有替你重新發布 NAVER 使用者照片。

【照片來源的重要原則】
技術上可以把 WebP 放進上述資料夾，但第三方平台上的店家/使用者照片不代表可以任意抓下來重新公開發布。
正式做圖片包時，建議優先使用：
1. 你自己拍的照片；
2. 商家官方明確可使用的媒體素材；
3. 開放授權圖片；
4. 經授權的照片。
若只是想保留 NAVER 視覺參考，可以在景點卡保留 NAVER 查看按鈕，而不要直接複製其 UGC 照片到 GitHub。

【Supabase / PWA】
尚未串接。下一階段：
- Supabase Auth + 每位使用者自己的行程 / 狀態 / 備註同步
- 共享旅行
- PWA：加入主畫面、App icon、離線快取

# 歷代版本更新紀錄

## Beta 2.10.1｜實機回饋修正版

- 修正旅行分帳新增旅伴。
- 修正 Naver Map 短網址座標解析與 `0,0` 誤存。
- 我的景點資訊卡新增直接編輯按鈕。
- Day 行程圖改為真實 OSM 地圖圖層＋路線與順序標記。
- 分享旅行拆分傳送方／接收方。
- 換錢所新增完整地址與中文釜山行政區。
- 使用教學更新為完整手把手流程。
- 發版規則：後續每版都同步更新使用教學。

## Beta 2.10 — 旅行分帳・匯率・分享

- 新增旅行分帳：旅伴、消費、付款人、平均／自訂分帳、最終結算。
- 新增旅行幣別／本國幣別與手動匯率。
- 新增網路參考匯率更新，並保存每筆消費當下匯率。
- 新增 1920×1080 Day 行程 PNG（行程清單＋地圖＋編號順序）。
- 新增圖片 Share Sheet。
- 新增 `TRIPMAP1` 旅行分享碼、複製、系統分享、合併／覆蓋匯入。
- 分帳與分享資料延續 Local First，不新增登入需求。

## Beta 2.9.3｜Google Places 換錢所・介面動態效果（2026-08-24）
- 正式以 Beta 2.9.2 為基準延伸；先前測試中的 NAVER API HUB 方案不列入正式版本。
- 換錢所主資料來源改為既有的 Google Places API，不再需要申請 NAVER Cloud / NAVER API HUB。
- Google Places 會即時搜尋釜山換錢所，回傳名稱、地址、座標、類型與 Google 營業狀態；永久停業項目會排除。
- 換錢所資料採 6 小時本機快取以降低 API 呼叫；「立即更新」可強制重新讀取。
- Google Places 無法使用時，依序切換 OSM 備援、最近快取、內建備援清單。
- 每間換錢所保留「Naver 查看」，以名稱＋地址開啟 NAVER Map 搜尋，供韓國在地資訊與導航確認。
- 「我的景點」仍可貼 Naver Map 分享連結；後端會解析可取得的線索，再用 Google Places 配對名稱、地址、座標與分類，不要求使用者手填經緯度。
- 新增 Dashboard 色彩層次、卡片互動、主要 Modal 淡入／上浮動畫與手機 Bottom Sheet 滑入動畫。
- 動畫時間約 0.25～0.35 秒，並支援系統「減少動態效果」設定。

> 這份檔案可直接放在 GitHub 專案根目錄。後續每個版本都往最上方追加。

## Beta 2.9.2｜Dashboard 排版・參考 URL・換錢所即時同步（2026-08-24）
- Dashboard 重新排版：三個主要功能卡等寬對齊，移除重複的「探索景點」入口。
- 機場攻略、換錢所、目前位置、使用教學改為同一組整齊的快捷卡，不再獨立散落在最下方。
- 首頁切換到地圖加入約 0.35 秒淡出過場。
- 「我的景點」重新加入獨立的「參考 URL」欄位，可保存 Threads、Instagram、官方網站、部落格等來源；Naver Map 連結改為獨立欄位。
- 舊自訂景點若曾把 Naver URL 存在參考 URL，編輯時會自動辨識並移到 Naver Map 欄位。
- 換錢所開啟時自動向 OpenStreetMap / Overpass 重新同步目前登錄的換錢所，不再預設只讀 7 天快取。
- OSM 有提供時，同步顯示地址、營業時間、電話與網站資訊。
- 換錢所卡片本身可直接點擊；點選後會關閉清單與首頁，直接切回地圖並定位、開啟標記。
- 若 OSM 即時同步失敗，才改用最近快取；沒有快取時再顯示備援清單。

> 這份檔案可直接放在 GitHub 專案根目錄。後續每個版本都往最上方追加。

## Beta 2.9.1｜介面修正版・Naver 快速新增（2026-08-24）
- 首頁統計卡改為可直接開啟對應內容。
- 景點地圖與找景點整合為「探索景點」。
- 移除固定「81 個景點」文案，數量由目前資料動態計算。
- 我的景點支援貼上 Naver Map 地點連結自動讀取。
- 自動取得位置與地址，分類／區域預設自動判斷並保留手動選項。
- 經緯度移到進階設定，不再要求一般使用者手動填寫。
- 清除首頁與功能畫面中的開發備註與版本預告文字。

> 這份檔案可直接放在 GitHub 專案根目錄。後續每個版本都往最上方追加。

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

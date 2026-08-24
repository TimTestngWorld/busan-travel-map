# Beta 2.9.2｜Dashboard 排版・參考 URL・換錢所即時同步

## 這版修改什麼

### 1. 首頁重新排版
- 移除右上角第二個「探索景點」按鈕。
- 我的行程／探索景點／我的景點改成三張等寬主功能卡。
- 機場攻略／換錢所／目前位置／使用教學改成四張等寬快捷卡。
- Dashboard 離開時使用約 0.35 秒淡出動畫。

### 2. 我的景點補回參考 URL
- `Naver Map 連結`：只負責自動解析地點。
- `參考 URL`：可另外保存 Threads、Instagram、官方網站、部落格等來源。
- 一般使用者仍不需要手動填經緯度。

### 3. 換錢所改為開啟即同步
- 每次打開換錢所會先向 OpenStreetMap Overpass 讀取目前登錄的 `bureau_de_change`。
- 若 OSM 有資料，清單會顯示可取得的地址、營業時間、電話、網站。
- 點整張換錢所卡片或「地圖查看」會直接關閉清單並切回地圖定位。
- 若即時服務失敗，會退回最近快取；沒有快取才使用備援清單。

> OSM 是地圖資料來源，不代表能保證店家當下營業、現場匯率或所有換錢所都已登錄。

## 部署
1. 將本資料夾內容更新到 GitHub Pages Repository。
2. `app-config.js` 已沿用目前 GitHub 部署版設定。
3. Supabase `place-photos` Edge Function 本版沒有新增必要後端介面，不需要重新設定 Secret。
4. GitHub Pages 部署完成後建議使用 Ctrl + Shift + R 強制重新整理。

## 主要檔案
- `index.html`：App UI 與功能。
- `data/city.json`：城市、公版區域與版本設定。
- `data/poi-data.json`：公版景點資料。
- `app-config.js`：Supabase 前端公開設定。
- `CHANGELOG.md`：歷代版本紀錄。

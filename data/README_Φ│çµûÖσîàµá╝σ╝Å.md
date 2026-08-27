# Travel Map 資料包格式（Beta 2.8）

## `city.json`
控制城市層級資料：名稱、版本、地圖中心、Day 數量、機場、區域 Views、顏色與標籤配置。

## `poi-data.json`
每個景點至少需要：

- `id`: 穩定且不可隨意重排的景點 ID
- `display`: 使用者看到的名稱
- `name`: NAVER/原文名稱
- `category`
- `address`
- `lat`, `lon`
- `code`: 對應 `city.json.regions[].code`
- `region`
- `color`

可選：`memo`, `url`, `sid`, `previewImages`。

**重要：更新景點時優先保留既有 `id`，否則既有 Day 行程會失去對應。**

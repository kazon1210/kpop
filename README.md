# 猜女團成員測驗－Kpopping 圖片版

此版本會透過 Netlify Serverless Function 讀取 Kpopping 成員頁面的 `og:image`，
因此不需要自行下載或整理圖片。

## 為什麼需要 Netlify

一般瀏覽器受到 CORS 限制，不能直接讀取 Kpopping 頁面 HTML。
本專案使用：

`netlify/functions/kpopping-image.js`

由伺服器讀取成員頁面並取得主圖。

## 部署方式

### 最簡單：Netlify Drop / Git 部署

1. 登入 Netlify。
2. 建立新網站並連接 GitHub，或將整個資料夾拖曳部署。
3. Netlify 會自動讀取 `netlify.toml`。
4. 部署完成後即可取得公開網址。

注意：單純部署到 GitHub Pages 無法執行 Serverless Function，因此不能使用本版本的自動抓圖功能。

## 本機測試

安裝 Netlify CLI：

```bash
npm install -g netlify-cli
```

在專案資料夾執行：

```bash
netlify dev
```

再開啟終端機顯示的本機網址。

## 圖片與使用規範

- 圖片仍由 Kpopping 或原權利人持有。
- 網站保留每張圖片的 Kpopping 來源連結。
- 建議僅用於非商業、教育或朋友間遊戲。
- 若要公開或商業營運，應先確認 Kpopping 的使用條款及圖片授權。
- Kpopping 若調整頁面結構、阻擋自動請求或更換網址，部分圖片可能失效。

# ⚾ Baseball Team Manager Pro

## Coach Edition v1.0.0

Professional baseball team management PWA for coaches.

## Features

- ⚾ Player Management
- ⚾ Injury / Suspension Management
- ⚾ Smart Starting Order AI
- ⚾ Defensive Position Assignment
- ⚾ Game Day Management
- ⚾ Score Board
- ⚾ Pitch Count Management
- ⚾ Player Statistics
- ⚾ PWA Offline Support
- ⚾ GitHub Pages Deployment

## Technology

- HTML5
- CSS3
- JavaScript ES Modules
- LocalStorage
- Progressive Web App

## Version

v1.0.0 Coach Edition

## 部署與安裝（Android／Windows／Mac）

這個 App 是一個 PWA（Progressive Web App），已經內建圖示、manifest 和離線 Service Worker。要讓 Android 手機/平板、Windows 10/11、Mac 都能「安裝」成獨立 App，步驟如下：

1. **建置**：`npm install` → `npm run build`，產生 `dist/` 資料夾。
2. **部署到一個公開網址**（PWA 安裝與打包工具都需要一個實際的 https 網址才能運作）：
   - 最簡單：這個專案已經附帶 GitHub Actions（`.github/workflows/deploy-pages.yml`），只要 push 到 `main` 分支，GitHub Pages 就會自動建置＋部署。
   - 或者也可以把 `dist/` 資料夾丟到 Netlify、Vercel、Firebase Hosting 等免費靜態網站服務。
3. **在各平台「安裝」**：
   - **Android（Chrome）**：開啟網址 → 選單會出現「安裝應用程式」/「加到主畫面」。
   - **Windows 10/11（Edge 或 Chrome）**：網址列右側會出現「安裝」圖示，點下去就會變成開始功能表裡的獨立應用程式。
   - **Mac（Safari 17+ 或 Chrome）**：選單裡的「加入 Dock」/「安裝」，會變成一般 Mac App 一樣可以從 Dock 開啟。
4. **如果需要真正的安裝檔（.apk / .msix）**：可以把部署好的網址貼到 [PWABuilder](https://www.pwabuilder.com)（微軟提供的免費工具），它會自動打包出 Android APK/AAB、Windows MSIX 安裝檔可以直接下載安裝或上架商店。iOS 也可以透過 PWABuilder 產生 Xcode 專案，但需要一台 Mac 加上 Apple 開發者帳號才能編譯簽署。


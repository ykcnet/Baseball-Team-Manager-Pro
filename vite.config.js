import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // 💡 確保是相對路徑
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 💡 確保打包時不會因為某些 PWA 設定漏掉檔案
    emptyOutDir: true,
  }
})

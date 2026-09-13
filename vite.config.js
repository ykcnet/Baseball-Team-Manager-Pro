import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Baseball-Team-Manager-Pro/', // 💡 確保網頁版路徑正確
  build: {
    copyPublicDir: true // 🔥 確保public目錄文件（包括manifest.json）被複製到build輸出
  }
})

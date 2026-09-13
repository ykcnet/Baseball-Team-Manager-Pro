const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 💡 隱藏視窗最上方的內建選單列（File, Edit...），必須放在這個大括號裡面！
  win.setMenu(null)

  // 💡 讀取打包後的 index.html
  win.loadFile(path.join(__dirname, 'dist/index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

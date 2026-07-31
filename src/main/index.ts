import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { initDb } from './db'
import { registerIpc } from './ipc'

app.whenReady().then(() => {
  initDb()
  registerIpc()
  const win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true, nodeIntegration: false
    }
  })
  if (process.env['ELECTRON_RENDERER_URL']) win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  else win.loadFile(path.join(__dirname, '../renderer/index.html'))
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

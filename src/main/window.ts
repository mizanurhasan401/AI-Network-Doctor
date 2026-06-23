import { BrowserWindow, shell } from 'electron'
import { join } from 'node:path'

/**
 * Creates the single application window with Electron's recommended security
 * posture:
 *  - contextIsolation: true  → renderer JS cannot touch preload/Node internals
 *  - sandbox: true           → renderer runs in an OS sandbox
 *  - nodeIntegration: false  → no `require`/Node globals in the renderer
 * The renderer reaches main ONLY through the typed preload bridge.
 */
export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#0b0f1a',
    title: 'NetDoctor AI',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  window.once('ready-to-show', () => window.show())

  // Open external links in the OS browser, never in-app.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })

  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (devUrl) {
    void window.loadURL(devUrl)
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

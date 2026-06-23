import { app, BrowserWindow, session } from 'electron'
import { createContainer } from './container'
import { registerIpcHandlers } from './ipc/registerIpc'
import { createMainWindow } from './window'
import { logger } from './core/logger'

/**
 * Main-process entry point. Order matters: install global guards, harden the
 * session, wire IPC against the container, then open the window.
 */
function installGlobalErrorGuards(): void {
  process.on('uncaughtException', (err) => logger.error({ err }, 'uncaughtException'))
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'unhandledRejection'))
}

/** Restrict what the renderer may load — a strict CSP and no new-window nav. */
function hardenSession(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
        ]
      }
    })
  })

  // Block navigation away from the app's own content.
  app.on('web-contents-created', (_e, contents) => {
    contents.on('will-navigate', (event, url) => {
      const devUrl = process.env['ELECTRON_RENDERER_URL']
      if (devUrl && url.startsWith(devUrl)) return
      if (url.startsWith('file://')) return
      event.preventDefault()
    })
  })
}

async function bootstrap(): Promise<void> {
  installGlobalErrorGuards()
  await app.whenReady()

  hardenSession()

  const container = createContainer()
  registerIpcHandlers(container)

  createMainWindow()
  logger.info('NetDoctor AI started')

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

void bootstrap()

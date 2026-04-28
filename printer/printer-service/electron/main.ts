import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs'
import express, { Request, Response } from 'express'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Paths
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

  
let win: BrowserWindow | null = null
let configPath: string

// 🪟 Create Window
function createWindow(): void {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send(
      'main-process-message',
      new Date().toLocaleString()
    )
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Close behavior
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

// Reopen (Mac)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

/* ===========================
   🖨️ PRINTER HANDLERS
   =========================== */

// Get printers
ipcMain.handle('get-printers', async (): Promise<any[]> => {
  if (!win) return []

  try {
    const printers = await win.webContents.getPrintersAsync()
    console.log('Printers:', printers)
    return printers
  } catch (err) {
    console.error('Printer fetch error:', err)
    return []
  }
})

// Save printer
ipcMain.on('save-printer', (_event, printerName: string): void => {
  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ printer: printerName }, null, 2)
    )
    console.log('Printer saved:', printerName)
  } catch (err) {
    console.error('Error saving printer:', err)
  }
})

// Get saved printer
ipcMain.handle('get-saved-printer', (): string | null => {
  try {
    if (!fs.existsSync(configPath)) return null

    const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    return data.printer
  } catch (err) {
    console.error('Read error:', err)
    return null
  }
})

/* ===========================
   🚀 APP READY
   =========================== */

app.whenReady().then(() => {
  configPath = path.join(app.getPath('userData'), 'config.json')

  createWindow()

  /* ===========================
     🖨️ PRINT SERVER
     =========================== */

  const server = express()
  server.use(express.json())

  server.post('/print', async (req: Request, res: Response) => {
    try {
      if (!fs.existsSync(configPath)) {
        return res.status(400).send('Printer not configured')
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      const printerName: string = config.printer

      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          preload: path.join(__dirname, 'preload.mjs'),
        },
      })

      const html = `
        <html>
          <body style="font-family: monospace; text-align: center;">
            <h2>Hospital Token</h2>
            <h1>${req.body.token || "A-01"}</h1>
            <p>${req.body.department || "General"}</p>
            <p>${new Date().toLocaleString()}</p>
          </body>
        </html>
      `

      await printWindow.loadURL(
        'data:text/html;charset=utf-8,' + encodeURIComponent(html)
      )

      printWindow.webContents.on('did-finish-load', () => {
        printWindow.webContents.print(
          {
            silent: true,
            deviceName: printerName,
          },
          (success: boolean, errorType?: string) => {
            if (!success) {
              console.error('Print failed:', errorType)
              return res.status(500).send('Print failed')
            }

            printWindow.close()
            res.send({ status: 'Printed successfully' })
          }
        )
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error printing')
    }
  })

  server.listen(3001, () => {
    console.log('🖨️ Print server running at http://localhost:3001')
  })
})
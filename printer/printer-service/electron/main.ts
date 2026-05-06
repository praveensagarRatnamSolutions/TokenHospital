import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";
import os from "os";
import express, { Request, Response } from "express";
import cors from "cors";
import { Server } from "node:http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths
process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null = null;
let configPath: string;

// 🪟 Create Window
function createWindow(): void {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, "electron-vite.svg"),
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Close behavior
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

// Reopen (Mac)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/* ===========================
   🖨️ PRINTER HANDLERS
   =========================== */

// Get printers
ipcMain.handle("get-printers", async (): Promise<unknown[]> => {
  if (!win) return [];

  try {
    const printers = await win.webContents.getPrintersAsync();

    return printers;
  } catch (err) {
    console.error("Printer fetch error:", err);
    return [];
  }
});

// Save printer
ipcMain.on("save-printer", (_event, printerName: string): void => {
  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ printer: printerName }, null, 2),
    );
    console.log("Printer saved:", printerName);
  } catch (err) {
    console.error("Error saving printer:", err);
  }
});

// Get saved printer
ipcMain.handle("get-saved-printer", (): string | null => {
  try {
    if (!fs.existsSync(configPath)) return null;

    const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return data.printer;
  } catch (err) {
    console.error("Read error:", err);
    return null;
  }
});

/* ===========================
   🚀 APP READY
   =========================== */

let httpServer: Server | null = null;
const SERVER_PORT = 3001;
let SERVER_URL = "http://127.0.0.1:3001";

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (iface) {
      for (const addr of iface) {
        // Skip localhost and internal addresses
        if (addr.family === "IPv4" && !addr.internal) {
          return addr.address;
        }
      }
    }
  }
  return "127.0.0.1";
}

function startServer() {
  if (httpServer) return;

  const server = express();
  server.use(cors());
  server.use(express.json());

  // Health check endpoint
  server.get("/health", (_req: Request, res: Response) => {
    res.send({ status: "Server is running" });
  });

  server.post("/print", async (req: Request, res: Response) => {
    console.log("🖨️ Received print request:", req.body);

    try {
      // =========================
      // CHECK PRINTER CONFIG
      // =========================
      if (!fs.existsSync(configPath)) {
        console.error("❌ Printer config file missing");

        return res
          .status(400)
          .send("Printer not configured. Please select a printer first.");
      }

      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      const printerName: string = config.printer;

      if (!printerName) {
        console.error("❌ Printer name empty");

        return res.status(400).send("Printer not configured");
      }

      // =========================
      // REQUEST DATA
      // =========================
      const {
        hospital = "Hospital Service",
        logo = "",
        doctor = "---",
        patient = "---",
        token = "A-01",
        department = "General",
      } = req.body;

      console.log("📋 Print Data:", {
        hospital,
        token,
        patient,
        doctor,
        department,
        hasLogo: !!logo,
      });

      // =========================
      // CREATE PRINT WINDOW
      // =========================
      const printWindow = new BrowserWindow({
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
          preload: path.join(__dirname, "preload.mjs"),
        },
      });

      // =========================
      // HTML TEMPLATE
      // =========================
      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            @page {
              margin: 0;
            }

            html,
            body {
              width: 300px;
              max-width: 300px;
              overflow: hidden;
              background: #fff;
            }

            body {
              font-family: Arial, sans-serif;
              color: #000;
              padding: 8px;
              text-align: center;
              line-height: 1.3;
            }

            .logo {
              width: 55px;
              height: auto;
              margin: 0 auto 6px;
              display: block;
              object-fit: contain;
            }

            .hospital-name {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              word-wrap: break-word;
              margin-bottom: 6px;
            }

            .divider {
              border-top: 1px dashed #000;
              margin: 6px 0;
            }

            .token-label {
              font-size: 10px;
              font-weight: bold;
              margin-bottom: 2px;
            }

            .token-number {
              font-size: 26px;
              font-weight: bold;
              margin-bottom: 4px;
              letter-spacing: 1px;
            }

            .info-section {
              text-align: left;
              font-size: 10px;
              margin-top: 6px;
            }

            .info-row {
              margin-bottom: 4px;
              word-wrap: break-word;
            }

            .label {
              font-weight: bold;
            }

            .footer {
              margin-top: 8px;
              padding-top: 6px;
              border-top: 1px dashed #000;
              font-size: 8px;
              text-align: center;
            }

            .footer-line {
              margin-top: 2px;
            }
          </style>
        </head>

        <body>
          ${
            logo
              ? `<img src="${logo}" class="logo" onerror="this.style.display='none'" />`
              : ""
          }

          <div class="hospital-name">
            ${hospital}
          </div>

          <div class="divider"></div>

          <div class="token-label">
            YOUR TOKEN NUMBER
          </div>

          <div class="token-number">
            ${token}
          </div>

          <div class="divider"></div>

          <div class="info-section">
            <div class="info-row">
              <span class="label">Patient:</span>
              ${patient}
            </div>

            <div class="info-row">
              <span class="label">Doctor:</span>
              ${doctor}
            </div>

            <div class="info-row">
              <span class="label">Department:</span>
              ${department}
            </div>
          </div>

          <div class="footer">
            <div class="footer-line">
              ${new Date().toLocaleString()}
            </div>

            <div class="footer-line">
              Thank you for your patience
            </div>
          </div>
        </body>
      </html>
    `;

      // =========================
      // LOAD HTML
      // =========================
      await printWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
      );

      // Wait for rendering
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("📄 Starting print...");

      // =========================
      // PRINT
      // =========================
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName: printerName,
        },
        (success, failureReason) => {
          try {
            if (!success) {
              console.error("❌ Print failed:", failureReason);

              return res.status(500).send({
                success: false,
                message: failureReason || "Print failed",
              });
            }

            console.log("✅ Printed successfully");

            return res.send({
              success: true,
              message: "Printed successfully",
            });
          } catch (error) {
            console.error("❌ Response error:", error);
          } finally {
            setTimeout(() => {
              if (!printWindow.isDestroyed()) {
                printWindow.close();
              }
            }, 1000);
          }
        },
      );
    } catch (err) {
      console.error("❌ Print endpoint error:", err);

      return res.status(500).send({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });

  const localIP = getLocalIP();
  SERVER_URL = `http://${localIP}:${SERVER_PORT}`;

  httpServer = server.listen(SERVER_PORT, "0.0.0.0", () => {
    console.log(`✅ 🖨️ Print server running at ${SERVER_URL}`);
    console.log(`✅ Health check: ${SERVER_URL}/health`);
    console.log(`✅ Network IP: ${localIP}`);
  });
}

function stopServer() {
  if (httpServer) {
    httpServer.close();
    httpServer = null;
    console.log("🖨️ Print server stopped");
  }
}

// Server IPC Handlers
ipcMain.handle("get-server-status", () => ({
  running: !!httpServer,
  port: SERVER_PORT,
  url: SERVER_URL,
}));

ipcMain.handle("toggle-server", () => {
  if (httpServer) {
    stopServer();
  } else {
    startServer();
  }
  return {
    running: !!httpServer,
    port: SERVER_PORT,
  };
});

app.whenReady().then(() => {
  configPath = path.join(app.getPath("userData"), "config.json");
  createWindow();

  // Start server by default
  startServer();
});

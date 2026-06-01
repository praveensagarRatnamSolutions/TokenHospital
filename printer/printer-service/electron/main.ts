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
        hospital = {},
        patient = {},
        doctor = {},
        token = {},
        department = {},
        payment = {},
      } = req.body;

      const CLOUDFRONT_BASE_URL =
        process.env.PRINTER_CLOUDFRONT_URL ||
        "https://d2rxrksscpnnty.cloudfront.net";

      const hospitalName: string =
        typeof hospital === "string"
          ? hospital
          : hospital.name || "Hospital Service";
      const logo: string =
        typeof hospital === "string"
          ? ""
          : hospital.logo || hospital.logoUrl || "";
      const logoUrl: string = logo
        ? /^https?:\/\//i.test(logo)
          ? logo
          : `${CLOUDFRONT_BASE_URL.replace(/\/$/, "")}/${logo.replace(/^\/+/, "")}`
        : "";
      const patientName: string =
        typeof patient === "string" ? patient : patient.name || "---";
      const patientPhone: string =
        typeof patient === "string"
          ? patient
          : patient.phone?.full || patient.phone || "N/A";
      const patientAge: number | string = patient.age ?? "--";
      const patientGender: string = patient.gender || "--";
      const doctorName: string =
        typeof doctor === "string" ? doctor : doctor.name || "---";
      const doctorSpecialization: string =
        doctor.specialization || doctor.education || "General";

      const doctorRoomFloor: string = doctor.roomFloor || null;

      const tokenNumber: string =
        typeof token === "string"
          ? token
          : token.number || token.tokenNumber || "A-01";
      const tokenSequence: number | string =
        token.sequence ?? token.sequenceNumber ?? "--";
      const tokenStatus: string = (token.status || "WAITING")
        .toString()
        .toUpperCase();
      const departmentName: string =
        typeof department === "string"
          ? department
          : department.name || "General";
      const paymentAmount: number | string = payment.amount ?? "--";
      const paymentCurrency: string = payment.currency || "INR";
      const paymentMethod: string = payment.method || "--";
      const paymentStatus: string = payment.status || "--";
      const paymentTransactionId: string =
        payment.transactionId ||
        payment.razorpayPaymentId ||
        payment.razorpayOrderId ||
        "--";

      console.log("📋 Print Data:", {
        hospitalName,
        logo,
        doctorName,
        doctorSpecialization,
        patientName,
        patientPhone,
        patientAge,
        patientGender,
        tokenNumber,
        tokenSequence,
        tokenStatus,
        departmentName,
        paymentAmount,
        paymentCurrency,
        paymentMethod,
        paymentStatus,
        paymentTransactionId,
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

            .ticket-container {
              width: 280px;
              margin: 0 auto;
              padding: 6px;
              box-sizing: border-box;
              display: block;
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
        <div class="ticket-container">
          ${
            logoUrl
              ? `<img src="${logoUrl}" class="logo" onerror="this.style.display='none'" />`
              : ""
          }

          <div class="hospital-name">
            ${hospitalName}
          </div>

          <div class="divider"></div>

          <div class="token-label">
            YOUR TOKEN NUMBER
          </div>

          <div class="token-number">
            ${tokenNumber}
          </div>

          <div class="token-label" style="font-size: 11px; margin-top: 2px; letter-spacing: 0.5px;">
            Seq: ${tokenSequence} · Status: ${tokenStatus}
          </div>

          <div class="divider"></div>

          <div class="info-section">
            <div class="info-row">
              <span class="label">Patient:</span>
              ${patientName}
            </div>

            <div class="info-row">
              <span class="label">Phone:</span>
              ${patientPhone}
            </div>

            <div class="info-row">
              <span class="label">Age / Gender:</span>
              ${patientAge} / ${patientGender}
            </div>

            <div class="info-row">
              <span class="label">Doctor:</span>
              ${doctorName}
            </div>

            <div class="info-row">
              <span class="label">Specialization:</span>
              ${doctorSpecialization}
            </div>

            <div class="info-row">
              <span class="label">Room Floor:</span>
              ${doctorRoomFloor || "--"}
            </div>

            <div class="info-row">
              <span class="label">Department:</span>
              ${departmentName}
            </div>
          </div>

          <div class="divider"></div>

          <div class="info-section">
            <div class="info-row">
              <span class="label">Payment:</span>
              ${paymentMethod} · ${paymentCurrency} ${paymentAmount}
            </div>
            <div class="info-row">
              <span class="label">Txn ID:</span>
              ${paymentTransactionId}
            </div>
            <div class="info-row">
              <span class="label">Pay Status:</span>
              ${paymentStatus}
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

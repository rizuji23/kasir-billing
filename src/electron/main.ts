import { app, BrowserWindow, ipcMain, Notification } from "electron";
import path from "path";
import { isDev } from "./utils.js";
import dotenv from "dotenv";
import log from "electron-log";

log.initialize();

log.info("App starting...");

dotenv.config();
process.env.DATABASE_URL = `file:${path.join(
  app.getPath("userData"),
  "kasir.sqlite",
)}`;

import { getPreloadPath } from "./pathResolver.js";
import CategoryModule from "./module/category.js";
import MenuModule from "./module/menu.js";
import TableModule, { initialStartLamp, updateTimers } from "./module/table.js";
import AuthModule from "./module/auth.js";
import MemberModule from "./module/member.js";
import Responses from "./lib/responses.js";
import { SerialPort } from "serialport";
import { prisma } from "./database.js";
import VoucherModule from "./module/voucher.js";
import MachineModule, {
  connectMachine,
  reconnectMachine,
} from "./module/machine.js";
import { onMachineStatus } from "./lib/utils.js";
import LoggingModule from "./module/logging.js";
import BookingModule from "./module/booking.js";
import StrukModule from "./module/struk.js";
import NetworkModule from "./module/networks/network_module.js";
import http from "http";
import { WebSocketServer } from "ws";
import { getLocalIPAddress } from "./module/networks/network_scan.js";
import ReportModule from "./module/report.js";
import { setupAutoUpdater } from "./module/updater.js";

let mainWindow: BrowserWindow | null = null;
let serialport: SerialPort | null = null;

const port = 3321;
const server = http.createServer();
const wss = new WebSocketServer({ server });

async function listSerialPorts(): Promise<boolean> {
  try {
    const ports = await SerialPort.list();
    return ports.some((port) => port.path === serialport?.path);
  } catch (err) {
    console.error("Error listing serial ports:", err);
    log.error(`Error listing serial ports: ${err}`);
    return false;
  }
}

async function isMachineConnected(): Promise<boolean> {
  if (!serialport) return false;
  return (await listSerialPorts()) && serialport.isOpen;
}

async function initializeMachine() {
  serialport = await connectMachine();

  if (!serialport) {
    new Notification({
      title: "Serial Port Not Found",
      body: "SerialPort tidak ditemukan, silahkan untuk restart aplikasi",
    }).show();
  } else {
    log.info("Machine connected successfully.");
    console.log("Machine connected successfully.");

    serialport.on("error", async (err) => {
      console.error("Serial port error:", err.message);
      log.error(`Serial port error: ${err.message}`);
      await onMachineStatus("DISCONNECTED");
    });

    serialport.on("close", async () => {
      console.log("Serial port closed. Attempting to reconnect...");
      log.warn(`Serial port closed. Attempting to reconnect...`);
      await onMachineStatus("DISCONNECTED");
      serialport = await reconnectMachine();
    });
  }
}

app.on("ready", async () => {
  console.log(app.getPath("userData"));

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  await initializeMachine();

  setInterval(async () => {
    const connected = await isMachineConnected();
    if (!connected) {
      console.warn("Machine disconnected, attempting to reconnect...");
      log.warn(`Machine disconnected, attempting to reconnect...`);
      serialport = await reconnectMachine();
    }
  }, 2000);

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("message", (message) => {
      console.log("Received:", message.toString());
      ws.send("Message received");
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  server.listen(port, () => {
    log.info(`WebSocket server running on ws://${getLocalIPAddress()}:${port}`);
    console.log(
      `WebSocket server running on ws://${getLocalIPAddress()}:${port}`,
    );
  });

  updateTimers(mainWindow, wss);
  setupAutoUpdater(mainWindow);
});

setTimeout(async () => {
  await initialStartLamp();
}, 3000);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

AuthModule();
TableModule();
CategoryModule();
MenuModule();
MemberModule();
VoucherModule();
MachineModule();
LoggingModule();
BookingModule();
StrukModule();
NetworkModule();
ReportModule();

ipcMain.handle("get_printer", async (_, id: number | null) => {
  const printers = await mainWindow?.webContents.getPrintersAsync();

  const settings = await prisma.settings.findFirst({
    where: {
      id: id || undefined,
    },
  });

  return Responses({
    code: 200,
    data: {
      printers,
      settings,
    },
  });
});

ipcMain.handle(
  "save_printer",
  async (_, id: string | null, label_settings: string, content: string) => {
    try {
      const check_id = await prisma.settings.findFirst({
        where: {
          id_settings: id || undefined,
        },
      });

      let res;

      if (check_id) {
        res = await prisma.settings.update({
          where: { id_settings: check_id?.id_settings },
          data: {
            id_settings: "PRINTER",
            label_settings: label_settings,
            content: content,
          },
        });
      } else {
        res = await prisma.settings.create({
          data: {
            id_settings: "PRINTER",
            label_settings: label_settings,
            content: content,
            url: "",
          },
        });
      }

      return Responses({
        code: 200,
        data: res,
        detail_message: "Printer berhasil disimpan atau diperbarui",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal mengupdate data: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Gagal mengupdate data" });
    }
  },
);

const getSerialPorts = async () => {
  try {
    const ports = await SerialPort.list();
    return ports;
  } catch (err) {
    if (err instanceof Error) {
      return Responses({
        code: 500,
        detail_message: `Terjadi Kesalahan: ${err.message}`,
      });
    }
    return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
  }
};

ipcMain.handle("get_serialport", async () => {
  const settings = await prisma.settings.findFirst({
    where: {
      id_settings: "PORT",
    },
  });

  return Responses({
    code: 200,
    data: {
      ports: await getSerialPorts(),
      settings: settings,
    },
  });
});

ipcMain.handle(
  "save_port",
  async (_, id: string | null, label_settings: string, content: string) => {
    try {
      let res;

      const check_id = await prisma.settings.findFirst({
        where: {
          id_settings: id || undefined,
        },
      });

      if (check_id) {
        res = await prisma.settings.update({
          where: { id_settings: check_id.id_settings },
          data: {
            id_settings: "PORT",
            label_settings: label_settings,
            content: content,
          },
        });
      } else {
        res = await prisma.settings.create({
          data: {
            id_settings: "PORT",
            label_settings: label_settings,
            content: content,
            url: "",
          },
        });
      }

      return Responses({
        code: 200,
        data: res,
        detail_message: "Port berhasil disimpan atau diperbarui",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal mengupdate data: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Gagal mengupdate data" });
    }
  },
);

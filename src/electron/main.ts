import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  Notification,
  shell,
} from "electron";
import path from "path";
import { isDev } from "./utils.js";
import dotenv from "dotenv";
import log from "electron-log";

log.initialize();

log.info("App starting...");

dotenv.config();

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
import {
  getCashierName,
  getLocalIPAddress,
} from "./module/networks/network_scan.js";
import ReportModule from "./module/report.js";
import { setupAutoUpdater } from "./module/updater.js";
import UserModule from "./module/user.js";
import PriceModule from "./module/price.js";
import ShiftModule from "./module/shift.js";
import { runMigration } from "./migrate.js";
import { Server } from "socket.io";

let mainWindow: BrowserWindow | null = null;
let serialport: SerialPort | null = null;

const gotTheLock = app.requestSingleInstanceLock();

const port = 3321;
const port_chat = 5321;

const server = http.createServer();
const wss = new WebSocketServer({ server });

const server_chat = http.createServer({});
const io = new Server(server_chat, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// let sockets = new Map<string, WebSocket>();

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
    new Notification({
      title: "Mesin berhasil terhubung.",
    }).show();

    serialport.on("error", async (err) => {
      console.error("Serial port error:", err.message);
      log.error(`Serial port error: ${err.message}`);
      new Notification({
        title: "Kesalahan port serial:",
        body: err.message,
      }).show();
      await onMachineStatus("DISCONNECTED");
    });

    serialport.on("close", async () => {
      console.log("Serial port closed. Attempting to reconnect...");
      log.warn(`Serial port closed. Attempting to reconnect...`);
      new Notification({
        title: "Port serial tertutup. Mencoba menyambungkan kembali...",
      }).show();
      await onMachineStatus("DISCONNECTED");
      serialport = await reconnectMachine();
    });
  }
}

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

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
      focusable: true,
    });

    mainWindow.maximize();

    if (isDev()) {
      mainWindow.loadURL("http://localhost:5123");
    } else {
      mainWindow.loadFile(
        path.join(app.getAppPath(), "/dist-react/index.html"),
      );
    }

    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: "File",
        submenu: [
          {
            label: "Pengaturan Admin",
            click: () => {
              mainWindow?.webContents.send("navigate", "/admin");
            },
          },
          { type: "separator" },
          {
            label: "Exit",
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
        ],
      },
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forceReload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
      {
        label: "Window",
        submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

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

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("message", (data) => {
        console.log("messagessss", data);
        io.emit("message", data);
        mainWindow!.webContents.send("message", data);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    server.listen(port, () => {
      log.info(
        `WebSocket server running on ws://${getLocalIPAddress()}:${port}`,
      );
      console.log(
        `WebSocket server running on ws://${getLocalIPAddress()}:${port}`,
      );
    });

    server_chat.listen(port_chat, () => {
      console.log(
        `Socket server running on ${getLocalIPAddress()}:${port_chat}`,
      );
    });

    updateTimers(mainWindow, wss);
    setupAutoUpdater(mainWindow);
    // sockets = await initWebSockets(mainWindow!);

    MenuModule(mainWindow);
  });
}

setTimeout(async () => {
  await initialStartLamp();
}, 3000);

app.on("quit", () => {
  app.exit(0);
  process.exit(0);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

AuthModule();
TableModule();
CategoryModule();
MemberModule();
VoucherModule();
MachineModule();
LoggingModule();
BookingModule();
StrukModule();
NetworkModule();
ReportModule();
UserModule();
PriceModule();
ShiftModule();

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
      app.relaunch(); // Relaunch the app
      app.exit(0); // Close the current instance
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

ipcMain.handle("get_cashier_name", async () => {
  try {
    const res = await getCashierName();

    return Responses({
      code: 200,
      data: res,
      detail_message: "Port berhasil disimpan atau diperbarui",
    });
  } catch (err) {
    if (err instanceof Error) {
      return Responses({
        code: 500,
        detail_message: `Gagal mengupdate data: ${err.message}`,
      });
    }
    return Responses({ code: 500, detail_message: "Gagal mengupdate data" });
  }
});

ipcMain.handle("cashier_name", async (_, name: string) => {
  try {
    const cashier = await prisma.settings.findFirst({
      where: {
        id_settings: "CASHIER_NAME",
      },
    });

    if (cashier) {
      await prisma.settings.update({
        where: {
          id_settings: cashier.id_settings,
        },
        data: {
          content: name,
        },
      });
    } else {
      await prisma.settings.create({
        data: {
          id_settings: "CASHIER_NAME",
          content: name,
          label_settings: "Cashier Name",
          url: "",
        },
      });
    }

    return Responses({
      code: 200,
      detail_message: "Nama Kasir berhasil disimpan atau diperbarui",
    });
  } catch (err) {
    if (err instanceof Error) {
      return Responses({
        code: 500,
        detail_message: `Gagal mengupdate data: ${err.message}`,
      });
    }
    return Responses({ code: 500, detail_message: "Gagal mengupdate data" });
  }
});

ipcMain.handle("confirm", async (_, title: string = "Apakah anda yakin?") => {
  const result = await dialog.showMessageBox(mainWindow!, {
    type: "question",
    buttons: ["Cancel", "OK"],
    defaultId: 1,
    title: "Konfirmasi",
    message: title,
  });

  return result.response === 1;
});

ipcMain.handle(
  "show_message_box",
  (
    _,
    type: "none" | "info" | "error" | "question" | "warning",
    message: string,
  ) => {
    dialog.showMessageBox(mainWindow!, {
      type,
      message,
    });
  },
);

ipcMain.handle("open_url", async (_, url: string) => {
  return shell.openExternal(url);
});

ipcMain.handle("run_migration", async (_, migrationName: string) => {
  try {
    return await runMigration(migrationName);
  } catch (err) {
    return err;
  }
});

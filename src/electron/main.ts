import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./utils.js";
import dotenv from "dotenv";

dotenv.config();
process.env.DATABASE_URL = `file:${path.join(
  app.getPath("userData"),
  "kasir.sqlite",
)}`;

import { getPreloadPath } from "./pathResolver.js";
import CategoryModule from "./module/category.js";
import MenuModule from "./module/menu.js";
import TableModule from "./module/table.js";
import AuthModule from "./module/auth.js";
import MemberModule from "./module/member.js";
import Responses from "./lib/responses.js";
import { SerialPort } from "serialport";
import { prisma } from "./database.js";
import VoucherModule from "./module/voucher.js";

let mainWindow: BrowserWindow | null = null;

app.on("ready", () => {
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
});

AuthModule();
TableModule();
CategoryModule();
MenuModule();
MemberModule();
VoucherModule();

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

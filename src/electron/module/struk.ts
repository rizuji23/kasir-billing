import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { getPreloadPath } from "../pathResolver.js";
import { isDev } from "../utils.js";
import path from "path";
import { prisma } from "../database.js";

export async function StrukWindow(id_struk: string) {
  try {
    const struk = await prisma.struk.findFirst({
      where: {
        id_struk: id_struk,
      },
      include: {
        orderId: {
          include: {
            menucafe: true,
          },
        },
        bookingId: {
          include: {
            detail_booking: true,
            table: true,
            order_cafe: {
              include: {
                menucafe: true,
              },
            },
          },
        },
      },
    });

    if (!struk) {
      dialog.showErrorBox("Terjadi Kesalahan", "Struk tidak ditemukan");
      return false;
    }

    console.log("struk", struk);

    const printWindow = new BrowserWindow({
      show: true,
      webPreferences: {
        preload: getPreloadPath(),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    console.log("isDev()", isDev());

    if (isDev()) {
      printWindow.loadURL("http://localhost:5123/#/struk");
    } else {
      printWindow.loadFile(
        path.join(app.getAppPath(), "/dist-react/index.html"),
        { hash: "struk" },
      );
    }

    printWindow.webContents.on("did-finish-load", () => {
      setTimeout(() => {
        prisma.settings
          .findFirst({
            where: {
              id_settings: "PRINTER",
            },
          })
          .then((result) => {
            if (result) {
              printWindow.webContents.send("print_struk", struk);
              //   printWindow.webContents.print({
              //     silent: true,
              //     printBackground: true,
              //     deviceName: result.content || "Microsoft Print to PDF",
              //     copies: 0,
              //     margins: {
              //       marginType: "custom",
              //       top: 0,
              //       bottom: 0,
              //       left: 0,
              //       right: 0,
              //     },
              //   });
              return true;
            } else {
              dialog.showErrorBox(
                "Terjadi Kesalahan",
                "Printer tidak ditemukan",
              );
              return false;
            }
          })
          .catch((err) => {
            dialog.showErrorBox(
              "Terjadi Kesalahan",
              `Error StrukWindow: ${JSON.stringify(err)}`,
            );
            return false;
          });
      }, 1000);
    });
  } catch (err) {
    dialog.showErrorBox(
      "Terjadi Kesalahan",
      `Error StrukWindow Catch: ${JSON.stringify(err)}`,
    );
    return false;
  }
}

export default function StrukModule() {
  ipcMain.handle("test_struk", async () => {
    return await StrukWindow("STR-KwE4tCxe1U");
  });
}

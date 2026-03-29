import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { getPreloadPath } from "../pathResolver.js";
import { isDev } from "../utils.js";
import path from "path";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";

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
            detail_booking: {
              include: {
                paket: true,
              },
            },
            table: true,
            order_cafe: {
              include: {
                menucafe: true,
              },
              where: {
                status: {
                  not: {
                    in: ["RESET"],
                  },
                },
                status_kitchen: {
                  not: {
                    in: ["CANCEL", "REJECT"],
                  },
                },
              },
            },
            paket: true,
          },
        },
      },
    });

    if (!struk) {
      dialog.showErrorBox("Terjadi Kesalahan", "Struk tidak ditemukan");
      return false;
    }

    const printWindow = new BrowserWindow({
      show: false,
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
              setTimeout(() => {
                const configuredPrinter = (result.content || "").trim();
                const normalizedPrinter = configuredPrinter.toLowerCase();
                const isPdfDestination =
                  normalizedPrinter.includes("pdf") ||
                  normalizedPrinter.includes("print_to_pdf") ||
                  normalizedPrinter.includes("save as pdf");

                const printOptions: Electron.WebContentsPrintOptions = {
                  silent: !isPdfDestination,
                  printBackground: true,
                  copies: 1,
                  margins: {
                    marginType: "none",
                  },
                  scaleFactor: 84,
                  pageSize: "A4",
                };

                if (configuredPrinter && !isPdfDestination) {
                  printOptions.deviceName = configuredPrinter;
                }

                printWindow.webContents.print(printOptions, (success, failureReason) => {
                  if (!success) {
                    dialog.showErrorBox(
                      "Terjadi Kesalahan",
                      `Print gagal: ${failureReason || "Unknown error"}`,
                    );
                  }
                  if (!printWindow.isDestroyed()) {
                    printWindow.close();
                  }
                });
              }, 2500);
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
    const struk = await prisma.struk.findFirst();

    if (!struk) {
      dialog.showErrorBox("Terjadi Kesalahan", "Struk tidak temukan");
      return;
    }

    return await StrukWindow(struk.id_struk);
  });

  ipcMain.handle("print_struk", async (_, id_struk: string) => {
    try {
      await StrukWindow(id_struk);

      return Responses({
        code: 200,
        detail_message: "Print struk berhasil dilakukan",
      });
    } catch (err) {
      dialog.showErrorBox(
        "Terjadi Kesalahan",
        `Error print_struk: ${JSON.stringify(err)}`,
      );
    }
  });
}

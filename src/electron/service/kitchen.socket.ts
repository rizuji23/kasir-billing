import { BrowserWindow, dialog } from "electron";
import { IKitchenIncoming } from "../types/index.js";
import { prisma } from "../database.js";

export default async function handleKitchenUpdate(
  data: IKitchenIncoming[],
  mainWindow: BrowserWindow | null,
) {
  const get_cashier_name = await prisma.settings.findFirst({
    where: { id_settings: "CASHIER_NAME" },
  });

  if (!get_cashier_name) {
    dialog.showErrorBox(
      "Nama kasir belum dikonfigurasi!",
      "Silahkan pergi ke Pengaturan lalu pilih API pada Nama Kasir, masukkan Nama Kasir dan Simpan Perubahan",
    );
    return;
  }

  const this_cashier_data = data.filter((el) => {
    return el.name_cashier === get_cashier_name.content;
  });

  if (mainWindow?.webContents.isLoading()) {
    mainWindow.webContents.once("did-finish-load", () => {
      mainWindow.webContents.send("kitchen:update", this_cashier_data);
    });
  } else {
    mainWindow?.webContents.send("kitchen:update", this_cashier_data);
  }
}

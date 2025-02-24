import { ipcMain } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";

export default function CategoryModule() {
  ipcMain.handle("list_category", async () => {
    try {
      const category = await prisma.categoryMenu.findMany();

      return Responses({ code: 200, data: category });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal mengambil Category Menu: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal mengambil Category Menu",
      });
    }
  });

  ipcMain.handle("add_category", async (_, name: string) => {
    try {
      const category = await prisma.categoryMenu.create({ data: { name } });
      return Responses({
        code: 201,
        data: category,
        detail_message: "Kategori Menu berhasil disimpan",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal Menu menyimpan Kategori: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal Menu menyimpan Kategori",
      });
    }
  });

  ipcMain.handle("update_category", async (_, name: string, id: number) => {
    try {
      const category = await prisma.categoryMenu.update({
        where: { id },
        data: { name },
      });
      return Responses({
        code: 201,
        data: category,
        detail_message: "Kategori Menu berhasil diubah",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal Menu ubah Kategori: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal Menu ubah Kategori",
      });
    }
  });

  ipcMain.handle("delete_category", async (_, id: number) => {
    try {
      const category = await prisma.categoryMenu.delete({
        where: {
          id: id,
        },
      });
      return Responses({
        code: 201,
        data: category,
        detail_message: "Kategori Menu berhasil dihapus",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal Menu hapus Kategori: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal Menu hapus Kategori",
      });
    }
  });
}

import { ipcMain } from "electron";
import { ICart, IMenu } from "../types/index.js";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";
import generateShortUUID from "../lib/random.js";

export default function MenuModule() {
  ipcMain.handle("add_menu", async (_, data: IMenu) => {
    try {
      const category = await prisma.categoryMenu.findFirst({
        where: { id: data.categoryMenuId },
      });

      if (!category) {
        return Responses({
          code: 400,
          detail_message: "Kategori Menu tidak ditemukan",
        });
      }

      const menuCafe = await prisma.menuCafe.create({
        data: {
          name: data.name,
          price: data.price,
          categoryMenuId: data.categoryMenuId,
          price_modal: data.price_modal,
          price_profit: data.price_profit,
        },
        include: {
          category_menu: true,
        },
      });

      return Responses({
        code: 201,
        data: menuCafe,
        detail_message: "Menu berhasil disimpan",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal menyimpan Menu: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Gagal menyimpan Menu" });
    }
  });

  ipcMain.handle("menu_list", async (_, filter: string) => {
    try {
      let menu;
      if (filter === "all") {
        menu = await prisma.menuCafe.findMany({
          include: {
            category_menu: true,
          },
        });
      } else {
        menu = await prisma.menuCafe.findMany({
          where: {
            categoryMenuId: parseInt(filter),
          },
          include: {
            category_menu: true,
          },
        });
      }

      return Responses({ code: 200, data: menu });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal mengambil Menu: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Gagal mengambil Menu" });
    }
  });

  ipcMain.handle("delete_menu", async (_, id: number) => {
    try {
      const category = await prisma.menuCafe.delete({
        where: {
          id: id,
        },
      });
      return Responses({
        code: 201,
        data: category,
        detail_message: "Menu berhasil dihapus",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal hapus Menu : ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal hapus Menu",
      });
    }
  });

  ipcMain.handle("update_menu", async (_, id: number, data: IMenu) => {
    try {
      // Ensure `id` is provided and valid
      if (!id) {
        return Responses({
          code: 400,
          detail_message: "ID Menu tidak valid",
        });
      }

      // Ensure at least one field is provided for updating
      if (
        !data.name &&
        !data.price &&
        !data.categoryMenuId &&
        !data.price_modal &&
        !data.price_profit
      ) {
        return Responses({
          code: 400,
          detail_message: "Tidak ada data yang akan diupdate",
        });
      }

      // Update the menu
      const updatedMenu = await prisma.menuCafe.update({
        where: { id: id }, // Provide the ID to identify the record
        data: {
          name: data.name,
          price: data.price,
          categoryMenuId: data.categoryMenuId,
          price_modal: data.price_modal,
          price_profit: data.price_profit,
        },
      });

      return Responses({
        code: 200,
        data: updatedMenu,
        detail_message: "Menu berhasil diupdate",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal mengupdate Menu: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Gagal mengupdate Menu" });
    }
  });

  ipcMain.handle("checkout_menu", async (_, cash: number, data: ICart[]) => {
    try {
      const total = data.reduce((acc, item) => acc + item.subtotal, 0);
      const id_order = generateShortUUID();

      const order_cafe = await prisma.orderCafe.createMany({
        data: data.map((item) => ({
          id_order,
          id_order_cafe: `ORD-${generateShortUUID()}`,
          menu_cafe: item.id,
          subtotal: item.subtotal,
          total,
          cash,
          change: cash - total,
          status: "PAID",
          qty: Number(item.qty),
        })),
      });

      const find_order = await prisma.orderCafe.findMany({
        where: {
          id_order,
        },
        include: {
          menucafe: true,
        },
      });

      await prisma.struk.create({
        data: {
          id_struk: `STK-${generateShortUUID()}`,
          id_order: find_order[0].id,
          name: "Cafe",
          total,
          cash,
          change: cash - total,
          status: "PAID",
          type_struk: "CAFEONLY",
        },
      });

      return Responses({
        code: 201,
        data: order_cafe,
        detail_message: "Pesanan berhasil dibuat",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Terjadi Kesalahan: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
    }
  });
}

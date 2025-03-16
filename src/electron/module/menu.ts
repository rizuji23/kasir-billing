import { BrowserWindow, ipcMain } from "electron";
import {
  ICart,
  IMenu,
  IOrderCafeNew,
  PaymentMethodCasierType,
} from "../types/index.js";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";
import generateShortUUID from "../lib/random.js";
import { StrukWindow } from "./struk.js";
import { getShift } from "../lib/utils.js";
import { sendToKitchen } from "./kitchen.js";

interface ICheckoutMenuTable {
  id_menu: number;
  price: number;
  qty: string;
  total: number;
  id_booking: string;
}

export default function MenuModule(mainWindow: BrowserWindow | null) {
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

  ipcMain.handle(
    "checkout_menu",
    async (
      _,
      cash: number,
      data: ICart[],
      payment_method: string,
      name: string,
    ) => {
      try {
        const currentTime = new Date();
        const shift = await getShift(currentTime);

        const total = data.reduce((acc, item) => acc + item.subtotal, 0);
        const id_order = generateShortUUID();

        const struk = await prisma.struk.create({
          data: {
            id_struk: `STK-${generateShortUUID()}`,
            name: name,
            total,
            total_cafe: total,
            cash,
            change: cash - total,
            status: "PAID",
            payment_method:
              payment_method as unknown as PaymentMethodCasierType,
            type_struk: "CAFEONLY",
            shift: shift || "Pagi",
          },
        });

        const order_cafe = await prisma.orderCafe.createMany({
          data: data.map((item) => ({
            id_order,
            id_order_cafe: `ORD-${generateShortUUID()}`,
            menu_cafe: item.id,
            subtotal: item.subtotal,
            total,
            name,
            cash,
            change: cash - total,
            payment_method:
              payment_method as unknown as PaymentMethodCasierType,
            status: "PAID",
            qty: Number(item.qty),
            id_struk: struk.id,
            shift: shift || "Pagi",
          })),
        });

        await StrukWindow(struk.id_struk);

        await sendToKitchen(mainWindow, id_order, "CAFE");

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
    },
  );

  ipcMain.handle("list_menu_table", async (_, id_table: string) => {
    try {
      const table = await prisma.tableBilliard.findFirst({
        where: {
          id_table: id_table,
        },
        include: {
          bookings: {
            take: 1,
            orderBy: {
              created_at: "desc",
            },
            include: {
              order_cafe: {
                include: {
                  menucafe: true,
                },
              },
            },
          },
        },
      });

      return Responses({
        code: 200,
        data: table,
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

  ipcMain.handle("checkout_menu_table", async (_, data: ICheckoutMenuTable) => {
    try {
      const [booking, menu_cafe] = await Promise.all([
        prisma.booking.findFirst({
          where: {
            id_booking: data.id_booking,
          },
        }),
        prisma.menuCafe.findFirst({
          where: {
            id: data.id_menu,
          },
        }),
      ]);

      if (!booking) {
        return Responses({
          code: 404,
          detail_message: "Booking tidak ditemukan",
        });
      }

      if (!menu_cafe) {
        return Responses({
          code: 404,
          detail_message: "Menu Cafe tidak ditemukan",
        });
      }

      const currentTime = new Date();
      const shift = await getShift(currentTime);

      const order = await prisma.orderCafe.findFirst({
        where: {
          menu_cafe: menu_cafe.id,
          bookingId: booking.id,
        },
      });

      let order_id = "";
      const item_data: {
        id_order_cafe_item: string;
        orderId: number;
        menu_cafe: number;
        price: number;
        shift: string;
        name_menu: string;
      }[] = [];

      const createManyOrderItem = async (
        order_new: IOrderCafeNew,
        qty: number,
      ) => {
        if (qty <= 0) return;

        const newOrderItem = Array.from({ length: qty }, () => {
          const data_item = {
            id_order_cafe_item: generateShortUUID(),
            orderId: order_new.id,
            menu_cafe: menu_cafe.id,
            price: menu_cafe.price,
            shift: shift || "Pagi",
          };

          item_data.push({ ...data_item, name_menu: menu_cafe.name });

          return data_item;
        });

        await prisma.orderCafeItem.createMany({
          data: newOrderItem,
        });
      };

      const newSubtotal = menu_cafe.price * Number(data.qty || "0");

      if (!order) {
        const new_order = await prisma.orderCafe.create({
          data: {
            id_order: generateShortUUID(),
            id_order_cafe: `ORD-${generateShortUUID()}`,
            menu_cafe: menu_cafe.id,
            subtotal: newSubtotal,
            total: newSubtotal,
            cash: 0,
            change: 0,
            name: booking.name,
            status: "NOPAID",
            qty: Number(data.qty || "0"),
            bookingId: booking.id,
            shift: shift || "Pagi",
          },
        });

        order_id = new_order.id_order;

        await createManyOrderItem(new_order, Number(data.qty || "0"));
      } else {
        // await prisma.orderCafeItem.deleteMany({
        //   where: { menu_cafe: menu_cafe.id, orderId: order.id },
        // });

        const oldQty = Number(order.qty || "0");
        const newQty = Number(data.qty || "0");
        const qtyDiff = newQty - oldQty;
        const qtyNew = qtyDiff + oldQty;
        const qtyResult = oldQty + qtyNew;

        const totalNew = menu_cafe.price * qtyResult;

        const update_order_item = await prisma.orderCafe.update({
          where: { id: order.id },
          data: {
            subtotal: totalNew,
            total: totalNew,
            name: booking.name,
            qty: qtyResult,
          },
        });

        order_id = update_order_item.id_order;

        await createManyOrderItem(update_order_item, newQty);
      }

      console.log("order_id", order_id);

      await sendToKitchen(mainWindow, order_id, "TABLE", item_data);

      return Responses({
        code: 201,
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

  ipcMain.handle(
    "menu_table_qty",
    async (_, id_order: number, type_qty: string) => {
      try {
        const order = await prisma.orderCafe.findFirst({
          where: {
            id: id_order,
          },
          include: {
            menucafe: true,
          },
        });

        if (!order) {
          return Responses({
            code: 404,
            detail_message: "Order tidak ditemukan",
          });
        }

        const currentTime = new Date();
        const shift = await getShift(currentTime);

        const newQty = type_qty === "plus" ? order.qty + 1 : order.qty - 1;
        const newTotal = order.menucafe.price * newQty;

        const update_order_item = await prisma.orderCafe.update({
          where: { id: order.id },
          data: {
            subtotal: newTotal,
            total: newTotal,
            qty: newQty,
          },
        });

        if (type_qty === "plus") {
          await prisma.orderCafeItem.create({
            data: {
              id_order_cafe_item: generateShortUUID(),
              orderId: update_order_item.id,
              menu_cafe: order.menucafe.id,
              price: order.menucafe.price,
              shift: shift || "Pagi",
            },
          });
        } else {
          const qtyDiff = newQty - order.qty;
          console.log("QTYDIFF", qtyDiff);

          const itemsToDelete = await prisma.orderCafeItem.findMany({
            where: {
              menu_cafe: order.menucafe.id,
              orderId: order.id,
            },
            select: { id_order_cafe_item: true },
            take: Math.abs(qtyDiff),
          });

          if (itemsToDelete.length > 0) {
            await prisma.orderCafeItem.deleteMany({
              where: {
                id_order_cafe_item: {
                  in: itemsToDelete.map((item) => item.id_order_cafe_item),
                },
              },
            });
          }
        }

        return Responses({
          code: 201,
          detail_message: "Pesanan berhasil ditambah",
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Terjadi Kesalahan: ${err.message}`,
          });
        }
        return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
      }
    },
  );
}

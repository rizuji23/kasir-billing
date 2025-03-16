import { BrowserWindow } from "electron";
import { prisma } from "../database.js";
import { getCashierName, getLocalIPAddress } from "./networks/network_scan.js";

type CafeItem = {
  id_order_cafe_item: string;
  orderId: number;
  menu_cafe: number;
  price: number;
  shift: string;
  name_menu: string;
};

type GroupedCafeItem = {
  orderId: number;
  menu_cafe: number;
  price: number;
  shift: string;
  name_menu: string;
  qty: number;
};

export const sendToKitchen = async (
  mainWindow: BrowserWindow | null,
  id_order: string,
  type_order: "CAFE" | "TABLE",
  item_order: CafeItem[] = [],
) => {
  try {
    const order = await prisma.orderCafe.findMany({
      where: {
        id_order,
      },
      include: {
        menucafe: true,
      },
    });

    if (order.length === 0) {
      return null;
    }

    const cashier_name = await getCashierName();
    let item_data: GroupedCafeItem[] = [];

    if (item_order.length !== 0) {
      item_data = Object.values(
        item_order.reduce<Record<number, GroupedCafeItem>>((acc, item) => {
          if (!acc[item.menu_cafe]) {
            acc[item.menu_cafe] = { ...item, qty: 1 };
          } else {
            acc[item.menu_cafe].qty += 1;
          }
          return acc;
        }, {}),
      );
    }

    const data_kitchen = {
      type: "kitchen",
      ip: getLocalIPAddress(),
      data: {
        order_type: type_order,
        order: order,
        item: item_data,
      },
      name: cashier_name?.content || "",
    };

    console.log("data_kitchen", JSON.stringify(data_kitchen));

    if (mainWindow) {
      console.log("MAIN WINDOW FOUND");
      mainWindow.webContents.send("send_kitchen", JSON.stringify(data_kitchen));
    }

    return data_kitchen;
  } catch (err) {
    console.log("err", err);
    return null;
  }
};

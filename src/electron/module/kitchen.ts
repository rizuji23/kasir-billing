import { BrowserWindow, dialog } from "electron";
import { prisma } from "../database.js";
import { getCashierName } from "./networks/network_scan.js";
import { getSocket, sendSocket } from "../socket.js";
import generateShortUUID from "../lib/random.js";

/* =======================
   TYPES
======================= */

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

type KitchenPayload = {
  orderId: string;
  type: "kitchen";
  ip: string;
  name: string;
  data: {
    order_type: "CAFE" | "TABLE";
    order: unknown[];
    item: GroupedCafeItem[];
    no_billiard: string;
    no_meja: string;
  };
};

type KitchenAck =
  | { ok: true; orderId: string }
  | { ok: false; message: string };

type KitchenStatus = "SENT" | "OFFLINE" | "REJECTED";

/* =======================
   MAIN FUNCTION
======================= */

export const sendToKitchen = async (
  mainWindow: BrowserWindow | null,
  id_order: string,
  type_order: "CAFE" | "TABLE",
  item_order: CafeItem[] = [],
): Promise<(KitchenPayload & { kitchen_status: KitchenStatus }) | null> => {
  try {
    const socket = getSocket();
    /* =======================
       LOAD DATA
    ======================= */

    const order = await prisma.orderCafe.findMany({
      where: { id_order },
      include: {
        menucafe: { include: { category_menu: true } },
        booking: { include: { table: true } },
      },
    });

    if (order.length === 0) return null;

    const table = await prisma.booking.findFirst({
      where: { id_booking: order[0].booking?.id_booking },
      include: { table: true },
    });

    const cashierName = await getCashierName();

    /* =======================
       GROUP ITEMS
    ======================= */

    const groupedItems: GroupedCafeItem[] = Object.values(
      item_order.reduce<Record<number, GroupedCafeItem>>((acc, item) => {
        if (!acc[item.menu_cafe]) {
          acc[item.menu_cafe] = { ...item, qty: 1 };
        } else {
          acc[item.menu_cafe].qty += 1;
        }
        return acc;
      }, {}),
    );

    /* =======================
       BUILD PAYLOAD
    ======================= */

    const payload: KitchenPayload = {
      orderId: generateShortUUID(),
      type: "kitchen",
      ip: socket?.id || "-",
      name: cashierName?.content ?? "",
      data: {
        order_type: type_order,
        order: order.filter((o) => o.menucafe.send_to_kitchen),
        item: groupedItems,
        no_billiard: table?.table.name ?? "-",
        no_meja: order[0].no_meja?.toString() ?? "-",
      },
    };

    console.log("📤 Sending to kitchen:", payload);

    /* =======================
       SEND VIA SOCKET
    ======================= */

    let ack: KitchenAck;

    try {
      ack = await sendSocket<KitchenAck>(
        "order:create",
        JSON.stringify(payload),
      );
    } catch (err) {
      console.error("❌ Kitchen offline:", err);

      mainWindow?.webContents.send("kitchen:offline", {
        reason: err instanceof Error ? err.message : "UNKNOWN",
        payload,
      });

      return { ...payload, kitchen_status: "OFFLINE" };
    }

    /* =======================
       HANDLE ACK
    ======================= */
    console.log("ack", ack);
    if (!ack.ok) {
      mainWindow?.webContents.send("kitchen:error", {
        message: ack.message,
        payload,
      });

      return { ...payload, kitchen_status: "REJECTED" };
    }

    /* =======================
       SUCCESS
    ======================= */

    mainWindow?.webContents.send("kitchen:success", {
      orderId: ack.orderId,
    });

    return { ...payload, kitchen_status: "SENT" };
  } catch (err) {
    console.error("🔥 sendToKitchen failed:", err);
    return null;
  }
};

export async function rejectOrder(order_id: Array<string>) {
  try {
    if (!order_id.length) {
      dialog.showErrorBox("Order ID kosong", `Order ID Harus lebih dari 1.`);
      return { data: null, status: true };
    }

    const updated_order = await prisma.$transaction(async (tx) => {
      const orders = await tx.orderCafe.findMany({
        where: {
          id_order_cafe: { in: order_id },
        },
        select: {
          id_struk: true,
        },
      });

      const strukIds = [
        ...new Set(
          orders
            .map((o) => o.id_struk)
            .filter((id): id is number => id !== null),
        ),
      ];

      await tx.orderCafe.updateMany({
        where: {
          id_order_cafe: { in: order_id },
        },
        data: {
          status: "RESET",
          status_kitchen: "REJECT",
        },
      });

      if (strukIds.length) {
        await tx.struk.updateMany({
          where: {
            id: { in: strukIds },
          },
          data: {
            status: "RESET",
          },
        });
      }

      return {
        updatedOrders: order_id.length,
        updatedStruk: strukIds.length,
      };
    });

    return { data: updated_order, status: true };
  } catch (err) {
    dialog.showErrorBox(
      "Proses Tolak Order tidak berhasil",
      `Ada Kendala saat tolak order, silahkan hubungi pihak developer \n${JSON.stringify(
        err,
      )}.`,
    );

    return { data: null, status: true };
  }
}

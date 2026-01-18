import { dialog } from "electron";
import { formatPrismaDate } from "../../lib/formatTime.js";
import { IRekapModuleParams } from "../../types/index.js";
import { prisma } from "../../database.js";

export async function getRekapPenjualanCafe(data: IRekapModuleParams) {
  try {
    let customRange;
    if (data.periode === "custom" && data.custom) {
      customRange = {
        startDate: new Date(data.custom.start_date),
        endDate: new Date(data.custom.end_date),
        closeHour: 3,
      };
    }

    const { gte, lte } = formatPrismaDate(data.periode, customRange, 3);

    console.log({ gte, lte });

    const orderItems = await prisma.orderCafeItem.findMany({
      where: {
        created_at: { gte, lte },
      },
      include: {
        menucafe: {
          include: {
            category_menu: true,
          },
        },
        orderCafe: true,
      },
    });

    console.log("orderItems", orderItems);

    const grouped: Record<string, { name: string; total: number }[]> = {};

    orderItems.forEach((item) => {
      const category = item.menucafe.category_menu?.name || "Uncategorized";
      const menuName = item.menucafe.name;

      const qty = item.orderCafe?.qty ?? 1;

      if (!grouped[category]) grouped[category] = [];

      const existing = grouped[category].find((m) => m.name === menuName);
      if (existing) {
        existing.total += qty;
      } else {
        grouped[category].push({ name: menuName, total: qty });
      }
    });

    return grouped;
  } catch (err) {
    dialog.showErrorBox(
      `Gagal saat mengambil data rekap`,
      `Silahkan untuk hubungi pihak developer ${err}.`,
    );
    return false;
  }
}

import { ipcMain } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";

export default function TableModule() {
  ipcMain.handle("table_list", async () => {
    const table = await prisma.tableBilliard.findMany({
      include: {
        bookings: true,
      },
    });
    return Responses({
      code: 200,
      data: table,
    });
  });

  ipcMain.handle("total_booking", async () => {
    try {
      const total_all = await prisma.tableBilliard.count();
      const total_used = await prisma.tableBilliard.count({
        where: {
          status: "USED",
        },
      });

      return Responses({
        code: 200,
        data: {
          total_all,
          total_used,
        },
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

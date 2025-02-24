import { ipcMain } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";

export default function TableModule() {
  async function getCurrentShift() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const shifts = await prisma.shift.findMany();

    const activeShift = shifts.find((shift) => {
      const start = new Date(shift.start_hours);
      const end = new Date(shift.end_hours);

      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();

      if (startMinutes < endMinutes) {
        return currentTime >= startMinutes && currentTime < endMinutes;
      } else {
        return currentTime >= startMinutes || currentTime < endMinutes;
      }
    });

    return activeShift;
  }

  async function getCurrentShiftByTime(timeString: string) {
    const now = new Date();
    if (timeString) {
      const [hours, minutes, seconds] = timeString.split(":").map(Number);
      now.setHours(hours, minutes, seconds || 0);
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const shifts = await prisma.shift.findMany();

    const activeShift = shifts.find((shift) => {
      const start = new Date(shift.start_hours);
      const end = new Date(shift.end_hours);

      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();

      if (startMinutes < endMinutes) {
        return currentTime >= startMinutes && currentTime < endMinutes;
      } else {
        return currentTime >= startMinutes || currentTime < endMinutes;
      }
    });

    return activeShift;
  }

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

  ipcMain.handle("get_current_shift", async () => {
    try {
      const activeShift = await getCurrentShift();

      return Responses({ code: 200, data: activeShift?.shift || "Unknown" });
    } catch (err) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Terjadi Kesalahan: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
    }
  });

  ipcMain.handle("get_price_type", async () => {
    try {
      const res = await prisma.priceBillingType.findMany();
      return Responses({ code: 200, data: res });
    } catch (err) {
      return Responses({
        code: 500,
        detail_message: `Terjadi Kesalahan: ${(err as Error).message}`,
      });
    }
  });

  ipcMain.handle("get_price", async (_, type_price: string, time: string) => {
    try {
      const activeShift = await getCurrentShiftByTime(time);

      if (!activeShift?.shift) {
        return Responses({
          code: 400,
          detail_message: "Shift Tidak Ditemukan.",
        });
      }

      const type_pricing = await prisma.priceBillingType.findFirst({
        where: { type_price },
      });

      if (!type_pricing) {
        return Responses({
          code: 404,
          detail_message: "Tipe harga tidak ditemukan",
        });
      }

      const price = await prisma.priceBilling.findFirst({
        where: {
          type_price_id: type_pricing.id,
          season: activeShift.shift, // Fetch price for the correct shift
        },
      });

      return Responses({ code: 200, data: price });
    } catch (err) {
      return Responses({
        code: 500,
        detail_message: `Terjadi Kesalahan: ${(err as Error).message}`,
      });
    }
  });
}

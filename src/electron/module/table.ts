import { BrowserWindow, ipcMain } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";
import { sendMessageToMachine } from "./machine.js";

export async function initialStartLamp() {
  try {
    const table_on = await prisma.tableBilliard.findMany({
      where: {
        power: "ON",
      },
    });

    if (table_on.length !== 0) {
      const get_only_number = table_on.map((el) => Number(el.number));
      console.log(get_only_number);
      await sendMessageToMachine(`on [${get_only_number.toString()}]`);
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(secs).padStart(2, "0")}`;
};

export const updateTimers = async (mainWindow: BrowserWindow) => {
  setInterval(async () => {
    const tables = await prisma.tableBilliard.findMany({
      include: {
        bookings: {
          take: 1,
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    const now = new Date();
    const updatedTables = await Promise.all(
      tables.map(async (table) => {
        let remainingTime = "00:00:00";

        if (table.timer) {
          const secondsRemaining = Math.max(
            0,
            Math.floor((table.timer.getTime() - now.getTime()) / 1000),
          );

          remainingTime = formatTime(secondsRemaining);

          if (secondsRemaining <= 0 && table.status !== "EXPIRE") {
            // Only update if not already "EXPIRE"
            await prisma.tableBilliard.update({
              where: { id: table.id },
              data: { status: "EXPIRE", timer: null, power: "OFF" },
            });
            setTimeout(async () => {
              await sendMessageToMachine(`off ${table.number}`);
            }, 100 * Number(table.number));
          } else if (
            secondsRemaining <= 900 &&
            table.status !== "MOSTLYEXPIRE"
          ) {
            // Only update if not already "MOSTLYEXPIRE"
            await prisma.tableBilliard.update({
              where: { id: table.id },
              data: { status: "MOSTLYEXPIRE" },
            });

            if (table.blink) {
              setTimeout(async () => {
                await sendMessageToMachine(`blink ${table.number}`);
              }, 100 * Number(table.number));
            }
          }
        }

        return { ...table, remainingTime };
      }),
    );

    mainWindow.webContents.send("update_table_list", updatedTables);
  }, 1000);
};

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

  ipcMain.handle("table_list_only", async () => {
    const tables = await await prisma.tableBilliard.findMany();

    return Responses({
      code: 200,
      data: tables,
    });
  });

  ipcMain.handle("table_list", async () => {
    const tables = await prisma.tableBilliard.findMany({
      include: {
        bookings: {
          take: 1,
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    const now = new Date();
    const tablesWithFormattedTime = tables.map((table) => {
      let remainingTime = "00:00:00";

      if (table.timer) {
        const secondsRemaining = Math.max(
          0,
          Math.floor((table.timer.getTime() - now.getTime()) / 1000),
        );
        remainingTime = formatTime(secondsRemaining);
      }

      return { ...table, remainingTime };
    });

    return { code: 200, data: tablesWithFormattedTime };
  });

  ipcMain.handle("total_booking", async () => {
    try {
      const total_all = await prisma.tableBilliard.count();
      const total_used = await prisma.tableBilliard.count({
        where: {
          NOT: [
            {
              status: "AVAILABLE",
            },
          ],
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

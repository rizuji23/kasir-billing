import { BrowserWindow, ipcMain } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";
import { sendMessageToMachine } from "./machine.js";
import { PriceBilling } from "../types/index.js";
import WebSocket, { WebSocketServer } from "ws";
import { getLocalIPAddress } from "./networks/network_scan.js";

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

export const updateTimers = async (
  mainWindow: BrowserWindow,
  wss: WebSocketServer,
) => {
  setInterval(async () => {
    const broadcast = (data: unknown) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    };

    const tables = await prisma.tableBilliard.findMany({
      include: {
        bookings: {
          take: 1,
          orderBy: {
            created_at: "desc",
          },
          include: {
            detail_booking: {
              orderBy: {
                end_duration: "desc",
              },
            },
            price_type: true,
          },
        },
      },
    });

    const now = new Date();
    const updatedTables = await Promise.all(
      tables.map(async (table) => {
        let remainingTime = "00:00:00";

        // if (table.status === "EXPIRE" && table.power !== "OFF") {
        //   setTimeout(async () => {
        //     await sendMessageToMachine(`off ${table.number}`);
        //   }, 100 * Number(table.number));

        //   await prisma.tableBilliard.update({
        //     where: { id: table.id },
        //     data: { status: "EXPIRE", timer: null, power: "OFF" },
        //   });
        // }

        if (table.type_play === "REGULAR" && table.timer) {
          // Countdown mode for REGULAR play
          const secondsRemaining = Math.max(
            0,
            Math.floor((table.timer.getTime() - now.getTime()) / 1000),
          );

          remainingTime = formatTime(secondsRemaining);

          if (secondsRemaining <= 0 && table.status !== "EXPIRE") {
            setTimeout(async () => {
              sendMessageToMachine(`off ${table.number}`).then(async () => {
                await prisma.tableBilliard.update({
                  where: { id: table.id },
                  data: { status: "EXPIRE", timer: null, power: "OFF" },
                });
              });
            }, 100 * Number(table.number));
          } else if (
            secondsRemaining <= 300 &&
            table.status !== "MOSTLYEXPIRE"
          ) {
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
        } else if (
          table.type_play === "LOSS" &&
          table.status === "USED" &&
          table.bookings.length > 0
        ) {
          // Count forward mode for LOSS play (starting from created_at)
          const startTime = new Date(table.bookings[0].created_at);
          const secondsElapsed = Math.floor(
            (now.getTime() - startTime.getTime()) / 1000,
          );
          remainingTime = formatTime(secondsElapsed);

          // Check if 1 hour 15 minutes (4500 seconds) has passed since the last detailBilling entry
          const lastBilling = table.bookings[0].detail_booking[0]; // Last detailBilling entry
          const lastBillingTime = lastBilling
            ? new Date(lastBilling.end_duration)
            : startTime;

          if ((now.getTime() - lastBillingTime.getTime()) / 1000 >= 60) {
            // const formattedTime = now
            //   .toLocaleTimeString("id-ID", {
            //     hour: "2-digit",
            //     minute: "2-digit",
            //     second: "2-digit",
            //     hour12: false,
            //   })
            //   .replace(/\./g, ":"); // Replace dots with colons
            // const price = await getPriceByShift(
            //   table.bookings[0].price_type?.type_price || "",
            //   formattedTime,
            // );
            // Save a new billing entry
            // if (price) {
            //   await prisma.detailBooking.create({
            //     data: {
            //       bookingId: table.bookings[0].id,
            //       start_duration: lastBillingTime,
            //       end_duration: now,
            //       duration: 1,
            //       price: price.price,
            //     },
            //   });
            // }
          }
        }

        return { ...table, remainingTime };
      }),
    );

    const cashier_name = await prisma.settings.findFirst({
      where: {
        id_settings: "CASHIER_NAME",
      },
    });

    broadcast({
      type: "table_status",
      ip: getLocalIPAddress(),
      data: updatedTables,
      name: cashier_name?.content || "Uknown",
    });

    mainWindow.webContents.send("update_table_list", updatedTables);
  }, 1000);
};

// async function getCurrentShiftByTime(timeString: string) {
//   const now = new Date();
//   if (timeString) {
//     const [hours, minutes, seconds] = timeString.split(":").map(Number);
//     now.setHours(hours, minutes, seconds || 0);
//   }

//   const currentTime = now.getHours() * 60 + now.getMinutes();
//   const shifts = await prisma.shift.findMany();

//   const activeShift = shifts.find((shift) => {
//     const start = new Date(shift.start_hours);
//     const end = new Date(shift.end_hours);

//     const startMinutes = start.getHours() * 60 + start.getMinutes();
//     const endMinutes = end.getHours() * 60 + end.getMinutes();

//     if (startMinutes < endMinutes) {
//       return currentTime >= startMinutes && currentTime < endMinutes;
//     } else {
//       return currentTime >= startMinutes || currentTime < endMinutes;
//     }
//   });

//   return activeShift;
// }

export const getPriceByShift = async (
  type_price: string,
  time: string,
): Promise<PriceBilling | null> => {
  try {
    // Convert time string (HH:MM:SS) into total minutes of the day
    const [hours, minutes] = time.split(":").map(Number);
    const currentMinutes = hours * 60 + minutes;

    // Fetch type pricing
    const type_pricing = await prisma.priceBillingType.findFirst({
      where: { type_price },
    });

    if (!type_pricing) {
      console.log("ERROR type_pricing");
      return null;
    }

    // Fetch all price records for the type
    const prices = await prisma.priceBilling.findMany({
      where: { type_price_id: type_pricing.id },
    });

    // Find the correct price based on `start_from` and `end_from`
    const activePrice = prices.find((price) => {
      if (!price.start_from || !price.end_from) return false;

      const [startH, startM] = price.start_from.split(":").map(Number);
      const [endH, endM] = price.end_from.split(":").map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (startMinutes < endMinutes) {
        // Normal case: shift is within the same day (e.g., 08:00 - 18:00)
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      } else {
        // Cross-midnight case (e.g., 22:00 - 04:00)
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      }
    });

    return activePrice as unknown as PriceBilling;
  } catch (err) {
    console.log("err", err);
    return null;
  }
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

  ipcMain.handle("table_list_only", async () => {
    const tables = await prisma.tableBilliard.findMany();

    return Responses({
      code: 200,
      data: tables,
    });
  });

  ipcMain.handle("table_list_not_used", async () => {
    const tables = await prisma.tableBilliard.findMany({
      where: {
        status: "AVAILABLE",
      },
    });

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
      const price = await getPriceByShift(type_price, time);

      return Responses({ code: 200, data: price });
    } catch (err) {
      return Responses({
        code: 500,
        detail_message: `Terjadi Kesalahan: ${(err as Error).message}`,
      });
    }
  });
}

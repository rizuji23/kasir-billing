import { BrowserWindow, ipcMain } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";
import { sendMessageToMachine } from "./machine.js";
import { PriceBilling } from "../types/index.js";
import { getShift } from "../lib/utils.js";
import WebSocket, { WebSocketServer } from "ws";
import { getLocalIPAddress } from "./networks/network_scan.js";
import { sendTableStatusToExternalWss } from "./table_status_wss.js";

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
    const now = new Date();
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

          // const secondsRemaining = Math.max(
          //   0,
          //   Math.floor(((now.getTime() + 100000) - now.getTime()) / 1000),
          // );

          remainingTime = formatTime(secondsRemaining);

          if (secondsRemaining <= 0 && table.status !== "EXPIRE") {
            await prisma.tableBilliard.update({
              where: { id: table.id },
              data: { status: "EXPIRE", timer: null, power: "OFF" },
            });
            await sendMessageToMachine(`off ${table.number}`);
          } else if (
            secondsRemaining <= 300 &&
            table.status !== "MOSTLYEXPIRE"
          ) {
            await prisma.tableBilliard.update({
              where: { id: table.id },
              data: { status: "MOSTLYEXPIRE" },
            });

            if (table.blink) {
              await sendMessageToMachine(`blink ${table.number}`);
            }
          }
        } else if (
          table.type_play === "LOSS" &&
          table.status === "USED" &&
          table.bookings.length > 0
        ) {
          const sortedDetails = [...table.bookings[0].detail_booking].sort(
            (a, b) => b.end_duration.getTime() - a.end_duration.getTime(),
          );

          const lastRegular = sortedDetails.find((db) => db.price >= 20000);
          const firstLoss = [...sortedDetails]
            .reverse()
            .find((db) => db.price < 20000);

          // 1. Tentukan Titik Awal Timer (Anchor Time)
          let anchorTime: Date;
          if (table.timer) {
            // Gunakan waktu persis saat tombol transisi ditekan
            anchorTime = new Date(table.timer);
          } else if (firstLoss) {
            anchorTime = new Date(firstLoss.start_duration);
          } else if (lastRegular) {
            anchorTime = new Date(lastRegular.end_duration);
          } else {
            anchorTime = new Date(table.bookings[0].created_at);
          }

          const secondsElapsed = Math.max(
            0,
            Math.floor((now.getTime() - anchorTime.getTime()) / 1000),
          );
          remainingTime = formatTime(secondsElapsed);

          // Automatic Billing for LOSS
          const localizedNow = new Date(
            now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
          );
          const currentShiftStr = await getShift(localizedNow);
          const isSiang =
            currentShiftStr?.toLowerCase() === "siang" ||
            currentShiftStr?.toLowerCase() === "pagi";

          const minutesKey = isSiang
            ? "LOSS_RATE_SIANG_MINUTES"
            : "LOSS_RATE_MALAM_MINUTES";
          const priceKey = isSiang
            ? "LOSS_RATE_SIANG_PRICE"
            : "LOSS_RATE_MALAM_PRICE";

          const [rateSetting, priceSetting] = await Promise.all([
            prisma.settings.findFirst({ where: { id_settings: minutesKey } }),
            prisma.settings.findFirst({ where: { id_settings: priceKey } }),
          ]);

          const incrementMinutes = Math.max(
            1,
            rateSetting ? parseInt(rateSetting.content || "2") : 2,
          );
          const priceValue = priceSetting
            ? parseInt(priceSetting.content || "6000")
            : 6000;

          // 2. Tentukan Patokan Penagihan (Last Billing Time)
          const lastBilling = table.bookings[0].detail_booking[0];
          let lastBillingTime: Date;

          if (firstLoss && lastBilling) {
            // Jika sudah masuk siklus LOSS, hitung dari akhir durasi billing terakhir
            lastBillingTime = new Date(lastBilling.end_duration);
          } else if (table.timer) {
            // Jika baru pertama kali transisi ke LOSS, mulai siklus penagihan dari detik ini
            lastBillingTime = new Date(table.timer);
          } else {
            // Fallback
            lastBillingTime = lastBilling
              ? new Date(lastBilling.end_duration)
              : new Date(table.bookings[0].created_at);
          }

          if (now.getTime() >= lastBillingTime.getTime()) {
            const diffMs = now.getTime() - lastBillingTime.getTime();
            const missingUnits =
              Math.floor(diffMs / (incrementMinutes * 60 * 1000)) + 1;

            let currentLastEnd = lastBillingTime;
            for (let i = 0; i < missingUnits; i++) {
              const startSlot = new Date(currentLastEnd.getTime());
              const endSlot = new Date(
                startSlot.getTime() + incrementMinutes * 60 * 1000,
              );

              await prisma.detailBooking.create({
                data: {
                  bookingId: table.bookings[0].id,
                  start_duration: startSlot,
                  end_duration: endSlot,
                  duration: 1,
                  status: "NOPAID",
                  price: priceValue,
                  shift: currentShiftStr || "Pagi",
                },
              });
              currentLastEnd = endSlot;
            }

            await prisma.booking.update({
              where: { id: table.bookings[0].id },
              data: {
                total_price: { increment: priceValue * missingUnits },
              },
            });

            table.bookings[0].total_price += priceValue * missingUnits;
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
    await sendTableStatusToExternalWss({
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
    const rawNow = new Date();
    // Localize to Jakarta
    const now = new Date(
      rawNow.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
    );
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
          include: {
            detail_booking: {
              orderBy: {
                end_duration: "desc",
              },
            },
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

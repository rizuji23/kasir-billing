import { ipcMain } from "electron";
import { prisma } from "../database.js";
import generateShortUUID from "../lib/random.js";
import Responses from "../lib/responses.js";
import { Booking, TypePlay } from "../types/index.js";
import { sendMessageToMachine } from "./machine.js";

export interface IItemPrice {
  price: number;
  duration: number;
  start_duration: Date;
  end_duration: Date;
}

export interface IDataBooking {
  type_play: string;
  name: string;
  type_price: string;
  duration: string;
  blink: string;
  id_table: string;
  id_booking?: string;
}

export interface IBookingCheckout {
  item_price: IItemPrice[];
  data_booking: IDataBooking;
  subtotal: number;
  add_duration: boolean;
}

async function checkoutBookingRegular(data: IBookingCheckout) {
  try {
    const tables = await prisma.tableBilliard.findFirst({
      where: {
        id_table: data.data_booking.id_table,
      },
    });

    if (!tables) {
      return Responses({
        code: 404,
        detail_message: "Table tidak ditemukan",
      });
    }

    const currentDate = new Date();

    await prisma.tableBilliard.update({
      where: {
        id_table: tables.id_table,
      },
      data: {
        status: "USED",
        type_play: data.data_booking.type_play as unknown as TypePlay,
        duration: (Number(tables.duration) + data.item_price.length).toString(),
        power: "ON",
        blink: data.data_booking.blink === "iya" ? true : false,
        // timer: data.item_price[data.item_price.length - 1].end_duration,
        timer: new Date(currentDate.getTime() + 5000),
      },
    });

    console.log("data.data_booking.name", data);

    const saveManyBooking = async (booking_data: Booking) => {
      await prisma.detailBooking.createMany({
        data: data.item_price.map((el) => {
          return {
            bookingId: booking_data.id,
            price: el.price,
            duration: el.duration,
            start_duration: el.start_duration,
            end_duration: el.end_duration,
          };
        }),
      });
    };

    if (data.add_duration) {
      const data_booking = await prisma.booking.findFirst({
        where: {
          id_booking: data.data_booking.id_booking || "",
        },
      });

      if (!data_booking) {
        return Responses({
          code: 404,
          detail_message: "Data Booking tidak ditemukan",
        });
      }
      console.log(
        "data.subtotal + data_booking.total_price",
        data.subtotal + data_booking.total_price,
      );
      const booking = await prisma.booking.update({
        where: {
          id_booking: data_booking.id_booking,
        },
        data: {
          duration: Number(data.data_booking.duration) + data_booking.duration,
          total_price: data.subtotal + data_booking.total_price,
        },
      });
      await saveManyBooking(booking as unknown as Booking);
    } else {
      const booking = await prisma.booking.create({
        data: {
          id_booking: generateShortUUID(),
          name: data.data_booking.name,
          tableId: tables.id,
          duration: Number(data.data_booking.duration),
          total_price: data.subtotal,
        },
      });
      await saveManyBooking(booking as unknown as Booking);
    }

    console.log("tables.id_table", tables.id_table);

    await sendMessageToMachine(`on ${tables.number}`);

    return Responses({
      code: 201,
      data: null,
    });
  } catch (err) {
    return Responses({
      code: 500,
      detail_message: `Terjadi Kesalahan: ${(err as Error).message}`,
    });
  }
}

export default function BookingModule() {
  ipcMain.handle("booking_regular", async (_, data: IBookingCheckout) => {
    try {
      const res = await checkoutBookingRegular(data);
      return res;
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

  ipcMain.handle(
    "change_name",
    async (_, data: { id_booking: string; name: string }) => {
      try {
        const change_name = await prisma.booking.update({
          where: {
            id_booking: data.id_booking,
          },
          data: {
            name: data.name,
          },
        });

        return Responses({
          code: 201,
          data: change_name,
          detail_message: "Pesanan berhasil dibuat",
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

  ipcMain.handle("detail_booking", async (_, id_table: string) => {
    try {
      const table = await prisma.tableBilliard.findFirst({
        where: {
          id_table: id_table,
        },
      });

      if (!table) {
        return Responses({
          code: 404,
          detail_message: "Table tidak ditemukan",
        });
      }

      const booking = await prisma.booking.findFirst({
        where: {
          tableId: table.id,
        },
        include: {
          detail_booking: true,
          order_cafe: {
            include: {
              orderCafeItem: true,
              menucafe: true,
            },
            orderBy: {
              created_at: "desc",
            },
          },
        },
      });

      if (!booking) {
        return Responses({
          code: 404,
          detail_message: "Booking tidak ditemukan",
        });
      }

      return Responses({
        code: 200,
        data: {
          table: table,
          booking: booking,
        },
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
  });
}

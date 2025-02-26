import { ipcMain } from "electron";
import { prisma } from "../database.js";
import generateShortUUID from "../lib/random.js";
import Responses from "../lib/responses.js";
import { TypePlay } from "../types/index.js";
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
}

export interface IBookingCheckout {
  item_price: IItemPrice[];
  data_booking: IDataBooking;
  subtotal: number;
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
        code: 400,
        detail_message: "Table tidak ditemukan",
      });
    }

    await prisma.tableBilliard.update({
      where: {
        id_table: tables.id_table,
      },
      data: {
        status: "USED",
        type_play: data.data_booking.type_play as unknown as TypePlay,
        duration: data.item_price.length.toString(),
        power: "ON",
        blink: data.data_booking.blink === "iya" ? true : false,
        timer: data.item_price[data.item_price.length - 1].end_duration,
      },
    });

    console.log("data.data_booking.name", data);

    const booking = await prisma.booking.create({
      data: {
        id_booking: generateShortUUID(),
        name: data.data_booking.name,
        tableId: tables.id,
        duration: Number(data.data_booking.duration),
        total_price: data.subtotal,
      },
    });

    console.log(
      "DD",
      data.item_price.map((el) => {
        return {
          bookingId: booking.id,
          price: el.price,
          duration: el.duration,
          start_duration: el.start_duration,
          end_duration: el.end_duration,
        };
      }),
    );

    await prisma.detailBooking.createMany({
      data: data.item_price.map((el) => {
        return {
          bookingId: booking.id,
          price: el.price,
          duration: el.duration,
          start_duration: el.start_duration,
          end_duration: el.end_duration,
        };
      }),
    });

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
}

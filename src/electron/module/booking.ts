import { dialog, ipcMain } from "electron";
import { prisma } from "../database.js";
import generateShortUUID from "../lib/random.js";
import Responses from "../lib/responses.js";
import {
  Booking,
  IPaymentData,
  PaymentMethodCasierType,
  StatusTransaction,
  Struk,
  TableBilliard,
  TypeCustomer,
  TypePlay,
  TypeStruk,
} from "../types/index.js";
import { sendMessageToMachine } from "./machine.js";
import { StrukWindow } from "./struk.js";
import { getShift } from "../lib/utils.js";

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
  type_customer?: string;
  kode_member?: string;
  id_paket_segment?: string;
  id_paket_price?: string;
}

export interface IBookingCheckout {
  item_price: IItemPrice[];
  data_booking: IDataBooking;
  subtotal: number;
  add_duration: boolean;
}

async function checkoutBookingLossRegular(data: IBookingCheckout) {
  try {
    const [tables, type_price] = await Promise.all([
      prisma.tableBilliard.findFirst({
        where: {
          id_table: data.data_booking.id_table,
        },
      }),
      prisma.priceBillingType.findFirst({
        where: {
          type_price: data.data_booking.type_price,
        },
      }),
    ]);

    if (!tables) {
      return Responses({
        code: 404,
        detail_message: "Table tidak ditemukan",
      });
    }

    if (!type_price) {
      return Responses({
        code: 404,
        detail_message: "Price Billing Type tidak ditemukan",
      });
    }

    const currentDate = new Date();
    const shift = await getShift(currentDate);


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
        // KODE LAMA:
        // timer: data.item_price.length > 0 
        //   ? data.item_price[data.item_price.length - 1].end_duration 
        //   : null,
        
        // KODE BARU:
        timer: data.data_booking.type_play === "LOSS" 
          ? currentDate // Jika LOSS, simpan detik persis saat ini untuk titik 00:00:00
          : (data.item_price.length > 0 
            ? new Date(data.item_price[data.item_price.length - 1].end_duration)
            : null),
      },
    });

    console.log("data.data_booking.name", data);

    const saveManyBooking = async (
      booking_data: Booking,
      type_customer: "BIASA" | "MEMBER" | "PAKET",
    ) => {
      try {
        const isLoss = data.data_booking.type_play === "LOSS";
        
        const data_booking_many = await Promise.all(
          data.item_price.map(async (el) => {
            const shift = await getShift(el.start_duration);
            
            // Backend Price Enforcement: If mode is LOSS, use shift-based price regardless of what frontend sent
            let correctedPrice = el.price;
            if (isLoss) {
               const isSiang = shift?.toLowerCase() === "siang" || shift?.toLowerCase() === "pagi";
               const priceSetting = await prisma.settings.findFirst({
                 where: { id_settings: isSiang ? "LOSS_RATE_SIANG_PRICE" : "LOSS_RATE_MALAM_PRICE" }
               });
               correctedPrice = priceSetting ? parseInt(priceSetting.content || "6000") : 6000;
               console.log(`[CHECKOUT_ENFORCE] Segment Price: ${el.price} -> ${correctedPrice} (LOSS)`);
            }

            return {
              bookingId: booking_data.id,
              price: correctedPrice,
              duration: el.duration,
              start_duration: el.start_duration,
              end_duration: el.end_duration,
              shift: shift || "Pagi",
              idPaketPrice:
                type_customer === "PAKET" ? booking_data.idPaketPrice : null,
            };
          }),
        );

        // Overlap Prevention: filter out segments that conflict with existing ones
        const existingSegments = await prisma.detailBooking.findMany({
          where: { bookingId: booking_data.id },
          select: { start_duration: true, end_duration: true },
        });

        const filtered = data_booking_many.filter(seg => {
          const newStart = new Date(seg.start_duration).getTime();
          const newEnd = new Date(seg.end_duration).getTime();
          const hasOverlap = existingSegments.some(ex => {
            const exStart = new Date(ex.start_duration).getTime();
            const exEnd = new Date(ex.end_duration).getTime();
            return newStart < exEnd && newEnd > exStart; // They overlap
          });
          if (hasOverlap) {
            console.warn(`[OVERLAP_SKIP] Skipping segment ${new Date(seg.start_duration).toLocaleTimeString()} - ${new Date(seg.end_duration).toLocaleTimeString()} (overlap detected)`);
          }
          return !hasOverlap;
        });

        if (filtered.length === 0) {
          console.warn("[OVERLAP_SKIP] All segments overlapped with existing ones. Nothing saved.");
          return;
        }

        await prisma.detailBooking.createMany({
          data: filtered,
        });

        console.log(`[SAVE_COMPLETE] ${filtered.length} segment(s) saved successfully.`);
      } catch (err) {
        console.error("Error saving bookings:", err);
        throw err;
      }
    };

    if (data.add_duration) {
      const data_booking = await prisma.booking.findFirst({
        where: {
          id_booking: data.data_booking.id_booking || "",
        },
      });

      if (!data_booking) {
        console.warn("[CHECKOUT_BACKEND] Data Booking not found");
        return Responses({
          code: 404,
          detail_message: "Data Booking tidak ditemukan",
        });
      }

      console.log(`[CHECKOUT_BACKEND] ID: ${data_booking.id_booking}, Type: ${data.data_booking.type_play}, Frontend Subtotal: ${data.subtotal}`);
        // Determine price for LOSS unit even if frontend sends 0
        let lossPriceIncrement = 0;
        let isLoss = data.data_booking.type_play === "LOSS";

        if (isLoss) {
           // Localize to Jakarta for shift detection
           const localizedDate = new Date(currentDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
           const currentShiftStr = await getShift(localizedDate);
           const isSiang = currentShiftStr?.toLowerCase() === "siang" || currentShiftStr?.toLowerCase() === "pagi";
           const priceSetting = await prisma.settings.findFirst({
             where: { id_settings: isSiang ? "LOSS_RATE_SIANG_PRICE" : "LOSS_RATE_MALAM_PRICE" }
           });
           lossPriceIncrement = priceSetting ? parseInt(priceSetting.content || "6000") : 6000;
           console.log(`[LOSS_ACTION] Update Shift: ${currentShiftStr}, isSiang: ${isSiang}, Price: ${lossPriceIncrement}`);
        }

        // Step 1: Save the segments first (overlap check filters duplicates)
        // We compute the actual saved count so we can accurately update total_price.
        let actualSavedCount = 0;
        {
          const isLoss = data.data_booking.type_play === "LOSS";
          const existingSegments = await prisma.detailBooking.findMany({
            where: { bookingId: data_booking.id },
            select: { start_duration: true, end_duration: true },
          });

          const filtered = data.item_price.filter(seg => {
            const newStart = new Date(seg.start_duration).getTime();
            const newEnd = new Date(seg.end_duration).getTime();
            const hasOverlap = existingSegments.some(ex => {
              const exStart = new Date(ex.start_duration).getTime();
              const exEnd = new Date(ex.end_duration).getTime();
              return newStart < exEnd && newEnd > exStart;
            });
            if (hasOverlap) {
              console.warn(`[OVERLAP_SKIP] Skipping segment ${new Date(seg.start_duration).toLocaleTimeString()}`);
            }
            return !hasOverlap;
          });

          actualSavedCount = filtered.length;
          console.log(`[SAVE_PREP] Total: ${data.item_price.length}, Filtered (to save): ${actualSavedCount}`);

          if (actualSavedCount > 0) {
            // Enforce LOSS price at save time
            const segmentsToSave = await Promise.all(filtered.map(async (el) => {
              const segShift = await getShift(el.start_duration);
              let correctedPrice = el.price;
              if (isLoss) {
                const isSiang = segShift?.toLowerCase() === "siang" || segShift?.toLowerCase() === "pagi";
                const priceSetting = await prisma.settings.findFirst({
                  where: { id_settings: isSiang ? "LOSS_RATE_SIANG_PRICE" : "LOSS_RATE_MALAM_PRICE" }
                });
                correctedPrice = priceSetting ? parseInt(priceSetting.content || "6000") : 6000;
              }
              return {
                bookingId: data_booking.id,
                price: correctedPrice,
                duration: el.duration,
                start_duration: el.start_duration,
                end_duration: el.end_duration,
                shift: segShift || "Pagi",
                idPaketPrice: null,
              };
            }));

            await prisma.detailBooking.createMany({ data: segmentsToSave });
            console.log(`[SAVE_COMPLETE] ${actualSavedCount} segment(s) created.`);
          }
        }

        if (actualSavedCount === 0) {
          console.warn("[SKIP_UPDATE] No segments saved, skipping Booking update.");
          return Responses({ code: 200, detail_message: "No new segments to add (all overlapped)." });
        }

        // Step 2: Update Booking after segments are confirmed
        // For LOSS, price increment = lossPriceIncrement * actualSavedCount
        // For REGULAR, use data.subtotal (sum of all hour prices)
        const effectivePriceAdd = isLoss 
          ? lossPriceIncrement * actualSavedCount 
          : data.subtotal;

        const booking = await prisma.booking.update({
          where: {
            id_booking: data_booking.id_booking,
          },
          data: {
            // LOSS: duration stays as-is (hours, not minutes)
            duration: isLoss ? data_booking.duration : Number(data.data_booking.duration) + data_booking.duration,
            total_price: effectivePriceAdd + data_booking.total_price,
            type_play: data.data_booking.type_play as unknown as TypePlay,
            idPriceType: type_price.id,
          },
          include: {
            detail_booking: {
              orderBy: {
                end_duration: "desc",
              },
              take: 1,
            },
          },
        });

        console.log(`[BOOKING_UPDATE] total_price: ${data_booking.total_price} + ${effectivePriceAdd} = ${booking.total_price}`);

        return Responses({ code: 200, data: booking, detail_message: "Berhasil menambahkan durasi" });

    } else {
      const booking_data = {
        id_booking: generateShortUUID(),
        name: data.data_booking.name,
        tableId: tables.id,
        duration: Number(data.data_booking.duration),
        total_price: data.subtotal,
        type_play: data.data_booking.type_play as unknown as TypePlay,
        idPriceType: type_price.id,
        shift: shift || "Pagi",
        type_customer: data.data_booking
          .type_customer as unknown as TypeCustomer,
        idPaketPrice: null as unknown as number | null,
        created_at: currentDate,
      };

      if (data.data_booking.type_customer === "PAKET") {
        const get_paket = await prisma.paketPrice.findFirst({
          where: {
            id_paket_price: data.data_booking.id_paket_price,
          },
        });

        if (!get_paket) {
          return Responses({
            code: 404,
            detail_message: "Paket tidak ditemukan",
          });
        }

        booking_data["idPaketPrice"] = get_paket.id;
      }

      const booking = await prisma.booking.create({
        data: booking_data,
      });

      if (data.data_booking.type_play !== "LOSS") {
        await saveManyBooking(
          booking as unknown as Booking,
          data.data_booking.type_customer as unknown as TypeCustomer,
        );
      } else {
        const startSlot = new Date(currentDate.getTime());
        
        const currentShiftStr = await getShift(startSlot);
        const isSiang = currentShiftStr?.toLowerCase() === "siang" || currentShiftStr?.toLowerCase() === "pagi";
        
        const incrementSetting = await prisma.settings.findFirst({
          where: { id_settings: isSiang ? "LOSS_RATE_SIANG_MINUTES" : "LOSS_RATE_MALAM_MINUTES" }
        });
        const incrementMinutes = incrementSetting ? parseInt(incrementSetting.content || "2") : 2;

        const priceSetting = await prisma.settings.findFirst({
          where: { id_settings: isSiang ? "LOSS_RATE_SIANG_PRICE" : "LOSS_RATE_MALAM_PRICE" }
        });
        const priceValue = priceSetting ? parseInt(priceSetting.content || "6000") : 6000;
        
        const endSlot = new Date(
          startSlot.getTime() + incrementMinutes * 60 * 1000,
        );

        await prisma.detailBooking.create({
          data: {
            bookingId: booking.id,
            price: priceValue,
            duration: 1,
            status: "NOPAID",
            start_duration: startSlot,
            end_duration: endSlot,
            shift: currentShiftStr || shift || "Pagi",
          },
        });
      }
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

async function checkoutTableDone(table: TableBilliard) {
  try {
    await prisma.tableBilliard.update({
      where: {
        id: table.id,
      },
      data: {
        duration: "0",
        status: "AVAILABLE",
        type_play: "NONE",
        timer: null,
        power: "OFF",
        blink: false,
      },
    });

    await sendMessageToMachine(`off ${table.number}`);
    return true;
  } catch (err) {
    return err;
  }
}

async function createUpdateStruk(
  types: "update" | "create",
  booking_update: Booking,
  struk: number | null,
  data: IPaymentData,
  is_paid = true,
): Promise<unknown> {
  try {
    const currentTime = new Date();
    const shift = await getShift(currentTime);

    const data_new = {
      name: booking_update.name,
      total: data.total?.total_all || 0,
      total_billing: data.total?.total_billing || 0,
      total_cafe: data.total?.total_cafe || 0,
      cash: Number(data.payment_cash || "0"),
      change: data.change,
      payment_method: data.payment_method as unknown as PaymentMethodCasierType,
      is_split_bill: false,
      type_struk: "TABLE" as TypeStruk,
      status: is_paid
        ? ("PAID" as StatusTransaction)
        : ("NOPAID" as StatusTransaction),
      shift: shift || "Pagi",
      subtotal: data.total?.subtotal || 0,
      subtotal_cafe: data.total?.subtotal_cafe || 0,
      subtotal_billing: data.total?.subtotal_billing || 0,
      discount_billing: data?.discount_billing || "0",
      discount_cafe: data?.discount_cafe || "0",
    };

    if (types === "create") {
      return await prisma.struk.create({
        data: {
          id_struk: `STR-${generateShortUUID()}`,
          id_booking: booking_update.id,
          ...data_new,
        },
      });
    } else {
      return await prisma.struk.update({
        where: {
          id: struk || undefined,
        },
        data: data_new,
      });
    }
  } catch (err) {
    return err;
  }
}

export default function BookingModule() {
  ipcMain.handle("booking_regular", async (_, data: IBookingCheckout) => {
    try {
      const res = await checkoutBookingLossRegular(data);
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
          detail_booking: {
            include: {
              paket: true,
            },
          },
          price_type: true,
          order_cafe: {
            include: {
              orderCafeItem: true,
              menucafe: true,
            },
            orderBy: {
              created_at: "desc",
            },
            where: {
              status: {
                not: {
                  in: ["RESET"],
                },
              },
              status_kitchen: {
                not: {
                  in: ["CANCEL", "REJECT"],
                },
              },
            },
          },
          paket: true,
        },
        orderBy: {
          created_at: "desc",
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

  ipcMain.handle("payment_booking", async (_, data: IPaymentData) => {
    try {
      console.log("Data", data);
      let id_struk = "";
      const [booking, table] = await Promise.all([
        prisma.booking.findFirst({
          where: {
            id_booking: data.id_booking,
          },
        }),
        prisma.tableBilliard.findFirst({
          where: {
            id_table: data.id_table,
          },
        }),
      ]);

      if (!booking) {
        return Responses({
          code: 404,
          detail_message: "Booking tidak ditemukan",
        });
      }

      if (!table) {
        return Responses({
          code: 404,
          detail_message: "Table tidak ditemukan",
        });
      }

      const struk = await prisma.struk.findFirst({
        where: {
          id_booking: booking.id,
          is_split_bill: false,
        },
      });

      // if struk is empty
      if (data.is_split_bill === false) {
        console.log("SPLIT", false);
        // update booking first
        const booking_update = await prisma.booking.update({
          where: {
            id: booking.id,
          },
          data: {
            payment_method:
              data.payment_method as unknown as PaymentMethodCasierType,
            status: "PAID",
          },
        });

        // update all booking detail
        await Promise.all([
          // update order cafe
          prisma.detailBooking.updateMany({
            where: {
              bookingId: booking.id,
            },
            data: {
              status: "PAID",
            },
          }),
          prisma.orderCafe.updateMany({
            where: {
              bookingId: booking.id,
              status: {
                not: {
                  in: ["RESET"],
                },
              },
              status_kitchen: {
                not: {
                  in: ["CANCEL", "REJECT"],
                },
              },
            },
            data: {
              payment_method:
                data.payment_method as unknown as PaymentMethodCasierType,
              status: "PAID",
            },
          }),
        ]);

        if (!struk) {
          // create new struk
          const struk_create = await createUpdateStruk(
            "create",
            booking_update as unknown as Booking,
            null,
            data,
          );

          if (!struk_create) {
            return Responses({
              code: 500,
              detail_message: "Error saat membuat struk",
            });
          }

          id_struk = (struk_create as unknown as Struk).id_struk;

          // await StrukWindow((struk_create as unknown as Struk).id_struk);
        } else {
          // update struk
          const struk_update = await createUpdateStruk(
            "update",
            booking_update as unknown as Booking,
            struk.id,
            data,
          );

          if (!struk_update) {
            return Responses({
              code: 500,
              detail_message: "Error saat update struk",
            });
          }

          id_struk = (struk_update as unknown as Struk).id_struk;
          // await StrukWindow((struk_update as unknown as Struk).id_struk);
        }

        const check_out_table = await checkoutTableDone(
          table as unknown as TableBilliard,
        );

        if (!check_out_table) {
          return Responses({
            code: 500,
            detail_message: "Error saat mematikan table",
          });
        }
      }

      return Responses({
        code: 201,
        data: {
          id_struk: id_struk,
        },
      });
    } catch (err) {
      console.log("err", err);
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Terjadi Kesalahan: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
    }
  });

  ipcMain.handle("print_struk_temp", async (_, data: IPaymentData) => {
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          id_booking: data.id_booking,
        },
        include: {
          order_cafe: true,
        },
      });

      if (!booking) {
        return Responses({
          code: 404,
          detail_message: "Booking tidak ditemukan",
        });
      }

      const struk = await prisma.struk.findFirst({
        where: {
          id_booking: booking.id,
          is_split_bill: false,
        },
      });

      if (!struk) {
        // create new struk
        const struk_create = await createUpdateStruk(
          "create",
          booking as unknown as Booking,
          null,
          data,
          false,
        );

        if (!struk_create) {
          return Responses({
            code: 500,
            detail_message: "Error saat membuat struk",
          });
        }

        await StrukWindow((struk_create as unknown as Struk).id_struk);
      } else {
        // update struk
        const struk_update = await createUpdateStruk(
          "update",
          booking as unknown as Booking,
          struk.id,
          data,
          false,
        );

        if (!struk_update) {
          return Responses({
            code: 500,
            detail_message: "Error saat update struk",
          });
        }

        await StrukWindow((struk_update as unknown as Struk).id_struk);
      }

      return Responses({
        code: 201,
        data: null,
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

  ipcMain.handle(
    "reset_table",
    async (_, id_booking: string, id_table: string) => {
      try {
        const tables = await prisma.tableBilliard.findFirst({
          where: {
            id_table: id_table,
          },
        });

        const booking = await prisma.booking.findFirst({
          where: {
            id_booking: id_booking,
          },
          include: {
            order_cafe: true,
          },
        });

        if (!tables) {
          return Responses({
            code: 404,
            detail_message: "Table tidak ditemukan",
          });
        }

        if (!booking) {
          return Responses({
            code: 404,
            detail_message: "Booking tidak ditemukan",
          });
        }

        if (booking.order_cafe.length !== 0) {
          dialog.showErrorBox(
            "Reset table tidak bisa dilakukan",
            "Saat ini table ditemukan memiliki order cafe, jika order cafe ditemukan maka tidak bisa melakukan reset table!",
          );
          return Responses({
            code: 400,
            detail_message: "Reset tidak dapat dilakukan",
          });
        }

        const struk = await prisma.struk.findFirst({
          where: {
            id_booking: booking.id,
          },
        });

        if (struk) {
          await prisma.struk.updateMany({
            where: {
              id_booking: booking.id,
            },
            data: {
              status: "RESET",
            },
          });
        }

        await prisma.booking.update({
          where: {
            id_booking: booking.id_booking,
          },
          data: {
            status: "RESET",
          },
        });

        await prisma.detailBooking.updateMany({
          where: {
            bookingId: booking.id,
          },
          data: {
            status: "RESET",
          },
        });

        const check_out_table = await checkoutTableDone(
          tables as unknown as TableBilliard,
        );

        if (!check_out_table) {
          return Responses({
            code: 500,
            detail_message: "Error saat mematikan table",
          });
        }

        return Responses({
          code: 201,
          data: null,
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

  ipcMain.handle(
    "change_table",
    async (
      _,
      id_curr_table: string,
      id_to_table: string,
      id_booking: string,
    ) => {
      try {
        const [tables_curr, tables_move] = await Promise.all([
          await prisma.tableBilliard.findFirst({
            where: {
              id_table: id_curr_table,
            },
          }),
          await prisma.tableBilliard.findFirst({
            where: {
              id_table: id_to_table,
            },
          }),
        ]);

        const booking = await prisma.booking.findFirst({
          where: {
            id_booking: id_booking,
          },
        });

        if (!booking) {
          return Responses({
            code: 400,
            detail_message: "Booking tidak ditemukan",
          });
        }

        if (!tables_curr || !tables_move) {
          return Responses({
            code: 400,
            detail_message: "Table tidak ditemukan",
          });
        }

        // move to table move
        await prisma.tableBilliard.update({
          where: {
            id: tables_move.id,
          },
          data: {
            duration: tables_curr.duration,
            status: tables_curr.status,
            type_play: tables_curr.type_play,
            timer: tables_curr.timer,
            power: tables_curr.power,
            blink: tables_curr.blink,
          },
        });

        if (tables_curr.status === "USED") {
          await sendMessageToMachine(`on ${tables_move.number}`);
        }

        // set to default table curr
        await prisma.tableBilliard.update({
          where: {
            id: tables_curr.id,
          },
          data: {
            duration: "0",
            status: "AVAILABLE",
            type_play: "NONE",
            timer: null,
            power: "OFF",
            blink: false,
          },
        });

        setTimeout(async () => {
          await sendMessageToMachine(`off ${tables_curr.number}`);
        }, 1500);

        // set booking to move table
        await prisma.booking.update({
          where: {
            id: booking.id,
          },
          data: {
            tableId: tables_move.id,
          },
        });

        return Responses({
          code: 201,
          detail_message: "Table berhasil dipindahkan",
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
}

import { ipcMain } from "electron";
import Responses from "../lib/responses.js";
import { prisma } from "../database.js";

export default function PriceModule() {
  ipcMain.handle("get_price_list", async () => {
    try {
      const res = await prisma.priceBilling.findMany({
        include: {
          type_price: true,
        },
      });

      return Responses({ code: 200, data: res });
    } catch (err) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal mengambil data user: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal mengambil data user",
      });
    }
  });

  ipcMain.handle(
    "update_price",
    async (
      _,
      data: {
        id_price: string;
        price: number;
        start_from: string;
        end_from: string;
      },
    ) => {
      try {
        const get_price = await prisma.priceBilling.findFirst({
          where: {
            id_price_billing: data.id_price,
          },
        });

        if (!get_price) {
          return Responses({
            code: 400,
            detail_message: "Harga tidak ditemukan",
          });
        }

        await prisma.priceBilling.update({
          where: {
            id_price_billing: data.id_price,
          },
          data: {
            start_from: data.start_from,
            end_from: data.end_from,
            price: data.price,
          },
        });

        return Responses({
          code: 201,
          detail_message: "Harga berhasil disimpan",
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Gagal mengambil data user: ${err.message}`,
          });
        }
        return Responses({
          code: 500,
          detail_message: "Gagal mengambil data user",
        });
      }
    },
  );
}

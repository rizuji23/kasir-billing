import { ipcMain } from "electron";
import Responses from "../lib/responses.js";
import { prisma } from "../database.js";

export default function ShiftModule() {
  ipcMain.handle("get_shift", async () => {
    try {
      const shift = await prisma.shift.findMany();

      return Responses({ code: 200, data: shift });
    } catch (err) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal mengambil data shift: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal mengambil data shift",
      });
    }
  });

  ipcMain.handle(
    "update_shift",
    async (
      _,
      data: { id_shift: number; start_hours: Date; end_hours: Date },
    ) => {
      try {
        const shift = await prisma.shift.findFirst({
          where: {
            id: data.id_shift,
          },
        });

        if (!shift) {
          return Responses({
            code: 400,
            detail_message: "Shift tidak ditemukan",
          });
        }

        await prisma.shift.update({
          where: {
            id: data.id_shift,
          },
          data: {
            start_hours: data.start_hours,
            end_hours: data.end_hours,
          },
        });

        return Responses({
          code: 201,
          detail_message: "Shift berhasil diubah",
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Gagal mengubah data shift: ${err.message}`,
          });
        }
        return Responses({
          code: 500,
          detail_message: "Gagal mengubah data shift",
        });
      }
    },
  );
}

import { ipcMain } from "electron";
import Responses from "../lib/responses.js";
import { prisma } from "../database.js";
import generateShortUUID from "../lib/random.js";

export default function PaketModule() {
  ipcMain.handle("get_paket", async () => {
    try {
      const res = await prisma.paketSegment.findMany({
        include: {
          paketPrice: true,
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

  ipcMain.handle("get_paket_by_id", async (_, id: string) => {
    try {
      const res = await prisma.paketSegment.findFirst({
        where: {
          id_paket_segment: id,
        },
        include: {
          paketPrice: true,
        },
      });

      if (!res) {
        return Responses({
          code: 400,
          detail_message: "Paket Segment tidak ditemukan",
        });
      }

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
    "save_paket_segment",
    async (
      _,
      data: {
        name: string;
        start_hours: string;
        end_hours: string;
      },
    ) => {
      try {
        await prisma.paketSegment.create({
          data: {
            ...data,
            id_paket_segment: generateShortUUID(),
          },
        });

        return Responses({
          code: 201,
          detail_message: "paket segment berhasil disimpan",
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

  ipcMain.handle(
    "update_paket_segment",
    async (
      _,
      data: {
        id_paket_segment: string;
        name: string;
        start_hours: string;
        end_hours: string;
      },
    ) => {
      try {
        await prisma.paketSegment.update({
          where: {
            id_paket_segment: data.id_paket_segment,
          },
          data: {
            ...data,
          },
        });

        return Responses({
          code: 201,
          detail_message: "paket segment berhasil diubah",
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

  ipcMain.handle(
    "save_paket",
    async (
      _,
      data: {
        id_paket_segment: string;
        name: string;
        duration: number;
        price: number;
        is_last_call?: boolean;
        last_call_hours?: string;
      },
    ) => {
      try {
        const paket_segment = await prisma.paketSegment.findFirst({
          where: {
            id_paket_segment: data.id_paket_segment,
          },
        });

        if (!paket_segment) {
          return Responses({
            code: 400,
            detail_message: "Paket Segment tidak ditemukan",
          });
        }

        await prisma.paketPrice.create({
          data: {
            id_paket_price: generateShortUUID(),
            name: data.name,
            duration: data.duration,
            price: data.price,
            is_last_call: data.is_last_call,
            last_call_hours: data.last_call_hours,
            paket_segment_id: paket_segment.id,
          },
        });

        return Responses({
          code: 201,
          detail_message: "paket berhasil disimpan",
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

  ipcMain.handle(
    "update_paket",
    async (
      _,
      data: {
        id_paket_segment: string;
        name: string;
        duration: number;
        price: number;
        is_last_call?: boolean;
        last_call_hours?: string;
        id_paket: string;
      },
    ) => {
      try {
        const paket_segment = await prisma.paketSegment.findFirst({
          where: {
            id_paket_segment: data.id_paket_segment,
          },
        });

        if (!paket_segment) {
          return Responses({
            code: 400,
            detail_message: "Paket Segment tidak ditemukan",
          });
        }

        await prisma.paketPrice.update({
          where: {
            id_paket_price: data.id_paket,
          },
          data: {
            name: data.name,
            duration: data.duration,
            price: data.price,
            is_last_call: data.is_last_call,
            last_call_hours: data.last_call_hours,
          },
        });

        return Responses({
          code: 201,
          detail_message: "paket berhasil diubah",
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

  ipcMain.handle("delete_paket_segment", async (_, id: string) => {
    try {
      await prisma.paketSegment.delete({
        where: {
          id_paket_segment: id,
        },
      });

      return Responses({
        code: 201,
        detail_message: "paket segment berhasil dihapus",
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
  });

  ipcMain.handle("delete_paket", async (_, id: string) => {
    try {
      await prisma.paketPrice.delete({
        where: {
          id_paket_price: id,
        },
      });

      return Responses({
        code: 201,
        detail_message: "paket berhasil dihapus",
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
  });
}

import { ipcMain } from "electron";
import Responses from "../lib/responses.js";
import { prisma } from "../database.js";
import generateShortUUID from "../lib/random.js";

interface DataVoucher {
  kode_voucher: string;
  discount: number;
  start_date: Date;
  end_date: Date;
}

export default function VoucherModule() {
  ipcMain.handle("add_voucher", async (_, data: DataVoucher) => {
    try {
      const newVoucher = await prisma.voucher.create({
        data: { ...data, id_voucher: generateShortUUID() },
      });

      return Responses({
        code: 201,
        data: newVoucher,
        detail_message: "Voucher berhasil disimpan",
      });
    } catch (err) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal menyimpan voucher: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal menyimpan voucher",
      });
    }
  });

  ipcMain.handle("list_voucher", async () => {
    try {
      const voucher = await prisma.voucher.findMany();

      return Responses({ code: 200, data: voucher });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal mengambil voucher Menu: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal mengambil voucher Menu",
      });
    }
  });

  ipcMain.handle("update_voucher", async (_, data: DataVoucher, id: number) => {
    try {
      const voucher = await prisma.voucher.update({
        where: { id },
        data: data,
      });
      return Responses({
        code: 201,
        data: voucher,
        detail_message: "Voucher berhasil diubah",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal Voucher diubah: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal Voucher diubah",
      });
    }
  });

  ipcMain.handle("delete_voucher", async (_, id: number) => {
    try {
      const voucher = await prisma.voucher.delete({
        where: {
          id: id,
        },
      });
      return Responses({
        code: 201,
        data: voucher,
        detail_message: "Voucher berhasil dihapus",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal Voucher diubah: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal Voucher diubah",
      });
    }
  });
}

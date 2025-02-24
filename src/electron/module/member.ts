import { ipcMain } from "electron";
import Responses from "../lib/responses.js";
import { prisma } from "../database.js";
import { Members } from "../types/index.js";
import generateShortUUID from "../lib/random.js";

export default function MemberModule() {
  ipcMain.handle("get_type", async (_, type_member: string) => {
    try {
      const type_members = await prisma.priceMember.findFirst({
        where: { type_member: type_member },
      });

      return Responses({
        code: 200,
        data: type_members,
      });
    } catch (err) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal menyimpan data: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Gagal menyimpan data" });
    }
  });

  ipcMain.handle("list_member", async () => {
    try {
      const members = await prisma.members.findMany();
      return Responses({
        code: 200,
        data: members,
      });
    } catch (err) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal menyimpan data: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Gagal menyimpan data" });
    }
  });

  ipcMain.handle("add_member", async (_, data: Members) => {
    try {
      const type_member = await prisma.priceMember.findFirst({
        where: { type_member: data.type_member },
      });

      if (!type_member) {
        return Responses({
          code: 400,
          detail_message: "Type Member tidak ditemukan",
        });
      }

      const check_phone = await prisma.members.findFirst({
        where: {
          no_telp: data.no_telp,
        },
      });

      if (check_phone) {
        return Responses({
          code: 400,
          detail_message: "Nomor sudah digunakan",
        });
      }

      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      const member = await prisma.members.create({
        data: {
          id_member: generateShortUUID(),
          kode_member: data.no_telp,
          name: data.name,
          no_telp: data.no_telp,
          type_member: data.type_member,
          email: data.email,
          start_date: new Date(),
          end_date: oneMonthLater,
          playing: 0,
          status: "ACTIVE",
          id_price_member: type_member.id,
        },
      });

      return Responses({
        code: 201,
        data: member,
        detail_message: "Member berhasil disimpan",
      });
    } catch (err) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal menyimpan data: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Gagal menyimpan data" });
    }
  });

  ipcMain.handle("delete_member", async (_, id: number) => {
    try {
      const member = await prisma.members.delete({
        where: {
          id: id,
        },
      });
      return Responses({
        code: 201,
        data: member,
        detail_message: "Member berhasil dihapus",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal hapus Data : ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal hapus Data",
      });
    }
  });

  ipcMain.handle(
    "update_member",
    async (_, id_member: string, data: Partial<Members>) => {
      try {
        const existingMember = await prisma.members.findUnique({
          where: { id_member: id_member },
        });

        if (!existingMember) {
          return Responses({
            code: 404,
            detail_message: "Member tidak ditemukan",
          });
        }

        const updatedMember = await prisma.members.update({
          where: { id_member: id_member },
          data: {
            name: data.name ?? existingMember.name,
            no_telp: data.no_telp ?? existingMember.no_telp,
            type_member: data.type_member ?? existingMember.type_member,
            email: data.email ?? existingMember.email,
            end_date: data.end_date ?? existingMember.end_date,
          },
        });

        return Responses({
          code: 200,
          data: updatedMember,
          detail_message: "Member berhasil diperbarui",
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Gagal memperbarui data: ${err.message}`,
          });
        }
        return Responses({
          code: 500,
          detail_message: "Gagal memperbarui data",
        });
      }
    },
  );
}

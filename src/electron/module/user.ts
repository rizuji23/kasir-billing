import { ipcMain } from "electron";
import Responses from "../lib/responses.js";
import { prisma } from "../database.js";

export default function UserModule() {
  ipcMain.handle("get_user", async () => {
    try {
      const user = await prisma.user.findMany({
        where: {
          role: "cashier",
        },
      });

      return Responses({ code: 200, data: user });
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
    "create_user",
    async (_, data: { name: string; username: string; password: string }) => {
      try {
        const check_username = await prisma.user.findMany({
          where: {
            username: data.username,
          },
        });

        if (check_username.length !== 0) {
          return Responses({
            code: 400,
            detail_message: "Username sudah digunakan",
          });
        }

        await prisma.user.create({
          data: data,
        });

        return Responses({
          code: 201,
          detail_message: "User berhasil disimpan",
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Gagal menyimpan data user: ${err.message}`,
          });
        }
        return Responses({
          code: 500,
          detail_message: "Gagal menyimpan data user",
        });
      }
    },
  );

  ipcMain.handle(
    "update_user",
    async (
      _,
      data: {
        name: string;
        username: string;
        password: string;
        id_user: number;
      },
    ) => {
      try {
        const [check_user, check_username] = await Promise.all([
          await prisma.user.findFirst({
            where: {
              id: data.id_user,
            },
          }),
          await prisma.user.findFirst({
            where: {
              username: data.username,
            },
          }),
        ]);

        if (!check_user) {
          return Responses({
            code: 400,
            detail_message: "User tidak ditemukan",
          });
        }

        if (check_username?.username !== data.username) {
          if (check_username) {
            return Responses({
              code: 400,
              detail_message: "Username sudah digunakan",
            });
          }
        }

        await prisma.user.update({
          where: {
            id: check_user.id,
          },
          data: {
            username: data.username,
            password: data.password,
            name: data.name,
          },
        });

        return Responses({
          code: 201,
          detail_message: "User berhasil diubah",
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Gagal update data user: ${err.message}`,
          });
        }
        return Responses({
          code: 500,
          detail_message: "Gagal update data user",
        });
      }
    },
  );

  ipcMain.handle("delete_user", async (_, id_user: number) => {
    try {
      const get_user = await prisma.user.findFirst({
        where: {
          id: id_user,
        },
      });

      if (!get_user) {
        return Responses({
          code: 400,
          detail_message: "User tidak ditemukan",
        });
      }

      await prisma.user.delete({
        where: {
          id: get_user.id,
        },
      });

      return Responses({
        code: 201,
        detail_message: "User berhasil dihapus",
      });
    } catch (err) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal update data user: ${err.message}`,
        });
      }
      return Responses({
        code: 500,
        detail_message: "Gagal update data user",
      });
    }
  });
}

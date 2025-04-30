import { ipcMain } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";
import Store from "electron-store";
import { UserData } from "../types/index.js";

export default function AuthModule() {
  ipcMain.handle("login", async (_, username: string, password: string) => {
    const user = await prisma.user.findUnique({
      where: { username, password },
    });

    if (user === null) {
      return Responses({
        code: 400,
        detail_message: "Username atau Password Salah",
      });
    }

    const store = new Store();

    store.set(
      "userdata",
      JSON.stringify({
        username: user.username,
        name: user.name,
      }),
    );

    return Responses({ code: 200, detail_message: "Login successful" });
  });

  ipcMain.handle("logout", async () => {
    try {
      const store = new Store();

      if (!store.has("userdata")) {
        return Responses({
          code: 400,
          detail_message: "Data user tidak ditemukan",
        });
      }

      store.delete("userdata");

      return Responses({ code: 200, detail_message: "Login successful" });
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

  ipcMain.handle("middleware", async () => {
    try {
      const store = new Store();

      if (!store.has("userdata")) {
        return Responses({
          code: 400,
          detail_message: "Data user tidak ditemukan",
        });
      }

      const userData: UserData = JSON.parse(store.get("userdata") as string);
      const user = await prisma.user.findFirst({
        where: {
          username: userData.username,
        },
      });

      if (!user) {
        return Responses({
          code: 400,
          detail_message: "Data user tidak ditemukan",
        });
      }

      return Responses({
        code: 200,
        data: {
          username: user.username,
          name: user.name,
        },
        detail_message: "User ditemukan",
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

import { ipcMain } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";
import bcrypt from "bcryptjs";

export default function AuthModule() {
  ipcMain.handle("login", async (_, username: string, password: string) => {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return Responses({
        code: 400,
        detail_message: "Username atau Password Salah",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return Responses({
        code: 400,
        detail_message: "Username atau Password Salah",
      });
    }

    return Responses({ code: 200, detail_message: "Login successful" });
  });
}

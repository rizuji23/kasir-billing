import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./utils.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
process.env.DATABASE_URL = `file:${path.join(
  app.getPath("userData"),
  "kasir.sqlite",
)}`;

import { prisma } from "./database.js";

app.on("ready", () => {
  console.log(app.getPath("userData"));

  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: "",
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});

ipcMain.handle("get-users", async () => {
  return await prisma.user.findMany();
});

ipcMain.handle("add-user", async (_, data) => {
  return await prisma.user.create({ data });
});

ipcMain.handle("login", async (_, username, password) => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return { success: false, message: "Password tidak ditemukan" };
  }

  return { success: true, message: "Login berhasil" };
});

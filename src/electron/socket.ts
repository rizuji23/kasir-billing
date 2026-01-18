import { BrowserWindow, dialog, ipcMain } from "electron";
import { io, Socket } from "socket.io-client";
import handleKitchenUpdate from "./service/kitchen.socket.js";
import { IKitchenIncoming, IRejectIncoming } from "./types/index.js";

let socket: Socket | null = null;
let mainWindow: BrowserWindow | null = null;

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win;
}

function sendStatus(connected: boolean) {
  mainWindow?.webContents.send("socket:status", connected);
}

let lastKitchenData: IKitchenIncoming[] | null = null;

export function getLastKitchenData() {
  return lastKitchenData;
}

export function initSocket(serverUrl: string) {
  if (socket) return socket;

  socket = io(serverUrl, {
    reconnection: true,
    timeout: 5000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket IO connected:", socket?.id);
    sendStatus(true);
    dialog.showMessageBox(mainWindow!, {
      type: "info",
      title: "Jaringan Daput Terkoneksi",
      message: "Dapur Terkoneksi, anda bisa mulai order menu sekarang.",
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket IO disconnected");
    sendStatus(false);
    dialog.showErrorBox(
      `Jaringan Dapur Terputus ${reason}`,
      "Silahkan untuk refresh aplikasi ini dengan CTRL+SHIFT+R secara bersamaan",
    );
  });

  socket.on("connect_error", (err) => {
    console.error("Socket IO error:", err.message);
    sendStatus(false);
  });

  socket.on("kitchen:update", async (data: IKitchenIncoming[]) => {
    console.log("RECEIVED FROM SOCKET", data.length);

    lastKitchenData = data;
    await handleKitchenUpdate(data, mainWindow);
  });

  socket.on("kitchen:reject", (data: IRejectIncoming) => {
    console.log("MESSAGE FROM REJECT KITCHEN:", data);
    mainWindow?.webContents.send("kitchen:reject", data);
  });

  return socket;
}

ipcMain.on("renderer:ready", () => {
  if (lastKitchenData && mainWindow) {
    mainWindow.webContents.send("kitchen:update", lastKitchenData);
  }
});

export function isSocketConnected(): boolean {
  return !!socket?.connected;
}

export function sendSocket<T>(
  event: string,
  payload: string,
  timeoutMs = 5000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!socket || !socket.connected) {
      return reject(new Error("KITCHEN_NOT_CONNECTED"));
    }

    const timeout = setTimeout(() => {
      reject(new Error("KITCHEN_ACK_TIMEOUT"));
    }, timeoutMs);

    socket.emit(event, payload, (ack: T) => {
      clearTimeout(timeout);
      resolve(ack);
    });
  });
}

export function getSocket() {
  return socket;
}

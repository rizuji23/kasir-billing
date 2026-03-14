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
  if (socket) {
    console.log("Disconnecting existing socket to reconnect to new URL...");
    socket.disconnect();
  }

  socket = io(serverUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
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
    console.log("❌ Socket IO disconnected. Reason:", reason);
    sendStatus(false);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket IO error:", err.message);
    sendStatus(false);
  });

  socket.on("reconnect", (attempt) => {
    console.log(`🔄 Socket IO reconnected after ${attempt} attempts`);
    sendStatus(true);
  });

  socket.on("reconnect_attempt", (attempt) => {
    console.log(`⚠️ Socket IO reconnect_attempt:`, attempt);
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

ipcMain.handle("test_kitchen", async () => {
  if (!socket?.connected) {
    throw new Error("KITCHEN_NOT_CONNECTED");
  }

  const dummyData = {
    message: "TEST_CONNECTION",
    timestamp: new Date().toISOString(),
    items: [
      { name: "Dummy Item 1", qty: 2 },
      { name: "Dummy Item 2", qty: 1 }
    ]
  };

  socket.emit("kitchen:new_order", dummyData, (ack: any) => {
    console.log("Kitchen test acknowledged:", ack);
  });
  
  return { success: true };
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

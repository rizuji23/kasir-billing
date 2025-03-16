import WebSocket from "ws"; // Import WebSocket from 'ws'
import { BrowserWindow } from "electron";
import { prisma } from "./database.js";

export type WebsocketResponseType = "table_status" | "chat" | "kitchen";

export interface ISocket<T> {
  type: WebsocketResponseType;
  ip: string;
  data: T;
  name: string;
}

export async function getWebSocketUrls(): Promise<string[]> {
  const configs = await prisma.localServers.findMany({
    where: {
      type_server: "KITCHEN",
    },
  });
  if (configs.length === 0) {
    return [];
  }
  return configs.map((config) => config.ip);
}

export async function initWebSockets(
  mainWindow: BrowserWindow,
): Promise<Map<string, WebSocket>> {
  const data_ip = await getWebSocketUrls();
  const sockets = new Map<string, WebSocket>();

  async function connectWebSocket(url: string) {
    const url_ws = `ws://${url}:4321`;

    return new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(url_ws);

      ws.on("open", () => {
        console.log(`WebSocket connected: ${url}`);
        sockets.set(url, ws); // Store WebSocket
        resolve(ws);
      });

      ws.on("message", (data) => {
        console.log(`Received from ${url}: ${data}`);
        if (mainWindow) {
          mainWindow.webContents.send("websocket-message", {
            url,
            data: data.toString(),
          });
        }
      });

      ws.on("close", async () => {
        console.warn(`WebSocket closed: ${url}. Reconnecting in 5s...`);
        sockets.delete(url); // Remove closed socket
        setTimeout(async () => {
          try {
            const newSocket = await connectWebSocket(url); // Reconnect
            sockets.set(url, newSocket); // Update reference
          } catch (err) {
            console.error(`Reconnection failed for ${url}:`, err);
          }
        }, 5000);
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error: ${url}`, error);
        ws.close();
        reject(error);
      });
    });
  }

  try {
    await Promise.all(data_ip.map((url) => connectWebSocket(url)));
    console.log("WebSockets initialized.");
  } catch (error) {
    console.error("WebSocket initialization failed:", error);
  }

  return sockets;
}

export function sendMessageKitchen(
  sockets: Map<string, WebSocket>,
  message: string,
) {
  sockets.forEach((ws, url) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      console.error(
        `WebSocket is not open for URL: ${url}, removing from list.`,
      );
      sockets.delete(url); // Cleanup dead sockets
    }
  });
}

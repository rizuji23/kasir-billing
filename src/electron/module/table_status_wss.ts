import WebSocket from "ws";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";
import { saveLogging } from "./logging.js";

const TABLE_STATUS_WSS_ID = "TABLE_STATUS_WSS_URL";
const TABLE_STATUS_WSS_LABEL = "Table Status WebSocket URL";

let tableStatusWs: WebSocket | null = null;
let tableStatusWsUrl = "";
let reconnectTimer: NodeJS.Timeout | null = null;
let lastEnsureAt = 0;

const normalizeWsUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("ws://") || trimmed.startsWith("wss://")) {
    return trimmed;
  }

  return `wss://${trimmed}`;
};

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const scheduleReconnect = (url: string) => {
  clearReconnectTimer();
  reconnectTimer = setTimeout(() => {
    void connectTableStatusWss(url);
  }, 5000);
};

const getConfiguredWssUrl = async (): Promise<string> => {
  const setting = await prisma.settings.findFirst({
    where: { id_settings: TABLE_STATUS_WSS_ID },
  });
  return normalizeWsUrl(setting?.content || "");
};

export async function ensureTableStatusWssSetting() {
  const current = await prisma.settings.findFirst({
    where: { id_settings: TABLE_STATUS_WSS_ID },
  });

  if (!current) {
    await prisma.settings.create({
      data: {
        id_settings: TABLE_STATUS_WSS_ID,
        label_settings: TABLE_STATUS_WSS_LABEL,
        content: "",
        url: "",
      },
    });
  }
}

export async function connectTableStatusWss(forceUrl?: string) {
  const targetUrl = normalizeWsUrl(forceUrl || (await getConfiguredWssUrl()));

  if (!targetUrl) {
    if (tableStatusWs) {
      tableStatusWs.close();
      tableStatusWs = null;
      tableStatusWsUrl = "";
    }
    return;
  }

  if (
    tableStatusWs &&
    tableStatusWsUrl === targetUrl &&
    (tableStatusWs.readyState === WebSocket.OPEN ||
      tableStatusWs.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  if (tableStatusWs) {
    tableStatusWs.removeAllListeners();
    tableStatusWs.close();
    tableStatusWs = null;
  }

  tableStatusWsUrl = targetUrl;
  const ws = new WebSocket(targetUrl);
  tableStatusWs = ws;

  ws.on("open", () => {
    saveLogging(`[TABLE_WSS] Connected to ${targetUrl}`);
  });

  ws.on("close", () => {
    saveLogging(`[TABLE_WSS] Disconnected from ${targetUrl}`, "WARNING");
    if (tableStatusWsUrl === targetUrl) {
      scheduleReconnect(targetUrl);
    }
  });

  ws.on("error", (err) => {
    saveLogging(`[TABLE_WSS] Error (${targetUrl}): ${err.message}`, "ERROR");
  });
}

export async function ensureTableStatusWssConnection() {
  const now = Date.now();
  if (now - lastEnsureAt < 10_000) return;
  lastEnsureAt = now;

  const configuredUrl = await getConfiguredWssUrl();

  if (!configuredUrl) return;

  if (
    !tableStatusWs ||
    tableStatusWsUrl !== configuredUrl ||
    tableStatusWs.readyState === WebSocket.CLOSED
  ) {
    await connectTableStatusWss(configuredUrl);
  }
}

export async function sendTableStatusToExternalWss(payload: unknown) {
  await ensureTableStatusWssConnection();

  if (!tableStatusWs || tableStatusWs.readyState !== WebSocket.OPEN) return;

  try {
    tableStatusWs.send(JSON.stringify(payload));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    saveLogging(`[TABLE_WSS] Failed sending payload: ${message}`, "ERROR");
  }
}

export async function testTableStatusWssConnection(url?: string | null) {
  try {
    const targetUrl = normalizeWsUrl(url || (await getConfiguredWssUrl()));

    if (!targetUrl) {
      return Responses({
        code: 400,
        detail_message: "URL websocket server belum diisi",
      });
    }

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(targetUrl);
      const timeout = setTimeout(() => {
        ws.terminate();
        reject(new Error("Timeout saat membuka koneksi websocket"));
      }, 10_000);

      ws.on("open", () => {
        clearTimeout(timeout);
        ws.close();
        resolve();
      });

      ws.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    saveLogging(`[TABLE_WSS][TEST] Connected: ${targetUrl}`);
    return Responses({
      code: 200,
      detail_message: "Koneksi websocket server berhasil",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    saveLogging(`[TABLE_WSS][TEST] Failed: ${message}`, "ERROR");
    return Responses({
      code: 500,
      detail_message: `Gagal koneksi websocket server: ${message}`,
    });
  }
}

export { TABLE_STATUS_WSS_ID, TABLE_STATUS_WSS_LABEL };

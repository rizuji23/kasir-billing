import WebSocket from "ws";
import { BrowserWindow } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";
import { saveLogging } from "./logging.js";
import { sendMessageToMachine } from "./machine.js";
import { getCashierName, getLocalIPAddress } from "./networks/network_scan.js";

const TABLE_STATUS_WSS_ID = "TABLE_STATUS_WSS_URL";
const TABLE_STATUS_WSS_LABEL = "Table Status WebSocket URL";

let tableStatusWs: WebSocket | null = null;
let tableStatusWsUrl = "";
let reconnectTimer: NodeJS.Timeout | null = null;
let tableStatusPingTimer: NodeJS.Timeout | null = null;
let lastEnsureAt = 0;
let rendererWindow: BrowserWindow | null = null;
let sendingPeriodicSnapshot = false;

const allowedActions = new Set(["on", "off", "blink"]);
const TABLE_STATUS_PUSH_INTERVAL_MS = 2_000;
const RELAY_TIMEOUT_MS = 3_000;
const RELAY_RETRY_COUNT = 2;

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(secs).padStart(2, "0")}`;
};

type ManualLampWsResponse = {
  type: "manual_lamp_ack";
  command: string;
  status: "ok" | "error";
  note: string;
  floorCode: string;
};

type ManualLampRequestEvent = {
  type: "manual_lamp_command";
  command: string;
  action: string;
  target: string;
  floorCode: string;
  timestamp?: string;
  request_id?: string;
  sender?: {
    clientType?: string;
    ip?: string;
    name?: string;
  };
};

type ManualLampUiEvent = {
  type?: string;
  request_id?: string;
  command?: string;
  action?: string;
  target?: string;
  floorCode?: string;
  status?: string;
  note?: string;
  data?: {
    command?: string;
    action?: string;
    number?: string;
    target?: string;
    floorCode?: string;
    delivered?: number;
    websocket?: string;
  };
};

type ManualLampWsCommand = {
  type: "manual_lamp_command";
  request_id?: string;
  command?: string;
  action?: string;
  target?: string | number;
  number?: string | number;
  floorCode?: string;
  timestamp?: string;
  sender?: {
    clientType?: string;
    ip?: string;
    name?: string;
  };
  data?: {
    command?: string;
    action?: string;
    target?: string | number;
    number?: string | number;
    floorCode?: string;
  };
};

type ParsedManualLampCommand = {
  command: string;
  action: string;
  target: string;
  floorCode: string;
};

type ManualLampCommandDecision =
  | {
      kind: "execute";
      delivered: 1;
      status: "ok";
      note: string;
      parsed: ParsedManualLampCommand;
    }
  | {
      kind: "invalid";
      delivered: 0;
      status: "error";
      note: string;
      parsed: ParsedManualLampCommand;
    }
  | {
      kind: "floor_mismatch";
      delivered: 0;
      status: "error";
      note: string;
      parsed: ParsedManualLampCommand;
    }
  | {
      kind: "no_cashier_online";
      delivered: 0;
      status: "error";
      note: string;
      parsed: ParsedManualLampCommand;
    };

const normalizeWsUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("ws://") || trimmed.startsWith("wss://")) {
    return trimmed;
  }

  return `wss://${trimmed}`;
};

const normalizeTableNumber = (rawNumber: string): string => {
  const trimmed = rawNumber.trim();
  if (!trimmed) return "";
  if (trimmed.toLowerCase() === "all") return "all";
  if (/^\d+$/.test(trimmed)) return trimmed.padStart(2, "0");
  return trimmed;
};

export const canExecuteCommand = (action: string, target: string): boolean => {
  if (!allowedActions.has(action)) return false;
  if (!target) return false;
  if (target === "all") return action === "on" || action === "off";
  return /^\d{1,2}$/.test(target);
};

const parseCommandAction = (
  command: string,
): { action: string; target: string } => {
  const [actionRaw, targetRaw] = command.trim().split(/\s+/);
  return {
    action: (actionRaw || "").toLowerCase(),
    target: targetRaw || "",
  };
};

const toStringSafe = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const isManualLampWsTypedCommand = (
  payload: unknown,
): payload is ManualLampWsCommand => {
  if (!payload || typeof payload !== "object") return false;
  const asObj = payload as Record<string, unknown>;
  return asObj.type === "manual_lamp_command";
};

const isManualLampWsResponse = (
  payload: unknown,
): payload is ManualLampWsResponse => {
  if (!payload || typeof payload !== "object") return false;

  const asObj = payload as Record<string, unknown>;
  return (
    asObj.type === "manual_lamp_ack" &&
    typeof asObj.command === "string" &&
    typeof asObj.status === "string"
  );
};

export const parseManualLampCommandPayload = (
  payload: ManualLampWsCommand,
): ParsedManualLampCommand => {
  const floorCode = payload.floorCode || payload.data?.floorCode || "";
  const commandCandidate =
    toStringSafe(payload.command) || toStringSafe(payload.data?.command);
  const fallbackParsed = parseCommandAction(commandCandidate);
  const action = (
    toStringSafe(payload.action) ||
    toStringSafe(payload.data?.action) ||
    fallbackParsed.action ||
    ""
  )
    .trim()
    .toLowerCase();
  const target = normalizeTableNumber(
    toStringSafe(payload.target) ||
      toStringSafe(payload.number) ||
      toStringSafe(payload.data?.target) ||
      toStringSafe(payload.data?.number) ||
      fallbackParsed.target ||
      "",
  );
  return {
    command: `${action} ${target}`.trim(),
    action,
    target,
    floorCode,
  };
};

export const shouldIgnoreFloor = (
  incomingFloorCode: string,
  cashierFloorCode: string,
): boolean => {
  if (!incomingFloorCode) return false;
  return incomingFloorCode !== cashierFloorCode;
};

export const evaluateManualLampCommand = (params: {
  payload: ManualLampWsCommand;
  cashierFloorCode: string;
  isCashierOnline?: boolean;
}): ManualLampCommandDecision => {
  const parsed = parseManualLampCommandPayload(params.payload);
  if (params.isCashierOnline === false) {
    return {
      kind: "no_cashier_online",
      delivered: 0,
      status: "error",
      note: "No cashier online",
      parsed,
    };
  }

  if (shouldIgnoreFloor(parsed.floorCode, params.cashierFloorCode)) {
    return {
      kind: "floor_mismatch",
      delivered: 0,
      status: "error",
      note: `Floor mismatch incoming=${parsed.floorCode} cashier=${params.cashierFloorCode}`,
      parsed,
    };
  }

  if (!canExecuteCommand(parsed.action, parsed.target)) {
    return {
      kind: "invalid",
      delivered: 0,
      status: "error",
      note: "Command tidak valid. Gunakan: on 01, off 01, blink 01, on all, off all",
      parsed,
    };
  }

  return {
    kind: "execute",
    delivered: 1,
    status: "ok",
    note: "Command valid and ready for relay execution",
    parsed,
  };
};

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const clearTableStatusPingTimer = () => {
  if (tableStatusPingTimer) {
    clearInterval(tableStatusPingTimer);
    tableStatusPingTimer = null;
  }
};

const scheduleReconnect = (url: string) => {
  clearReconnectTimer();
  reconnectTimer = setTimeout(() => {
    void connectTableStatusWss(url);
  }, 5000);
};

const sendJson = (ws: WebSocket, payload: unknown) => {
  ws.send(JSON.stringify(payload));
};

const getConfiguredWssUrl = async (): Promise<string> => {
  const setting = await prisma.settings.findFirst({
    where: { id_settings: TABLE_STATUS_WSS_ID },
  });
  return normalizeWsUrl(setting?.content || "");
};

const getFloorCode = async () => {
  const cashier = await prisma.localServers.findFirst({
    where: { type_server: "CASHIER" },
  });
  const floorNumber = cashier?.number || "1";
  return `FLOOR_${floorNumber}`;
};

const getCashierLabel = async (): Promise<string> => {
  const cashierName = await getCashierName();
  return cashierName?.content || "Kasir";
};

const updateTableByActionTarget = async (
  action: string,
  target: string,
): Promise<void> => {
  const normalizedTarget = normalizeTableNumber(target);

  if (normalizedTarget === "all") {
    if (action === "on" || action === "off") {
      await prisma.tableBilliard.updateMany({
        data: {
          power: action === "on" ? "ON" : "OFF",
        },
      });
    }

    if (action === "blink") {
      await prisma.tableBilliard.updateMany({
        data: {
          blink: true,
        },
      });
    }

    return;
  }

  const parsed = Number.parseInt(normalizedTarget, 10);
  const variants = new Set<string>([normalizedTarget]);

  if (!Number.isNaN(parsed)) {
    variants.add(String(parsed));
    variants.add(String(parsed).padStart(2, "0"));
  }

  if (action === "on" || action === "off") {
    await prisma.tableBilliard.updateMany({
      where: {
        number: {
          in: [...variants],
        },
      },
      data: {
        power: action === "on" ? "ON" : "OFF",
      },
    });
  }

  if (action === "blink") {
    await prisma.tableBilliard.updateMany({
      where: {
        number: {
          in: [...variants],
        },
      },
      data: {
        blink: true,
      },
    });
  }
};

const buildTableStatusSnapshot = async () => {
  const tables = await prisma.tableBilliard.findMany({
    include: {
      bookings: {
        take: 1,
        orderBy: {
          created_at: "desc",
        },
        include: {
          detail_booking: {
            orderBy: {
              end_duration: "desc",
            },
          },
        },
      },
    },
  });

  const now = new Date();
  const formattedTables = tables.map((table) => {
    let remainingTime = "00:00:00";

    if (table.timer) {
      const secondsRemaining = Math.max(
        0,
        Math.floor((table.timer.getTime() - now.getTime()) / 1000),
      );
      remainingTime = formatTime(secondsRemaining);
    }

    return { ...table, remainingTime };
  });

  const cashierName = await prisma.settings.findFirst({
    where: { id_settings: "CASHIER_NAME" },
  });

  return {
    type: "table_status",
    ip: getLocalIPAddress(),
    data: formattedTables,
    name: cashierName?.content || "Unknown",
  };
};

const sendCurrentTableStatus = async (
  ws: WebSocket,
  source: "periodic" | "sync",
) => {
  if (ws.readyState !== WebSocket.OPEN) return;
  const snapshot = await buildTableStatusSnapshot();
  sendJson(ws, snapshot);
  rendererWindow?.webContents.send("update_table_list", snapshot.data);
  console.log("source", source);
  // saveLogging(
  //   `[TABLE_WSS][TABLE_STATUS] Sent (${source}) rows=${snapshot.data.length}`,
  // );
};

const startTableStatusPeriodicPush = (ws: WebSocket) => {
  clearTableStatusPingTimer();
  tableStatusPingTimer = setInterval(() => {
    if (sendingPeriodicSnapshot) return;
    sendingPeriodicSnapshot = true;
    void sendCurrentTableStatus(ws, "periodic").finally(() => {
      sendingPeriodicSnapshot = false;
    });
  }, TABLE_STATUS_PUSH_INTERVAL_MS);
};

const executeRelayWithRetry = async (
  command: string,
): Promise<{ ok: true; attempts: number }> => {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= RELAY_RETRY_COUNT; attempt += 1) {
    try {
      await Promise.race([
        sendMessageToMachine(command),
        new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Relay timeout waiting response")),
            RELAY_TIMEOUT_MS,
          );
        }),
      ]);
      return { ok: true, attempts: attempt };
    } catch (error) {
      lastError = error;
      console.log("ERROR", error);
      saveLogging(
        `[TABLE_WSS][RELAY] Attempt ${attempt}/${RELAY_RETRY_COUNT} failed for "${command}": ${
          error instanceof Error ? error.message : String(error)
        }`,
        "WARNING",
      );
      if (attempt < RELAY_RETRY_COUNT) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(lastError ? String(lastError) : "Relay execution failed");
};

const handleManualLampCommand = async (
  ws: WebSocket,
  payload: ManualLampWsCommand,
) => {
  const cashierFloorCode = await getFloorCode();
  const decision = evaluateManualLampCommand({
    payload,
    cashierFloorCode,
    isCashierOnline: true,
  });
  const { floorCode, action, target, command } = decision.parsed;
  const incomingRequestPayload: ManualLampRequestEvent = {
    type: "manual_lamp_command",
    command,
    action,
    target,
    floorCode: floorCode || cashierFloorCode,
    timestamp: payload.timestamp,
    request_id: payload.request_id,
    sender: payload.sender,
  };

  rendererWindow?.webContents.send(
    "manual-lamp:request",
    incomingRequestPayload,
  );
  saveLogging(
    `[TABLE_WSS][MANUAL_LAMP][REQUEST] command="${command}" floor="${floorCode || "-"}" request_id="${payload.request_id || "-"}" payload=${JSON.stringify(
      payload,
    ).slice(0, 600)}`,
  );

  if (decision.kind === "floor_mismatch") {
    saveLogging(
      `[TABLE_WSS][MANUAL_LAMP] Ignored floor mismatch command="${command}" incoming="${floorCode}" cashier="${cashierFloorCode}"`,
      "WARNING",
    );
    return;
  }

  if (decision.kind === "invalid") {
    const invalidAck: ManualLampWsResponse = {
      type: "manual_lamp_ack",
      command,
      status: "error",
      note: decision.note,
      floorCode: cashierFloorCode,
    };

    sendJson(ws, invalidAck);
    rendererWindow?.webContents.send("manual-lamp:response", {
      ...invalidAck,
      data: {
        command,
        action,
        number: target,
        target,
        floorCode: cashierFloorCode,
        delivered: 0,
        websocket: tableStatusWsUrl,
      },
    } satisfies ManualLampUiEvent);
    saveLogging(
      `[TABLE_WSS][MANUAL_LAMP] Invalid command received: action="${action}" target="${target}" payload=${JSON.stringify(
        payload,
      ).slice(0, 400)}`,
      "WARNING",
    );
    return;
  }

  try {
    const relayResult = await executeRelayWithRetry(command);
    saveLogging(
      `[TABLE_WSS][MANUAL_LAMP][RELAY] command="${command}" result=ok attempts=${relayResult.attempts}`,
    );
    await updateTableByActionTarget(action, target);

    const ackPayload: ManualLampWsResponse = {
      type: "manual_lamp_ack",
      command,
      status: "ok",
      note: `Lamp table ${target.toUpperCase()} ${action.toUpperCase()}`,
      floorCode: cashierFloorCode,
    };

    sendJson(ws, ackPayload);
    saveLogging(
      `[TABLE_WSS][MANUAL_LAMP][ACK_SENT] status=ok command="${command}"`,
    );
    rendererWindow?.webContents.send("manual-lamp:response", {
      ...ackPayload,
      data: {
        command,
        action,
        number: target,
        target,
        floorCode: cashierFloorCode,
        delivered: 1,
        websocket: tableStatusWsUrl,
      },
    } satisfies ManualLampUiEvent);

    await sendCurrentTableStatus(ws, "sync");

    saveLogging(
      `[TABLE_WSS][MANUAL_LAMP] ACK + snapshot sync success for command ${command}`,
    );
  } catch (err) {
    const ackPayload: ManualLampWsResponse = {
      type: "manual_lamp_ack",
      command,
      status: "error",
      note: `Eksekusi lampu gagal: ${
        err instanceof Error ? err.message : String(err)
      }`,
      floorCode: cashierFloorCode,
    };

    sendJson(ws, ackPayload);
    saveLogging(
      `[TABLE_WSS][MANUAL_LAMP][ACK_SENT] status=error command="${command}"`,
      "ERROR",
    );
    rendererWindow?.webContents.send("manual-lamp:response", {
      ...ackPayload,
      data: {
        command,
        action,
        number: target,
        target,
        floorCode: cashierFloorCode,
        delivered: 0,
        websocket: tableStatusWsUrl,
      },
    } satisfies ManualLampUiEvent);

    saveLogging(
      `[TABLE_WSS][MANUAL_LAMP] Command failed ${command}: ${
        err instanceof Error ? err.message : String(err)
      }`,
      "ERROR",
    );
  }
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

export function setTableStatusRendererWindow(window: BrowserWindow | null) {
  rendererWindow = window;
}

export async function connectTableStatusWss(forceUrl?: string) {
  const targetUrl = normalizeWsUrl(forceUrl || (await getConfiguredWssUrl()));

  if (!targetUrl) {
    if (tableStatusWs) {
      clearTableStatusPingTimer();
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
    clearTableStatusPingTimer();
    tableStatusWs.removeAllListeners();
    tableStatusWs.close();
    tableStatusWs = null;
  }

  tableStatusWsUrl = targetUrl;
  const ws = new WebSocket(targetUrl);
  tableStatusWs = ws;

  ws.on("open", () => {
    saveLogging(`[TABLE_WSS] Connected to ${targetUrl}`);

    void (async () => {
      const floorCode = await getFloorCode();
      const cashierName = await getCashierLabel();
      const ip = getLocalIPAddress() || "0.0.0.0";
      sendJson(ws, {
        type: "register",
        clientType: "cashier",
        floorCode,
        ip,
        name: cashierName,
      });
      saveLogging(
        `[TABLE_WSS] Register sent clientType=cashier floorCode=${floorCode} ip=${ip} name="${cashierName}"`,
      );
      await sendCurrentTableStatus(ws, "sync");
      startTableStatusPeriodicPush(ws);
    })();
  });

  ws.on("message", (rawData) => {
    try {
      const text = rawData.toString();
      // saveLogging(`[TABLE_WSS][INCOMING_RAW] ${text.slice(0, 1000)}`);
      const parsed = JSON.parse(text);

      if (isManualLampWsTypedCommand(parsed)) {
        void handleManualLampCommand(ws, parsed);
        return;
      }

      if (isManualLampWsResponse(parsed)) {
        saveLogging(
          `[TABLE_WSS][MANUAL_LAMP][RESPONSE] status=${parsed.status} command=${parsed.command}`,
        );
        rendererWindow?.webContents.send("manual-lamp:response", {
          ...parsed,
          data: {
            command: parsed.command,
            floorCode: parsed.floorCode,
            websocket: tableStatusWsUrl,
          },
        } satisfies ManualLampUiEvent);
      }
    } catch (err) {
      saveLogging(
        `[TABLE_WSS] Failed parsing incoming message: ${
          err instanceof Error ? err.message : String(err)
        }`,
        "WARNING",
      );
    }
  });

  ws.on("close", () => {
    clearTableStatusPingTimer();
    saveLogging(`[TABLE_WSS] Disconnected from ${targetUrl}`, "WARNING");
    if (tableStatusWsUrl === targetUrl) {
      scheduleReconnect(targetUrl);
    }
  });

  ws.on("error", (err) => {
    clearTableStatusPingTimer();
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
    const asObj =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : null;
    if (asObj?.type !== "table_status") {
      saveLogging(
        `[TABLE_WSS][OUTGOING_RAW] ${JSON.stringify(payload).slice(0, 1000)}`,
      );
    }
    sendJson(tableStatusWs, payload);
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

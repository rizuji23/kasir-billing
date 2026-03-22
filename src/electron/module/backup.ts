import os from "os";
import { BrowserWindow } from "electron";
import { prisma, databasePath } from "../database.js";
import { saveLogging } from "./logging.js";
import generateShortUUID from "../lib/random.js";
import { getLocalIPAddress } from "./networks/network_scan.js";
import Responses from "../lib/responses.js";

const BACKUP_TIMEOUT_MS = 180_000;
const BACKUP_TEST_TIMEOUT_MS = 30_000;
const BACKUP_ENDPOINT_ID = "BACKUP_SERVER_ENDPOINT";
const BACKUP_LABEL = "Server Backup Endpoint";
const AUTO_BACKUP_ENABLED_ID = "AUTO_BACKUP_ENABLED";
const AUTO_BACKUP_LABEL = "Auto Backup Enabled";
const AUTO_BACKUP_INTERVAL_MINUTES_ID = "AUTO_BACKUP_INTERVAL_MINUTES";
const AUTO_BACKUP_INTERVAL_MINUTES_LABEL = "Auto Backup Interval Minutes";
const DEFAULT_AUTO_BACKUP_INTERVAL_MINUTES = 2;

type BackupPayloadData = {
  User: unknown[];
  TableBilliard: unknown[];
  PaketSegment: unknown[];
  PaketPrice: unknown[];
  Machine: unknown[];
  PriceBilling: unknown[];
  PriceBillingType: unknown[];
  Members: unknown[];
  Booking: unknown[];
  DetailBooking: unknown[];
  SplitBillDetail: unknown[];
  PriceMember: unknown[];
  CategoryMenu: unknown[];
  MenuCafe: unknown[];
  OrderCafe: unknown[];
  OrderCafeItem: unknown[];
  Settings: unknown[];
  Shift: unknown[];
  SplitBill: unknown[];
  Chat: unknown[];
  Activity: unknown[];
  TableNumber: unknown[];
  OrderIn: unknown[];
  OrderInMenu: unknown[];
  LogsData: unknown[];
  Struk: unknown[];
  Voucher: unknown[];
  LocalServers: unknown[];
};

type BackupPayload = {
  source_key: string;
  run_uuid: string;
  app_name: string;
  device_name: string;
  device_ip: string;
  db_engine: "sqlite";
  db_file_path: string;
  type_floor: number;
  snapshot_at: string;
  include_raw_data: boolean;
  data: BackupPayloadData;
};

type BackupProgressStatus =
  | "idle"
  | "started"
  | "collecting"
  | "serializing"
  | "sending"
  | "success"
  | "error";

type BackupProgressEvent = {
  runId: string;
  status: BackupProgressStatus;
  step: number;
  totalSteps: number;
  message: string;
  endpoint?: string;
  payloadSizeKb?: number;
  durationMs?: number;
  error?: string;
  at: string;
};

let backupTimer: NodeJS.Timeout | null = null;
let isBackupRunning = false;
let isBackupEnabledLogged = false;
let backupProgressWindow: BrowserWindow | null = null;

const TOTAL_BACKUP_STEPS = 4;

const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException
    ? err.name === "AbortError"
    : err instanceof Error && err.name === "AbortError";

const emitBackupProgress = (payload: BackupProgressEvent) => {
  backupProgressWindow?.webContents.send("backup:progress", payload);
};

export const setBackupProgressWindow = (window: BrowserWindow | null) => {
  backupProgressWindow = window;
};

async function setSettingsValue(
  id_settings: string,
  label_settings: string,
  content: string,
) {
  const found = await prisma.settings.findFirst({
    where: { id_settings },
  });

  if (found) {
    await prisma.settings.update({
      where: { id_settings },
      data: {
        label_settings,
        content,
      },
    });
  } else {
    await prisma.settings.create({
      data: {
        id_settings,
        label_settings,
        content,
        url: "",
      },
    });
  }
}

async function getAutoBackupEnabled(): Promise<boolean> {
  const setting = await prisma.settings.findFirst({
    where: { id_settings: AUTO_BACKUP_ENABLED_ID },
  });

  if (!setting) {
    await setSettingsValue(AUTO_BACKUP_ENABLED_ID, AUTO_BACKUP_LABEL, "true");
    return true;
  }

  return setting.content?.toLowerCase() !== "false";
}

async function getAutoBackupIntervalMinutes(): Promise<number> {
  const setting = await prisma.settings.findFirst({
    where: { id_settings: AUTO_BACKUP_INTERVAL_MINUTES_ID },
  });

  if (!setting) {
    await setSettingsValue(
      AUTO_BACKUP_INTERVAL_MINUTES_ID,
      AUTO_BACKUP_INTERVAL_MINUTES_LABEL,
      String(DEFAULT_AUTO_BACKUP_INTERVAL_MINUTES),
    );
    return DEFAULT_AUTO_BACKUP_INTERVAL_MINUTES;
  }

  const parsed = Number.parseInt(setting.content || "", 10);
  if (Number.isNaN(parsed)) {
    await setSettingsValue(
      AUTO_BACKUP_INTERVAL_MINUTES_ID,
      AUTO_BACKUP_INTERVAL_MINUTES_LABEL,
      String(DEFAULT_AUTO_BACKUP_INTERVAL_MINUTES),
    );
    return DEFAULT_AUTO_BACKUP_INTERVAL_MINUTES;
  }

  return Math.min(1440, Math.max(1, parsed));
}

function clearBackupTimer() {
  if (backupTimer) {
    clearInterval(backupTimer);
    backupTimer = null;
  }
}

async function postJsonWithTimeout(
  endpoint: string,
  payloadJson: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payloadJson,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

const createEmptyBackupData = (): BackupPayloadData => ({
  User: [],
  TableBilliard: [],
  PaketSegment: [],
  PaketPrice: [],
  Machine: [],
  PriceBilling: [],
  PriceBillingType: [],
  Members: [],
  Booking: [],
  DetailBooking: [],
  SplitBillDetail: [],
  PriceMember: [],
  CategoryMenu: [],
  MenuCafe: [],
  OrderCafe: [],
  OrderCafeItem: [],
  Settings: [],
  Shift: [],
  SplitBill: [],
  Chat: [],
  Activity: [],
  TableNumber: [],
  OrderIn: [],
  OrderInMenu: [],
  LogsData: [],
  Struk: [],
  Voucher: [],
  LocalServers: [],
});

const toSafeSourceKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function getBackupEndpoint(): Promise<string | null> {
  const setting = await prisma.settings.findFirst({
    where: {
      id_settings: BACKUP_ENDPOINT_ID,
    },
  });

  const endpoint = setting?.content?.trim();
  if (!endpoint) return null;
  return endpoint;
}

async function buildPayload(includeRawData: boolean): Promise<BackupPayload> {
  const [cashierName, localCashier] = await Promise.all([
    prisma.settings.findFirst({
      where: { id_settings: "CASHIER_NAME" },
    }),
    prisma.localServers.findFirst({
      where: { type_server: "CASHIER" },
    }),
  ]);

  const typeFloor = Number.parseInt(localCashier?.number || "1", 10) || 1;
  const hostname = os.hostname();
  const sourceKey = toSafeSourceKey(`cashier-floor${typeFloor}-${hostname}`);
  const baseData = createEmptyBackupData();

  const data = includeRawData
    ? {
        User: await prisma.user.findMany(),
        TableBilliard: await prisma.tableBilliard.findMany(),
        PaketSegment: await prisma.paketSegment.findMany(),
        PaketPrice: await prisma.paketPrice.findMany(),
        Machine: await prisma.machine.findMany(),
        PriceBilling: await prisma.priceBilling.findMany(),
        PriceBillingType: await prisma.priceBillingType.findMany(),
        Members: await prisma.members.findMany(),
        Booking: await prisma.booking.findMany(),
        DetailBooking: await prisma.detailBooking.findMany(),
        SplitBillDetail: await prisma.splitBillDetail.findMany(),
        PriceMember: await prisma.priceMember.findMany(),
        CategoryMenu: await prisma.categoryMenu.findMany(),
        MenuCafe: await prisma.menuCafe.findMany(),
        OrderCafe: await prisma.orderCafe.findMany(),
        OrderCafeItem: await prisma.orderCafeItem.findMany(),
        Settings: await prisma.settings.findMany(),
        Shift: await prisma.shift.findMany(),
        SplitBill: await prisma.splitBill.findMany(),
        Chat: await prisma.chat.findMany(),
        Activity: await prisma.activity.findMany(),
        TableNumber: await prisma.tableNumber.findMany(),
        OrderIn: await prisma.orderIn.findMany(),
        OrderInMenu: await prisma.orderInMenu.findMany(),
        LogsData: await prisma.logsData.findMany(),
        Struk: await prisma.struk.findMany(),
        Voucher: await prisma.voucher.findMany(),
        LocalServers: await prisma.localServers.findMany(),
      }
    : baseData;

  return {
    source_key: sourceKey || "cashier-floor1-device",
    run_uuid: generateShortUUID(),
    app_name: "Kasir Billing Billiard",
    device_name: cashierName?.content || hostname,
    device_ip: getLocalIPAddress() || "",
    db_engine: "sqlite",
    db_file_path: databasePath,
    type_floor: typeFloor,
    snapshot_at: new Date().toISOString(),
    include_raw_data: includeRawData,
    data,
  };
}

async function postBackupSnapshot(endpoint: string): Promise<boolean> {
  if (isBackupRunning) {
    return false;
  }

  isBackupRunning = true;
  const startedAt = Date.now();
  const runId = generateShortUUID();

  try {
    emitBackupProgress({
      runId,
      status: "started",
      step: 1,
      totalSteps: TOTAL_BACKUP_STEPS,
      message: "Memulai backup data",
      endpoint,
      at: new Date().toISOString(),
    });

    saveLogging(`[BACKUP][${runId}] Start collecting snapshot data`);
    emitBackupProgress({
      runId,
      status: "collecting",
      step: 2,
      totalSteps: TOTAL_BACKUP_STEPS,
      message: "Mengumpulkan snapshot data dari database",
      endpoint,
      at: new Date().toISOString(),
    });
    const payload = await buildPayload(true);

    emitBackupProgress({
      runId,
      status: "serializing",
      step: 3,
      totalSteps: TOTAL_BACKUP_STEPS,
      message: "Menyusun payload backup",
      endpoint,
      at: new Date().toISOString(),
    });

    const payloadJson = JSON.stringify(payload);
    const payloadSizeKb = Math.round(Buffer.byteLength(payloadJson, "utf8") / 1024);
    saveLogging(`[BACKUP][${runId}] Snapshot ready, sending to ${endpoint}`);
    saveLogging(
      `[BACKUP][${runId}] Payload size ~${payloadSizeKb} KB (timeout ${BACKUP_TIMEOUT_MS}ms)`,
    );
    emitBackupProgress({
      runId,
      status: "sending",
      step: 4,
      totalSteps: TOTAL_BACKUP_STEPS,
      message: `Mengirim payload ke server backup (${payloadSizeKb} KB)`,
      endpoint,
      payloadSizeKb,
      at: new Date().toISOString(),
    });

    const response = await postJsonWithTimeout(
      endpoint,
      payloadJson,
      BACKUP_TIMEOUT_MS,
    );

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(
        `Backup failed with status ${response.status}: ${responseText.slice(0, 300)}`,
      );
    }

    const durationMs = Date.now() - startedAt;
    saveLogging(
      `[BACKUP][${runId}] Success (${durationMs}ms) - snapshot_at=${payload.snapshot_at}`,
      "LOG",
    );
    emitBackupProgress({
      runId,
      status: "success",
      step: TOTAL_BACKUP_STEPS,
      totalSteps: TOTAL_BACKUP_STEPS,
      message: "Backup selesai berhasil",
      endpoint,
      payloadSizeKb,
      durationMs,
      at: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    saveLogging(`[BACKUP] Failed: ${message}`, "ERROR");
    emitBackupProgress({
      runId,
      status: "error",
      step: TOTAL_BACKUP_STEPS,
      totalSteps: TOTAL_BACKUP_STEPS,
      message: "Backup gagal",
      endpoint,
      error: message,
      at: new Date().toISOString(),
    });
    return false;
  } finally {
    isBackupRunning = false;
  }
}

export async function testBackupConnection(endpoint?: string | null) {
  try {
    const finalEndpoint = endpoint?.trim() || (await getBackupEndpoint());

    if (!finalEndpoint) {
      return Responses({
        code: 400,
        detail_message: "Endpoint backup belum diisi",
      });
    }

    const payload = await buildPayload(false);
    const payloadJson = JSON.stringify(payload);
    let response: Response;

    try {
      saveLogging(
        `[BACKUP][TEST] Start request to ${finalEndpoint} (timeout ${BACKUP_TEST_TIMEOUT_MS}ms)`,
      );
      response = await postJsonWithTimeout(
        finalEndpoint,
        payloadJson,
        BACKUP_TEST_TIMEOUT_MS,
      );
    } catch (err) {
      if (!isAbortError(err)) throw err;

      saveLogging(
        `[BACKUP][TEST] Request timeout, retrying once with timeout ${BACKUP_TEST_TIMEOUT_MS}ms`,
        "WARNING",
      );

      response = await postJsonWithTimeout(
        finalEndpoint,
        payloadJson,
        BACKUP_TEST_TIMEOUT_MS,
      );
    }

    if (!response.ok) {
      const body = await response.text();
      saveLogging(
        `[BACKUP][TEST] Endpoint error ${response.status}: ${body.slice(0, 300)}`,
        "WARNING",
      );
      return Responses({
        code: 400,
        detail_message: `Endpoint merespon ${response.status}`,
      });
    }

    saveLogging(`[BACKUP][TEST] Endpoint reachable: ${finalEndpoint}`);
    return Responses({
      code: 200,
      detail_message: "Koneksi server backup berhasil",
    });
  } catch (err) {
    const message = isAbortError(err)
      ? `Request timeout/aborted after ${BACKUP_TEST_TIMEOUT_MS}ms`
      : err instanceof Error
        ? err.message
        : String(err);
    saveLogging(`[BACKUP][TEST] Failed: ${message}`, "ERROR");
    return Responses({
      code: 500,
      detail_message: `Gagal test koneksi backup: ${message}. Cek endpoint/server apakah lambat atau menolak request.`,
    });
  }
}

export async function triggerBackupNow() {
  try {
    const endpoint = await getBackupEndpoint();

    if (!endpoint) {
      return Responses({
        code: 400,
        detail_message:
          "Endpoint backup belum diisi. Silakan isi di Pengaturan > API > Server Backup",
      });
    }

    saveLogging("[BACKUP] Manual backup requested");
    const success = await postBackupSnapshot(endpoint);

    if (!success) {
      return Responses({
        code: 500,
        detail_message: "Backup data gagal, cek Logs untuk detail error",
      });
    }

    return Responses({
      code: 200,
      detail_message: "Backup data berhasil dijalankan",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Responses({
      code: 500,
      detail_message: `Backup manual gagal: ${message}`,
    });
  }
}

export async function startBackupScheduler() {
  if (backupTimer) return;

  const [currentEndpoint, autoEnabled, intervalMinutes] = await Promise.all([
    prisma.settings.findFirst({
      where: {
        id_settings: BACKUP_ENDPOINT_ID,
      },
    }),
    getAutoBackupEnabled(),
    getAutoBackupIntervalMinutes(),
  ]);

  if (!currentEndpoint) {
    await prisma.settings.create({
      data: {
        id_settings: BACKUP_ENDPOINT_ID,
        label_settings: BACKUP_LABEL,
        content: "",
        url: "",
      },
    });
  }

  if (!autoEnabled) {
    saveLogging("[BACKUP] Auto backup status: OFF");
    return;
  }

  const intervalMs = intervalMinutes * 60 * 1000;
  backupTimer = setInterval(async () => {
    try {
      const endpoint = await getBackupEndpoint();

      if (!endpoint) {
        if (!isBackupEnabledLogged) {
          saveLogging(
            "[BACKUP] Auto backup aktif, tetapi endpoint belum diset di Pengaturan > API > Server Backup",
            "WARNING",
          );
          isBackupEnabledLogged = true;
        }
        return;
      }

      if (isBackupEnabledLogged) {
        saveLogging(
          "[BACKUP] Endpoint backup sudah tersedia, scheduler berjalan",
        );
        isBackupEnabledLogged = false;
      }

      await postBackupSnapshot(endpoint);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      saveLogging(`[BACKUP] Scheduler error: ${message}`, "ERROR");
    }
  }, intervalMs);

  saveLogging(
    `[BACKUP] Scheduler started (interval ${intervalMinutes} menit)`,
  );
}

export async function reloadAutoBackupScheduler() {
  try {
    clearBackupTimer();
    await startBackupScheduler();
    const intervalMinutes = await getAutoBackupIntervalMinutes();

    return Responses({
      code: 200,
      data: { interval_minutes: intervalMinutes },
      detail_message: `Scheduler auto backup berhasil dimuat ulang (${intervalMinutes} menit)`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Responses({
      code: 500,
      detail_message: `Gagal memuat ulang scheduler auto backup: ${message}`,
    });
  }
}

export async function stopAutoBackup() {
  try {
    clearBackupTimer();
    await setSettingsValue(AUTO_BACKUP_ENABLED_ID, AUTO_BACKUP_LABEL, "false");
    saveLogging("[BACKUP] Auto backup stopped by user", "WARNING");

    return Responses({
      code: 200,
      detail_message: "Auto backup berhasil dihentikan",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Responses({
      code: 500,
      detail_message: `Gagal menghentikan auto backup: ${message}`,
    });
  }
}

export async function startAutoBackup() {
  try {
    await setSettingsValue(AUTO_BACKUP_ENABLED_ID, AUTO_BACKUP_LABEL, "true");
    clearBackupTimer();
    await startBackupScheduler();
    saveLogging("[BACKUP] Auto backup started by user");

    return Responses({
      code: 200,
      detail_message: "Auto backup berhasil dinyalakan",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Responses({
      code: 500,
      detail_message: `Gagal menyalakan auto backup: ${message}`,
    });
  }
}

export async function getAutoBackupStatus() {
  try {
    const [enabled, intervalMinutes] = await Promise.all([
      getAutoBackupEnabled(),
      getAutoBackupIntervalMinutes(),
    ]);

    return Responses({
      code: 200,
      data: {
        enabled,
        running: backupTimer !== null,
        interval_minutes: intervalMinutes,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Responses({
      code: 500,
      detail_message: `Gagal mengambil status auto backup: ${message}`,
    });
  }
}

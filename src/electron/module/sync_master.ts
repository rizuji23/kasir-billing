import Responses from "../lib/responses.js";
import { prisma } from "../database.js";
import { saveLogging } from "./logging.js";

const MASTER_SYNC_ENDPOINT_ID = "SYNC_MASTER_ENDPOINT";
const MASTER_SYNC_ENDPOINT_LABEL = "Sync Master Endpoint";
const BACKUP_API_KEY_ID = "BACKUP_API_KEY";
const BACKUP_API_KEY_LABEL = "Backup API Key";
const MASTER_SYNC_INTERVAL_MS = 60_000;
const MASTER_SYNC_TIMEOUT_MS = 60_000;

type MasterSyncPayload = {
  message?: string;
  generated_at?: string;
  incremental?: boolean;
  updated_since?: string;
  counts?: Record<string, number>;
  data?: {
    CategoryMenu?: Array<Record<string, unknown>>;
    MenuCafe?: Array<Record<string, unknown>>;
    PriceBillingType?: Array<Record<string, unknown>>;
    PriceBilling?: Array<Record<string, unknown>>;
    Shift?: Array<Record<string, unknown>>;
  };
};

let syncTimer: NodeJS.Timeout | null = null;
let isSyncRunning = false;
let missingEndpointLogged = false;

const toDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return undefined;
};

const toInt = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return undefined;
};

const toStringOrUndefined = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  return undefined;
};

const toBooleanOrUndefined = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  return undefined;
};

const setSettingsValue = async (
  id_settings: string,
  label_settings: string,
  content: string,
) => {
  const found = await prisma.settings.findFirst({ where: { id_settings } });
  if (found) {
    await prisma.settings.update({
      where: { id_settings },
      data: { label_settings, content },
    });
    return;
  }

  await prisma.settings.create({
    data: { id_settings, label_settings, content, url: "" },
  });
};

const ensureSyncSettings = async () => {
  const [syncEndpoint, backupApiKey] = await Promise.all([
    prisma.settings.findFirst({
      where: { id_settings: MASTER_SYNC_ENDPOINT_ID },
    }),
    prisma.settings.findFirst({
      where: { id_settings: BACKUP_API_KEY_ID },
    }),
  ]);

  if (!syncEndpoint) {
    await setSettingsValue(
      MASTER_SYNC_ENDPOINT_ID,
      MASTER_SYNC_ENDPOINT_LABEL,
      "",
    );
  }

  if (!backupApiKey) {
    await setSettingsValue(BACKUP_API_KEY_ID, BACKUP_API_KEY_LABEL, "");
  }
};

const deriveSyncEndpointFromBackupEndpoint = async (): Promise<string> => {
  const backupEndpoint = await prisma.settings.findFirst({
    where: { id_settings: "BACKUP_SERVER_ENDPOINT" },
  });
  const raw = backupEndpoint?.content?.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    url.pathname = "/api/sync/master";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
};

const normalizeSyncEndpoint = (rawEndpoint: string): string => {
  const trimmed = rawEndpoint.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    if (!url.pathname || url.pathname === "/") {
      url.pathname = "/api/sync/master";
    }
    return url.toString();
  } catch {
    return trimmed;
  }
};

const getSyncEndpoint = async (): Promise<string> => {
  const setting = await prisma.settings.findFirst({
    where: { id_settings: MASTER_SYNC_ENDPOINT_ID },
  });
  const endpoint = normalizeSyncEndpoint(setting?.content?.trim() || "");
  if (endpoint) return endpoint;
  return normalizeSyncEndpoint(await deriveSyncEndpointFromBackupEndpoint());
};

const getBackupApiKey = async (): Promise<string> => {
  const setting = await prisma.settings.findFirst({
    where: { id_settings: BACKUP_API_KEY_ID },
  });
  return setting?.content?.trim() || "";
};

const fetchMasterSync = async (
  endpoint: string,
  backupApiKey: string,
): Promise<MasterSyncPayload> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MASTER_SYNC_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {};
    if (backupApiKey) {
      headers["x-backup-api-key"] = backupApiKey;
    }
    const response = await fetch(endpoint, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as MasterSyncPayload;
    return payload;
  } finally {
    clearTimeout(timeout);
  }
};

const syncCategoryMenu = async (rows: Array<Record<string, unknown>>) => {
  for (const row of rows) {
    const id = toInt(row.id);
    const name = toStringOrUndefined(row.name);
    if (!name) continue;

    const data = {
      name,
      created_at: toDate(row.created_at),
      updated_at: toDate(row.updated_at),
    };

    if (id) {
      await prisma.categoryMenu.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
      continue;
    }

    await prisma.categoryMenu.create({ data });
  }
};

const syncMenuCafe = async (rows: Array<Record<string, unknown>>) => {
  for (const row of rows) {
    const id = toInt(row.id);
    const name = toStringOrUndefined(row.name);
    const price = toInt(row.price);
    if (!name || typeof price !== "number") continue;

    const data = {
      name,
      price,
      categoryMenuId: toInt(row.categoryMenuId),
      price_modal: toInt(row.price_modal) ?? 0,
      price_profit: toInt(row.price_profit) ?? 0,
      send_to_kitchen: toBooleanOrUndefined(row.send_to_kitchen),
      created_at: toDate(row.created_at),
      updated_at: toDate(row.updated_at),
    };

    if (id) {
      await prisma.menuCafe.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
      continue;
    }

    await prisma.menuCafe.create({ data });
  }
};

const syncPriceBillingType = async (rows: Array<Record<string, unknown>>) => {
  for (const row of rows) {
    const id = toInt(row.id);
    const idPriceType = toStringOrUndefined(row.id_price_billing_type);
    const typePrice = toStringOrUndefined(row.type_price);
    if (!idPriceType || !typePrice) continue;

    const createData = {
      id_price_billing_type: idPriceType,
      type_price: typePrice,
      created_at: toDate(row.created_at),
      updated_at: toDate(row.updated_at),
    };

    if (id) {
      await prisma.priceBillingType.upsert({
        where: { id },
        create: { id, ...createData },
        update: createData,
      });
      continue;
    }

    await prisma.priceBillingType.upsert({
      where: { id_price_billing_type: idPriceType },
      create: createData,
      update: createData,
    });
  }
};

const syncPriceBilling = async (rows: Array<Record<string, unknown>>) => {
  for (const row of rows) {
    const idPriceBilling = toStringOrUndefined(row.id_price_billing);
    const typePriceId = toInt(row.type_price_id);
    const season = toStringOrUndefined(row.season);
    const price = toInt(row.price);
    if (!idPriceBilling || !typePriceId || !season || typeof price !== "number")
      continue;

    const createData = {
      id_price_billing: idPriceBilling,
      type_price_id: typePriceId,
      season,
      price,
      start_from: toStringOrUndefined(row.start_from),
      end_from: toStringOrUndefined(row.end_from),
      created_at: toDate(row.created_at),
      updated_at: toDate(row.updated_at),
    };

    await prisma.priceBilling.upsert({
      where: { id_price_billing: idPriceBilling },
      create: createData,
      update: createData,
    });
  }
};

const syncShift = async (rows: Array<Record<string, unknown>>) => {
  for (const row of rows) {
    const id = toInt(row.id);
    const shift = toStringOrUndefined(row.shift);
    const startHours = toDate(row.start_hours);
    const endHours = toDate(row.end_hours);
    if (!shift || !startHours || !endHours) continue;

    const data = {
      shift,
      start_hours: startHours,
      end_hours: endHours,
      created_at: toDate(row.created_at),
      updated_at: toDate(row.updated_at),
    };

    if (id) {
      await prisma.shift.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
      continue;
    }

    await prisma.shift.create({ data });
  }
};

const applyMasterSyncData = async (payload: MasterSyncPayload) => {
  const data = payload.data || {};
  await syncCategoryMenu(data.CategoryMenu || []);
  await syncPriceBillingType(data.PriceBillingType || []);
  await syncMenuCafe(data.MenuCafe || []);
  await syncPriceBilling(data.PriceBilling || []);
  await syncShift(data.Shift || []);
};

export async function runMasterSyncNow() {
  if (isSyncRunning) return false;
  isSyncRunning = true;

  try {
    const [endpoint, apiKey] = await Promise.all([
      getSyncEndpoint(),
      getBackupApiKey(),
    ]);

    if (!endpoint) {
      if (!missingEndpointLogged) {
        saveLogging(
          "[SYNC_MASTER] Endpoint belum diset. Isi di Pengaturan > API > Sync Master Endpoint",
          "WARNING",
        );
        missingEndpointLogged = true;
      }
      return false;
    }

    if (missingEndpointLogged) {
      saveLogging("[SYNC_MASTER] Endpoint tersedia, scheduler berjalan");
      missingEndpointLogged = false;
    }

    saveLogging(`[SYNC_MASTER] Request: GET ${endpoint}`);
    const payload = await fetchMasterSync(endpoint, apiKey);
    await applyMasterSyncData(payload);

    await setSettingsValue(
      "SYNC_MASTER_LAST_RUN_AT",
      "Sync Master Last Run At",
      new Date().toISOString(),
    );

    const countsText = JSON.stringify(payload.counts || {});
    saveLogging(
      `[SYNC_MASTER] Response OK incremental=${payload.incremental ? "true" : "false"} counts=${countsText}`,
    );
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    saveLogging(`[SYNC_MASTER] Failed: ${message}`, "ERROR");
    return false;
  } finally {
    isSyncRunning = false;
  }
}

export async function startMasterSyncScheduler() {
  if (syncTimer) return;
  await ensureSyncSettings();

  syncTimer = setInterval(() => {
    saveLogging("[SYNC_MASTER] Tick scheduler (1 menit)");
    void runMasterSyncNow();
  }, MASTER_SYNC_INTERVAL_MS);

  saveLogging("[SYNC_MASTER] Scheduler started (interval 1 menit)");
  void runMasterSyncNow();
}

export async function reloadMasterSyncScheduler() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
  await startMasterSyncScheduler();
  return Responses({
    code: 200,
    detail_message: "Scheduler sync master berhasil dimuat ulang (1 menit)",
  });
}

export async function getMasterSyncStatus() {
  const [endpoint, apiKey, lastRun] = await Promise.all([
    getSyncEndpoint(),
    getBackupApiKey(),
    prisma.settings.findFirst({
      where: { id_settings: "SYNC_MASTER_LAST_RUN_AT" },
    }),
  ]);

  return Responses({
    code: 200,
    data: {
      running: syncTimer !== null,
      endpoint,
      api_key_set: Boolean(apiKey),
      last_run_at: lastRun?.content || null,
    },
  });
}

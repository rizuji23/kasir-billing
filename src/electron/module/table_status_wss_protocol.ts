export type ManualLampWsCommand = {
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

export type ParsedManualLampCommand = {
  command: string;
  action: string;
  target: string;
  floorCode: string;
};

export type ManualLampCommandDecision =
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

const allowedActions = new Set(["on", "off", "blink"]);

const toStringSafe = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

export const normalizeTableNumber = (rawNumber: string): string => {
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

export const parseCommandAction = (
  command: string,
): { action: string; target: string } => {
  const [actionRaw, targetRaw] = command.trim().split(/\s+/);
  return {
    action: (actionRaw || "").toLowerCase(),
    target: targetRaw || "",
  };
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
      note:
        "Command tidak valid. Gunakan: on 01, off 01, blink 01, on all, off all",
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

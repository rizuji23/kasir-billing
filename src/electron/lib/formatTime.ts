import { PeriodeType } from "../types/index.js";

export interface CustomDateRange {
  startDate: Date;
  endDate: Date;
  closeHour?: number;
}

export function formatPrismaDate(
  type: PeriodeType,
  customRange?: CustomDateRange,
  closeHour: number = 3,
): { gte: Date; lte: Date } {
  const now = new Date();
  let gte: Date;
  let lte: Date;

  switch (type) {
    case "today": {
      gte = new Date(now);
      gte.setHours(0, 0, 0, 0);

      lte = new Date(now);
      lte.setDate(lte.getDate() + 1);
      lte.setHours(closeHour, 0, 0, 0);
      break;
    }

    case "yesterday": {
      gte = new Date(now);
      gte.setDate(gte.getDate() - 1);
      gte.setHours(0, 0, 0, 0);

      lte = new Date(now);
      lte.setHours(closeHour, 0, 0, 0);
      break;
    }

    case "monthly": {
      gte = new Date(now.getFullYear(), now.getMonth(), 1);
      lte = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }

    case "annual": {
      gte = new Date(now.getFullYear(), 0, 1);
      lte = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    }

    case "custom": {
      if (!customRange) {
        throw new Error("Custom range requires startDate and endDate");
      }

      gte = new Date(customRange.startDate);
      gte.setHours(0, 0, 0, 0);

      lte = new Date(customRange.endDate);
      const endCloseHour = customRange.closeHour ?? closeHour;
      lte.setHours(endCloseHour, 0, 0, 0);
      break;
    }

    default: {
      throw new Error("Invalid date range type");
    }
  }

  return { gte, lte };
}

import { PeriodeType } from "../types/index.js";

export interface CustomDateRange {
  startDate: Date;
  endDate: Date;
}

export function formatPrismaDate(
  type: PeriodeType, // Menambahkan support type 'weekly'
  customRange?: CustomDateRange,
): { gte: Date; lte: Date } {
  const now = new Date();
  let gte: Date;
  let lte: Date;

  // Helper untuk set jam operasional
  // 08:00 WIB = 01:00 UTC
  // 05:00 WIB (Besok) = 22:00 UTC (Hari yang sama)
  const setOperationalHours = (startDate: Date, endDate: Date) => {
    startDate.setUTCHours(1, 0, 0, 0); // 08:00 Pagi WIB
    endDate.setUTCHours(22, 0, 0, 0); // 05:00 Pagi WIB (Besoknya)
  };

  switch (type) {
    case "today": {
      gte = new Date(now);
      lte = new Date(now);
      setOperationalHours(gte, lte);
      break;
    }

    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      gte = new Date(yesterday);
      lte = new Date(yesterday);
      setOperationalHours(gte, lte);
      break;
    }

    case "weekly": {
      // Cari hari Senin minggu ini
      const day = now.getDay(); // 0 (Minggu) - 6 (Sabtu)
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust ke Senin

      gte = new Date(now);
      gte.setDate(diff);

      // Akhir minggu (Minggu)
      lte = new Date(gte);
      lte.setDate(gte.getDate() + 6);

      setOperationalHours(gte, lte);
      break;
    }

    case "monthly": {
      // Awal bulan
      gte = new Date(now.getFullYear(), now.getMonth(), 1);
      // Akhir bulan
      lte = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setOperationalHours(gte, lte);
      break;
    }

    case "annual": {
      gte = new Date(now.getFullYear(), 0, 1);
      lte = new Date(now.getFullYear(), 11, 31);

      setOperationalHours(gte, lte);
      break;
    }

    case "custom": {
      if (!customRange) {
        throw new Error("Custom range requires startDate and endDate");
      }

      gte = new Date(customRange.startDate);
      lte = new Date(customRange.endDate);

      setOperationalHours(gte, lte);
      break;
    }

    default: {
      throw new Error("Invalid date range type");
    }
  }

  return { gte, lte };
}

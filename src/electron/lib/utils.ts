import { prisma } from "../database.js";
import { MACHINE_ID } from "../MACHINE.js";
import { StatusTransaction } from "../types/index.js";

export const onMachineStatus = async (
  status: "CONNECTED" | "RECONNECTED" | "DISCONNECTED",
) => {
  await prisma.machine.update({
    where: {
      id_machine: MACHINE_ID,
    },
    data: {
      status: status,
    },
  });
};

export function convertRupiah(integer: string | null): string {
  if (integer === null || isNaN(Number(integer.replace(/\./g, "")))) {
    return "0";
  }

  const numberString = integer
    .toString()
    .replace(/\./g, "")
    .replace(/[^,\d]/g, "");
  const split = numberString.split(",");
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah += split[1] !== undefined ? "," + split[1] : "";

  return rupiah;
}

export const getShift = async (time: Date): Promise<string | null> => {
  try {
    // Fetch all shifts from the database
    const shifts = await prisma.shift.findMany();

    // Convert current time to minutes for precise comparison
    const currentMinutes = time.getHours() * 60 + time.getMinutes();

    for (const shift of shifts) {
      const startHours = new Date(shift.start_hours);
      const endHours = new Date(shift.end_hours);

      // Convert shift start & end times to minutes
      const startMinutes = startHours.getHours() * 60 + startHours.getMinutes();
      const endMinutes = endHours.getHours() * 60 + endHours.getMinutes();

      // Handle shifts that span midnight (e.g., 17:00 - 08:00)
      if (startMinutes > endMinutes) {
        // Shift spans midnight: valid if current time is after start or before end
        if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
          return shift.shift;
        }
      } else {
        // Normal shift: valid if current time is within the range (excluding end time)
        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          return shift.shift;
        }
      }
    }

    return null; // No shift found
  } catch (err) {
    console.error("Error fetching shift:", err);
    throw err;
  }
};

export const getMonthName = (date: Date): string => {
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return monthNames[date.getMonth()];
};

export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const strukFilter = async (
  filter: { period: string; start_date?: string; end_date?: string },
  shift: string,
) => {
  // Define the type for the whereClause object
  const whereClause: {
    status: StatusTransaction;
    updated_at?: {
      gte?: Date;
      lte?: Date;
    };
    shift?: string;
  } = {
    status: StatusTransaction.PAID, // Use the enum value
  };

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Today at 00:00
  const endOfDay = new Date(today);
  endOfDay.setDate(endOfDay.getDate() + 1); // Move to the next day
  endOfDay.setHours(3, 0, 0, 0); // Set time to 03:00 AM

  let period = ""; // Variable to store the period string

  if (shift && shift !== "all") {
    whereClause["shift"] = shift;
  }

  switch (filter.period) {
    case "today": {
      whereClause["updated_at"] = {
        gte: startOfDay, // Start of today at 00:00
        lte: endOfDay, // End of today at 03:00 AM next day
      };
      period = `Hari Ini (${formatDate(today)})`; // e.g., "Hari Ini (15/02/2023)"
      break;
    }

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1); // Move to yesterday

      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0)); // 00:00 yesterday
      const endOfYesterday = new Date(today.setHours(3, 0, 0, 0)); // Today at 03:00 AM

      whereClause["updated_at"] = {
        gte: startOfYesterday, // Start of yesterday at 00:00
        lte: endOfYesterday, // End of yesterday at 03:00 AM today
      };
      period = `Kemarin (${formatDate(yesterday)})`; // e.g., "Kemarin (14/02/2023)"
      break;
    }

    case "this_month": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      whereClause["updated_at"] = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
      period = getMonthName(today); // e.g., "Februari"
      break;
    }

    case "quarterly": {
      const currentMonth = today.getMonth(); // April = 3
      const startMonth = currentMonth - 2; // April (3) - 2 = January (1)

      // Handle year wrap-around if needed (for Jan/Feb)
      const adjustedYear =
        startMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
      const adjustedStartMonth = startMonth < 0 ? 12 + startMonth : startMonth;

      const startOfQuarter = new Date(adjustedYear, adjustedStartMonth, 1);

      const endOfQuarter = new Date(
        today.getFullYear(),
        currentMonth,
        today.getDate(), // Use current day of month
        23,
        59,
        59,
        999,
      );

      whereClause["updated_at"] = {
        gte: startOfQuarter,
        lte: endOfQuarter,
      };

      const startMonthName = getMonthName(startOfQuarter);
      const endMonthName = getMonthName(endOfQuarter);
      period = `${startMonthName} - ${endMonthName}`; // e.g., "Januari - April"
      break;
    }

    case "this_year": {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
      whereClause["updated_at"] = {
        gte: startOfYear,
        lte: endOfYear,
      };
      period = `Tahun ${today.getFullYear()}`; // e.g., "Tahun 2023"
      break;
    }

    case "custom": {
      if (filter.start_date && filter.end_date) {
        const startDate = new Date(filter.start_date);
        const endDate = new Date(filter.end_date);
        whereClause["updated_at"] = {
          gte: startDate,
          lte: endDate,
        };
        period = `${formatDate(startDate)} - ${formatDate(endDate)}`; // e.g., "01/01/2023 - 31/12/2023"
      }
      break;
    }

    default:
      period = "Semua Waktu"; // Default period if no filter is selected
      break;
  }
  return {
    where: whereClause,
    period: period,
  };
};

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
  const whereClause: {
    status: StatusTransaction;
    updated_at?: {
      gte?: Date;
      lte?: Date;
    };
    shift?: string;
  } = {
    status: StatusTransaction.PAID,
  };

  const now = new Date();
  let gte: Date;
  let lte: Date;
  let period = "";

  // Helper: Set Jam Operasional
  // Start: 08:00 WIB (01:00 UTC)
  // End: 05:00 WIB Besoknya (22:00 UTC di hari yang sama agar +7 jam jadi 05:00 besok)
  const setOperationalHours = (startDate: Date, endDate: Date) => {
    startDate.setUTCHours(1, 0, 0, 0);
    endDate.setUTCHours(22, 0, 0, 0);
  };

  if (shift && shift !== "all") {
    whereClause["shift"] = shift;
  }

  switch (filter.period) {
    case "today": {
      gte = new Date(now);
      lte = new Date(now);
      setOperationalHours(gte, lte);

      period = `Hari Ini (${formatDate(now)})`;
      break;
    }

    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      gte = new Date(yesterday);
      lte = new Date(yesterday);
      setOperationalHours(gte, lte);

      period = `Kemarin (${formatDate(yesterday)})`;
      break;
    }

    case "weekly": {
      // Minggu Ini (Senin s/d Minggu)
      const day = now.getDay(); // 0 (Minggu) - 6 (Sabtu)
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust ke Senin

      gte = new Date(now);
      gte.setDate(diff); // Set ke Senin

      lte = new Date(gte);
      lte.setDate(gte.getDate() + 6); // Set ke Minggu

      setOperationalHours(gte, lte);

      period = `Minggu Ini (${formatDate(gte)} - ${formatDate(lte)})`;
      break;
    }

    case "this_month": {
      gte = new Date(now.getFullYear(), now.getMonth(), 1);
      lte = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setOperationalHours(gte, lte);

      period = getMonthName(now);
      break;
    }

    case "quarterly": {
      // Triwulan (3 Bulan terakhir termasuk bulan ini)
      const currentMonth = now.getMonth();
      // Mundur 2 bulan ke belakang
      const startMonth = currentMonth - 2;

      // Handle pergantian tahun jika mundur ke tahun lalu
      const adjustedYear =
        startMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const adjustedStartMonth = startMonth < 0 ? 12 + startMonth : startMonth;

      gte = new Date(adjustedYear, adjustedStartMonth, 1);
      lte = new Date(now.getFullYear(), currentMonth + 1, 0); // Akhir bulan ini

      setOperationalHours(gte, lte);

      const startMonthName = getMonthName(gte);
      const endMonthName = getMonthName(lte);
      period = `${startMonthName} - ${endMonthName}`;
      break;
    }

    case "this_year": {
      gte = new Date(now.getFullYear(), 0, 1);
      lte = new Date(now.getFullYear(), 11, 31);

      setOperationalHours(gte, lte);

      period = `Tahun ${now.getFullYear()}`;
      break;
    }

    case "custom": {
      if (filter.start_date && filter.end_date) {
        gte = new Date(filter.start_date);
        lte = new Date(filter.end_date);

        setOperationalHours(gte, lte);

        period = `${formatDate(gte)} - ${formatDate(lte)}`;
      } else {
        // Fallback jika user pilih custom tapi tanggal kosong, default ke hari ini
        gte = new Date(now);
        lte = new Date(now);
        setOperationalHours(gte, lte);
        period = `Hari Ini (${formatDate(now)})`;
      }
      break;
    }

    default:
      // Default ke "Semua Waktu" atau "Hari Ini" tergantung kebutuhan
      // Di sini saya set logic default mirip 'today' agar aman, tapi labelnya Semua Waktu
      gte = new Date(now);
      lte = new Date(now);
      setOperationalHours(gte, lte);
      period = "Hari Ini";
      break;
  }

  // Assign gte dan lte ke whereClause jika sudah terdefinisi
  if (gte && lte) {
    whereClause["updated_at"] = {
      gte: gte,
      lte: lte,
    };
  }

  return {
    where: whereClause,
    period: period,
  };
};

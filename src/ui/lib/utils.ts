import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatToRupiah(
  amountStr: string,
  with_fraction: boolean = false,
): string {
  const amount = parseFloat(amountStr);
  if (isNaN(amount)) {
    throw new Error("Invalid number format");
  }

  let faction = {};
  if (with_fraction) {
    faction = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
  }
  return amount.toLocaleString("id-ID", faction);
}

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

export function convertToInteger(formattedRupiah: string | null): number {
  if (formattedRupiah === null) {
    return 0;
  }

  const cleanedString = formattedRupiah.replace(/[^0-9]/g, "");
  const integerValue = parseInt(cleanedString, 10);
  return isNaN(integerValue) ? 0 : integerValue;
}

export function generateShortUUID() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shortUUID = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    shortUUID += chars[randomIndex];
  }

  return shortUUID;
}

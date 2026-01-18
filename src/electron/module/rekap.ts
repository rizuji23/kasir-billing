import { dialog, ipcMain } from "electron";
import { IRekapModuleParams, TypePrint } from "../types/index.js";
import {
  generateExcelRekapPenjualanCafe,
  generatePDFRekapPenjualanCafe,
  getRekapPenjualanCafe,
} from "./report/rekap.service.js";

export default function RekapModule() {
  ipcMain.handle(
    "rekap_penjualan_cafe",
    async (
      _,
      data: {
        time: IRekapModuleParams;
        type_print: TypePrint;
      },
    ) => {
      // 1. Ambil Data
      const result = await getRekapPenjualanCafe(data.time);
      if (!result) return null;

      const { data_order, period } = result;

      // 2. Jika tidak ada permintaan print, return raw data (untuk Frontend)
      // Perbaikan: Return result.data_order, bukan data input
      if (!data.type_print) {
        return result;
      }

      // 3. Jika ada permintaan Print (PDF/Excel)

      // --- PERBAIKAN DEFAULT NAME ---
      // String period isinya "18/01/2026 - 19/01/2026"
      // Kita harus ubah "/" menjadi "-" agar valid jadi nama file
      const safePeriod = period.toString().replace(/\//g, "-");

      // Hasil: "Rekap_Cafe_18-01-2026 - 19-01-2026"
      const defaultName = `Rekap_Cafe_${safePeriod}`;
      // -----------------------------

      const options = {
        title: "Simpan Laporan",
        defaultPath:
          data.type_print === "PDF"
            ? `${defaultName}.pdf`
            : `${defaultName}.xlsx`,
        filters: [
          data.type_print === "PDF"
            ? { name: "PDF Files", extensions: ["pdf"] }
            : { name: "Excel Files", extensions: ["xlsx"] },
        ],
      };

      const { filePath, canceled } = await dialog.showSaveDialog(options);

      if (canceled || !filePath) return false;

      try {
        if (data.type_print === "PDF") {
          await generatePDFRekapPenjualanCafe(
            data_order,
            result.category_totals, // Pass category_totals
            result.total_order, // Pass total_order
            period.toString(),
            filePath,
          );
        } else if (data.type_print === "EXCEL") {
          await generateExcelRekapPenjualanCafe(
            data_order,
            result.category_totals, // Pass data total per kategori
            result.total_order, // Pass data grand total
            period.toString(),
            filePath,
          );
        }

        return true;
      } catch (error) {
        dialog.showErrorBox("Gagal Menyimpan", `Error: ${error}`);
        return false;
      }
    },
  );
}

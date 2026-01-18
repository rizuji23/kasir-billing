import { ipcMain } from "electron";
import { IRekapModuleParams, TypePrint } from "../types/index.js";
import { getRekapPenjualanCafe } from "./report/rekap.service.js";

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
      const data_rekap = await getRekapPenjualanCafe(data.time);
      console.log("data_rekap", data_rekap);
      return data_rekap;
    },
  );
}

import { ipcMain } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";
import log from "electron-log";

export function saveLogging(
  message: string,
  status: "LOG" | "WARNING" | "ERROR" = "LOG",
) {
  try {
    if (status === "LOG") {
      log.info(message);
    } else if (status === "ERROR") {
      log.error(message);
    } else if (status === "WARNING") {
      log.warn(message);
    }

    return;
  } catch (err) {
    console.log(err);
    return err;
  }
}

export default function LoggingModule() {
  ipcMain.handle("get_logging", async () => {
    try {
      const res = await prisma.logsData.findMany({
        orderBy: {
          id: "desc",
        },
      });

      return Responses({ code: 200, data: res });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Gagal menyimpan Menu: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Gagal menyimpan Menu" });
    }
  });
}

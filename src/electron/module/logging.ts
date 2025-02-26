import { ipcMain } from "electron";
import { prisma } from "../database.js";
import Responses from "../lib/responses.js";

export async function saveLogging(
  message: string,
  status: "LOG" | "WARNING" | "ERROR" = "LOG",
) {
  try {
    const res = await prisma.logsData.create({
      data: {
        activity: message,
        status: status,
      },
    });

    return res;
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

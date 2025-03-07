import { ipcMain } from "electron";
import {
  getLocalIPAddress,
  getLocalSubnet,
  isAlive,
  scanNetwork,
} from "./network_scan.js";
import Responses from "../../lib/responses.js";
import { prisma } from "../../database.js";
import { TypeServer } from "../../types/index.js";
import generateShortUUID from "../../lib/random.js";

export default function NetworkModule() {
  ipcMain.handle("network_scan", async (_, port: number) => {
    return await scanNetwork(getLocalSubnet(), port);
  });

  ipcMain.handle(
    "save_network",
    async (
      _,
      data: {
        ip: string;
        hostname: string;
        number: string;
        type_server: TypeServer;
      },
    ) => {
      try {
        const check_ip_connection = await isAlive(data.ip);

        if (!check_ip_connection) {
          return Responses({
            code: 400,
            detail_message: "IP tidak tersambung oleh jaringan lokal",
          });
        }

        await prisma.localServers.create({
          data: {
            id_local_server: generateShortUUID(),
            ip: data.ip,
            hostname: data.hostname,
            number: data.number,
            status: check_ip_connection ? "CONNECTED" : "DISCONNECTED",
            type_server: data.type_server,
          },
        });

        return Responses({
          code: 201,
          detail_message: "Network berhasil disimpan",
        });
      } catch (err) {
        return Responses({
          code: 500,
          detail_message: `Terjadi Kesalahan: ${
            err instanceof Error ? err.message : "Unknown error"
          }`,
        });
      }
    },
  );

  ipcMain.handle(
    "opsi_network",
    async (_, ip: string, opsi: "delete" | "check") => {
      try {
        const ip_data = await prisma.localServers.findFirst({
          where: {
            ip: ip,
          },
        });

        if (!ip_data) {
          return Responses({
            code: 404,
            detail_message: "Network tidak ditemukan",
          });
        }

        if (opsi === "delete") {
          await prisma.localServers.delete({
            where: {
              id: ip_data.id,
            },
          });
        } else {
          const check_ip_connection = await isAlive(ip_data.ip);

          await prisma.localServers.update({
            where: {
              id: ip_data.id,
            },
            data: {
              status: check_ip_connection ? "CONNECTED" : "DISCONNECTED",
            },
          });
        }

        return Responses({
          code: 201,
          detail_message: "Network berhasil diubah",
        });
      } catch (err) {
        return Responses({
          code: 500,
          detail_message: `Terjadi Kesalahan: ${
            err instanceof Error ? err.message : "Unknown error"
          }`,
        });
      }
    },
  );

  ipcMain.handle("list_network", async () => {
    try {
      const servers = await prisma.localServers.findMany();

      await Promise.all(
        servers.map(async (el) => {
          const connection_status = await isAlive(el.ip);
          return prisma.localServers.update({
            where: { id_local_server: el.id_local_server },
            data: { status: connection_status ? "CONNECTED" : "DISCONNECTED" },
          });
        }),
      );

      const [cashier, kitchen] = await Promise.all([
        prisma.localServers.findMany({ where: { type_server: "CASHIER" } }),
        prisma.localServers.findMany({ where: { type_server: "KITCHEN" } }),
      ]);

      return Responses({
        code: 200,
        data: { cashier, kitchen },
      });
    } catch (err) {
      return Responses({
        code: 500,
        detail_message: `Terjadi Kesalahan: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      });
    }
  });

  ipcMain.handle("my_ip", async () => {
    return getLocalIPAddress();
  });
}

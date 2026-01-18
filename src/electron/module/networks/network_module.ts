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
import { initSocket } from "../../socket.js";

export default function NetworkModule() {
  ipcMain.handle("network_scan", async (_, port: number) => {
    return await scanNetwork(getLocalSubnet(), port);
  });

  ipcMain.handle("save_socket", async (_, socket: string) => {
    try {
      const check_ip_connection = await isAlive(socket);

      if (!check_ip_connection) {
        return Responses({
          code: 400,
          detail_message: "IP tidak tersambung oleh jaringan lokal",
        });
      }

      const existingServer = await prisma.localServers.findFirst({
        where: {
          type_server: "KITCHEN",
        },
      });

      let local;

      if (existingServer) {
        local = await prisma.localServers.update({
          where: {
            id: existingServer.id,
          },
          data: {
            status: "CONNECTED",
            ip: `http://${socket}:4321`,
          },
        });
      } else {
        local = await prisma.localServers.create({
          data: {
            id_local_server: generateShortUUID(),
            ip: `http://${socket}:4321`,
            hostname: "KITCHEN HOST PC",
            number: "1",
            status: "CONNECTED",
            type_server: "KITCHEN",
          },
        });
      }

      initSocket(local.ip);

      return Responses({
        code: 201,
        detail_message: "Network berhasil disimpan",
      });
    } catch (err) {
      console.error(err);
      return Responses({
        code: 500,
        detail_message: `Terjadi Kesalahan: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      });
    }
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

  ipcMain.handle("send_chat", async (_, message: string) => {
    try {
      const get_cashier = await prisma.settings.findFirst({
        where: {
          id_settings: "CASHIER_NAME",
        },
      });

      if (!get_cashier) {
        return Responses({
          code: 404,
          detail_message: "Cashier name tidak ditemukan",
        });
      }

      const my_ip = getLocalIPAddress();

      const data = {
        type: "chat",
        ip: my_ip,
        name: get_cashier.content,
        data: {
          message: message,
          created_at: new Date(),
        },
      };

      return Responses({
        code: 200,
        data: data,
        detail_message: "Chat berhasil didapatkan",
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
}

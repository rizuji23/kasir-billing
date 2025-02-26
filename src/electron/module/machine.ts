import { SerialPort } from "serialport";
import { prisma } from "../database.js";
import { MACHINE_ID } from "../MACHINE.js";
import { ipcMain } from "electron";
import Responses from "../lib/responses.js";
import { onMachineStatus } from "../lib/utils.js";
import { saveLogging } from "./logging.js";

let serialport: SerialPort | null = null;
let isReconnecting = false;

export async function connectMachine(): Promise<SerialPort | null> {
  try {
    if (serialport && serialport.isOpen) {
      console.log("Serial port already connected.");
      await saveLogging("Serial port already connected.");
      return serialport;
    }

    const get_port = await prisma.settings.findFirst({
      where: { id_settings: "PORT" },
    });

    if (!get_port || !get_port.content) {
      console.error("Serial port not configured in database.");
      await saveLogging("Serial port not configured in database.", "ERROR");
      await onMachineStatus("DISCONNECTED");
      return null;
    }

    serialport = new SerialPort({
      path: get_port.content,
      baudRate: 115200,
      autoOpen: false,
    });

    serialport.on("error", async (err) => {
      console.error("Serial port error:", err.message);
      await saveLogging(
        "Serial port error: " + JSON.stringify(err.message),
        "ERROR",
      );
      await onMachineStatus("DISCONNECTED");
    });

    serialport.on("close", async () => {
      console.log("Serial port closed. Attempting to reconnect...");
      await saveLogging(
        "Serial port closed. Attempting to reconnect...",
        "WARNING",
      );
      await onMachineStatus("DISCONNECTED");
      await reconnectMachine();
    });

    return new Promise<SerialPort | null>((resolve, reject) => {
      serialport?.open(async (err) => {
        if (err) {
          console.error("Failed to open serial port:", err.message);
          await saveLogging(
            "Failed to open serial port: " + JSON.stringify(err.message),
            "ERROR",
          );
          await onMachineStatus("DISCONNECTED");
          return reject(null);
        }

        console.log("Serial port connected.");
        await saveLogging("Serial port connected.");
        await onMachineStatus("CONNECTED");
        resolve(serialport);
      });
    });
  } catch (err) {
    console.error("Error connecting to serial port:", err);
    await saveLogging(
      "Error connecting to serial port: " + JSON.stringify(err),
      "WARNING",
    );
    return null;
  }
}

export function isMachineConnected(): boolean {
  return serialport?.isOpen ?? false;
}

export async function reconnectMachine(): Promise<SerialPort | null> {
  if (isReconnecting) {
    console.warn("Reconnection already in progress...");
    await saveLogging("Reconnection already in progress...", "WARNING");
    return serialport;
  }

  isReconnecting = true;

  try {
    if (serialport && serialport.isOpen) {
      await new Promise<void>((resolve, reject) => {
        serialport?.close((err) => {
          if (err) {
            console.warn("Error closing serial port:", err.message);
            saveLogging(
              "Error closing serial port: " + JSON.stringify(err.message),
              "WARNING",
            );
            return reject(err);
          }
          console.log("Serial port closed before reconnecting.");
          saveLogging("Serial port closed before reconnecting.", "WARNING");
          resolve();
        });
      });
    }

    await prisma.machine.update({
      where: { id_machine: MACHINE_ID },
      data: { status: "RECONNECTED" },
    });

    console.log("Reconnecting to machine...");
    saveLogging("Reconnecting to machine...", "WARNING");
    serialport = await connectMachine();

    if (!serialport) {
      saveLogging("Reconnection failed: No serialport available.", "ERROR");
      console.error("Reconnection failed: No serialport available.");
    }
  } catch (error) {
    console.error("Error during reconnection:", error);
    saveLogging("Error during reconnection: " + JSON.stringify(error), "ERROR");
  } finally {
    isReconnecting = false; // Reset flag no matter what
  }

  return serialport;
}

export async function sendMessageToMachine(message: string): Promise<unknown> {
  if (!isMachineConnected()) {
    console.warn("Machine is not connected. Attempting to reconnect...");
    await saveLogging(
      "Machine is not connected. Attempting to reconnect...",
      "ERROR",
    );
    serialport = await reconnectMachine();

    if (!serialport || !serialport.isOpen) {
      return Promise.reject({
        code: 500,
        detail_message: "Failed to reconnect to serial port",
      });
    }
  }

  return new Promise((resolve, reject) => {
    serialport!.write(message, (err) => {
      if (err) {
        console.error("Error sending message:", err.message);
        saveLogging(
          "Error sending message: " + JSON.stringify(err.message),
          "ERROR",
        );
        return reject({
          code: 500,
          detail_message: `Failed to send message: ${err.message}`,
        });
      }

      console.log(`Message sent: ${message}`);
      resolve({ code: 200, detail_message: "Message sent successfully" });
    });
  });
}

export default function MachineModule() {
  ipcMain.handle("get_status_machine", async () => {
    try {
      const res = await prisma.machine.findFirst({
        where: { id_machine: MACHINE_ID },
      });

      return Responses({ code: 200, data: res });
    } catch (err) {
      return Responses({
        code: 500,
        detail_message: `Error fetching machine status: ${err}`,
      });
    }
  });

  ipcMain.handle(
    "send_on",
    async (_, data: { id_table: string; number: string }) => {
      try {
        await sendMessageToMachine(`on ${data.number}`);
        const tables = await prisma.tableBilliard.update({
          where: { id_table: data.id_table },
          data: {
            power: "ON",
          },
        });

        return Responses({
          code: 201,
          data: tables,
          detail_message: `Table ${data.number} dinyalakan`,
        });
      } catch (err) {
        return Responses({
          code: 500,
          detail_message: `Error fetching table power: ${err}`,
        });
      }
    },
  );

  ipcMain.handle(
    "send_off",
    async (_, data: { id_table: string; number: string }) => {
      try {
        await sendMessageToMachine(`off ${data.number}`);
        const tables = await prisma.tableBilliard.update({
          where: { id_table: data.id_table },
          data: {
            power: "OFF",
          },
        });

        return Responses({
          code: 201,
          data: tables,
          detail_message: `Table ${data.number} dimatikan`,
        });
      } catch (err) {
        return Responses({
          code: 500,
          detail_message: `Error fetching table power: ${err}`,
        });
      }
    },
  );

  ipcMain.handle("on_off_all", async (_, status: string) => {
    try {
      await sendMessageToMachine(`${status === "ON_ALL" ? "on" : "off"} all`);
      const tables = await prisma.tableBilliard.updateMany({
        data: {
          power: status === "ON_ALL" ? "ON" : "OFF",
        },
      });

      return Responses({
        code: 201,
        data: tables,
        detail_message: `Semua Table ${
          status === "ON_ALL" ? "Dinayalakan" : "Dimatikan"
        }`,
      });
    } catch (err) {
      return Responses({
        code: 500,
        detail_message: `Error fetching table power: ${err}`,
      });
    }
  });
}

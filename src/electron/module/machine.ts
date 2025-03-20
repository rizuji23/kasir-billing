import { SerialPort } from "serialport";
import { prisma } from "../database.js";
import { MACHINE_ID } from "../MACHINE.js";
import { ipcMain, Notification } from "electron";
import Responses from "../lib/responses.js";
import { onMachineStatus } from "../lib/utils.js";
import { saveLogging } from "./logging.js";

let serialport: SerialPort | null = null;
let isReconnecting = false;
const messageQueue: string[] = [];
let isWriting = false;

// Helper function to show notifications
function showNotification(title: string, body: string = "") {
  new Notification({ title, body }).show();
}

// Helper function to handle errors and log them
async function handleError(
  context: string,
  error: Error | string | unknown,
  severity: "ERROR" | "WARNING" = "ERROR",
) {
  // Convert the error to a string representation
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : JSON.stringify(error);

  console.error(`${context}:`, errorMessage);
  saveLogging(`${context}: ${errorMessage}`, severity);
  await onMachineStatus("DISCONNECTED");
  // showNotification("Error", `${context}: ${errorMessage}`);
}

// Function to initialize serial port
function initializeSerialPort(portPath: string): SerialPort {
  const port = new SerialPort({
    path: portPath,
    baudRate: 115200,
    autoOpen: false,
  });

  port.on("error", async (err) => {
    await handleError("Serial port error", err);
  });

  port.on("close", async () => {
    console.log("Serial port closed. Attempting to reconnect...");
    saveLogging("Serial port closed. Attempting to reconnect...", "WARNING");
    await onMachineStatus("DISCONNECTED");
    await reconnectMachine();
    // showNotification(
    //   "Box terputus",
    //   "Port serial tertutup. Mencoba menyambungkan kembali...",
    // );
  });

  return port;
}

// Function to connect to the machine
export async function connectMachine(): Promise<SerialPort | null> {
  if (serialport && serialport.isOpen) {
    console.log("Serial port already connected.");
    saveLogging("Serial port already connected.");
    showNotification(
      "Box sudah terkoneksi",
      "Box sudah dalam keadaan terkoneksi",
    );

    return serialport;
  }

  try {
    const portSetting = await prisma.settings.findFirst({
      where: { id_settings: "PORT" },
    });

    if (!portSetting?.content) {
      await handleError(
        "Serial port not configured in database",
        new Error("PORT setting missing"),
      );
      return null;
    }

    serialport = initializeSerialPort(portSetting.content);

    return new Promise<SerialPort | null>((resolve, reject) => {
      serialport?.open(async (err) => {
        if (err) {
          await handleError("Failed to open serial port", err);
          return reject(null);
        }

        console.log("Serial port connected.");
        saveLogging("Serial port connected.");
        await onMachineStatus("CONNECTED");
        showNotification("Box billing berhasil terkoneksi");
        resolve(serialport);
      });
    });
  } catch (err) {
    await handleError("Error connecting to serial port", err, "WARNING");
    return null;
  }
}

// Function to check if the machine is connected
export function isMachineConnected(): boolean {
  return serialport?.isOpen ?? false;
}

// Function to reconnect to the machine
export async function reconnectMachine(): Promise<SerialPort | null> {
  if (isReconnecting) {
    console.warn("Reconnection already in progress...");
    saveLogging("Reconnection already in progress...", "WARNING");
    showNotification("Koneksi ulang sedang berlangsung...");
    return serialport;
  }

  isReconnecting = true;

  try {
    if (serialport?.isOpen) {
      await new Promise<void>((resolve, reject) => {
        serialport?.close((err) => {
          if (err) {
            handleError("Error closing serial port", err, "WARNING");
            return reject(err);
          }
          console.log("Serial port closed before reconnecting.");
          saveLogging("Serial port closed before reconnecting.", "WARNING");
          // showNotification(
          //   "Port serial ditutup sebelum menghubungkan kembali.",
          // );
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
    showNotification("Menghubungkan kembali ke mesin...");
    serialport = await connectMachine();

    if (!serialport) {
      await handleError(
        "Reconnection failed",
        new Error("No serialport available"),
      );
    }
  } catch (error) {
    await handleError("Error during reconnection", error);
  } finally {
    isReconnecting = false;
  }

  return serialport;
}

// Function to process the message queue
async function processQueue() {
  if (isWriting || messageQueue.length === 0 || !serialport?.isOpen) return;

  isWriting = true;
  const message = messageQueue.shift();

  if (message) {
    try {
      await new Promise<void>((resolve, reject) => {
        serialport!.write(message, (err) => {
          if (err) {
            handleError("Error sending message", err);
            return reject(err);
          }

          serialport!.drain(() => {
            console.log(`Message sent: ${message}`);
            resolve();
          });
        });
      });
    } finally {
      isWriting = false;
      processQueue();
    }
  } else {
    isWriting = false;
  }
}

// Function to send a message to the machine
export async function sendMessageToMachine(message: string): Promise<unknown> {
  if (!isMachineConnected()) {
    console.warn("Machine is not connected. Attempting to reconnect...");
    saveLogging(
      "Machine is not connected. Attempting to reconnect...",
      "ERROR",
    );
    serialport = await reconnectMachine();

    if (!serialport?.isOpen) {
      return Promise.reject({
        code: 500,
        detail_message: "Failed to reconnect to serial port",
      });
    }
  }

  messageQueue.push(message);
  processQueue();

  return { code: 200, detail_message: "Message queued successfully" };
}

// IPC Handlers
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
          data: { power: "ON" },
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
          data: { power: "OFF" },
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

  ipcMain.handle("send_blink", async (_, number: string) => {
    try {
      await sendMessageToMachine(`blink ${number}`);
      return Responses({
        code: 201,
        detail_message: `Table ${number} blink`,
      });
    } catch (err) {
      return Responses({
        code: 500,
        detail_message: `Error fetching table power: ${err}`,
      });
    }
  });

  ipcMain.handle("on_off_all", async (_, status: string) => {
    try {
      await sendMessageToMachine(`${status === "ON_ALL" ? "on" : "off"} all`);
      const tables = await prisma.tableBilliard.updateMany({
        data: { power: status === "ON_ALL" ? "ON" : "OFF" },
      });
      return Responses({
        code: 201,
        data: tables,
        detail_message: `Semua Table ${
          status === "ON_ALL" ? "Dinyalakan" : "Dimatikan"
        }`,
      });
    } catch (err) {
      return Responses({
        code: 500,
        detail_message: `Error fetching table power: ${err}`,
      });
    }
  });

  ipcMain.handle("reconnect_box", async () => {
    try {
      const serialPort = await reconnectMachine();

      if (serialPort && serialPort.isOpen) {
        return Responses({
          code: 200,
          data: { status: "SUCCESS" },
          detail_message: "Reconnected to the machine successfully.",
        });
      } else {
        return Responses({
          code: 500,
          data: { status: "FAILED" },
          detail_message: "Failed to reconnect to the machine.",
        });
      }
    } catch (error) {
      return Responses({
        code: 500,
        data: { status: "FAILED" },
        detail_message: `Error during reconnection: ${
          error instanceof Error ? error.message : error
        }`,
      });
    }
  });
}

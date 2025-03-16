import net from "net";
import os from "os";
import { exec } from "child_process";
import ping from "ping";
import { prisma } from "../../database.js";

/**
 * Function to check if a port is open on a given host
 */
const scanPort = (host: string, port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);

    socket.on("connect", () => {
      resolve(true);
      socket.destroy();
    });

    socket.on("timeout", () => {
      resolve(false);
      socket.destroy();
    });

    socket.on("error", () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
};

/**
 * Function to get hostnames from ARP cache
 */
const getArpTable = (): Promise<{ ip: string; hostname: string }[]> => {
  return new Promise((resolve) => {
    exec("arp -a", (error, stdout) => {
      if (error) {
        resolve([]);
        return;
      }

      const devices: { ip: string; hostname: string }[] = [];
      const lines = stdout.split("\n");

      lines.forEach((line) => {
        const match = line.match(/\s+([\d.]+)\s+([\w-]+)/);
        if (match) {
          devices.push({ ip: match[1], hostname: match[2] });
        }
      });

      resolve(devices);
    });
  });
};

/**
 * Function to scan a subnet for active devices with a specific port open
 */
export const scanNetwork = async (subnet: string, port: number) => {
  const results: { ip: string; hostname: string }[] = [];
  const scanPromises = [];
  const arpTable = await getArpTable();

  for (let i = 1; i <= 254; i++) {
    const ip = `${subnet}.${i}`;
    scanPromises.push(
      scanPort(ip, port).then(async (isOpen) => {
        if (isOpen) {
          const matchedDevice = arpTable.find((device) => device.ip === ip);
          results.push({
            ip,
            hostname: matchedDevice ? matchedDevice.hostname : "Unknown Host",
          });
        }
      }),
    );
  }

  await Promise.all(scanPromises);
  console.log("Active Devices:", results);
  return results;
};

// Get local subnet
export const getLocalSubnet = (): string => {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    for (const netInfo of interfaces[key] || []) {
      if (netInfo.family === "IPv4" && !netInfo.internal) {
        return netInfo.address.split(".").slice(0, 3).join(".");
      }
    }
  }
  return "192.168.1"; // Default subnet
};

export const getLocalIPAddress = (): string | null => {
  const interfaces = os.networkInterfaces();

  for (const key in interfaces) {
    for (const netInfo of interfaces[key] || []) {
      if (netInfo.family === "IPv4" && !netInfo.internal) {
        return netInfo.address; // Returns the device's IP address
      }
    }
  }

  return null; // If no IP is found
};

export const getCashierName = async () => {
  const res = await prisma.settings.findFirst({
    where: {
      id_settings: "CASHIER_NAME",
    },
  });

  return res;
};

export const isAlive = async (host: string) => {
  const res = await ping.promise.probe(host);
  return res.alive;
};

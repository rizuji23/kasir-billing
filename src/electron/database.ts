import { PrismaClient } from "@prisma/client";
import path from "path";
import { app } from "electron";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const databasePath = path.join(app.getPath("userData"), "kasir.sqlite");
const databaseUrl = `file:${databasePath}`;

// Override DATABASE_URL globally
process.env.DATABASE_URL = databaseUrl;

console.log("🛠 Using database path:", databaseUrl);

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((error) => console.error("❌ Database connection failed:", error));

export { prisma };

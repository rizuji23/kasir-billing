import { execSync } from "child_process";
import path from "path";
// import { app } from "electron";

// Get userData path manually
function getUserDataPath(): string {
  const appName = "kasir-billing"; // Change this to your app's name

  if (process.platform === "win32") {
    return path.join(process.env.APPDATA || "", appName);
  } else if (process.platform === "darwin") {
    return path.join(
      process.env.HOME || "",
      "Library",
      "Application Support",
      appName,
    );
  } else {
    return path.join(process.env.HOME || "", ".config", appName);
  }
}

export interface IMigrateNowResult {
  applied: boolean;
  output: string;
}

// function getSchemaPath(): string {
//   return path.join(app.getAppPath(), "prisma", "schema.prisma");
// }

export function migrateDatabaseNow(): Promise<IMigrateNowResult> {
  return new Promise((resolve, reject) => {
    const databasePath = `file:${path.join(getUserDataPath(), "kasir.sqlite")}`;
    const env = { ...process.env, DATABASE_URL: databasePath };
    // const schemaPath = getSchemaPath();

    try {
      const output = execSync(`npm run migrate`, {
        stdio: "pipe",
        shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh",
        env,
        encoding: "utf8",
      });

      const normalizedOutput = String(output || "");
      const applied =
        !normalizedOutput.includes("No pending migrations to apply.") &&
        !normalizedOutput.includes("No migration found");

      resolve({
        applied,
        output: normalizedOutput.trim(),
      });
    } catch (error) {
      reject(`Migration failed: ${error}`);
    }
  });
}

// Function to run Prisma migration
export function runMigration(
  migrationName: string = "default_migration",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const databasePath = `file:${path.join(getUserDataPath(), "kasir.sqlite")}`;
    const env = { ...process.env, DATABASE_URL: databasePath };

    try {
      console.log(
        `Running migration: ${migrationName} on database: ${databasePath}`,
      );

      execSync(`npx prisma migrate dev --name ${migrationName}`, {
        stdio: "inherit",
        shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh", // ✅ Fix: Explicit shell
        env,
      });

      resolve("Migration completed successfully.");
    } catch (error) {
      reject(`Migration failed: ${error}`);
    }
  });
}

import { execSync } from "child_process";
import path from "path";

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

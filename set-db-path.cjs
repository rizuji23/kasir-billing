const path = require("path");
const fs = require("fs");
const os = require("os");

// Function to get the userData directory without Electron
function getUserDataDir() {
  const platform = os.platform();
  const homeDir = os.homedir();

  switch (platform) {
    case "win32":
      return path.join(homeDir, "AppData", "Roaming", "kasir-billing");
    case "darwin":
      return path.join(homeDir, "Library", "Application Support", "kasir-billing");
    case "linux":
      return path.join(homeDir, ".config", "kasir-billing");
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Ensure the userData directory exists
const userDataDir = getUserDataDir();
if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir, { recursive: true });
}

// Set the database path
const databasePath = path.join(userDataDir, "kasir.sqlite");
const databaseUrl = `file:${databasePath}`;

// Write the DATABASE_URL to the .env file
fs.writeFileSync(".env", `DATABASE_URL=${databaseUrl}`);

console.log("🛠 Generated .env file with DATABASE_URL:", databaseUrl);
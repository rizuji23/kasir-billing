import { app, BrowserWindow, ipcMain } from "electron";
import pkg from "electron-updater";
import path from "path";
import { prisma } from "../database.js";
import { saveLogging } from "./logging.js";
const { autoUpdater } = pkg;

const UPDATE_GITHUB_REPO_KEY = "UPDATE_GITHUB_REPO";
const UPDATE_GITHUB_REPO_LABEL = "GitHub Update Repository";

function logUpdate(
  message: string,
  status: "LOG" | "WARNING" | "ERROR" = "LOG",
) {
  const text = `[UPDATER] ${message}`;
  console.log(text);
  saveLogging(text, status);
}

function parseGitHubRepo(raw: string): { owner: string; repo: string } | null {
  const cleaned = raw.trim().replace(/^https?:\/\/github\.com\//, "");
  const withoutGit = cleaned.replace(/\.git$/, "");
  const [owner, repo] = withoutGit.split("/");

  if (!owner || !repo) return null;
  return { owner, repo };
}

async function ensureUpdateRepoSetting() {
  const setting = await prisma.settings.findFirst({
    where: {
      id_settings: UPDATE_GITHUB_REPO_KEY,
    },
  });

  if (!setting) {
    await prisma.settings.create({
      data: {
        id_settings: UPDATE_GITHUB_REPO_KEY,
        label_settings: UPDATE_GITHUB_REPO_LABEL,
        content: "",
        url: "",
      },
    });
  }
}

async function configureGitHubFeed(mainWindow: BrowserWindow) {
  const setting = await prisma.settings.findFirst({
    where: {
      id_settings: UPDATE_GITHUB_REPO_KEY,
    },
  });

  const repoRaw = setting?.content?.trim() || "";
  const repoParsed = parseGitHubRepo(repoRaw);

  if (!repoParsed) {
    logUpdate(
      "Repository update belum diset di Settings (UPDATE_GITHUB_REPO)",
      "WARNING",
    );
    mainWindow.webContents.send(
      "update-error",
      new Error(
        "Repository update belum diset. Isi format owner/repo di Pengaturan > Tentang Aplikasi.",
      ),
    );
    return false;
  }

  autoUpdater.setFeedURL({
    provider: "github",
    owner: repoParsed.owner,
    repo: repoParsed.repo,
  });
  logUpdate(`Feed GitHub diset ke ${repoParsed.owner}/${repoParsed.repo}`);

  return true;
}

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (autoUpdater as any).verifyUpdateCodeSignature = false;
  autoUpdater.autoDownload = true; // Silent mode: auto download in background
  autoUpdater.autoInstallOnAppQuit = true; // Install silently on next app quit

  void ensureUpdateRepoSetting();

  if (process.env.NODE_ENV === "development") {
    autoUpdater.forceDevUpdateConfig = true; // Force dev update config
    autoUpdater.updateConfigPath = path.join(
      app.getAppPath(),
      "dev-app-update.yml",
    );
  }

  if (process.env.NODE_ENV === "development") {
    autoUpdater.allowPrerelease = true;
  }

  // Listen for download progress
  autoUpdater.on("download-progress", (progress) => {
    logUpdate(
      `Download progress ${Math.round(progress.percent || 0)}% (${progress.transferred}/${progress.total})`,
    );
    mainWindow.webContents.send("download-progress", progress);
  });

  // Other event listeners (update-available, update-downloaded, etc.)
  autoUpdater.on("update-available", (info) => {
    logUpdate(
      `Update tersedia v${info.version} (current v${app.getVersion()})`,
    );
    logUpdate(
      "Silent mode aktif: update akan di-download otomatis di background",
    );
    mainWindow.webContents.send("update-available", info);
  });

  autoUpdater.on("update-not-available", (info) => {
    logUpdate(`Tidak ada update baru. Current version v${app.getVersion()}`);
    mainWindow.webContents.send("update-not-available", info);
  });

  autoUpdater.on("update-downloaded", (info) => {
    logUpdate(`Update v${info.version} selesai didownload, siap install`);
    logUpdate("Update akan di-install otomatis saat aplikasi ditutup");
    mainWindow.webContents.send("update-downloaded", info);
  });

  autoUpdater.on("error", (error) => {
    logUpdate(`Error updater: ${error.message || error}`, "ERROR");
    mainWindow.webContents.send("update-error", error);
  });

  ipcMain.handle("get_version", () => {
    logUpdate(`Request current version -> v${app.getVersion()}`);
    return app.getVersion();
  });

  // IPC handlers
  ipcMain.on("check-for-updates", async () => {
    logUpdate("Request check-for-updates diterima");
    const ok = await configureGitHubFeed(mainWindow);
    if (!ok) {
      logUpdate(
        "Check update dibatalkan karena konfigurasi feed invalid",
        "WARNING",
      );
      return;
    }
    logUpdate("Menjalankan checkForUpdates()");
    autoUpdater.checkForUpdates();
  });

  ipcMain.on("download-update", () => {
    logUpdate("Request download-update diterima");
    autoUpdater.downloadUpdate();
  });

  ipcMain.on("quit-and-install", () => {
    logUpdate(
      "Request quit-and-install diterima, aplikasi akan restart untuk install update",
    );
    autoUpdater.quitAndInstall();
  });

  const silentCheckUpdates = async (reason: string) => {
    logUpdate(`Silent check update: ${reason}`);
    const ok = await configureGitHubFeed(mainWindow);
    if (!ok) return;

    autoUpdater.checkForUpdates().catch((error) => {
      logUpdate(`Silent check error: ${error?.message || error}`, "ERROR");
    });
  };

  // Silent initial check on app startup
  setTimeout(() => {
    void silentCheckUpdates("app-start");
  }, 8000);

  // Silent periodic checks every 30 minutes
  setInterval(
    () => {
      void silentCheckUpdates("interval-30m");
    },
    30 * 60 * 1000,
  );
}

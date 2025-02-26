-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LogsData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOG',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_LogsData" ("activity", "created_at", "id", "updated_at") SELECT "activity", "created_at", "id", "updated_at" FROM "LogsData";
DROP TABLE "LogsData";
ALTER TABLE "new_LogsData" RENAME TO "LogsData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

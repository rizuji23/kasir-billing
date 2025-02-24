-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TableBilliard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_table" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "type_play" TEXT NOT NULL DEFAULT 'NONE',
    "timer" DATETIME,
    "number" TEXT,
    "power" TEXT NOT NULL DEFAULT 'OFF',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_TableBilliard" ("created_at", "duration", "id", "id_table", "name", "number", "power", "status", "timer", "type_play", "updated_at") SELECT "created_at", "duration", "id", "id_table", "name", "number", "power", "status", "timer", "type_play", "updated_at" FROM "TableBilliard";
DROP TABLE "TableBilliard";
ALTER TABLE "new_TableBilliard" RENAME TO "TableBilliard";
CREATE UNIQUE INDEX "TableBilliard_id_table_key" ON "TableBilliard"("id_table");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

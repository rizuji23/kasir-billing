/*
  Warnings:

  - You are about to drop the column `id_cashier_server` on the `LocalServers` table. All the data in the column will be lost.
  - Added the required column `id_local_server` to the `LocalServers` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LocalServers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_local_server" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "type_server" TEXT NOT NULL DEFAULT 'CASHIER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_LocalServers" ("created_at", "hostname", "id", "ip", "number", "status", "type_server", "updated_at") SELECT "created_at", "hostname", "id", "ip", "number", "status", "type_server", "updated_at" FROM "LocalServers";
DROP TABLE "LocalServers";
ALTER TABLE "new_LocalServers" RENAME TO "LocalServers";
CREATE UNIQUE INDEX "LocalServers_id_local_server_key" ON "LocalServers"("id_local_server");
CREATE UNIQUE INDEX "LocalServers_ip_key" ON "LocalServers"("ip");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

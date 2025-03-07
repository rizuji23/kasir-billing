/*
  Warnings:

  - You are about to drop the `CashierServers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KitchenServers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CashierServers";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "KitchenServers";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LocalServers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_cashier_server" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "type_server" TEXT NOT NULL DEFAULT 'CASHIER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalServers_id_cashier_server_key" ON "LocalServers"("id_cashier_server");

-- CreateIndex
CREATE UNIQUE INDEX "LocalServers_ip_key" ON "LocalServers"("ip");

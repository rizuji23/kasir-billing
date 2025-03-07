-- CreateTable
CREATE TABLE "CashierServers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_cashier_server" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KitchenServers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_cashier_server" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CashierServers_id_cashier_server_key" ON "CashierServers"("id_cashier_server");

-- CreateIndex
CREATE UNIQUE INDEX "CashierServers_ip_key" ON "CashierServers"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenServers_id_cashier_server_key" ON "KitchenServers"("id_cashier_server");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenServers_ip_key" ON "KitchenServers"("ip");

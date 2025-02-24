-- CreateTable
CREATE TABLE "Voucher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_voucher" TEXT NOT NULL,
    "kode_voucher" TEXT NOT NULL,
    "discount" REAL NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_id_voucher_key" ON "Voucher"("id_voucher");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_kode_voucher_key" ON "Voucher"("kode_voucher");

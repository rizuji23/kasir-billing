-- CreateTable
CREATE TABLE "PriceBilling" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_price_billing" TEXT NOT NULL,
    "type_price" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PriceBilling_id_price_billing_key" ON "PriceBilling"("id_price_billing");

-- CreateIndex
CREATE UNIQUE INDEX "PriceBilling_type_price_key" ON "PriceBilling"("type_price");

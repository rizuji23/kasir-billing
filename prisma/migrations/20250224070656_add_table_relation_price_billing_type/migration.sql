/*
  Warnings:

  - You are about to drop the column `type_price` on the `PriceBilling` table. All the data in the column will be lost.
  - Added the required column `type_price_id` to the `PriceBilling` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PriceBillingType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_price_billing_type" TEXT NOT NULL,
    "type_price" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PriceBilling" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_price_billing" TEXT NOT NULL,
    "type_price_id" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "PriceBilling_type_price_id_fkey" FOREIGN KEY ("type_price_id") REFERENCES "PriceBillingType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PriceBilling" ("created_at", "id", "id_price_billing", "price", "season", "updated_at") SELECT "created_at", "id", "id_price_billing", "price", "season", "updated_at" FROM "PriceBilling";
DROP TABLE "PriceBilling";
ALTER TABLE "new_PriceBilling" RENAME TO "PriceBilling";
CREATE UNIQUE INDEX "PriceBilling_id_price_billing_key" ON "PriceBilling"("id_price_billing");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PriceBillingType_id_price_billing_type_key" ON "PriceBillingType"("id_price_billing_type");

-- CreateIndex
CREATE UNIQUE INDEX "PriceBillingType_type_price_key" ON "PriceBillingType"("type_price");

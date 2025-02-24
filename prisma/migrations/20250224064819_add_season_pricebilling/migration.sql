/*
  Warnings:

  - Added the required column `season` to the `PriceBilling` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PriceBilling" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_price_billing" TEXT NOT NULL,
    "type_price" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_PriceBilling" ("created_at", "id", "id_price_billing", "price", "type_price", "updated_at") SELECT "created_at", "id", "id_price_billing", "price", "type_price", "updated_at" FROM "PriceBilling";
DROP TABLE "PriceBilling";
ALTER TABLE "new_PriceBilling" RENAME TO "PriceBilling";
CREATE UNIQUE INDEX "PriceBilling_id_price_billing_key" ON "PriceBilling"("id_price_billing");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

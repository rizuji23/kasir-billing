/*
  Warnings:

  - Added the required column `price_profit` to the `MenuCafe` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuCafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "categoryMenuId" INTEGER,
    "price_sell" INTEGER NOT NULL,
    "price_modal" INTEGER NOT NULL,
    "price_profit" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "MenuCafe_categoryMenuId_fkey" FOREIGN KEY ("categoryMenuId") REFERENCES "CategoryMenu" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MenuCafe" ("categoryMenuId", "created_at", "id", "name", "price", "price_modal", "price_sell", "updated_at") SELECT "categoryMenuId", "created_at", "id", "name", "price", "price_modal", "price_sell", "updated_at" FROM "MenuCafe";
DROP TABLE "MenuCafe";
ALTER TABLE "new_MenuCafe" RENAME TO "MenuCafe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

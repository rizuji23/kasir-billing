/*
  Warnings:

  - Added the required column `qty` to the `OrderCafe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `OrderCafe` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderCafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order_cafe" TEXT NOT NULL,
    "menu_cafe" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "cash" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "userId" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderCafe_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafe" ("bookingId", "cash", "change", "created_at", "id", "id_order_cafe", "menu_cafe", "status", "total", "updated_at", "userId") SELECT "bookingId", "cash", "change", "created_at", "id", "id_order_cafe", "menu_cafe", "status", "total", "updated_at", "userId" FROM "OrderCafe";
DROP TABLE "OrderCafe";
ALTER TABLE "new_OrderCafe" RENAME TO "OrderCafe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

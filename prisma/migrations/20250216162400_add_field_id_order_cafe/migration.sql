/*
  Warnings:

  - Added the required column `id_order_cafe` to the `OrderCafe` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderCafe" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "id_order_cafe" TEXT NOT NULL,
    "menu_cafe" BIGINT NOT NULL,
    "total" BIGINT NOT NULL,
    "cash" BIGINT NOT NULL,
    "change" BIGINT NOT NULL,
    "bookingId" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "userId" BIGINT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderCafe_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafe" ("bookingId", "cash", "change", "created_at", "id", "menu_cafe", "status", "total", "updated_at", "userId") SELECT "bookingId", "cash", "change", "created_at", "id", "menu_cafe", "status", "total", "updated_at", "userId" FROM "OrderCafe";
DROP TABLE "OrderCafe";
ALTER TABLE "new_OrderCafe" RENAME TO "OrderCafe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

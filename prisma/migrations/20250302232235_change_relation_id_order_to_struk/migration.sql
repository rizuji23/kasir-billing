/*
  Warnings:

  - You are about to drop the column `id_order` on the `Struk` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderCafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order" TEXT NOT NULL DEFAULT '',
    "id_order_cafe" TEXT NOT NULL,
    "menu_cafe" INTEGER NOT NULL,
    "id_struk" INTEGER,
    "subtotal" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "cash" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "payment_method" TEXT NOT NULL DEFAULT 'CASH',
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "userId" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderCafe_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_id_struk_fkey" FOREIGN KEY ("id_struk") REFERENCES "Struk" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafe" ("bookingId", "cash", "change", "created_at", "id", "id_order", "id_order_cafe", "menu_cafe", "payment_method", "qty", "status", "subtotal", "total", "updated_at", "userId") SELECT "bookingId", "cash", "change", "created_at", "id", "id_order", "id_order_cafe", "menu_cafe", "payment_method", "qty", "status", "subtotal", "total", "updated_at", "userId" FROM "OrderCafe";
DROP TABLE "OrderCafe";
ALTER TABLE "new_OrderCafe" RENAME TO "OrderCafe";
CREATE TABLE "new_Struk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_struk" TEXT NOT NULL,
    "id_order_in" INTEGER,
    "id_booking" INTEGER,
    "name" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "total_cafe" INTEGER,
    "total_billing" INTEGER,
    "cash" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'CASH',
    "is_split_bill" BOOLEAN NOT NULL DEFAULT false,
    "type_struk" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Struk_id_order_in_fkey" FOREIGN KEY ("id_order_in") REFERENCES "OrderIn" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Struk_id_booking_fkey" FOREIGN KEY ("id_booking") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Struk" ("cash", "change", "created_at", "id", "id_booking", "id_order_in", "id_struk", "is_split_bill", "name", "payment_method", "status", "total", "total_billing", "total_cafe", "type_struk", "updated_at") SELECT "cash", "change", "created_at", "id", "id_booking", "id_order_in", "id_struk", "is_split_bill", "name", "payment_method", "status", "total", "total_billing", "total_cafe", "type_struk", "updated_at" FROM "Struk";
DROP TABLE "Struk";
ALTER TABLE "new_Struk" RENAME TO "Struk";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

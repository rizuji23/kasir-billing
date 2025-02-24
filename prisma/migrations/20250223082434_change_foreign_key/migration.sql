/*
  Warnings:

  - You are about to drop the column `discount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `discount_name` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `is_blink` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `type_booking` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `uang_cash` on the `Booking` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TableNumber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_table" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrderIn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order_in" TEXT NOT NULL,
    "token_qr" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "noTableId" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'CASH',
    "sub_total" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "nominal" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "status_order" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderIn_noTableId_fkey" FOREIGN KEY ("noTableId") REFERENCES "TableNumber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderInMenu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order_in_menu" TEXT NOT NULL,
    "orderInId" INTEGER NOT NULL,
    "menuId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderInMenu_orderInId_fkey" FOREIGN KEY ("orderInId") REFERENCES "OrderIn" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderInMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenuCafe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_booking" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "tableId" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "TableBilliard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("created_at", "duration", "id", "id_booking", "memberId", "name", "status", "tableId", "total_price", "updated_at") SELECT "created_at", "duration", "id", "id_booking", "memberId", "name", "status", "tableId", "total_price", "updated_at" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_id_booking_key" ON "Booking"("id_booking");
CREATE TABLE "new_OrderCafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order_cafe" TEXT NOT NULL,
    "menu_cafe" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "cash" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "userId" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderCafe_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafe" ("bookingId", "cash", "change", "created_at", "id", "id_order_cafe", "menu_cafe", "status", "total", "updated_at", "userId") SELECT "bookingId", "cash", "change", "created_at", "id", "id_order_cafe", "menu_cafe", "status", "total", "updated_at", "userId" FROM "OrderCafe";
DROP TABLE "OrderCafe";
ALTER TABLE "new_OrderCafe" RENAME TO "OrderCafe";
CREATE TABLE "new_SplitBill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_split_bill" TEXT NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "type_bill" TEXT NOT NULL DEFAULT 'SPLITBILL',
    "userId" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SplitBill_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SplitBill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SplitBill" ("bookingId", "created_at", "id", "id_split_bill", "name", "total", "type_bill", "updated_at", "userId") SELECT "bookingId", "created_at", "id", "id_split_bill", "name", "total", "type_bill", "updated_at", "userId" FROM "SplitBill";
DROP TABLE "SplitBill";
ALTER TABLE "new_SplitBill" RENAME TO "SplitBill";
CREATE TABLE "new_SplitBillDetail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "splitBillId" INTEGER NOT NULL,
    "menu_cafe" INTEGER,
    "detail_booking_id" INTEGER NOT NULL,
    "sub_total" INTEGER NOT NULL,
    "status_bill" TEXT NOT NULL DEFAULT 'NOPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SplitBillDetail_splitBillId_fkey" FOREIGN KEY ("splitBillId") REFERENCES "SplitBill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SplitBillDetail_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SplitBillDetail_detail_booking_id_fkey" FOREIGN KEY ("detail_booking_id") REFERENCES "DetailBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SplitBillDetail" ("created_at", "detail_booking_id", "id", "menu_cafe", "splitBillId", "status_bill", "sub_total", "updated_at") SELECT "created_at", "detail_booking_id", "id", "menu_cafe", "splitBillId", "status_bill", "sub_total", "updated_at" FROM "SplitBillDetail";
DROP TABLE "SplitBillDetail";
ALTER TABLE "new_SplitBillDetail" RENAME TO "SplitBillDetail";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TableNumber_id_table_key" ON "TableNumber"("id_table");

/*
  Warnings:

  - The primary key for the `Activity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Activity` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `userId` on the `Activity` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Booking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `memberId` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `tableId` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `CategoryMenu` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `CategoryMenu` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Chat` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `DetailBooking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `bookingId` on the `DetailBooking` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `DetailBooking` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `price` on the `DetailBooking` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Members` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `MenuCafe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `categoryMenuId` on the `MenuCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `MenuCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `price` on the `MenuCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `price_modal` on the `MenuCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `price_sell` on the `MenuCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `OrderCafe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `bookingId` on the `OrderCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `cash` on the `OrderCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `change` on the `OrderCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `OrderCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `menu_cafe` on the `OrderCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `total` on the `OrderCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `userId` on the `OrderCafe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `PriceMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `PriceMember` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `price` on the `PriceMember` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Settings` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Shift` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Shift` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `SplitBill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `bookingId` on the `SplitBill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `SplitBill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `total` on the `SplitBill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `userId` on the `SplitBill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `SplitBillDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `detail_booking_id` on the `SplitBillDetail` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `SplitBillDetail` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `menu_cafe` on the `SplitBillDetail` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `splitBillId` on the `SplitBillDetail` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `sub_total` on the `SplitBillDetail` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `TableBilliard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `TableBilliard` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activity" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type_activity" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Activity" ("activity", "created_at", "id", "type_activity", "updated_at", "userId") SELECT "activity", "created_at", "id", "type_activity", "updated_at", "userId" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_booking" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "tableId" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "uang_cash" INTEGER DEFAULT 0,
    "discount" INTEGER DEFAULT 0,
    "discount_name" TEXT,
    "type_booking" TEXT NOT NULL DEFAULT 'REGULAR',
    "is_blink" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "TableBilliard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("created_at", "discount", "discount_name", "duration", "id", "id_booking", "is_blink", "memberId", "name", "status", "tableId", "total_price", "type_booking", "uang_cash", "updated_at") SELECT "created_at", "discount", "discount_name", "duration", "id", "id_booking", "is_blink", "memberId", "name", "status", "tableId", "total_price", "type_booking", "uang_cash", "updated_at" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_id_booking_key" ON "Booking"("id_booking");
CREATE TABLE "new_CategoryMenu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_CategoryMenu" ("created_at", "id", "name", "updated_at") SELECT "created_at", "id", "name", "updated_at" FROM "CategoryMenu";
DROP TABLE "CategoryMenu";
ALTER TABLE "new_CategoryMenu" RENAME TO "CategoryMenu";
CREATE TABLE "new_Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "send_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Chat" ("created_at", "id", "send_by", "text", "updated_at") SELECT "created_at", "id", "send_by", "text", "updated_at" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
CREATE TABLE "new_DetailBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "start_duration" DATETIME NOT NULL,
    "end_duration" DATETIME NOT NULL,
    "type_bill" TEXT NOT NULL DEFAULT 'ALL',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DetailBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DetailBooking" ("bookingId", "created_at", "duration", "end_duration", "id", "price", "start_duration", "status", "type_bill", "updated_at") SELECT "bookingId", "created_at", "duration", "end_duration", "id", "price", "start_duration", "status", "type_bill", "updated_at" FROM "DetailBooking";
DROP TABLE "DetailBooking";
ALTER TABLE "new_DetailBooking" RENAME TO "DetailBooking";
CREATE TABLE "new_Members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_member" TEXT NOT NULL,
    "kode_member" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "no_telp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type_member" TEXT NOT NULL DEFAULT 'PREMIUM',
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "playing" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "discount" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Members" ("created_at", "discount", "email", "end_date", "id", "id_member", "kode_member", "name", "no_telp", "playing", "start_date", "status", "type_member", "updated_at") SELECT "created_at", "discount", "email", "end_date", "id", "id_member", "kode_member", "name", "no_telp", "playing", "start_date", "status", "type_member", "updated_at" FROM "Members";
DROP TABLE "Members";
ALTER TABLE "new_Members" RENAME TO "Members";
CREATE UNIQUE INDEX "Members_id_member_key" ON "Members"("id_member");
CREATE UNIQUE INDEX "Members_kode_member_key" ON "Members"("kode_member");
CREATE UNIQUE INDEX "Members_no_telp_key" ON "Members"("no_telp");
CREATE UNIQUE INDEX "Members_email_key" ON "Members"("email");
CREATE TABLE "new_MenuCafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "categoryMenuId" INTEGER,
    "price_sell" INTEGER NOT NULL,
    "price_modal" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "MenuCafe_categoryMenuId_fkey" FOREIGN KEY ("categoryMenuId") REFERENCES "CategoryMenu" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MenuCafe" ("categoryMenuId", "created_at", "id", "name", "price", "price_modal", "price_sell", "updated_at") SELECT "categoryMenuId", "created_at", "id", "name", "price", "price_modal", "price_sell", "updated_at" FROM "MenuCafe";
DROP TABLE "MenuCafe";
ALTER TABLE "new_MenuCafe" RENAME TO "MenuCafe";
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
    CONSTRAINT "OrderCafe_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafe" ("bookingId", "cash", "change", "created_at", "id", "id_order_cafe", "menu_cafe", "status", "total", "updated_at", "userId") SELECT "bookingId", "cash", "change", "created_at", "id", "id_order_cafe", "menu_cafe", "status", "total", "updated_at", "userId" FROM "OrderCafe";
DROP TABLE "OrderCafe";
ALTER TABLE "new_OrderCafe" RENAME TO "OrderCafe";
CREATE TABLE "new_PriceMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL,
    "playing" INTEGER NOT NULL,
    "type_member" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_PriceMember" ("created_at", "discount", "id", "playing", "price", "type_member", "updated_at") SELECT "created_at", "discount", "id", "playing", "price", "type_member", "updated_at" FROM "PriceMember";
DROP TABLE "PriceMember";
ALTER TABLE "new_PriceMember" RENAME TO "PriceMember";
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label_settings" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Settings" ("content", "created_at", "id", "label_settings", "updated_at", "url") SELECT "content", "created_at", "id", "label_settings", "updated_at", "url" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE TABLE "new_Shift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shift" TEXT NOT NULL,
    "start_hours" DATETIME NOT NULL,
    "end_hours" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Shift" ("created_at", "end_hours", "id", "shift", "start_hours", "updated_at") SELECT "created_at", "end_hours", "id", "shift", "start_hours", "updated_at" FROM "Shift";
DROP TABLE "Shift";
ALTER TABLE "new_Shift" RENAME TO "Shift";
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
    CONSTRAINT "SplitBill_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SplitBill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "SplitBillDetail_splitBillId_fkey" FOREIGN KEY ("splitBillId") REFERENCES "SplitBill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SplitBillDetail_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SplitBillDetail_detail_booking_id_fkey" FOREIGN KEY ("detail_booking_id") REFERENCES "DetailBooking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SplitBillDetail" ("created_at", "detail_booking_id", "id", "menu_cafe", "splitBillId", "status_bill", "sub_total", "updated_at") SELECT "created_at", "detail_booking_id", "id", "menu_cafe", "splitBillId", "status_bill", "sub_total", "updated_at" FROM "SplitBillDetail";
DROP TABLE "SplitBillDetail";
ALTER TABLE "new_SplitBillDetail" RENAME TO "SplitBillDetail";
CREATE TABLE "new_TableBilliard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_table" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_TableBilliard" ("created_at", "duration", "id", "id_table", "name", "status", "updated_at") SELECT "created_at", "duration", "id", "id_table", "name", "status", "updated_at" FROM "TableBilliard";
DROP TABLE "TableBilliard";
ALTER TABLE "new_TableBilliard" RENAME TO "TableBilliard";
CREATE UNIQUE INDEX "TableBilliard_id_table_key" ON "TableBilliard"("id_table");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("created_at", "id", "name", "password", "updated_at", "username") SELECT "created_at", "id", "name", "password", "updated_at", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

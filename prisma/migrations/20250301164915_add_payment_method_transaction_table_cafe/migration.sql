-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_booking" TEXT NOT NULL,
    "memberId" INTEGER,
    "name" TEXT NOT NULL,
    "tableId" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'CASH',
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
    "id_order" TEXT NOT NULL DEFAULT '',
    "id_order_cafe" TEXT NOT NULL,
    "menu_cafe" INTEGER NOT NULL,
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
    CONSTRAINT "OrderCafe_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafe" ("bookingId", "cash", "change", "created_at", "id", "id_order", "id_order_cafe", "menu_cafe", "qty", "status", "subtotal", "total", "updated_at", "userId") SELECT "bookingId", "cash", "change", "created_at", "id", "id_order", "id_order_cafe", "menu_cafe", "qty", "status", "subtotal", "total", "updated_at", "userId" FROM "OrderCafe";
DROP TABLE "OrderCafe";
ALTER TABLE "new_OrderCafe" RENAME TO "OrderCafe";
CREATE TABLE "new_SplitBill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_split_bill" TEXT NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "type_bill" TEXT NOT NULL DEFAULT 'SPLITBILL',
    "payment_method" TEXT NOT NULL DEFAULT 'CASH',
    "userId" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SplitBill_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SplitBill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SplitBill" ("bookingId", "created_at", "id", "id_split_bill", "name", "total", "type_bill", "updated_at", "userId") SELECT "bookingId", "created_at", "id", "id_split_bill", "name", "total", "type_bill", "updated_at", "userId" FROM "SplitBill";
DROP TABLE "SplitBill";
ALTER TABLE "new_SplitBill" RENAME TO "SplitBill";
CREATE TABLE "new_Struk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_struk" TEXT NOT NULL,
    "id_order" INTEGER,
    "id_order_in" INTEGER,
    "id_booking" INTEGER,
    "name" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "cash" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'CASH',
    "type_struk" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Struk_id_order_in_fkey" FOREIGN KEY ("id_order_in") REFERENCES "OrderIn" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Struk_id_order_fkey" FOREIGN KEY ("id_order") REFERENCES "OrderCafe" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Struk_id_booking_fkey" FOREIGN KEY ("id_booking") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Struk" ("cash", "change", "created_at", "id", "id_booking", "id_order", "id_order_in", "id_struk", "name", "status", "total", "type_struk", "updated_at") SELECT "cash", "change", "created_at", "id", "id_booking", "id_order", "id_order_in", "id_struk", "name", "status", "total", "type_struk", "updated_at" FROM "Struk";
DROP TABLE "Struk";
ALTER TABLE "new_Struk" RENAME TO "Struk";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

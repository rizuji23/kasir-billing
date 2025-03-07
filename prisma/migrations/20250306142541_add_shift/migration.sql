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
    "type_play" TEXT NOT NULL DEFAULT 'REGULAR',
    "idPriceType" INTEGER,
    "shift" TEXT NOT NULL DEFAULT 'PAGI',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "TableBilliard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_idPriceType_fkey" FOREIGN KEY ("idPriceType") REFERENCES "PriceBillingType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("created_at", "duration", "id", "idPriceType", "id_booking", "memberId", "name", "payment_method", "status", "tableId", "total_price", "type_play", "updated_at") SELECT "created_at", "duration", "id", "idPriceType", "id_booking", "memberId", "name", "payment_method", "status", "tableId", "total_price", "type_play", "updated_at" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_id_booking_key" ON "Booking"("id_booking");
CREATE TABLE "new_DetailBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "start_duration" DATETIME NOT NULL,
    "end_duration" DATETIME NOT NULL,
    "type_bill" TEXT NOT NULL DEFAULT 'ALL',
    "shift" TEXT NOT NULL DEFAULT 'PAGI',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DetailBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DetailBooking" ("bookingId", "created_at", "duration", "end_duration", "id", "price", "start_duration", "status", "type_bill", "updated_at") SELECT "bookingId", "created_at", "duration", "end_duration", "id", "price", "start_duration", "status", "type_bill", "updated_at" FROM "DetailBooking";
DROP TABLE "DetailBooking";
ALTER TABLE "new_DetailBooking" RENAME TO "DetailBooking";
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
    "shift" TEXT NOT NULL DEFAULT 'PAGI',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderCafe_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_id_struk_fkey" FOREIGN KEY ("id_struk") REFERENCES "Struk" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafe" ("bookingId", "cash", "change", "created_at", "id", "id_order", "id_order_cafe", "id_struk", "menu_cafe", "payment_method", "qty", "status", "subtotal", "total", "updated_at", "userId") SELECT "bookingId", "cash", "change", "created_at", "id", "id_order", "id_order_cafe", "id_struk", "menu_cafe", "payment_method", "qty", "status", "subtotal", "total", "updated_at", "userId" FROM "OrderCafe";
DROP TABLE "OrderCafe";
ALTER TABLE "new_OrderCafe" RENAME TO "OrderCafe";
CREATE TABLE "new_OrderCafeItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order_cafe_item" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "menu_cafe" INTEGER NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "shift" TEXT NOT NULL DEFAULT 'PAGI',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderCafeItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafeItem_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafeItem" ("created_at", "id", "id_order_cafe_item", "menu_cafe", "orderId", "price", "updated_at") SELECT "created_at", "id", "id_order_cafe_item", "menu_cafe", "orderId", "price", "updated_at" FROM "OrderCafeItem";
DROP TABLE "OrderCafeItem";
ALTER TABLE "new_OrderCafeItem" RENAME TO "OrderCafeItem";
CREATE UNIQUE INDEX "OrderCafeItem_id_order_cafe_item_key" ON "OrderCafeItem"("id_order_cafe_item");
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
    "shift" TEXT NOT NULL DEFAULT 'PAGI',
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

-- CreateTable
CREATE TABLE "PaketSegment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_paket_segment" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_hours" TEXT NOT NULL,
    "end_hours" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaketPrice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_paket_price" TEXT NOT NULL,
    "paket_segment_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "is_last_call" BOOLEAN NOT NULL DEFAULT false,
    "last_call_hours" TEXT DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "PaketPrice_paket_segment_id_fkey" FOREIGN KEY ("paket_segment_id") REFERENCES "PaketSegment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "shift" TEXT NOT NULL DEFAULT 'Pagi',
    "idPaketPrice" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "TableBilliard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_idPriceType_fkey" FOREIGN KEY ("idPriceType") REFERENCES "PriceBillingType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_idPaketPrice_fkey" FOREIGN KEY ("idPaketPrice") REFERENCES "PaketPrice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("created_at", "duration", "id", "idPriceType", "id_booking", "memberId", "name", "payment_method", "shift", "status", "tableId", "total_price", "type_play", "updated_at") SELECT "created_at", "duration", "id", "idPriceType", "id_booking", "memberId", "name", "payment_method", "shift", "status", "tableId", "total_price", "type_play", "updated_at" FROM "Booking";
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
    "idPaketPrice" INTEGER,
    "shift" TEXT NOT NULL DEFAULT 'Pagi',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DetailBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DetailBooking_idPaketPrice_fkey" FOREIGN KEY ("idPaketPrice") REFERENCES "PaketPrice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DetailBooking" ("bookingId", "created_at", "duration", "end_duration", "id", "price", "shift", "start_duration", "status", "type_bill", "updated_at") SELECT "bookingId", "created_at", "duration", "end_duration", "id", "price", "shift", "start_duration", "status", "type_bill", "updated_at" FROM "DetailBooking";
DROP TABLE "DetailBooking";
ALTER TABLE "new_DetailBooking" RENAME TO "DetailBooking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PaketSegment_id_paket_segment_key" ON "PaketSegment"("id_paket_segment");

-- CreateIndex
CREATE UNIQUE INDEX "PaketPrice_id_paket_price_key" ON "PaketPrice"("id_paket_price");

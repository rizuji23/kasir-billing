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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "TableBilliard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_idPriceType_fkey" FOREIGN KEY ("idPriceType") REFERENCES "PriceBillingType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("created_at", "duration", "id", "id_booking", "memberId", "name", "payment_method", "status", "tableId", "total_price", "type_play", "updated_at") SELECT "created_at", "duration", "id", "id_booking", "memberId", "name", "payment_method", "status", "tableId", "total_price", "type_play", "updated_at" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_id_booking_key" ON "Booking"("id_booking");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

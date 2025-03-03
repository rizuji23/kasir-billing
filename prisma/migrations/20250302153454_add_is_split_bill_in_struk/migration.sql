-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "is_split_bill" BOOLEAN NOT NULL DEFAULT false,
    "type_struk" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Struk_id_order_in_fkey" FOREIGN KEY ("id_order_in") REFERENCES "OrderIn" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Struk_id_order_fkey" FOREIGN KEY ("id_order") REFERENCES "OrderCafe" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Struk_id_booking_fkey" FOREIGN KEY ("id_booking") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Struk" ("cash", "change", "created_at", "id", "id_booking", "id_order", "id_order_in", "id_struk", "name", "payment_method", "status", "total", "type_struk", "updated_at") SELECT "cash", "change", "created_at", "id", "id_booking", "id_order", "id_order_in", "id_struk", "name", "payment_method", "status", "total", "type_struk", "updated_at" FROM "Struk";
DROP TABLE "Struk";
ALTER TABLE "new_Struk" RENAME TO "Struk";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

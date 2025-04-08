-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Struk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_struk" TEXT NOT NULL,
    "id_order_in" INTEGER,
    "id_booking" INTEGER,
    "name" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "subtotal" INTEGER DEFAULT 0,
    "total_cafe" INTEGER,
    "total_billing" INTEGER,
    "cash" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "discount_billing" TEXT DEFAULT '0',
    "discount_cafe" TEXT DEFAULT '0',
    "subtotal_cafe" INTEGER DEFAULT 0,
    "subtotal_billing" INTEGER DEFAULT 0,
    "payment_method" TEXT NOT NULL DEFAULT 'CASH',
    "is_split_bill" BOOLEAN NOT NULL DEFAULT false,
    "type_struk" TEXT NOT NULL,
    "shift" TEXT NOT NULL DEFAULT 'Pagi',
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Struk_id_order_in_fkey" FOREIGN KEY ("id_order_in") REFERENCES "OrderIn" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Struk_id_booking_fkey" FOREIGN KEY ("id_booking") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Struk" ("cash", "change", "created_at", "discount_billing", "discount_cafe", "id", "id_booking", "id_order_in", "id_struk", "is_split_bill", "name", "payment_method", "shift", "status", "subtotal", "subtotal_billing", "subtotal_cafe", "total", "total_billing", "total_cafe", "type_struk", "updated_at") SELECT "cash", "change", "created_at", "discount_billing", "discount_cafe", "id", "id_booking", "id_order_in", "id_struk", "is_split_bill", "name", "payment_method", "shift", "status", "subtotal", "subtotal_billing", "subtotal_cafe", "total", "total_billing", "total_cafe", "type_struk", "updated_at" FROM "Struk";
DROP TABLE "Struk";
ALTER TABLE "new_Struk" RENAME TO "Struk";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

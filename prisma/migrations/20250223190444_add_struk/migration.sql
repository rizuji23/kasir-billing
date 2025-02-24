-- CreateTable
CREATE TABLE "Struk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_struk" TEXT NOT NULL,
    "id_order" INTEGER,
    "id_order_in" INTEGER,
    "id_booking" INTEGER,
    "name" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "cash" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "type_struk" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Struk_id_order_in_fkey" FOREIGN KEY ("id_order_in") REFERENCES "OrderIn" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Struk_id_order_fkey" FOREIGN KEY ("id_order") REFERENCES "OrderCafe" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Struk_id_booking_fkey" FOREIGN KEY ("id_booking") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

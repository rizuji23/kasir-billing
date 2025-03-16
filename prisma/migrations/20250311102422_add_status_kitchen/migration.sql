-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderCafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order" TEXT NOT NULL DEFAULT '',
    "id_order_cafe" TEXT NOT NULL,
    "menu_cafe" INTEGER NOT NULL,
    "id_struk" INTEGER,
    "name" TEXT,
    "subtotal" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "cash" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "payment_method" TEXT NOT NULL DEFAULT 'CASH',
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "status_kitchen" TEXT NOT NULL DEFAULT 'PENDING',
    "userId" INTEGER,
    "shift" TEXT NOT NULL DEFAULT 'Pagi',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderCafe_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_id_struk_fkey" FOREIGN KEY ("id_struk") REFERENCES "Struk" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafe" ("bookingId", "cash", "change", "created_at", "id", "id_order", "id_order_cafe", "id_struk", "menu_cafe", "name", "payment_method", "qty", "shift", "status", "subtotal", "total", "updated_at", "userId") SELECT "bookingId", "cash", "change", "created_at", "id", "id_order", "id_order_cafe", "id_struk", "menu_cafe", "name", "payment_method", "qty", "shift", "status", "subtotal", "total", "updated_at", "userId" FROM "OrderCafe";
DROP TABLE "OrderCafe";
ALTER TABLE "new_OrderCafe" RENAME TO "OrderCafe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

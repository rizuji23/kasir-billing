-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderCafeItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order_cafe_item" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "menu_cafe" INTEGER NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderCafeItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafeItem_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OrderCafeItem" ("created_at", "id", "id_order_cafe_item", "menu_cafe", "orderId", "updated_at") SELECT "created_at", "id", "id_order_cafe_item", "menu_cafe", "orderId", "updated_at" FROM "OrderCafeItem";
DROP TABLE "OrderCafeItem";
ALTER TABLE "new_OrderCafeItem" RENAME TO "OrderCafeItem";
CREATE UNIQUE INDEX "OrderCafeItem_id_order_cafe_item_key" ON "OrderCafeItem"("id_order_cafe_item");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "OrderCafeItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_order_cafe_item" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "menu_cafe" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderCafeItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderCafeItem_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderCafeItem_id_order_cafe_item_key" ON "OrderCafeItem"("id_order_cafe_item");

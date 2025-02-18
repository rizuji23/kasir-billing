-- CreateTable
CREATE TABLE "User" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TableBilliard" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "id_table" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Members" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "id_member" TEXT NOT NULL,
    "kode_member" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "no_telp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type_member" TEXT NOT NULL DEFAULT 'PREMIUM',
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "playing" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "discount" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "id_booking" TEXT NOT NULL,
    "memberId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "tableId" BIGINT NOT NULL,
    "duration" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "uang_cash" INTEGER DEFAULT 0,
    "discount" INTEGER DEFAULT 0,
    "discount_name" TEXT,
    "type_booking" TEXT NOT NULL DEFAULT 'REGULAR',
    "is_blink" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "TableBilliard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetailBooking" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "bookingId" BIGINT NOT NULL,
    "price" BIGINT NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "start_duration" DATETIME NOT NULL,
    "end_duration" DATETIME NOT NULL,
    "type_bill" TEXT NOT NULL DEFAULT 'ALL',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DetailBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceMember" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "price" BIGINT NOT NULL,
    "discount" INTEGER NOT NULL,
    "playing" INTEGER NOT NULL,
    "type_member" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CategoryMenu" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MenuCafe" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "categoryMenuId" BIGINT,
    "price_sell" BIGINT NOT NULL,
    "price_modal" BIGINT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "MenuCafe_categoryMenuId_fkey" FOREIGN KEY ("categoryMenuId") REFERENCES "CategoryMenu" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderCafe" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "menu_cafe" BIGINT NOT NULL,
    "total" BIGINT NOT NULL,
    "cash" BIGINT NOT NULL,
    "change" BIGINT NOT NULL,
    "bookingId" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOPAID',
    "userId" BIGINT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OrderCafe_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderCafe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "label_settings" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "shift" TEXT NOT NULL,
    "start_hours" DATETIME NOT NULL,
    "end_hours" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SplitBill" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "id_split_bill" TEXT NOT NULL,
    "bookingId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "total" BIGINT NOT NULL,
    "type_bill" TEXT NOT NULL DEFAULT 'SPLITBILL',
    "userId" BIGINT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SplitBill_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SplitBill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SplitBillDetail" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "splitBillId" BIGINT NOT NULL,
    "menu_cafe" BIGINT,
    "detail_booking_id" BIGINT NOT NULL,
    "sub_total" BIGINT NOT NULL,
    "status_bill" TEXT NOT NULL DEFAULT 'NOPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SplitBillDetail_splitBillId_fkey" FOREIGN KEY ("splitBillId") REFERENCES "SplitBill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SplitBillDetail_menu_cafe_fkey" FOREIGN KEY ("menu_cafe") REFERENCES "MenuCafe" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SplitBillDetail_detail_booking_id_fkey" FOREIGN KEY ("detail_booking_id") REFERENCES "DetailBooking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "TableBilliard_id_table_key" ON "TableBilliard"("id_table");

-- CreateIndex
CREATE UNIQUE INDEX "Members_id_member_key" ON "Members"("id_member");

-- CreateIndex
CREATE UNIQUE INDEX "Members_kode_member_key" ON "Members"("kode_member");

-- CreateIndex
CREATE UNIQUE INDEX "Members_no_telp_key" ON "Members"("no_telp");

-- CreateIndex
CREATE UNIQUE INDEX "Members_email_key" ON "Members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_id_booking_key" ON "Booking"("id_booking");

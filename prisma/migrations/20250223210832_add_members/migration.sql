/*
  Warnings:

  - You are about to drop the column `discount` on the `Members` table. All the data in the column will be lost.
  - Added the required column `id_price_member` to the `Members` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "id_price_member" INTEGER NOT NULL,
    CONSTRAINT "Members_id_price_member_fkey" FOREIGN KEY ("id_price_member") REFERENCES "PriceMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Members" ("created_at", "email", "end_date", "id", "id_member", "kode_member", "name", "no_telp", "playing", "start_date", "status", "type_member", "updated_at") SELECT "created_at", "email", "end_date", "id", "id_member", "kode_member", "name", "no_telp", "playing", "start_date", "status", "type_member", "updated_at" FROM "Members";
DROP TABLE "Members";
ALTER TABLE "new_Members" RENAME TO "Members";
CREATE UNIQUE INDEX "Members_id_member_key" ON "Members"("id_member");
CREATE UNIQUE INDEX "Members_kode_member_key" ON "Members"("kode_member");
CREATE UNIQUE INDEX "Members_no_telp_key" ON "Members"("no_telp");
CREATE UNIQUE INDEX "Members_email_key" ON "Members"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

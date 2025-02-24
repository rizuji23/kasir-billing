/*
  Warnings:

  - A unique constraint covering the columns `[id_settings]` on the table `Settings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Settings_id_settings_key" ON "Settings"("id_settings");

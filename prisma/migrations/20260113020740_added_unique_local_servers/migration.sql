/*
  Warnings:

  - A unique constraint covering the columns `[type_server]` on the table `LocalServers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LocalServers_type_server_key" ON "LocalServers"("type_server");

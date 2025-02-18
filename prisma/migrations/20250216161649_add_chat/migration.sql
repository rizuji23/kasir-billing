-- CreateTable
CREATE TABLE "Chat" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "send_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

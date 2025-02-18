-- CreateTable
CREATE TABLE "Activity" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "activity" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "type_activity" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

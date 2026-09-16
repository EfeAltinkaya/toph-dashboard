/*
  Warnings:

  - You are about to drop the column `mapX` on the `EmployeeLog` table. All the data in the column will be lost.
  - You are about to drop the column `mapY` on the `EmployeeLog` table. All the data in the column will be lost.
  - Added the required column `lat` to the `EmployeeLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `EmployeeLog` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmployeeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "accuracy" INTEGER NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeeLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EmployeeLog" ("accuracy", "activity", "audioUrl", "createdAt", "date", "employeeId", "endTime", "field", "id", "isNew", "startTime", "transcript") SELECT "accuracy", "activity", "audioUrl", "createdAt", "date", "employeeId", "endTime", "field", "id", "isNew", "startTime", "transcript" FROM "EmployeeLog";
DROP TABLE "EmployeeLog";
ALTER TABLE "new_EmployeeLog" RENAME TO "EmployeeLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

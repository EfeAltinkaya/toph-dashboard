-- Farms become tenants: every account, employee, log and message belongs
-- to exactly one farm, and the dashboard filters everything by it.
--
-- Written by hand rather than generated, because the columns are NOT NULL
-- on tables that already hold rows: they go on nullable, get backfilled to
-- the farm that existed before multi-tenancy, and are tightened after.

-- Nullable first.
ALTER TABLE "User" ADD COLUMN "farmId" INTEGER;
ALTER TABLE "Employee" ADD COLUMN "farmId" INTEGER;
ALTER TABLE "EmployeeLog" ADD COLUMN "farmId" INTEGER;
ALTER TABLE "Message" ADD COLUMN "farmId" INTEGER;

-- Everything that predates this migration belongs to the demo farm. On a
-- database being migrated from scratch there are no rows to move, but the
-- farm still has to exist for the backfill's subquery to resolve.
INSERT INTO "Farm" ("name", "joinCode")
SELECT 'Bay Ranch', 'BAYRANCH'
WHERE NOT EXISTS (SELECT 1 FROM "Farm" WHERE "joinCode" = 'BAYRANCH');

UPDATE "User" SET "farmId" = (SELECT "id" FROM "Farm" WHERE "joinCode" = 'BAYRANCH') WHERE "farmId" IS NULL;
UPDATE "Employee" SET "farmId" = (SELECT "id" FROM "Farm" WHERE "joinCode" = 'BAYRANCH') WHERE "farmId" IS NULL;
UPDATE "EmployeeLog" SET "farmId" = (SELECT "id" FROM "Farm" WHERE "joinCode" = 'BAYRANCH') WHERE "farmId" IS NULL;
UPDATE "Message" SET "farmId" = (SELECT "id" FROM "Farm" WHERE "joinCode" = 'BAYRANCH') WHERE "farmId" IS NULL;

-- Now required.
ALTER TABLE "User" ALTER COLUMN "farmId" SET NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "farmId" SET NOT NULL;
ALTER TABLE "EmployeeLog" ALTER COLUMN "farmId" SET NOT NULL;
ALTER TABLE "Message" ALTER COLUMN "farmId" SET NOT NULL;

-- An employee's name is unique inside a farm, not across the platform.
DROP INDEX "Employee_name_key";
CREATE UNIQUE INDEX "Employee_farmId_name_key" ON "Employee"("farmId", "name");

-- Every dashboard read is "this farm, recently".
CREATE INDEX "EmployeeLog_farmId_date_idx" ON "EmployeeLog"("farmId", "date");

ALTER TABLE "User" ADD CONSTRAINT "User_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeLog" ADD CONSTRAINT "EmployeeLog_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

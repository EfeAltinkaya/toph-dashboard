-- AlterTable
ALTER TABLE "EmployeeLog" ADD COLUMN     "coordSource" TEXT NOT NULL DEFAULT 'field',
ADD COLUMN     "gpsAccuracyM" DOUBLE PRECISION;

/*
  Warnings:

  - The `reservationTimes` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "reservationDays" INTEGER[],
DROP COLUMN "reservationTimes",
ADD COLUMN     "reservationTimes" JSONB;

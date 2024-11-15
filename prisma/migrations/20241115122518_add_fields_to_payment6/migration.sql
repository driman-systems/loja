/*
  Warnings:

  - The primary key for the `Payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `installments` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - The `id` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `bookingIds` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `transactionAmount` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "installments",
DROP COLUMN "updatedAt",
ADD COLUMN     "lastUpdated" TIMESTAMP(3),
ADD COLUMN     "statusMessage" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "transactionAmount" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
DROP COLUMN "bookingIds",
ADD COLUMN     "bookingIds" INTEGER[],
ADD CONSTRAINT "Payment_pkey" PRIMARY KEY ("id");

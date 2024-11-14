/*
  Warnings:

  - You are about to drop the column `installments` on the `Payment` table. All the data in the column will be lost.
  - Made the column `transactionId` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "installments",
ADD COLUMN     "dateApproved" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "paymentMethod" DROP NOT NULL,
ALTER COLUMN "transactionId" SET NOT NULL,
ALTER COLUMN "transactionAmount" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

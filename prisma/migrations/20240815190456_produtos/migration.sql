/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Product` table. All the data in the column will be lost.
  - Added the required column `hasDateReservation` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasTimeReservation` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "hasDateReservation" BOOLEAN NOT NULL,
ADD COLUMN     "hasTimeReservation" BOOLEAN NOT NULL,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "includedItems" TEXT[],
ADD COLUMN     "notIncludedItems" TEXT[],
ADD COLUMN     "promoPrice" DOUBLE PRECISION,
ADD COLUMN     "title" TEXT NOT NULL;

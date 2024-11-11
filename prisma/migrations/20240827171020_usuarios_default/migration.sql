/*
  Warnings:

  - You are about to drop the column `address` on the `ClientUser` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `ClientUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClientUser" DROP COLUMN "address",
DROP COLUMN "image",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'Cliente';

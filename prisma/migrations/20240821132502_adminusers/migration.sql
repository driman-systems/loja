/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `AdminUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nome` to the `AdminUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "ClientUser" ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "User";

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_cpf_key" ON "AdminUser"("cpf");

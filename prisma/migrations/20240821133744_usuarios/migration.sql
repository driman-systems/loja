/*
  Warnings:

  - You are about to drop the column `firstName` on the `ClientUser` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `ClientUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `ClientUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `ClientUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `ClientUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClientUser" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ClientUser_cpf_key" ON "ClientUser"("cpf");

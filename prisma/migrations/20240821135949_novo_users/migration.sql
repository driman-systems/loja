/*
  Warnings:

  - You are about to drop the column `nome` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `ClientUser` table. All the data in the column will be lost.
  - Added the required column `name` to the `AdminUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ClientUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "nome",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ClientUser" DROP COLUMN "nome",
ADD COLUMN     "name" TEXT NOT NULL;

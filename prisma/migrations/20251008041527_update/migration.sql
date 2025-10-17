/*
  Warnings:

  - Added the required column `sequencialItem` to the `procedimentosExecutados` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "procedimentosExecutados" DROP COLUMN "sequencialItem",
ADD COLUMN     "sequencialItem" INTEGER NOT NULL;

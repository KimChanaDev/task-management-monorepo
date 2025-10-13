/*
  Warnings:

  - Made the column `tokenFamily` on table `refresh_tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" ALTER COLUMN "tokenFamily" SET NOT NULL;

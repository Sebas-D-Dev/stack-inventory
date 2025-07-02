/*
  Warnings:

  - You are about to drop the column `reorderThreshold` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "reorderThreshold",
ADD COLUMN     "overrideConstraints" BOOLEAN NOT NULL DEFAULT false;

/*
  Warnings:

  - You are about to drop the column `reserve_price` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "reserve_price";

-- AlterTable
ALTER TABLE "UserAuction" ADD COLUMN     "reserve_price" DOUBLE PRECISION;

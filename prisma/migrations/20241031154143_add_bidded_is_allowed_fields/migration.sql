-- AlterTable
ALTER TABLE "UserAuction" ADD COLUMN     "bidded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAllowed" BOOLEAN NOT NULL DEFAULT false;

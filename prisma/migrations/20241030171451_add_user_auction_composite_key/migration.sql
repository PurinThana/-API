/*
  Warnings:

  - A unique constraint covering the columns `[user_id,auction_id]` on the table `UserAuction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserAuction_user_id_auction_id_key" ON "UserAuction"("user_id", "auction_id");

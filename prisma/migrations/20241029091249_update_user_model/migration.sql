-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('active', 'semi_inactive', 'inactive');

-- CreateTable
CREATE TABLE "Auction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" CHAR(6) NOT NULL,
    "opening_price" DOUBLE PRECISION NOT NULL,
    "current_price" DOUBLE PRECISION,
    "round" INTEGER,
    "mode" TEXT,
    "time" BIGINT,
    "action_btn" TEXT,
    "min_bid" DOUBLE PRECISION,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "organization" TEXT,
    "role" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "socket_id" TEXT,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "status" "AuctionStatus",
    "guest" BOOLEAN NOT NULL DEFAULT false,
    "bid" DOUBLE PRECISION,
    "auction_id" INTEGER NOT NULL,

    CONSTRAINT "UserAuction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "auction_id" INTEGER,
    "name" TEXT,
    "organization" TEXT,
    "message" TEXT,
    "time" BIGINT,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auction_code_key" ON "Auction"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "UserAuction" ADD CONSTRAINT "UserAuction_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuction" ADD CONSTRAINT "UserAuction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

// controllers/userController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const JSONBig = require('json-bigint');
const getLogByAuctionId = async (req, res) => {
    const { auction_id } = req.params;
    console.log(auction_id);
    try {
        const Logs = await prisma.log.findMany({
            where: { auction_id: parseInt(auction_id) },
        });

        if (Logs.length > 0) {
            res.send(JSONBig.stringify(Logs)); // Use JSONBig to serialize BigInt
        } else {
            res.status(404).json({ message: 'Logs not found' });
        }
    } catch (error) {
        console.error("Error fetching Logs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getLogByAuctionId,

};

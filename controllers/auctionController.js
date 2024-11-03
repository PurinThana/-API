// controllers/auctionController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all Auctions
const getAllAuctions = async (req, res) => {
    try {

        const auction = await prisma.auction.findMany(); // Use user in lowercase
        res.json(auction);
    } catch (error) {
        console.error("Error fetching auctions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get all in

const getAllInAuctions = async (req, res) => {
    const { id } = req.params
    try {
        const auction = await prisma.userAuction.findMany({
            where: {
                user_id: parseInt(id)
            },
            include: {
                auction: true,//อยากนำข้อมูลตาราง auction โดยเชื่อมจาก auction_id
            }
        })
        res.json(auction);
    } catch (error) {
        console.error("Error fetching auctions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Get a single user by ID
const getAuctionById = async (req, res) => {
    const { id } = req.params;
    try {
        const auction = await prisma.auction.findUnique({
            where: { id: parseInt(id) },
        });
        if (auction) {
            res.json(auction);
        } else {
            res.status(404).json({ message: 'Auction not found' });
        }
    } catch (error) {
        console.error("Error fetching auction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getAuctionByCode = async (req, res) => {
    const { code } = req.params;
    try {
        const auction = await prisma.auction.findUnique({
            where: { code: code },
        });
        if (auction) {
            res.json(auction);
        } else {
            res.status(404).json({ message: 'Auction not found' });
        }
    } catch (error) {
        console.error("Error fetching auction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Create a new auction
const createAuction = async (req, res) => {
    try {
        const { name, description, opening_price } = req.body;

        // Generate a random alphanumeric code of 6 characters
        const generateCode = () => {
            return Math.random().toString(36).substring(2, 8).toUpperCase();
        };
        const code = generateCode();

        // Set mode and time
        const mode = "lobby";
        const time = Math.floor(Date.now() / 1000); // Current Unix timestamp

        // Create auction in the database
        const auction = await prisma.auction.create({
            data: {
                name,
                description,
                opening_price: parseFloat(opening_price),
                current_price: parseFloat(opening_price),
                code,
                mode,
                min_bid: 0,
                round: 1,
                action_btn: "จับเวลา",
                time: null, // Store as a string if time is a String in the schema
            },
        });

        res.status(201).json(auction);
    } catch (error) {
        console.error("Error creating auction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Update a auction by ID
const updateAuction = async (req, res) => {
    try {
        const { id } = req.params; // Auction ID from URL params
        const { name, description, opening_price, current_price, round, mode, time, action_btn, min_bid } = req.body;

        // Update only the fields provided in the request
        const updatedAuction = await prisma.auction.update({
            where: { id: parseInt(id) },  // Convert id to integer if it's a number
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(opening_price && { opening_price: parseFloat(opening_price) }),
                ...(current_price && { current_price: parseFloat(current_price) }),
                ...(round && { round: parseInt(round) }),
                ...(mode && { mode }),
                ...(time && { time: time.toString() }), // Ensure time is a string if it's a BigInt
                ...(action_btn && { action_btn }),
                ...(min_bid && { min_bid: parseFloat(min_bid) }),
            },
        });

        res.json(updatedAuction);
    } catch (error) {
        console.error("Error updating auction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Delete a auction by ID
const deleteAuction = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.auction.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).end();
    } catch (error) {
        console.error("Error deleting auction:", error);
        if (error.code === 'P2025') {
            // This error code means the record was not found
            res.status(404).json({ message: 'auction not found' });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = {
    getAllAuctions,
    getAuctionById,
    createAuction,
    updateAuction,
    getAuctionByCode,
    deleteAuction,
    getAllInAuctions
};

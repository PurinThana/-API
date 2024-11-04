// controllers/userController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany(); // Use user in lowercase
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get a single user by ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get a single user by ID
const getUserByAuctionId = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.userAuction.findMany({
            where: { auction_id: parseInt(id) },
            include: {
                user: true
            }
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Create a new user
const createUser = async (req, res) => {
    const { username, name, organization, role, password, position } = req.body;
    try {
        const newUser = await prisma.user.create({
            data: { username, name, organization, role, password },
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const registerBulk = async (req, res) => {
    try {
        const users = req.body; // Expecting an array of user objects

        // Prepare user data with hashed passwords
        const userData = await Promise.all(users.map(async ({ username, name, organization, password, position }) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            return {
                username,
                name,
                organization,
                role: "user",
                password: hashedPassword,
                position
            };
        }));

        // Create users in the database
        const createdUsers = await prisma.user.createMany({
            data: userData,
            skipDuplicates: true // Optional: skips duplicate entries based on unique fields
        });

        res.status(201).json({ message: "Users registered successfully", count: createdUsers.count });
    } catch (error) {
        console.error("Error registering users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



// Update a user by ID
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, name, organization, role, password } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { username, name, organization, role, password },
        });
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        if (error.code === 'P2025') {
            // This error code means the record was not found
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).end();
    } catch (error) {
        console.error("Error deleting user:", error);
        if (error.code === 'P2025') {
            // This error code means the record was not found
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    registerBulk,
    getUserByAuctionId
};

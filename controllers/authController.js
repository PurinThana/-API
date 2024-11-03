const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config()
// Secret for JWT signing
const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
const register = async (req, res) => {
    try {
        const { username, name, organization, password } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in the database
        const user = await prisma.user.create({
            data: {
                username,
                name,
                organization,
                role: "user",
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) return res.status(404).json({ error: "User not found" });

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return res.status(401).json({ error: "Invalid password" });

        // Generate JWT
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name, organization: user.organization, position: user.position }, JWT_SECRET, { expiresIn: '3h' });

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Middleware for role-based access control
const authorizeRole = (roles) => (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(403).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!roles.includes(decoded.role)) {
            return res.status(403).json({ error: "Forbidden: Insufficient role" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error("Authorization error:", error);
        res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = { register, login, authorizeRole };

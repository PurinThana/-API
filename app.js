// app.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socket'); // Import the socket handler
require('dotenv').config()
const userRoutes = require('./routes/userRoutes')
const auctionRoutes = require('./routes/auctionRoutes')
const authRoutes = require('./routes/authRoutes')
const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // URL ของ React app ที่จะเชื่อมต่อ
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});
const cors = require("cors")
// Initialize Socket.IO with the imported handler
socketHandler(io);

// Middleware
app.use(express.json());
app.use(cors())

// Routes
app.get("/", (req, res) => {
    res.send("API is Ready to use. ")
})
app.use('/api', userRoutes);
app.use('/api', auctionRoutes);
app.use('/api', authRoutes);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

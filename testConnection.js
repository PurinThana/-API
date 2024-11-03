// testConnection.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testConnection = async () => {
    try {
        await prisma.$connect(); // เชื่อมต่อกับฐานข้อมูล
        console.log("Connected to the database successfully!");

        // ดึงข้อมูลชื่อของตารางในฐานข้อมูล PostgreSQL
        const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;

        console.log("Tables in the database:", tables);
    } catch (error) {
        console.error("Database connection failed:", error);
    } finally {
        await prisma.$disconnect(); // ปิดการเชื่อมต่อ
    }
};

testConnection();

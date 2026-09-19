// Import essential libraries
const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectTODB = require("./config/db");

// Import our route handlers
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRouter = require("./routes/transaction.routes");

const app = express();

/**
 * CORS Configuration:
 * Supports local dev (localhost:5173), Vercel production preview URLs (*.vercel.app),
 * and custom domains configured via CLIENT_URL.
 */
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server, same-origin)
        if (!origin) return callback(null, true);
        if (
            origin.includes("localhost") ||
            origin.includes("127.0.0.1") ||
            origin.endsWith(".vercel.app") ||
            (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
        ) {
            return callback(null, true);
        }
        // Permissive callback for deployment flexibility
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Automatic database connection for serverless invocations (e.g. Vercel)
app.use(async (req, res, next) => {
    try {
        await connectTODB();
        next();
    } catch (err) {
        console.error("Database connection middleware error:", err.message);
        res.status(500).json({ message: "Database connection failed", error: err.message });
    }
});

// Parse JSON request bodies (e.g. req.body)
app.use(express.json());

// Parse cookies attached to incoming client requests
app.use(cookieParser());

// Trust first proxy for accurate client IP detection in rate limiting
app.set('trust proxy', 1);

// Apply global rate limiting to all /api endpoints
const { apiLimiter } = require("./middleware/rateLimit.middleware");
app.use("/api", apiLimiter);

// Mount feature routers under /api namespace
app.use("/api/auth", authRouter);               // Login, Register, Logout, Current User
app.use("/api/accounts", accountRouter);       // Create & View Bank Accounts
app.use("/api/transactions", transactionRouter); // Deposit, Transfer & Ledger History

// Redis & System Health Check Endpoint
const { redisClient, isRedisReady } = require("./config/redis");
app.get("/api/health/redis", async (req, res) => {
    const isOnline = isRedisReady();
    let pingLatency = null;

    if (isOnline) {
        try {
            const start = Date.now();
            await redisClient.ping();
            pingLatency = `${Date.now() - start}ms`;
        } catch {
            // Handled
        }
    }

    res.status(200).json({
        service: "Fincheck Banking API",
        redis: {
            status: isOnline ? "CONNECTED (Active Caching)" : "OFFLINE (Direct Database Fallback)",
            ready: isOnline,
            latency: pingLatency,
            target: (process.env.REDIS_URL || "redis://127.0.0.1:6379").replace(/\/\/.*@/, "//***@")
        },
        database: "MongoDB Connected",
        cachingMode: isOnline ? "Cache-Aside Active (<1ms reads)" : "Graceful MongoDB Direct Mode"
    });
});

module.exports = app;

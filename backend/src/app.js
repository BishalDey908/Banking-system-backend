// Import essential libraries
const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import our route handlers
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRouter = require("./routes/transaction.routes");

const app = express();

/**
 * CORS (Cross-Origin Resource Sharing):
 * Allows our React frontend on port 5173 to safely communicate with this backend.
 * credentials: true ensures authentication cookies and tokens are accepted.
 */
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parse JSON request bodies (e.g. req.body)
app.use(express.json());

// Parse cookies attached to incoming client requests
app.use(cookieParser());

// Mount feature routers under /api namespace
app.use("/api/auth", authRouter);               // Login, Register, Logout, Current User
app.use("/api/accounts", accountRouter);       // Create & View Bank Accounts
app.use("/api/transactions", transactionRouter); // Deposit, Transfer & Ledger History

module.exports = app;

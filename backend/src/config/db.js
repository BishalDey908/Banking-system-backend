const mongoose = require("mongoose");

let isConnecting = false;

const connectTODB = async () => {
    // If already connected, reuse existing MongoDB connection
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (isConnecting) {
        return;
    }

    const uri = process.env.DB_CONNECTION_STRING;
    if (!uri) {
        console.warn("DB_CONNECTION_STRING environment variable is not defined");
        return;
    }

    try {
        isConnecting = true;
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnecting = false;
        console.log("DB connected successfully");
        return mongoose.connection;
    } catch (err) {
        isConnecting = false;
        console.error("DB connection failed:", err.message);
        // Only exit process if not in a serverless environment (e.g. VERCEL is not set)
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw err;
    }
};

module.exports = connectTODB;
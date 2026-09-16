const mongoose = require("mongoose");
const path = require("path");

// Ensure environment variables are loaded if not already present
if (!process.env.DB_CONNECTION_STRING) {
    require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
    if (!process.env.DB_CONNECTION_STRING) {
        require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
    }
}

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
        const errorMsg = "DB_CONNECTION_STRING environment variable is not defined. Please verify that .env exists in backend/ or the project root.";
        console.error(errorMsg);
        throw new Error(errorMsg);
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
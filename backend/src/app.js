const express  = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);


module.exports = app;
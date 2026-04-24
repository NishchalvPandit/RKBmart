require('dotenv').config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5174",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: "Invalid JSON format" });
    }
    next();
});

module.exports = app;
const express = require("express");
const router = express.Router();
const { chatLimiter } = require("../middleware/rateLimit.middleware");
const { handleChat, getSuggestions } = require("../controllers/chatbot.controller");

// Optional auth — attach user if logged in, but don't require it
const optionalAuth = (req, res, next) => {
    const jwt = require("jsonwebtoken");
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch {
            // Proceed without user — chatbot works for guests too
        }
    }
    next();
};

router.post("/", chatLimiter, optionalAuth, handleChat);
router.get("/suggestions", getSuggestions);

module.exports = router;

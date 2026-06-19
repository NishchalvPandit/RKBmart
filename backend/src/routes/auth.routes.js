const express = require("express");
const router = express.Router();
const { authLimiter } = require("../middleware/rateLimit.middleware");

const {
    register,
    login,
    getMe,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);
router.post("/resend-verification", authLimiter, resendVerificationEmail);
router.get("/verify-email", verifyEmail);
router.get("/me", auth, getMe);
router.post("/logout", logout);


module.exports = router;
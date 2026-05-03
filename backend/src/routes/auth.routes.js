const express = require("express");
const router = express.Router();

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

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/resend-verification", resendVerificationEmail);
router.get("/verify-email", verifyEmail);
router.get("/me", auth, getMe);
router.post("/logout", logout);


module.exports = router;
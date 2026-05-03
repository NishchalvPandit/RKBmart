const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/sendVerificationEmail");
const { createVerificationToken } = require("../utils/verificationToken");
const { sendPasswordResetEmail } = require("../utils/sendPasswordResetEmail");

const isStrongPassword = (password) => {
    if (typeof password !== "string") return false;
    if (password.length < 8) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;
    return true;
};

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character."
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            if (userExists.isVerified) {
                return res.status(400).json({ message: "User already exists" });
            }

            const {
                rawToken: rawVerificationToken,
                hashedToken: verificationToken,
                expiresAt: verificationTokenExpires
            } = createVerificationToken();

            userExists.verificationToken = verificationToken;
            userExists.verificationTokenExpires = verificationTokenExpires;
            userExists.verificationTokenUsedAt = null;
            await userExists.save();

            try {
                await sendVerificationEmail(userExists.email, rawVerificationToken);
            } catch (mailError) {
                userExists.verificationToken = null;
                userExists.verificationTokenExpires = null;
                userExists.verificationTokenUsedAt = null;
                await userExists.save();

                return res.status(500).json({
                    message: "Account exists but verification email could not be resent. Please try again.",
                    error: mailError.message
                });
            }

            return res.status(200).json({
                message: "Account already exists but is not verified. A new verification email has been sent."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const {
            rawToken: rawVerificationToken,
            hashedToken: verificationToken,
            expiresAt: verificationTokenExpires
        } = createVerificationToken();

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationToken,
            verificationTokenExpires,
            verificationTokenUsedAt: null
        });

        try {
            await sendVerificationEmail(user.email, rawVerificationToken);
        } catch (mailError) {
            await User.deleteOne({ _id: user._id });
            return res.status(500).json({
                message: "Verification email could not be sent. Please try registering again.",
                error: mailError.message
            });
        }

        res.status(201).json({
            message: "User created. Please verify your email.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ME
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LOGOUT
exports.logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: "Logged out successfully" });
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email first." });
        }

        const token = jwt.sign(
            {
                id: user._id,
                isAdmin: user.isAdmin,
                role: user.role || "user"
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRY || "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                role: user.role || "user"
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
    try {
        const token = req.query.token;

        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "Verification token is required." });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOneAndUpdate(
            {
                verificationToken: hashedToken,
                verificationTokenExpires: { $gt: new Date() },
                verificationTokenUsedAt: null,
                isVerified: false
            },
            {
                $set: {
                    isVerified: true,
                    verificationTokenUsedAt: new Date()
                },
                $unset: {
                    verificationToken: "",
                    verificationTokenExpires: ""
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({
                message: "Verification token is invalid, expired, or already used."
            });
        }

        return res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong while verifying your email." });
    }
};

// RESEND VERIFICATION EMAIL
exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        const {
            rawToken: rawVerificationToken,
            hashedToken: verificationToken,
            expiresAt: verificationTokenExpires
        } = createVerificationToken();

        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        user.verificationTokenUsedAt = null;
        await user.save();

        try {
            await sendVerificationEmail(user.email, rawVerificationToken);
        } catch (mailError) {
            user.verificationToken = null;
            user.verificationTokenExpires = null;
            user.verificationTokenUsedAt = null;
            await user.save();

            return res.status(500).json({
                message: "Could not send verification email. Please try again.",
                error: mailError.message
            });
        }

        return res.status(200).json({ message: "Verification email sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if account exists or not.
            return res.status(200).json({
                message: "If that email exists, a reset link has been sent."
            });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        user.passwordResetToken = hashedToken;
        user.passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        try {
            await sendPasswordResetEmail(user.email, rawToken);
        } catch (mailError) {
            user.passwordResetToken = null;
            user.passwordResetTokenExpires = null;
            await user.save();

            return res.status(500).json({
                message: "Could not send password reset email. Please try again.",
                error: mailError.message
            });
        }

        return res.status(200).json({
            message: "If that email exists, a reset link has been sent."
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: "Token and password are required" });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character."
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: "Reset token is invalid or expired" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = null;
        user.passwordResetTokenExpires = null;
        await user.save();

        return res.status(200).json({ message: "Password reset successful. Please log in." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

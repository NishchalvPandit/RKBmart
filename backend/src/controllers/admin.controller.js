const User = require("../models/user.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

// 📊 GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const adminUsers = await User.countDocuments({
            role: { $in: ["admin", "super_admin"] },
        });
        const totalOrders = await Order.countDocuments();

        res.json({ totalUsers, totalProducts, verifiedUsers, adminUsers, totalOrders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 👥 GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password -verificationToken -passwordResetToken -verificationTokenExpires -passwordResetTokenExpires")
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ❌ DELETE USER
exports.deleteUser = async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user.id.toString()) {
            return res.status(400).json({ message: "You cannot delete your own account from admin panel." });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === "super_admin") {
            return res.status(403).json({ message: "Super admin accounts cannot be deleted." });
        }

        await user.deleteOne();

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔄 TOGGLE ADMIN STATUS
exports.toggleAdminStatus = async (req, res) => {
    try {
        // Prevent removing own admin status
        if (req.params.id === req.user.id.toString()) {
            return res.status(400).json({ message: "You cannot modify your own admin status." });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === "super_admin") {
            return res.status(403).json({ message: "Super admin status cannot be modified." });
        }

        user.isAdmin = !user.isAdmin;
        user.role = user.isAdmin ? "admin" : "user";
        await user.save();

        res.json({
            message: `Admin access ${user.isAdmin ? "granted to" : "revoked from"} ${user.name}`,
            isAdmin: user.isAdmin,
            role: user.role,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 👑 PROMOTE USER TO ADMIN (Super Admin Only)
exports.promoteToAdmin = async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent promoting yourself (not needed, but good practice)
        if (userId === req.user.id.toString()) {
            return res.status(400).json({ message: "You cannot promote yourself to admin." });
        }

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is already admin or super_admin
        if (user.role === "admin" || user.role === "super_admin") {
            return res.status(400).json({ message: `User is already an ${user.role}` });
        }

        // Promote user to admin
        user.role = "admin";
        user.isAdmin = true; // Keep for backward compatibility
        await user.save();

        res.status(200).json({
            message: `User ${user.name} has been promoted to admin`,
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            newRole: user.role
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


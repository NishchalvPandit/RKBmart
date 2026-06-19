const User = require("../models/user.model");

const superAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const user = await User.findById(req.user.id).select("role isAdmin");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.role !== "super_admin") {
            return res.status(403).json({ message: "Super admin access required" });
        }

        req.user.role = user.role;
        req.user.isAdmin = user.isAdmin;
        next();
    } catch {
        return res.status(500).json({ message: "Authorization check failed" });
    }
};

module.exports = superAdmin;

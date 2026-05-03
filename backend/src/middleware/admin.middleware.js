const admin = (req, res, next) => {
    // req.user comes from auth middleware
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Allow both admin and super_admin roles
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    next();
};

module.exports = admin;
const superAdmin = (req, res, next) => {
    // req.user comes from auth middleware
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Only super_admin role allowed
    if (req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Super admin access required" });
    }

    next();
};

module.exports = superAdmin;

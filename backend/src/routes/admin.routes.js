const express = require("express");
const router = express.Router();

const {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    toggleAdminStatus,
    promoteToAdmin
} = require("../controllers/admin.controller");

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const superAdmin = require("../middleware/super_admin.middleware");

// All admin routes require auth + admin privileges
router.use(auth, admin);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/toggle-admin", toggleAdminStatus);

// Super admin only route - Promote user to admin
router.put("/users/:id/make-admin", superAdmin, promoteToAdmin);

module.exports = router;

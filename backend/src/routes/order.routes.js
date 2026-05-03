const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const {
    getAllOrders,
    getUserOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    cancelOrder
} = require("../controllers/order.controller");

// All order routes require authentication
router.use(auth);

// Admin order routes (must be before /:orderId to avoid conflict)
router.get("/", admin, getAllOrders);

// User order routes
router.get("/my-orders", getUserOrders);
router.get("/:orderId", getOrderById);
router.post("/", createOrder);
router.put("/:orderId/cancel", cancelOrder);

// Admin order routes
router.put("/:orderId/status", admin, updateOrderStatus);

module.exports = router;

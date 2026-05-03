const express = require("express");
const router = express.Router();

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/product.controller");

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

// 🔓 PUBLIC
router.get("/", getProducts);
router.get("/:id", getProductById);

// 👑 ADMIN ONLY
router.post("/", auth, admin, createProduct);
router.put("/:id", auth, admin, updateProduct);
router.delete("/:id", auth, admin, deleteProduct);

module.exports = router;
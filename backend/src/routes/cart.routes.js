const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} = require("../controllers/cart.controller");

router.get("/", auth, getCart);
router.post("/add", auth, addToCart);
router.put("/update/:productId", auth, updateCartItem);
router.delete("/remove/:productId", auth, removeFromCart);
router.delete("/clear", auth, clearCart);

module.exports = router;

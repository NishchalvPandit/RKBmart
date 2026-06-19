const User = require("../models/user.model");
const Product = require("../models/product.model");
const { parsePositiveIntQuantity } = require("../utils/validation");

exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("cart.product", "name price image stock category");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const items = (user.cart || [])
            .filter((entry) => entry.product != null)
            .map((entry) => ({
                productId: entry.product._id,
                name: entry.product.name,
                price: entry.product.price,
                image: entry.product.image,
                stock: entry.product.stock,
                category: entry.product.category,
                quantity: entry.quantity,
            }));

        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "productId is required" });
        }

        const qty = parsePositiveIntQuantity(quantity);
        if (qty === null) {
            return res.status(400).json({ message: "Quantity must be between 1 and 99" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existing = user.cart.find(
            (item) => item.product.toString() === productId
        );

        const newQty = existing ? existing.quantity + qty : qty;
        if (newQty > product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} item(s) available in stock`,
            });
        }

        if (existing) {
            existing.quantity = newQty;
        } else {
            user.cart.push({ product: productId, quantity: qty });
        }

        await user.save();

        await user.populate("cart.product", "name price image stock category");

        const items = user.cart
            .filter((entry) => entry.product != null)
            .map((entry) => ({
                productId: entry.product._id,
                name: entry.product.name,
                price: entry.product.price,
                image: entry.product.image,
                stock: entry.product.stock,
                category: entry.product.category,
                quantity: entry.quantity,
            }));

        res.json({ message: "Item added to cart", items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        const qty = parsePositiveIntQuantity(quantity);
        if (qty === null) {
            return res.status(400).json({ message: "Quantity must be between 1 and 99" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const item = user.cart.find(
            (entry) => entry.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({ message: "Item not in cart" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (qty > product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} item(s) available in stock`,
            });
        }

        item.quantity = qty;
        await user.save();

        await user.populate("cart.product", "name price image stock category");

        const items = user.cart
            .filter((entry) => entry.product != null)
            .map((entry) => ({
                productId: entry.product._id,
                name: entry.product.name,
                price: entry.product.price,
                image: entry.product.image,
                stock: entry.product.stock,
                category: entry.product.category,
                quantity: entry.quantity,
            }));

        res.json({ message: "Cart updated", items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const before = user.cart.length;
        user.cart = user.cart.filter(
            (entry) => entry.product.toString() !== productId
        );

        if (user.cart.length === before) {
            return res.status(404).json({ message: "Item not in cart" });
        }

        await user.save();

        await user.populate("cart.product", "name price image stock category");

        const items = user.cart
            .filter((entry) => entry.product != null)
            .map((entry) => ({
                productId: entry.product._id,
                name: entry.product.name,
                price: entry.product.price,
                image: entry.product.image,
                stock: entry.product.stock,
                category: entry.product.category,
                quantity: entry.quantity,
            }));

        res.json({ message: "Item removed", items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { cart: [] });
        res.json({ message: "Cart cleared", items: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

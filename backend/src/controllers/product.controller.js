const Product = require("../models/product.model");

/** Escape special regex chars so user input is treated as literal substring. */
const escapeRegex = (value) =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ➕ CREATE PRODUCT (ADMIN)
exports.createProduct = async (req, res) => {
    try {
        const { name, price } = req.body;
        if (!name || price === undefined || price === "") {
            return res
                .status(400)
                .json({ message: "Product name and price are required." });
        }
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📦 GET ALL PRODUCTS (PUBLIC) — ?keyword= &category= &minPrice= &maxPrice= &sort=
exports.getProducts = async (req, res) => {
    try {
        const { keyword, category, minPrice, maxPrice, sort } = req.query;

        let query = {};

        const trimmedKeyword =
            typeof keyword === "string" ? keyword.trim() : "";

        if (trimmedKeyword) {
            const safe = escapeRegex(trimmedKeyword);
            query.$or = [
                { name: { $regex: safe, $options: "i" } },
                { category: { $regex: safe, $options: "i" } }
            ];
        }

        if (category && String(category).trim()) {
            query.category = String(category).trim();
        }

        // Price range filter
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);
        if (!isNaN(min) || !isNaN(max)) {
            query.price = {};
            if (!isNaN(min)) query.price.$gte = min;
            if (!isNaN(max)) query.price.$lte = max;
        }

        // Sorting
        let sortOption = {};
        if (sort === "price_asc")  sortOption = { price: 1 };
        else if (sort === "price_desc") sortOption = { price: -1 };
        else if (sort === "newest") sortOption = { createdAt: -1 };
        else if (sort === "popular") sortOption = { stock: -1 }; // proxy for popularity
        // default: newest
        else sortOption = { createdAt: -1 };

        const products = await Product.find(query).sort(sortOption);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔍 GET SINGLE PRODUCT BY ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✏️ UPDATE PRODUCT (ADMIN)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ❌ DELETE PRODUCT (ADMIN)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
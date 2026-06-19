const Review = require("../models/review.model");

// ─── GET all reviews for a product ─────────────────────────────
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── POST a new review (auth required) ─────────────────────────
exports.createReview = async (req, res) => {
    try {
        const { rating, title, body } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5." });
        }

        // Check for existing review by this user on this product
        const existing = await Review.findOne({
            product: req.params.productId,
            user: req.user.id,
        });
        if (existing) {
            return res.status(409).json({ message: "You have already reviewed this product." });
        }

        const review = await Review.create({
            product: req.params.productId,
            user: req.user.id,
            userName: req.user.name || "Anonymous",
            rating: Number(rating),
            title: String(title || "").trim(),
            body: String(body || "").trim(),
        });

        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── DELETE a review (own review or admin) ──────────────────────
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: "Review not found." });

        const isOwner = review.user.toString() === req.user.id;
        const isAdmin =
            req.user.role === "admin" ||
            req.user.role === "super_admin" ||
            req.user.isAdmin;

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorised to delete this review." });
        }

        await review.deleteOne();
        res.json({ message: "Review deleted." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

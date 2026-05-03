const express = require("express");
const router = express.Router({ mergeParams: true }); // inherit :productId

const { getReviews, createReview, deleteReview } = require("../controllers/review.controller");
const auth = require("../middleware/auth.middleware");

router.get("/",        getReviews);
router.post("/",  auth, createReview);
router.delete("/:reviewId", auth, deleteReview);

module.exports = router;

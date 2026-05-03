const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
    getProfile,
    updateProfile,
    changePassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
} = require("../controllers/user.controller");

// All routes require authentication
router.use(auth);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

// Address routes
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

module.exports = router;

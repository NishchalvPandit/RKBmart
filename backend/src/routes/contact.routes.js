const express = require("express");
const router = express.Router();
const { contactLimiter } = require("../middleware/rateLimit.middleware");

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const {
    createContactMessage,
    getContactMessages,
    markContactRead,
    markContactUnread,
    deleteContactMessage
} = require("../controllers/contact.controller");

// Public — submit contact form
router.post("/", contactLimiter, createContactMessage);

// Admin — below routes protected
router.get("/", auth, admin, getContactMessages);
router.put("/:id/read", auth, admin, markContactRead);
router.put("/:id/unread", auth, admin, markContactUnread);
router.delete("/:id", auth, admin, deleteContactMessage);

module.exports = router;

const ContactMessage = require("../models/contactMessage.model");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact — public
exports.createContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (!EMAIL_RE.test(email.trim())) {
            return res.status(400).json({ message: "Invalid email address." });
        }

        const doc = await ContactMessage.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim()
        });

        res.status(201).json({
            message: "Message sent successfully",
            id: doc._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/contact — admin
exports.getContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/contact/:id/read — admin
exports.markContactRead = async (req, res) => {
    try {
        const msg = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            { $set: { isRead: true } },
            { new: true }
        );
        if (!msg) return res.status(404).json({ message: "Message not found" });
        res.json({ message: "Marked as read", contactMessage: msg });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/contact/:id/unread — admin (for toggle UX)
exports.markContactUnread = async (req, res) => {
    try {
        const msg = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            { $set: { isRead: false } },
            { new: true }
        );
        if (!msg) return res.status(404).json({ message: "Message not found" });
        res.json({ message: "Marked as unread", contactMessage: msg });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/contact/:id — admin
exports.deleteContactMessage = async (req, res) => {
    try {
        const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Message not found" });
        res.json({ message: "Message deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// GET user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE user profile (name, email, phone)
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone && { phone })
            },
            { new: true, runValidators: true }
        ).select("-password");

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const user = await User.findById(req.user.id);
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET all addresses
exports.getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.addresses || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADD address
exports.addAddress = async (req, res) => {
    try {
        const {
            label,
            recipientName,
            street,
            landmark,
            city,
            state,
            zipCode,
            country,
            phoneNumber,
            isDefault
        } = req.body;

        if (!street || !city || !state || !phoneNumber) {
            return res.status(400).json({ message: "Street, city, province, and phone are required" });
        }

        const user = await User.findById(req.user.id);
        
        // If this is the first address or marked as default, set it as default
        const shouldBeDefault = isDefault || user.addresses.length === 0;

        // If this address is default, unset other defaults
        if (shouldBeDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        const newAddress = {
            label: label || "home",
            recipientName: recipientName || "",
            landmark: landmark || "",
            street,
            city,
            state,
            zipCode: zipCode || "",
            country: country || "Nepal",
            phoneNumber,
            isDefault: shouldBeDefault
        };

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({ message: "Address added successfully", address: user.addresses[user.addresses.length - 1] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE address
exports.updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const {
            label,
            recipientName,
            street,
            landmark,
            city,
            state,
            zipCode,
            country,
            phoneNumber,
            isDefault
        } = req.body;

        const user = await User.findById(req.user.id);
        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        // If marking as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        if (label) address.label = label;
        if (typeof recipientName === "string") address.recipientName = recipientName.trim();
        if (typeof landmark === "string") address.landmark = landmark.trim();
        if (street) address.street = street;
        if (city) address.city = city;
        if (state) address.state = state;
        if (typeof zipCode === "string") address.zipCode = zipCode;
        if (country) address.country = country;
        if (phoneNumber) address.phoneNumber = phoneNumber;
        if (typeof isDefault !== 'undefined') address.isDefault = isDefault;

        // Ensure at least one default address exists when user has addresses.
        if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.json({ message: "Address updated successfully", address });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE address
exports.deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const wasDefault = address.isDefault;
        address.deleteOne();

        // If default address was removed, promote the first remaining address.
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        enum: ["home", "work", "other"],
        default: "home"
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: "Nepal"
    },
    phoneNumber: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            default: null
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: {
            type: String,
            select: false,
            default: null
        },
        verificationTokenExpires: {
            type: Date,
            select: false,
            default: null
        },
        verificationTokenUsedAt: {
            type: Date,
            select: false,
            default: null
        },
        passwordResetToken: {
            type: String,
            default: null
        },
        passwordResetTokenExpires: {
            type: Date,
            default: null
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum: ["user", "admin", "super_admin"],
            default: "user"
        },
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1
                }
            }
        ],
        addresses: [addressSchema]
    },
    { timestamps: true }
);

userSchema.index(
    { verificationToken: 1 },
    {
        unique: true,
        partialFilterExpression: { verificationToken: { $type: "string" } }
    }
);

module.exports = mongoose.model("User", userSchema);
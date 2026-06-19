const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const { parsePositiveIntQuantity } = require("../utils/validation");

async function buildOrderItems(items, session) {
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
        const qty = parsePositiveIntQuantity(item.quantity);
        if (qty === null) {
            const err = new Error("Each item must have a valid quantity between 1 and 99");
            err.status = 400;
            throw err;
        }

        const query = Product.findOneAndUpdate(
            { _id: item.productId, stock: { $gte: qty } },
            { $inc: { stock: -qty } },
            { new: true }
        );
        if (session) query.session(session);

        const product = await query;

        if (!product) {
            let existsQuery = Product.findById(item.productId);
            if (session) existsQuery = existsQuery.session(session);
            const exists = await existsQuery;

            if (!exists) {
                const err = new Error(`Product ${item.productId} not found`);
                err.status = 404;
                throw err;
            }

            const err = new Error(`Insufficient stock for ${exists.name}`);
            err.status = 400;
            throw err;
        }

        totalPrice += product.price * qty;
        orderItems.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: qty,
            image: product.image,
        });
    }

    return { totalPrice, orderItems };
}

async function restoreStock(orderItems, session) {
    for (const item of orderItems) {
        const query = Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
        });
        if (session) query.session(session);
        await query;
    }
}

// GET all orders (admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET user's orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate("items.productId")
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({
            _id: orderId,
            userId: req.user.id,
        }).populate("items.productId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE order — atomic stock updates; uses a transaction when MongoDB supports it
exports.createOrder = async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
    }

    if (!shippingAddress) {
        return res.status(400).json({ message: "Shipping address is required" });
    }

    const session = await mongoose.startSession();
    let orderItems = [];
    let stockMutatedOutsideTxn = false;

    try {
        let savedOrder;

        const placeOrder = async (activeSession) => {
            const { totalPrice, orderItems: builtItems } = await buildOrderItems(
                items,
                activeSession
            );
            orderItems = builtItems;
            if (!activeSession) stockMutatedOutsideTxn = true;

            const order = new Order({
                userId: req.user.id,
                items: orderItems,
                totalPrice,
                shippingAddress,
                paymentMethod: paymentMethod || "cash_on_delivery",
            });

            if (activeSession) {
                await order.save({ session: activeSession });
                await User.findByIdAndUpdate(
                    req.user.id,
                    { cart: [] },
                    { session: activeSession }
                );
            } else {
                await order.save();
                await User.findByIdAndUpdate(req.user.id, { cart: [] });
            }

            savedOrder = order;
        };

        try {
            await session.withTransaction(async () => {
                await placeOrder(session);
            });
        } catch (txnErr) {
            const msg = txnErr.message || "";
            const noTxn =
                msg.includes("Transaction") ||
                msg.includes("replica set") ||
                txnErr.code === 20;

            if (!noTxn) throw txnErr;

            orderItems = [];
            stockMutatedOutsideTxn = false;
            await placeOrder(null);
        }

        await savedOrder.populate("items.productId");
        res.status(201).json({ message: "Order created successfully", order: savedOrder });
    } catch (error) {
        if (stockMutatedOutsideTxn && orderItems.length > 0) {
            try {
                await restoreStock(orderItems, null);
            } catch {
                // Best-effort rollback
            }
        }

        const status = error.status || 500;
        res.status(status).json({
            message: status === 500 ? "Order creation failed" : error.message,
        });
    } finally {
        session.endSession();
    }
};

// UPDATE order status (admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate("items.productId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order status updated", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CANCEL order
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({
            _id: orderId,
            userId: req.user.id,
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!["pending", "confirmed"].includes(order.status)) {
            return res.status(400).json({ message: "Only pending or confirmed orders can be cancelled" });
        }

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity },
            });
        }

        order.status = "cancelled";
        await order.save();

        res.json({ message: "Order cancelled successfully", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

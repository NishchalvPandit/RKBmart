const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const adminRoutes = require("./routes/admin.routes");
const userRoutes = require("./routes/user.routes");
const orderRoutes = require("./routes/order.routes");
const cartRoutes = require("./routes/cart.routes");
const contactRoutes = require("./routes/contact.routes");
const reviewRoutes  = require("./routes/review.routes");
const chatbotRoutes = require("./routes/chatbot.routes");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(mongoSanitize());

const allowedOrigins = (process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow tools like curl/postman that may not send Origin.
        if (!origin) return callback(null, true);
        const isAllowedFromEnv = allowedOrigins.includes(origin);
        const isLocalhost =
            /^http:\/\/localhost:\d+$/.test(origin) ||
            /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

        // Allow configured origins and any localhost/127.0.0.1 dev port.
        if (isAllowedFromEnv || isLocalhost) return callback(null, true);
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Rastriya Khadya Bank API is running"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/products/:productId/reviews", reviewRoutes);
app.use("/api/chat", chatbotRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: "Invalid JSON format" });
    }
    next();
});

module.exports = app;
const Product = require("../models/product.model");
const Order = require("../models/order.model");

/* ═══════════════════════════════════════════════════════════════════
   FAQ / Customer Support Knowledge Base
   ═══════════════════════════════════════════════════════════════════ */
const FAQ_RESPONSES = {
    delivery_time: {
        keywords: ["delivery time", "how long", "when will i get", "deliver", "shipping time", "kitna din", "kati din"],
        answer: "🚚 Standard delivery takes 3-5 business days within Kathmandu Valley and 5-7 days for other locations in Nepal. Express delivery is available for Valley orders (1-2 days)."
    },
    return_policy: {
        keywords: ["return", "return policy", "exchange", "replace", "damaged", "wrong item"],
        answer: "🔄 We offer a 7-day return policy. If you receive a damaged or wrong product, you can request a return within 7 days of delivery. The product must be in its original condition."
    },
    refund: {
        keywords: ["refund", "money back", "get refund", "paisa firta"],
        answer: "💰 Refunds are processed within 5-7 business days after we receive the returned item. The amount is credited back to your original payment method. For COD orders, refunds are sent via bank transfer."
    },
    payment_methods: {
        keywords: ["payment", "pay", "payment method", "how to pay", "khalti", "esewa", "cod", "cash on delivery"],
        answer: "💳 We accept: Cash on Delivery (COD), Khalti, and eSewa. All online payments are secure and encrypted."
    },
    shipping_charges: {
        keywords: ["shipping charge", "delivery charge", "shipping cost", "delivery fee", "free delivery"],
        answer: "📦 Delivery charges: Free for orders above Rs. 1000 within Kathmandu Valley. Rs. 100 for Valley orders below Rs. 1000. Rs. 150-250 for outside Valley depending on location."
    },
    contact: {
        keywords: ["contact", "phone", "call", "email", "help", "support"],
        answer: "📞 Contact us:\n• Phone: 01-5906810\n• WhatsApp: 977-9741802661\n• Email: rastriyakhadyabank@gmail.com\n• Visit: Madhyapur Thimi -02, Divyashwori Planning"
    },
    greeting: {
        keywords: ["hi", "hello", "hey", "namaste", "good morning", "good evening"],
        answer: "🙏 Namaste! Welcome to Rastriya Khadya Bank Mart. How can I help you today?\n\nI can help you with:\n• 🛒 Finding products\n• 📦 Tracking orders\n• ❓ FAQs (delivery, returns, payments)\n\nJust ask me anything!"
    },
    thanks: {
        keywords: ["thank", "thanks", "dhanyabad", "धन्यवाद"],
        answer: "🙏 You're welcome! Is there anything else I can help you with?"
    }
};

/* ═══════════════════════════════════════════════════════════════════
   Intent Detection
   ═══════════════════════════════════════════════════════════════════ */
function detectIntent(message) {
    const msg = message.toLowerCase().trim();

    // Order tracking intent
    if (
        msg.includes("track") || msg.includes("order status") ||
        msg.includes("where is my order") || msg.includes("order id") ||
        msg.includes("my order") || msg.includes("order track") ||
        /^[a-f0-9]{24}$/.test(msg)
    ) {
        return "order_tracking";
    }

    // Product search intent — broad detection for anything product/price related
    const hasPrice = /\d+/.test(msg) && (
        msg.includes("rs") || msg.includes("nrs") || msg.includes("rupee") ||
        msg.includes("price") || msg.includes("under") || msg.includes("below") ||
        msg.includes("above") || msg.includes("over") || msg.includes("less") ||
        msg.includes("more") || msg.includes("between") || msg.includes("within") ||
        msg.includes("upto") || msg.includes("up to") || msg.includes("than") ||
        msg.includes("cheap") || msg.includes("budget") || msg.includes("costly") ||
        msg.includes("max") || msg.includes("min") || msg.includes("range")
    );

    const hasProductKeyword =
        msg.includes("show") || msg.includes("find") || msg.includes("search") ||
        msg.includes("recommend") || msg.includes("suggest") || msg.includes("best") ||
        msg.includes("cheap") || msg.includes("expensive") || msg.includes("costly") ||
        msg.includes("affordable") || msg.includes("budget") ||
        msg.includes("buy") || msg.includes("want") || msg.includes("need") ||
        msg.includes("looking for") || msg.includes("give me") || msg.includes("get me") ||
        msg.includes("list") || msg.includes("what do you have") || msg.includes("available") ||
        msg.includes("products") || msg.includes("product") || msg.includes("items") ||
        msg.includes("all") ||
        msg.includes("grains") || msg.includes("pulses") || msg.includes("fruits") ||
        msg.includes("oils") || msg.includes("organic") || msg.includes("vegetables") ||
        msg.includes("rice") || msg.includes("dal") || msg.includes("oil") ||
        msg.includes("wheat") || msg.includes("atta") || msg.includes("flour") ||
        msg.includes("ghee") || msg.includes("honey") || msg.includes("spice") ||
        msg.includes("tarkari") || msg.includes("chamal") || msg.includes("dhan") ||
        msg.includes("masala") || msg.includes("tea") || msg.includes("chiya");

    if (hasPrice || hasProductKeyword) {
        return "product_search";
    }

    // FAQ intent
    for (const [, faq] of Object.entries(FAQ_RESPONSES)) {
        if (faq.keywords.some(kw => msg.includes(kw))) {
            return "faq";
        }
    }

    return "unknown";
}

/* ═══════════════════════════════════════════════════════════════════
   Natural Language → Product Query Parser
   ═══════════════════════════════════════════════════════════════════ */
function parseProductQuery(message) {
    const msg = message.toLowerCase();
    const query = {};

    // Category detection
    const categories = {
        grains: ["grain", "grains", "rice", "wheat", "maize", "corn", "chamal", "dhan", "atta", "flour"],
        pulses: ["pulse", "pulses", "dal", "lentil", "bean", "beans", "mung", "masoor", "chana", "rajma"],
        fruits: ["fruit", "fruits", "apple", "banana", "mango", "orange", "kiwi", "grape"],
        oils: ["oil", "oils", "mustard oil", "sunflower", "cooking oil", "tel", "ghee", "butter"],
        organic: ["organic", "natural", "pure", "jaivik", "bio"],
        vegetables: ["vegetable", "vegetables", "tarkari", "potato", "tomato", "onion", "aloo", "gobhi", "palak"]
    };

    for (const [cat, kws] of Object.entries(categories)) {
        if (kws.some(kw => msg.includes(kw))) {
            query.category = cat.charAt(0).toUpperCase() + cat.slice(1);
            break;
        }
    }

    // ── Price Extraction (handles many natural language patterns) ──
    // Pattern: "between X to/and Y" or "from X to Y" or "X to Y" or "X-Y"
    const priceBetween = msg.match(
        /(?:between|from|range)?\s*(?:rs\.?|nrs\.?|रु\.?)?\s*(\d+)\s*(?:to|-|and|–)\s*(?:rs\.?|nrs\.?|रु\.?)?\s*(\d+)/i
    );

    // Pattern: "under/below/less than/within/upto/cheaper than/max/budget X"
    const priceUnder = msg.match(
        /(?:under|below|less\s*than|within|max|upto|up\s*to|cheaper\s*than|budget|not\s*more\s*than|at\s*most|maximum)\s*(?:rs\.?|nrs\.?|रु\.?|rupees?)?\s*(\d+)/i
    );

    // Pattern: "above/over/more than/min/at least/starting/starts from/costly/expensive than X"
    const priceAbove = msg.match(
        /(?:above|over|more\s*than|min|atleast|at\s*least|minimum|starting\s*(?:from)?|starts?\s*from|not\s*less\s*than|greater\s*than)\s*(?:rs\.?|nrs\.?|रु\.?|rupees?)?\s*(\d+)/i
    );

    // Pattern: "Rs X" or "X rupees" standalone (treat as approximate — show ±30% range)
    const priceExact = msg.match(
        /(?:rs\.?|nrs\.?|रु\.?|rupees?)\s*(\d+)|(\d+)\s*(?:rs\.?|nrs\.?|rupees?)/i
    );

    // Pattern: "for 500", "around 500", "about 500"
    const priceAround = msg.match(
        /(?:for|around|about|approx|approximately|near|nearly)\s*(?:rs\.?|nrs\.?|रु\.?)?\s*(\d+)/i
    );

    if (priceBetween && !priceUnder && !priceAbove) {
        query.minPrice = parseInt(priceBetween[1]);
        query.maxPrice = parseInt(priceBetween[2]);
    } else {
        if (priceUnder) query.maxPrice = parseInt(priceUnder[1]);
        if (priceAbove) query.minPrice = parseInt(priceAbove[1]);

        // If only "around X" or exact price mentioned without under/above
        if (!priceUnder && !priceAbove) {
            if (priceAround) {
                const val = parseInt(priceAround[1]);
                query.minPrice = Math.floor(val * 0.7);
                query.maxPrice = Math.ceil(val * 1.3);
            } else if (priceExact) {
                const val = parseInt(priceExact[1] || priceExact[2]);
                // Only if no other price was detected
                if (!query.minPrice && !query.maxPrice) {
                    query.maxPrice = val;
                }
            }
        }
    }

    // Handle "cheap" / "expensive" as price hints when no number given
    if (!query.minPrice && !query.maxPrice) {
        if (msg.includes("cheap") || msg.includes("sasto") || msg.includes("budget") || msg.includes("affordable")) {
            query.maxPrice = 300;
            query.sort = "price_asc";
        } else if (msg.includes("expensive") || msg.includes("costly") || msg.includes("premium") || msg.includes("mahango")) {
            query.minPrice = 1000;
            query.sort = "price_desc";
        }
    }

    // Keyword extraction (remove filler words)
    const fillers = [
        "show", "me", "find", "search", "recommend", "suggest", "best",
        "good", "give", "i", "want", "need", "looking", "for", "the",
        "some", "any", "a", "an", "please", "can", "you", "under",
        "below", "above", "over", "less", "more", "than", "between",
        "from", "to", "and", "rs", "nrs", "rupees", "price", "cheap",
        "expensive", "products", "product", "buy", "get", "all",
        "items", "list", "what", "do", "have", "budget", "around",
        "about", "approx", "costly", "premium", "affordable", "sasto",
        "mahango", "within", "upto", "range", "not", "starting",
        "maximum", "minimum", "atleast", "least", "most", "greater"
    ];
    const words = msg.replace(/[^\w\s]/g, "").split(/\s+/).filter(w =>
        w.length > 1 && !fillers.includes(w) && !/^\d+$/.test(w)
    );

    if (words.length > 0 && !query.category) {
        query.keyword = words.slice(0, 3).join(" ");
    }

    return query;
}

/* ═══════════════════════════════════════════════════════════════════
   Search Products
   ═══════════════════════════════════════════════════════════════════ */
async function searchProducts(parsedQuery) {
    const filter = {};

    if (parsedQuery.category) {
        filter.category = new RegExp(parsedQuery.category, "i");
    }

    if (parsedQuery.minPrice || parsedQuery.maxPrice) {
        filter.price = {};
        if (parsedQuery.minPrice) filter.price.$gte = parsedQuery.minPrice;
        if (parsedQuery.maxPrice) filter.price.$lte = parsedQuery.maxPrice;
    }

    if (parsedQuery.keyword) {
        filter.$or = [
            { name: new RegExp(parsedQuery.keyword, "i") },
            { description: new RegExp(parsedQuery.keyword, "i") },
            { category: new RegExp(parsedQuery.keyword, "i") }
        ];
    }

    // Only in-stock products
    filter.stock = { $gt: 0 };

    // Sort logic
    let sortObj = { createdAt: -1 };
    if (parsedQuery.sort === "price_asc") sortObj = { price: 1 };
    else if (parsedQuery.sort === "price_desc") sortObj = { price: -1 };

    const products = await Product.find(filter)
        .sort(sortObj)
        .limit(6)
        .lean();

    return products;
}

/* ═══════════════════════════════════════════════════════════════════
   Track Order
   ═══════════════════════════════════════════════════════════════════ */
async function trackOrder(message, userId) {
    // Extract order ID (MongoDB ObjectId = 24 hex chars)
    const idMatch = message.match(/[a-f0-9]{24}/i);

    if (!idMatch) {
        return {
            text: "Please provide your Order ID to track your order. You can find it in your order confirmation email or in your profile under 'My Orders'.",
            type: "text"
        };
    }

    const orderId = idMatch[0];
    const query = { _id: orderId };
    if (userId) query.userId = userId;

    const order = await Order.findOne(query).lean();

    if (!order) {
        return {
            text: `❌ No order found with ID: ${orderId}. Please check the ID and try again.`,
            type: "text"
        };
    }

    const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statusSteps.indexOf(order.status);
    const isCancelled = order.status === "cancelled";

    return {
        type: "order_status",
        order: {
            id: order._id,
            status: order.status,
            statusSteps,
            currentStep: currentIndex,
            isCancelled,
            totalPrice: order.totalPrice,
            itemCount: order.items.length,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt
        }
    };
}

/* ═══════════════════════════════════════════════════════════════════
   FAQ Response
   ═══════════════════════════════════════════════════════════════════ */
function getFAQResponse(message) {
    const msg = message.toLowerCase();
    for (const [, faq] of Object.entries(FAQ_RESPONSES)) {
        if (faq.keywords.some(kw => msg.includes(kw))) {
            return faq.answer;
        }
    }
    return null;
}

/* ═══════════════════════════════════════════════════════════════════
   Main Chat Handler
   ═══════════════════════════════════════════════════════════════════ */
exports.handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ error: "Message is required" });
        }

        const userId = req.user?._id || null;
        const intent = detectIntent(message);

        let response;

        switch (intent) {
            case "product_search": {
                const parsedQuery = parseProductQuery(message);
                const products = await searchProducts(parsedQuery);

                // Build a human-readable summary of what was searched
                const filterParts = [];
                if (parsedQuery.category) filterParts.push(`Category: ${parsedQuery.category}`);
                if (parsedQuery.maxPrice && !parsedQuery.minPrice) filterParts.push(`Under Rs. ${parsedQuery.maxPrice}`);
                if (parsedQuery.minPrice && !parsedQuery.maxPrice) filterParts.push(`Above Rs. ${parsedQuery.minPrice}`);
                if (parsedQuery.minPrice && parsedQuery.maxPrice) filterParts.push(`Rs. ${parsedQuery.minPrice} – ${parsedQuery.maxPrice}`);
                if (parsedQuery.keyword) filterParts.push(`"${parsedQuery.keyword}"`);
                const filterSummary = filterParts.length ? `\n🔍 ${filterParts.join(" • ")}` : "";

                if (products.length === 0) {
                    response = {
                        type: "text",
                        text: `😕 No products found matching your criteria.${filterSummary}\n\nTry:\n• Broader price range\n• Different category\n• "Show me all products"`
                    };
                } else {
                    response = {
                        type: "products",
                        text: `🛒 Found ${products.length} product${products.length > 1 ? "s" : ""} for you:${filterSummary}`,
                        products: products.map(p => ({
                            _id: p._id,
                            name: p.name,
                            price: p.price,
                            image: p.image,
                            category: p.category,
                            stock: p.stock
                        }))
                    };
                }
                break;
            }

            case "order_tracking": {
                response = await trackOrder(message, userId);
                break;
            }

            case "faq": {
                const faqAnswer = getFAQResponse(message);
                response = { type: "text", text: faqAnswer };
                break;
            }

            default: {
                response = {
                    type: "text",
                    text: "🤔 I'm not sure I understand. Here's what I can help with:\n\n🛒 **Product Search:**\n• \"Products under Rs. 500\"\n• \"Grains above Rs. 200\"\n• \"Organic between 100 to 800\"\n• \"Cheap pulses\"\n• \"Show me all products\"\n\n📦 **Order Tracking:**\n• Paste your Order ID\n\n❓ **FAQs:**\n• Delivery time\n• Return policy\n• Payment methods\n• Shipping charges"
                };
            }
        }

        return res.json({ response });
    } catch (err) {
        console.error("[Chatbot Error]", err);
        return res.status(500).json({
            response: {
                type: "text",
                text: "⚠️ Something went wrong. Please try again later."
            }
        });
    }
};

/* Quick suggestions for the welcome message */
exports.getSuggestions = (req, res) => {
    res.json({
        suggestions: [
            "Show me all products",
            "Organic products under Rs. 500",
            "What's your delivery time?",
            "Return policy",
            "Track my order",
            "Payment methods"
        ]
    });
};

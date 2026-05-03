/**
 * Seeds sample products (Pokhreli Chamal, Chana, Makkai, Apple, Wheat, Mustard Oil).
 * Run from backend folder: npm run seed:products
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Product = require("../src/models/product.model");

const SAMPLE_VIDEO =
    "https://www.w3schools.com/html/mov_bbb.mp4";

const SEED = [
    {
        name: "Pokhreli Chamal",
        description:
            "Premium Pokhreli Chamal rice, carefully graded for exceptional taste and aroma. Sourced directly from the fertile valleys of Pokhara.",
        price: 150,
        category: "Grains",
        stock: 120,
        image:
            "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80",
        video: SAMPLE_VIDEO
    },
    {
        name: "Chana",
        description:
            "High-quality chickpeas (chana dal) ideal for soups, curries, and salads. Rich in protein and fibre.",
        price: 220,
        category: "Pulses",
        stock: 80,
        image:
            "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&q=80",
        video: SAMPLE_VIDEO
    },
    {
        name: "Makkai",
        description:
            "Fresh dried maize (corn kernels) — perfect for milling, popping, and wholesome snacks.",
        price: 95,
        category: "Grains",
        stock: 200,
        image:
            "https://images.unsplash.com/photo-1601593768799-76f3e2588a33?w=800&q=80",
        video: SAMPLE_VIDEO
    },
    {
        name: "Apple",
        description:
            "Crisp and juicy Himalayan apples sourced from high-altitude orchards. A naturally sweet and healthy snack.",
        price: 180,
        category: "Fruits",
        stock: 150,
        image:
            "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80",
        video: SAMPLE_VIDEO
    },
    {
        name: "Wheat",
        description:
            "Premium whole wheat grains milled to perfection. Ideal for making rotis, bread, and other wholesome preparations.",
        price: 85,
        category: "Grains",
        stock: 300,
        image:
            "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80",
        video: SAMPLE_VIDEO
    },
    {
        name: "Mustard Oil",
        description:
            "Pure cold-pressed mustard oil with a rich, pungent flavour. A kitchen essential for cooking and pickling.",
        price: 310,
        category: "Oils",
        stock: 90,
        image:
            "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
        video: SAMPLE_VIDEO
    }
];

const run = async () => {
    await connectDB();

    let created = 0;
    let updated = 0;

    for (const doc of SEED) {
        const existing = await Product.findOne({ name: doc.name });
        if (existing) {
            Object.assign(existing, doc);
            await existing.save();
            updated += 1;
        } else {
            await Product.create(doc);
            created += 1;
        }
    }

    console.log(`Seed finished: ${created} created, ${updated} updated.`);
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

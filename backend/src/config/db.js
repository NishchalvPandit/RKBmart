const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || typeof mongoUri !== "string") {
        console.log(
            'DB Error: MONGO_URI is missing or not a string. Set the MONGO_URI environment variable in your host (e.g. Render) or in backend/.env for local development.'
        );
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(mongoUri);
        console.log("MongoDB Connected:", conn.connection.host);
    } catch (error) {
        console.log("DB Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;

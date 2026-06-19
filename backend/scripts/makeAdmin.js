require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../src/models/user.model");

const email = process.argv[2];

if (!email) {
    console.error("❌  Usage: node scripts/makeAdmin.js <email>");
    process.exit(1);
}

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅  Connected to MongoDB");

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error(`❌  No user found with email: ${email}`);
            process.exit(1);
        }

        if (user.isAdmin || user.role === "admin" || user.role === "super_admin") {
            console.log(`ℹ️   ${user.name} (${user.email}) is already an admin.`);
            process.exit(0);
        }

        user.isAdmin = true;
        user.role = "admin";
        await user.save();

        console.log(`🎉  Success! "${user.name}" (${user.email}) is now an admin.`);
        console.log(`    Log out and log back in — the 🛡️ Admin button will appear in the navbar.`);
    } catch (err) {
        console.error("❌  Error:", err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

run();

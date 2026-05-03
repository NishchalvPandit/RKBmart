const crypto = require("crypto");

const VERIFICATION_TOKEN_TTL_MS = 15 * 60 * 1000;

const createVerificationToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    return {
        rawToken,
        hashedToken,
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)
    };
};

module.exports = { createVerificationToken, VERIFICATION_TOKEN_TTL_MS };

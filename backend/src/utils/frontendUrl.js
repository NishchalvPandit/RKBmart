/**
 * Resolves the frontend base URL for email redirects.
 * Prefer FRONTEND_URL; otherwise first origin from CORS_ORIGIN.
 */
function getFrontendUrl() {
    if (process.env.FRONTEND_URL) {
        return String(process.env.FRONTEND_URL).replace(/\/$/, "");
    }

    if (process.env.CORS_ORIGIN) {
        const origins = process.env.CORS_ORIGIN.split(",")
            .map((o) => o.trim())
            .filter(Boolean);
        if (origins.length > 0) {
            return origins[0].replace(/\/$/, "");
        }
    }

    return "http://localhost:5175";
}

module.exports = { getFrontendUrl };

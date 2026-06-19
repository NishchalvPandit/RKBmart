const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "7d";

const parseMaxAgeMs = (expiry) => {
    const match = String(expiry).match(/^(\d+)([dhms])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
    return value * (multipliers[unit] || multipliers.d);
};

const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: parseMaxAgeMs(JWT_ACCESS_EXPIRY),
};

const clearAuthCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
};

module.exports = { authCookieOptions, clearAuthCookieOptions };

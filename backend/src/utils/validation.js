const MAX_ORDER_QUANTITY = 99;

const normalizeEmail = (email) => {
    if (typeof email !== "string") return "";
    return email.trim().toLowerCase();
};

const normalizePassword = (password) => String(password ?? "");

const isStrongPassword = (password) => {
    const pwd = normalizePassword(password);
    if (!pwd || pwd.length < 8) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    if (!/[^A-Za-z0-9]/.test(pwd)) return false;
    return true;
};

/** Returns a positive integer quantity or null if invalid. */
const parsePositiveIntQuantity = (value, max = MAX_ORDER_QUANTITY) => {
    const qty = Number(value);
    if (!Number.isInteger(qty) || qty < 1 || qty > max) return null;
    return qty;
};

module.exports = {
    MAX_ORDER_QUANTITY,
    normalizeEmail,
    normalizePassword,
    isStrongPassword,
    parsePositiveIntQuantity,
};

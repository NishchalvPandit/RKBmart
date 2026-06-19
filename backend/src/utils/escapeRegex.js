/** Escape special regex chars so user input is treated as a literal substring. */
const escapeRegex = (value) =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { escapeRegex };

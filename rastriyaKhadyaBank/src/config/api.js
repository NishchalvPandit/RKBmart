/** API base URL (no trailing slash). Override with Vite env if needed. */
export const API_BASE =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
        ? String(import.meta.env.VITE_API_URL).replace(/\/$/, "")
        : "https://rkbmart-1.onrender.com";

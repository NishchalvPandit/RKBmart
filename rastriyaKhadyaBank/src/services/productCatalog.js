import { API_BASE } from "../config/api";

/**
 * Builds GET /api/products URL with optional query params.
 */
export function buildProductsListUrl({ keyword, category, minPrice, maxPrice, sort } = {}) {
    const params = new URLSearchParams();
    const kw = keyword !== undefined && keyword !== null ? String(keyword).trim() : "";
    const cat = category !== undefined && category !== null ? String(category).trim() : "";
    if (kw) params.set("keyword", kw);
    if (cat) params.set("category", cat);
    if (minPrice !== undefined && minPrice !== "") params.set("minPrice", minPrice);
    if (maxPrice !== undefined && maxPrice !== "") params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    return `${API_BASE}/api/products${qs ? `?${qs}` : ""}`;
}

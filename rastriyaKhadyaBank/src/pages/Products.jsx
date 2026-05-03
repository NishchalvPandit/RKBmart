import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { buildProductsListUrl } from "../services/productCatalog";

/* ─── constants ─────────────────────────────────────────────────── */
const CATEGORIES = ["All", "Grains", "Pulses", "Fruits", "Oils", "Organic", "Vegetables"];

const SORT_OPTIONS = [
    { value: "newest",     label: "Newest First" },
    { value: "popular",    label: "Most Popular" },
    { value: "price_asc",  label: "Price: Low → High" },
    { value: "price_desc", label: "Price: High → Low" },
];

const CAT_ICONS = {
    All: "🛒", Grains: "🌾", Pulses: "🫘",
    Fruits: "🍎", Oils: "🫙", Organic: "🌿", Vegetables: "🥦",
};

function initialKeywordFromBrowser() {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("keyword") || "";
}

/* ─── Products page ─────────────────────────────────────────────── */
export default function Products() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const keywordFromUrl = searchParams.get("keyword") || "";
    const [draft, setDraft] = useState(initialKeywordFromBrowser);
    useEffect(() => { setDraft(keywordFromUrl); }, [keywordFromUrl]);

    const [category, setCategory] = useState("All");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort]         = useState("newest");
    const [mobileSidebar, setMobileSidebar] = useState(false);

    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState("");

    const keywordActive = keywordFromUrl.trim();

    /* ── fetch ── */
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const url = buildProductsListUrl({
                    keyword:  keywordActive || undefined,
                    category: category !== "All" ? category : undefined,
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                    sort,
                });
                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to load products");
                const data = await res.json();
                if (!cancelled) setProducts(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!cancelled) setError(e.message || "Failed to load products");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [keywordActive, category, minPrice, maxPrice, sort]);

    const applySearch = useCallback(() => {
        const next = draft.trim();
        setSearchParams(next ? { keyword: next } : {}, { replace: false });
    }, [draft, setSearchParams]);

    const clearAll = useCallback(() => {
        setDraft("");
        setCategory("All");
        setMinPrice("");
        setMaxPrice("");
        setSort("newest");
        setSearchParams({}, { replace: true });
    }, [setSearchParams]);

    const hasFilters = keywordActive || category !== "All" || minPrice || maxPrice || sort !== "newest";

    /* ── render ── */
    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

            {/* ── Hero Header ── */}
            <header style={{
                background: "linear-gradient(135deg, #0f3d23 0%, #1a6b3c 55%, #2d9e5f 100%)",
                padding: "3rem 2rem 4rem",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* decorative circles */}
                <div style={{
                    position: "absolute", top: -60, right: -60,
                    width: 300, height: 300, borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", bottom: -80, right: 120,
                    width: 200, height: 200, borderRadius: "50%",
                    background: "rgba(255,255,255,0.03)",
                    pointerEvents: "none",
                }} />

                <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative" }}>
                    <div style={{ marginBottom: "0.35rem" }}>
                        <span style={{
                            background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)",
                            borderRadius: 999, padding: "0.25rem 0.9rem",
                            fontSize: "0.75rem", fontWeight: 600,
                            letterSpacing: "0.06em", textTransform: "uppercase",
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}>
                            Rastriya Khadya Bank
                        </span>
                    </div>
                    <h1 style={{
                        color: "#fff", fontWeight: 800,
                        fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                        margin: "0.5rem 0 0.4rem", letterSpacing: "-0.02em",
                    }}>
                        {t("pages.products.title") || "Our Products"}
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: "1rem" }}>
                        Quality food staples — fresh, verified, delivered.
                    </p>

                    {/* Search bar */}
                    <div style={{
                        display: "flex", gap: 10, marginTop: "1.75rem",
                        maxWidth: 580,
                    }}>
                        <div style={{
                            flex: 1, display: "flex", alignItems: "center",
                            background: "rgba(255,255,255,0.12)",
                            border: "1.5px solid rgba(255,255,255,0.25)",
                            borderRadius: 14, padding: "0 1rem",
                            backdropFilter: "blur(10px)",
                            transition: "border-color 0.2s",
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input
                                id="product-search"
                                type="search"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applySearch(); } }}
                                placeholder="Search products…"
                                style={{
                                    flex: 1, border: "none", background: "transparent",
                                    color: "#fff", fontSize: "0.95rem", outline: "none",
                                    padding: "0.7rem 0.6rem", caretColor: "#fff",
                                }}
                            />
                            {draft && (
                                <button
                                    onClick={() => setDraft("")}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", padding: "0 4px", fontSize: "1.1rem" }}
                                >×</button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={applySearch}
                            style={{
                                background: "#fff", color: "#1a6b3c",
                                border: "none", borderRadius: 14,
                                padding: "0 1.4rem", fontWeight: 700,
                                cursor: "pointer", fontSize: "0.9rem",
                                letterSpacing: "0.01em",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                flexShrink: 0,
                            }}
                        >
                            Search
                        </button>
                        {/* Mobile filter btn */}
                        <button
                            onClick={() => setMobileSidebar(true)}
                            className="mobile-filter-btn"
                            style={{
                                display: "none",
                                background: "rgba(255,255,255,0.15)",
                                border: "1.5px solid rgba(255,255,255,0.25)",
                                borderRadius: 14, padding: "0 1rem",
                                color: "#fff", fontWeight: 600,
                                cursor: "pointer", fontSize: "0.9rem",
                                alignItems: "center", gap: 6,
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                            </svg>
                            Filters
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main layout ── */}
            <div style={{
                maxWidth: 1320, margin: "0 auto",
                display: "flex", gap: "1.75rem",
                padding: "2rem 1.5rem 3rem",
                alignItems: "flex-start",
            }}>
                {/* ── Sidebar ── */}
                <aside
                    className="products-sidebar"
                    style={{
                        width: 252, flexShrink: 0,
                        background: "#fff",
                        borderRadius: 18,
                        border: "1px solid #e8edf3",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                        padding: "1.5rem 1.25rem",
                        position: "sticky", top: 24,
                        maxHeight: "calc(100vh - 48px)",
                        overflowY: "auto",
                    }}
                >
                    {/* Sidebar header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a", letterSpacing: "-0.01em" }}>
                            Filters
                        </span>
                        {hasFilters && (
                            <button onClick={clearAll} style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "#dc2626", fontSize: "0.75rem", fontWeight: 700,
                                padding: "0.2rem 0.5rem", borderRadius: 6,
                                background: "#fef2f2",
                            }}>
                                Reset all
                            </button>
                        )}
                    </div>

                    {/* Category */}
                    <FilterSection title="Category">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                style={{
                                    width: "100%", textAlign: "left",
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "0.5rem 0.75rem", borderRadius: 10,
                                    border: "1.5px solid",
                                    borderColor: category === cat ? "#2d9e5f" : "transparent",
                                    background: category === cat ? "#f0fdf4" : "transparent",
                                    color: category === cat ? "#166534" : "#374151",
                                    fontWeight: category === cat ? 700 : 500,
                                    fontSize: "0.875rem", cursor: "pointer",
                                    transition: "all 0.15s",
                                    marginBottom: 3,
                                }}
                            >
                                <span style={{ fontSize: "1rem", lineHeight: 1 }}>{CAT_ICONS[cat] || "📦"}</span>
                                {cat}
                                {category === cat && (
                                    <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "#2d9e5f" }}>✓</span>
                                )}
                            </button>
                        ))}
                    </FilterSection>

                    {/* Price */}
                    <FilterSection title="Price Range (Rs)">
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                id="min-price"
                                type="number"
                                min={0}
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                style={numInputStyle}
                            />
                            <span style={{ color: "#cbd5e1", fontWeight: 700 }}>—</span>
                            <input
                                id="max-price"
                                type="number"
                                min={0}
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                style={numInputStyle}
                            />
                        </div>
                    </FilterSection>

                    {/* Sort */}
                    <FilterSection title="Sort By">
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setSort(opt.value)}
                                style={{
                                    width: "100%", textAlign: "left",
                                    padding: "0.5rem 0.75rem", borderRadius: 10,
                                    border: "1.5px solid",
                                    borderColor: sort === opt.value ? "#2d9e5f" : "transparent",
                                    background: sort === opt.value ? "#f0fdf4" : "transparent",
                                    color: sort === opt.value ? "#166534" : "#374151",
                                    fontWeight: sort === opt.value ? 700 : 500,
                                    fontSize: "0.875rem", cursor: "pointer",
                                    transition: "all 0.15s",
                                    marginBottom: 3,
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}
                            >
                                {opt.label}
                                {sort === opt.value && (
                                    <span style={{ fontSize: "0.65rem", color: "#2d9e5f" }}>✓</span>
                                )}
                            </button>
                        ))}
                    </FilterSection>
                </aside>

                {/* ── Products Area ── */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Top bar */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1.25rem", flexWrap: "wrap", gap: 10,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            {/* Active filter chips */}
                            {keywordActive && (
                                <Chip label={`"${keywordActive}"`} onRemove={() => { setDraft(""); setSearchParams({}, { replace: true }); }} />
                            )}
                            {category !== "All" && (
                                <Chip label={`${CAT_ICONS[category]} ${category}`} onRemove={() => setCategory("All")} />
                            )}
                            {(minPrice || maxPrice) && (
                                <Chip label={`Rs ${minPrice || "0"} – ${maxPrice || "∞"}`} onRemove={() => { setMinPrice(""); setMaxPrice(""); }} />
                            )}
                            {sort !== "newest" && (
                                <Chip label={SORT_OPTIONS.find((o) => o.value === sort)?.label} onRemove={() => setSort("newest")} />
                            )}
                        </div>
                        {!loading && !error && (
                            <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>
                                {products.length} {products.length === 1 ? "product" : "products"}
                            </span>
                        )}
                    </div>

                    {/* Loading skeleton */}
                    {loading && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: "1.25rem",
                        }}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} style={{
                                    borderRadius: 20, overflow: "hidden",
                                    background: "#fff", border: "1px solid #f1f5f9",
                                }}>
                                    <div style={{ paddingTop: "72%", background: "#f1f5f9", animation: "skeleton-pulse 1.4s ease-in-out infinite" }} />
                                    <div style={{ padding: "1rem" }}>
                                        <div style={{ height: 14, background: "#f1f5f9", borderRadius: 8, marginBottom: 8, width: "75%", animation: "skeleton-pulse 1.4s ease-in-out infinite" }} />
                                        <div style={{ height: 12, background: "#f1f5f9", borderRadius: 8, width: "45%", animation: "skeleton-pulse 1.4s ease-in-out infinite" }} />
                                        <div style={{ height: 38, background: "#f1f5f9", borderRadius: 12, marginTop: 16, animation: "skeleton-pulse 1.4s ease-in-out infinite" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div style={{
                            background: "#fff", borderRadius: 18,
                            border: "1px solid #fecaca",
                            padding: "3rem 2rem", textAlign: "center",
                        }}>
                            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚠️</div>
                            <p style={{ color: "#dc2626", fontWeight: 600, margin: 0 }}>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    marginTop: 16, background: "#fef2f2",
                                    border: "1px solid #fecaca", color: "#dc2626",
                                    borderRadius: 10, padding: "0.5rem 1.25rem",
                                    fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
                                }}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && products.length === 0 && (
                        <div style={{
                            background: "#fff", borderRadius: 18,
                            border: "1px solid #e2e8f0",
                            padding: "4rem 2rem", textAlign: "center",
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
                            <h3 style={{ color: "#0f172a", fontWeight: 700, margin: "0 0 8px" }}>No products found</h3>
                            <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0 0 20px" }}>
                                Try adjusting your filters or search term
                            </p>
                            <button
                                onClick={clearAll}
                                style={{
                                    background: "linear-gradient(135deg, #1a6b3c, #2d9e5f)",
                                    color: "#fff", border: "none", borderRadius: 12,
                                    padding: "0.6rem 1.5rem", fontWeight: 700,
                                    cursor: "pointer", fontSize: "0.9rem",
                                    boxShadow: "0 4px 14px rgba(26,107,60,0.3)",
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Product grid */}
                    {!loading && !error && products.length > 0 && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                            gap: "1.25rem",
                        }}>
                            {products.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile sidebar overlay */}
            {mobileSidebar && (
                <div
                    onClick={() => setMobileSidebar(false)}
                    style={{
                        position: "fixed", inset: 0,
                        background: "rgba(0,0,0,0.45)", zIndex: 999,
                        backdropFilter: "blur(3px)",
                    }}
                />
            )}
            <div
                className="mobile-sidebar-drawer"
                style={{
                    position: "fixed", left: 0, top: 0, bottom: 0,
                    width: 300, background: "#fff", zIndex: 1000,
                    padding: "1.5rem", overflowY: "auto",
                    boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
                    transform: mobileSidebar ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.3s ease",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>Filters</span>
                    <button onClick={() => setMobileSidebar(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}>×</button>
                </div>
                {/* ── Category (mobile) ── */}
                <FilterSection title="Category">
                    {CATEGORIES.map((cat) => (
                        <button key={cat} onClick={() => { setCategory(cat); setMobileSidebar(false); }}
                            style={{
                                width: "100%", textAlign: "left",
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "0.5rem 0.75rem", borderRadius: 10,
                                border: "1.5px solid",
                                borderColor: category === cat ? "#2d9e5f" : "transparent",
                                background: category === cat ? "#f0fdf4" : "transparent",
                                color: category === cat ? "#166534" : "#374151",
                                fontWeight: category === cat ? 700 : 500,
                                fontSize: "0.875rem", cursor: "pointer",
                                transition: "all 0.15s", marginBottom: 3,
                            }}
                        >
                            <span>{CAT_ICONS[cat] || "📦"}</span>{cat}
                        </button>
                    ))}
                </FilterSection>
                <FilterSection title="Price Range (Rs)">
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input id="mobile-min-price" type="number" min={0} placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={numInputStyle} />
                        <span style={{ color: "#cbd5e1", fontWeight: 700 }}>—</span>
                        <input id="mobile-max-price" type="number" min={0} placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={numInputStyle} />
                    </div>
                </FilterSection>
                <FilterSection title="Sort By">
                    {SORT_OPTIONS.map((opt) => (
                        <button key={opt.value} onClick={() => { setSort(opt.value); setMobileSidebar(false); }}
                            style={{
                                width: "100%", textAlign: "left",
                                padding: "0.5rem 0.75rem", borderRadius: 10,
                                border: "1.5px solid",
                                borderColor: sort === opt.value ? "#2d9e5f" : "transparent",
                                background: sort === opt.value ? "#f0fdf4" : "transparent",
                                color: sort === opt.value ? "#166534" : "#374151",
                                fontWeight: sort === opt.value ? 700 : 500,
                                fontSize: "0.875rem", cursor: "pointer",
                                transition: "all 0.15s", marginBottom: 3,
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </FilterSection>
                {hasFilters && (
                    <button onClick={() => { clearAll(); setMobileSidebar(false); }}
                        style={{
                            width: "100%", marginTop: 12,
                            background: "#fef2f2", border: "1px solid #fecaca",
                            color: "#dc2626", borderRadius: 12, padding: "0.6rem",
                            fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
                        }}
                    >Reset all filters</button>
                )}
            </div>

            {/* Global injected styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                @keyframes skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.45; }
                }
                @media (max-width: 768px) {
                    .products-sidebar { display: none !important; }
                    .mobile-filter-btn { display: inline-flex !important; }
                }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { opacity: 0.4; }
                input::placeholder { color: rgba(255,255,255,0.45); }
            `}</style>
        </div>
    );
}

/* ── Sub-components ────────────────────────────────────────────── */

function FilterSection({ title, children }) {
    return (
        <div style={{ marginBottom: "1.5rem" }}>
            <p style={{
                fontSize: "0.7rem", fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#94a3b8", marginBottom: "0.6rem", margin: "0 0 0.6rem 0",
            }}>
                {title}
            </p>
            {children}
        </div>
    );
}

function Chip({ label, onRemove }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            color: "#166534", borderRadius: 999,
            padding: "0.3rem 0.85rem 0.3rem 0.75rem",
            fontSize: "0.78rem", fontWeight: 700,
        }}>
            {label}
            <button
                onClick={onRemove}
                style={{
                    background: "rgba(22,101,52,0.12)", border: "none",
                    cursor: "pointer", color: "#166534",
                    width: 16, height: 16, borderRadius: "50%",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 900, padding: 0, lineHeight: 1,
                }}
            >×</button>
        </span>
    );
}

/* ── shared styles ──────────────────────────────────────────────── */
const numInputStyle = {
    width: "100%", padding: "0.45rem 0.7rem",
    border: "1.5px solid #e2e8f0", borderRadius: 9,
    fontSize: "0.875rem", outline: "none", color: "#0f172a",
    background: "#f8fafc", fontFamily: "inherit",
    transition: "border-color 0.15s",
};

import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../config/api";

/* ── Star renderer ─────────────────────────────────────────────── */
function Stars({ value, size = 18, interactive = false, onChange }) {
    const [hovered, setHovered] = useState(0);
    const display = interactive ? hovered || value : value;

    return (
        <span style={{ display: "inline-flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((n) => (
                <span
                    key={n}
                    onClick={() => interactive && onChange && onChange(n)}
                    onMouseEnter={() => interactive && setHovered(n)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    style={{
                        fontSize: size,
                        cursor: interactive ? "pointer" : "default",
                        color: n <= display ? "#f59e0b" : "#d1d5db",
                        transition: "color 0.1s",
                        userSelect: "none",
                        lineHeight: 1,
                    }}
                >
                    ★
                </span>
            ))}
        </span>
    );
}

/* ── Average summary bar ─────────────────────────────────────────── */
function RatingSummary({ reviews }) {
    if (!reviews.length) return null;

    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const counts = [5, 4, 3, 2, 1].map((n) => ({
        n,
        count: reviews.filter((r) => r.rating === n).length,
    }));

    return (
        <div style={{
            display: "flex", gap: "2rem", alignItems: "center",
            background: "#f8fafc", borderRadius: 14,
            padding: "1.25rem 1.5rem", marginBottom: "2rem",
            flexWrap: "wrap",
        }}>
            {/* Big number */}
            <div style={{ textAlign: "center", minWidth: 72 }}>
                <div style={{ fontSize: "3rem", fontWeight: 800, color: "#111", lineHeight: 1 }}>
                    {avg.toFixed(1)}
                </div>
                <Stars value={Math.round(avg)} size={20} />
                <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 4 }}>
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </div>
            </div>

            {/* Bar chart */}
            <div style={{ flex: 1, minWidth: 160 }}>
                {counts.map(({ n, count }) => (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: "0.8rem", color: "#555", width: 8, textAlign: "right" }}>{n}</span>
                        <span style={{ fontSize: 13, color: "#f59e0b", lineHeight: 1 }}>★</span>
                        <div style={{
                            flex: 1, height: 8, borderRadius: 99,
                            background: "#e5e7eb", overflow: "hidden",
                        }}>
                            <div style={{
                                height: "100%", borderRadius: 99,
                                background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                                width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%",
                                transition: "width 0.4s",
                            }} />
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "#888", width: 20, textAlign: "right" }}>{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Review form ──────────────────────────────────────────────────── */
function ReviewForm({ productId, onSubmitted }) {
    const { user } = useContext(AuthContext);
    const [rating, setRating] = useState(0);
    const [title, setTitle]   = useState("");
    const [body, setBody]     = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr]       = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) { setErr("Please select a star rating."); return; }
        setSaving(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ rating, title, body }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to submit review.");
            setRating(0); setTitle(""); setBody("");
            onSubmitted(data);
        } catch (e) {
            setErr(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 12, padding: "1rem 1.25rem",
                color: "#166534", fontSize: "0.9rem", textAlign: "center",
            }}>
                Please <a href="/login" style={{ fontWeight: 700, color: "#15803d" }}>log in</a> to leave a review.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 16, padding: "1.5rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}>
            <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem", color: "#111" }}>
                Write a Review
            </h3>

            {/* Star picker */}
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.82rem", color: "#555", display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Your Rating *
                </label>
                <Stars value={rating} size={28} interactive onChange={setRating} />
            </div>

            {/* Title */}
            <div style={{ marginBottom: "0.85rem" }}>
                <label style={labelStyle}>Review Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sum it up in a few words…"
                    maxLength={100}
                    style={inputStyle}
                />
            </div>

            {/* Body */}
            <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Your Review</label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Tell others what you think about this product…"
                    rows={4}
                    maxLength={1000}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 90 }}
                />
            </div>

            {err && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{err}</p>}

            <button
                type="submit"
                disabled={saving}
                style={{
                    background: saving ? "#9ca3af" : "linear-gradient(135deg,#1a6b3c,#2d9e5f)",
                    color: "#fff", border: "none", borderRadius: 10,
                    padding: "0.6rem 1.5rem", fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    fontSize: "0.9rem", transition: "opacity 0.2s",
                }}
            >
                {saving ? "Submitting…" : "Submit Review"}
            </button>
        </form>
    );
}

/* ── Single review card ───────────────────────────────────────────── */
function ReviewCard({ review, onDelete, canDelete }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm("Delete this review?")) return;
        setDeleting(true);
        try {
            await fetch(`${API_BASE}/api/products/${review.product}/reviews/${review._id}`, {
                method: "DELETE",
                credentials: "include",
            });
            onDelete(review._id);
        } finally {
            setDeleting(false);
        }
    };

    const date = new Date(review.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    });

    return (
        <div style={{
            background: "#fff", border: "1px solid #f1f5f9",
            borderRadius: 14, padding: "1.25rem 1.5rem",
            boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            transition: "box-shadow 0.2s",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                    <Stars value={review.rating} size={16} />
                    {review.title && (
                        <p style={{ fontWeight: 700, color: "#111", margin: "0.35rem 0 0", fontSize: "0.95rem" }}>
                            {review.title}
                        </p>
                    )}
                </div>
                <div style={{ textAlign: "right" }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "#f0fdf4", color: "#166534",
                        borderRadius: 20, padding: "0.2rem 0.75rem",
                        fontSize: "0.78rem", fontWeight: 600,
                    }}>
                        {review.userName}
                    </span>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>{date}</div>
                </div>
            </div>

            {review.body && (
                <p style={{ color: "#4b5563", fontSize: "0.9rem", marginTop: "0.75rem", lineHeight: 1.65 }}>
                    {review.body}
                </p>
            )}

            {canDelete && (
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                        marginTop: "0.75rem", background: "none", border: "none",
                        color: "#dc2626", cursor: "pointer", fontSize: "0.78rem",
                        fontWeight: 600, padding: 0, opacity: deleting ? 0.5 : 1,
                    }}
                >
                    {deleting ? "Deleting…" : "Delete"}
                </button>
            )}
        </div>
    );
}

/* ── Main export ─────────────────────────────────────────────────── */
export default function ProductReviews({ productId }) {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load reviews
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetch(`${API_BASE}/api/products/${productId}/reviews`)
            .then((r) => r.json())
            .then((data) => { if (!cancelled) setReviews(Array.isArray(data) ? data : []); })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [productId]);

    const handleSubmitted = useCallback((newReview) => {
        setReviews((prev) => [newReview, ...prev]);
    }, []);

    const handleDelete = useCallback((id) => {
        setReviews((prev) => prev.filter((r) => r._id !== id));
    }, []);

    // Determine if user already reviewed
    const userHasReviewed = user && reviews.some((r) => r.user === user._id || r.user === user.id);

    return (
        <section style={{ marginTop: "3.5rem" }}>
            {/* Section heading */}
            <div style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem",
            }}>
                <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#111", margin: 0 }}>
                    Reviews &amp; Ratings
                </h2>
                {reviews.length > 0 && (
                    <span style={{
                        background: "#f59e0b", color: "#fff",
                        borderRadius: 99, padding: "0.1rem 0.7rem",
                        fontSize: "0.82rem", fontWeight: 700,
                    }}>
                        {reviews.length}
                    </span>
                )}
            </div>

            {/* Summary */}
            {!loading && <RatingSummary reviews={reviews} />}

            {/* Review form */}
            {!userHasReviewed && (
                <div style={{ marginBottom: "2rem" }}>
                    <ReviewForm productId={productId} onSubmitted={handleSubmitted} />
                </div>
            )}
            {userHasReviewed && (
                <div style={{
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: 12, padding: "0.85rem 1.25rem",
                    color: "#166534", fontSize: "0.88rem", marginBottom: "2rem",
                    fontWeight: 600,
                }}>
                    ✓ You have already reviewed this product.
                </div>
            )}

            {/* List */}
            {loading && (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>
                    Loading reviews…
                </div>
            )}
            {!loading && reviews.length === 0 && (
                <div style={{
                    textAlign: "center", padding: "2.5rem",
                    background: "#f8fafc", borderRadius: 14,
                    color: "#9ca3af", fontSize: "0.9rem",
                }}>
                    No reviews yet. Be the first to share your thoughts!
                </div>
            )}
            {!loading && reviews.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {reviews.map((r) => (
                        <ReviewCard
                            key={r._id}
                            review={r}
                            onDelete={handleDelete}
                            canDelete={
                                user &&
                                (user._id === r.user || user.id === r.user || user.isAdmin)
                            }
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

/* ── shared styles ──────────────────────────────────────────────── */
const labelStyle = {
    fontSize: "0.82rem", color: "#555",
    display: "block", marginBottom: 5, fontWeight: 600,
};
const inputStyle = {
    width: "100%", padding: "0.55rem 0.85rem",
    border: "1.5px solid #e5e7eb", borderRadius: 9,
    fontSize: "0.9rem", outline: "none", color: "#111",
    background: "#fafafa", boxSizing: "border-box",
    fontFamily: "inherit",
};

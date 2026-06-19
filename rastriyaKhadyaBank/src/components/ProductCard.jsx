import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23cbd5e1'%3ENo Image%3C/text%3E%3C/svg%3E";

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const productId = product._id ?? product.id;
  const to = `/products/${productId}`;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: hovered
          ? "0 20px 60px rgba(0,0,0,0.13), 0 4px 16px rgba(26,107,60,0.08)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.28s ease, transform 0.28s ease",
        border: "1px solid #f1f5f9",
        height: "100%",
      }}
    >
      {/* ── Image ── */}
      <Link to={to} style={{ display: "block", position: "relative", flexShrink: 0 }}>
        <div style={{ position: "relative", paddingTop: "72%", overflow: "hidden", background: "#f8fafc" }}>
          <img
            src={product.image || placeholderImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={(e) => { e.target.src = placeholderImage; e.target.onerror = null; }}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
          />
          {/* Gradient overlay on hover */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 55%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }} />
          {/* Stock badge */}
          {(product.stock === 0) && (
            <span style={{
              position: "absolute", top: 12, right: 12,
              background: "#fef2f2", color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: 999, padding: "0.22rem 0.65rem",
              fontSize: "0.7rem", fontWeight: 700,
            }}>
              {t("pages.products.outOfStock")}
            </span>
          )}
        </div>
      </Link>

      {/* ── Body ── */}
      <div style={{ padding: "1rem 1.1rem 1.1rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <Link to={to} style={{ textDecoration: "none", flex: 1 }}>
          <h3 style={{
            fontWeight: 700, fontSize: "0.98rem",
            color: "#0f172a", margin: 0,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {product.name}
          </h3>
        </Link>

        {/* Price row */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginTop: "0.65rem",
        }}>
          <span style={{
            fontSize: "1.15rem", fontWeight: 800, color: "#1a6b3c",
            letterSpacing: "-0.02em",
          }}>
            Rs {product.price}
          </span>
          {product.stock > 0 && (
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
              {t("pages.products.stockLeft", { count: product.stock })}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          disabled={product.stock === 0}
          onClick={handleAdd}
          style={{
            marginTop: "0.85rem",
            width: "100%",
            padding: "0.6rem 0",
            borderRadius: 12,
            border: "none",
            cursor: product.stock === 0 ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: "0.88rem",
            letterSpacing: "0.01em",
            transition: "all 0.2s ease",
            background: product.stock === 0
              ? "#e2e8f0"
              : added
                ? "linear-gradient(135deg, #059669, #10b981)"
                : "linear-gradient(135deg, #1a6b3c, #2d9e5f)",
            color: product.stock === 0 ? "#94a3b8" : "#fff",
            boxShadow: product.stock > 0 && !added
              ? "0 4px 14px rgba(26,107,60,0.3)"
              : "none",
            transform: added ? "scale(0.97)" : "scale(1)",
          }}
        >
          {product.stock === 0
            ? t("pages.products.outOfStock")
            : added
              ? t("pages.products.addedToCart")
              : t("pages.products.addToCart") || "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../config/api";
import ProductDetailSkeleton from "../components/ProductDetailSkeleton";
import ProductReviews from "../components/ProductReviews";

const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3E%3C/text%3E%3C/svg%3E";

const IMG_WIDTH = 800;
const IMG_HEIGHT = 800;
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

export default function ProductDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (res.status === 404) {
          throw new Error(t("pages.productDetails.notFound"));
        }
        if (!res.ok) throw new Error(t("pages.productDetails.loadFailed"));
        const data = await res.json();
        if (!cancelled) setProduct(data);
      } catch (e) {
        if (!cancelled) setError(e.message || t("pages.productDetails.loadFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  useEffect(() => {
    if (!product) return;

    const prevTitle = document.title;
    const descText = (product.description || `${product.name} — RKB Mart`)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    document.title = `${product.name} | RKB Mart`;

    let meta = document.querySelector('meta[name="description"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    const prevDesc = meta.getAttribute("content") || "";
    meta.setAttribute("content", descText);

    return () => {
      document.title = prevTitle;
      if (created) {
        meta?.remove();
      } else {
        meta?.setAttribute("content", prevDesc);
      }
    };
  }, [product]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 mb-4">{error || t("pages.productDetails.notFound")}</p>
        <Link
          to="/products"
          className="text-green-900 font-semibold underline inline-flex items-center justify-center min-h-[44px] px-2"
        >
          {t("pages.productDetails.backToProducts")}
        </Link>
      </div>
    );
  }

  const imageSrc = product.image || placeholderImage;
  const isPlaceholderImage = !product.image;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-4 space-y-2 order-1">
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide lg:hidden">
            {t("pages.productDetails.video")}
          </h2>
          {product.video ? (
            <div className="w-full rounded-xl bg-black shadow-md overflow-hidden aspect-video max-h-[min(100vw,85vh)]">
              <video
                key={product.video}
                controls
                playsInline
                preload="metadata"
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                className="h-full w-full object-contain bg-black"
                aria-label={t("pages.productDetails.video")}
              >
                <source src={product.video} />
                <track
                  kind="captions"
                  srcLang="en"
                  label={t("pages.productDetails.videoCaptionLabel")}
                  src="/product-video-caption-en.vtt"
                  default
                />
              </video>
            </div>
          ) : (
            <div
              className="w-full rounded-xl bg-gray-200 flex items-center justify-center text-gray-600 text-sm aspect-video border border-gray-100"
              role="status"
            >
              {t("pages.productDetails.noVideo")}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 order-2 space-y-4 min-h-[240px]">
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            {product.name}
          </h1>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {product.description || t("pages.productDetails.noDescription")}
          </p>
          <dl className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between gap-4 border-b border-gray-200 py-2">
              <dt className="font-semibold text-gray-700">{t("pages.productDetails.price")}</dt>
              <dd className="text-gray-900 font-medium">Rs {product.price}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-gray-200 py-2">
              <dt className="font-semibold text-gray-700">{t("pages.productDetails.category")}</dt>
              <dd className="text-gray-900">{product.category || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="font-semibold text-gray-700">{t("pages.productDetails.stock")}</dt>
              <dd className="text-gray-900">{product.stock ?? 0}</dd>
            </div>
          </dl>
          <button
            type="button"
            disabled={!(product.stock > 0)}
            onClick={() => addToCart(product, 1)}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-8 py-3 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-green-100 transition-colors"
          >
            {t("pages.products.addToCart")}
          </button>
          <Link
            to="/products"
            className="inline-flex items-center text-sm text-green-900 font-semibold hover:underline min-h-[44px] py-2"
          >
            {t("pages.productDetails.allProducts")}
          </Link>
        </div>

        <div className="lg:col-span-4 order-3 space-y-2">
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide lg:hidden">
            {t("pages.productDetails.productImage")}
          </h2>
          <div className="relative w-full mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-md bg-gray-100 aspect-square max-h-[480px]">
            <img
              src={imageSrc}
              alt={isPlaceholderImage ? t("pages.productDetails.productImage") : product.name}
              width={IMG_WIDTH}
              height={IMG_HEIGHT}
              sizes="(max-width: 1024px) 100vw, 33vw"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                e.target.src = placeholderImage;
                e.target.onerror = null;
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Reviews & Ratings ── */}
      <div style={{
        maxWidth: "100%",
        marginTop: "2rem",
        paddingTop: "2rem",
        borderTop: "1px solid #e5e7eb",
      }}>
        <ProductReviews productId={id} />
      </div>
    </div>
  );
}

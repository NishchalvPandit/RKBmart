import { useContext } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

export default function Cart() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { items, updateQuantity, removeFromCart, grandTotal } = useCart();

  const formatRs = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return "—";
    return v.toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        {t("pages.cart.title")}
      </h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-600 mb-4">{t("pages.cart.empty")}</p>
          <Link
            to="/products"
            className="inline-flex font-bold text-green-700 hover:text-green-800 underline"
          >
            {t("pages.cart.browseProducts")}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {items.map((item) => {
              const lineTotal = Number(item.price) * item.quantity;
              return (
                <li
                  key={item.productId}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-5"
                >
                  <Link
                    to={`/products/${item.productId}`}
                    className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        {t("pages.cart.noImg")}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-bold text-gray-900 hover:text-green-700 line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      Rs {formatRs(item.price)} {t("pages.cart.each")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs font-semibold uppercase text-gray-500">
                      {t("pages.cart.qty")}
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.productId, e.target.value)
                        }
                        className="ml-2 w-16 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm"
                      />
                    </label>
                    <p className="text-sm font-bold text-gray-900 min-w-[9rem]">
                      {t("pages.cart.line")}: Rs {formatRs(lineTotal)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="text-sm font-semibold text-red-600 hover:text-red-800 underline"
                    >
                      {t("pages.cart.remove")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-green-100 bg-green-50/60 px-6 py-5">
            <span className="text-lg font-bold text-gray-800">
              {t("pages.cart.grandTotal")}
            </span>
            <span className="text-2xl font-black text-green-800">
              Rs {formatRs(grandTotal)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Link
              to="/products"
              className="text-sm font-semibold text-green-700 hover:text-green-800 underline"
            >
              {t("pages.cart.continueShopping")}
            </Link>
            <Link
              to={user ? "/checkout" : "/login"}
              className="inline-flex justify-center px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-lg shadow-green-100 transition-colors"
            >
              {user ? t("pages.cart.proceedCheckout") : "Login to Checkout"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

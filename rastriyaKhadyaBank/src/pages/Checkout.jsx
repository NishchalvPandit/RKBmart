import { useState, useContext } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../config/api";

const EMPTY_FORM = {
    fullName: "",
    email: "",
    phoneNumber: "",
    street: "",
    city: "",
};

export default function Checkout() {
    const { t } = useTranslation();
    const { user, loading } = useContext(AuthContext);
    const { items, grandTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting || items.length === 0) return;

        setError("");
        setSubmitting(true);

        const orderPayload = {
            items: items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
            })),
            shippingAddress: {
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phoneNumber: form.phoneNumber.trim(),
                street: form.street.trim(),
                city: form.city.trim(),
            },
            paymentMethod: "cash_on_delivery",
        };

        try {
            const res = await fetch(`${API_BASE}/api/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(orderPayload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || t("pages.checkout.failedPlaceOrder"));
            }

            clearCart();
            navigate("/order-success", {
                state: { orderId: data.order?._id },
                replace: true,
            });
        } catch (err) {
            setError(err.message || t("pages.checkout.errorGeneric"));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-gray-500 text-sm">{t("common.loading")}</p>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-gray-600">{t("pages.checkout.emptyCart")}</p>
                <Link
                    to="/products"
                    className="text-green-700 font-semibold underline"
                >
                    {t("pages.checkout.browseProducts")}
                </Link>
            </div>
        );
    }

    const fieldClass =
        "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
                {t("pages.checkout.title")}
            </h1>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
                >
                    <h2 className="text-lg font-bold text-gray-900">
                        {t("pages.checkout.shippingInfo")}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                {t("pages.checkout.fullName")}
                            </label>
                            <input
                                name="fullName"
                                type="text"
                                required
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder={t("pages.checkout.fullNamePlaceholder")}
                                className={fieldClass}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                {t("pages.checkout.emailLabel")}
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                placeholder={t("pages.checkout.emailPlaceholder")}
                                className={fieldClass}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                {t("pages.checkout.phoneLabel")}
                            </label>
                            <input
                                name="phoneNumber"
                                type="tel"
                                required
                                value={form.phoneNumber}
                                onChange={handleChange}
                                placeholder={t("pages.checkout.phonePlaceholder")}
                                className={fieldClass}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                {t("pages.checkout.addressLabel")}
                            </label>
                            <input
                                name="street"
                                type="text"
                                required
                                value={form.street}
                                onChange={handleChange}
                                placeholder={t("pages.checkout.addressPlaceholder")}
                                className={fieldClass}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                {t("pages.checkout.cityLabel")}
                            </label>
                            <input
                                name="city"
                                type="text"
                                required
                                value={form.city}
                                onChange={handleChange}
                                placeholder={t("pages.checkout.cityPlaceholder")}
                                className={fieldClass}
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">
                            {t("pages.checkout.paymentMethod")}
                        </h2>
                        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                            <span className="text-2xl">💵</span>
                            <div>
                                <p className="text-sm font-bold text-gray-900">
                                    {t("pages.checkout.cashOnDelivery")}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {t("pages.checkout.payWhenArrives")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-lg px-4 py-3">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 px-6 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold text-sm shadow-lg shadow-green-100 transition-colors"
                    >
                        {submitting ? t("pages.checkout.placingOrder") : t("pages.checkout.placeOrder")}
                    </button>
                </form>

                <div className="w-full lg:w-80 xl:w-96 shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 sticky top-28">
                        <h2 className="text-lg font-bold text-gray-900">
                            {t("pages.checkout.orderSummary")}
                        </h2>

                        <ul className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <li
                                    key={item.productId}
                                    className="flex items-center gap-3 py-3"
                                >
                                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
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
                                                📦
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {t("pages.checkout.qtyPriceLine", {
                                                qty: item.quantity,
                                                price: Number(item.price).toLocaleString(),
                                            })}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 shrink-0">
                                        Rs{" "}
                                        {(
                                            Number(item.price) * item.quantity
                                        ).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                            <span className="font-bold text-gray-700">
                                {t("pages.checkout.total")}
                            </span>
                            <span className="text-xl font-black text-green-800">
                                Rs {grandTotal.toLocaleString()}
                            </span>
                        </div>

                        <Link
                            to="/cart"
                            className="block text-center text-sm text-green-700 hover:text-green-900 font-semibold underline"
                        >
                            {t("pages.checkout.editCart")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

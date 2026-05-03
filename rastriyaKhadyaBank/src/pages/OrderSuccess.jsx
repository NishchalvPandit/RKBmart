import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function OrderSuccess() {
    const { t } = useTranslation();
    const { state } = useLocation();
    const orderId = state?.orderId;

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center bg-white rounded-2xl border border-gray-100 shadow-xl p-10 space-y-6">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto">
                    <svg
                        className="w-10 h-10 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">
                        {t("pages.orderSuccess.title")}
                    </h1>
                    <p className="mt-2 text-gray-500 text-sm">
                        {t("pages.orderSuccess.thankYouLead")}{" "}
                        <span className="font-semibold text-green-700">
                            {t("pages.orderSuccess.martName")}
                        </span>
                        . {t("pages.orderSuccess.processing")}
                    </p>
                </div>

                {orderId && (
                    <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            {t("pages.orderSuccess.orderId")}
                        </p>
                        <p className="font-mono text-sm text-gray-800 break-all">
                            {orderId}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/products"
                        className="inline-flex justify-center px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-lg shadow-green-100 transition-colors"
                    >
                        {t("pages.orderSuccess.continueShopping")}
                    </Link>
                    <Link
                        to="/profile"
                        className="inline-flex justify-center px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm transition-colors"
                    >
                        {t("pages.orderSuccess.viewOrders")}
                    </Link>
                </div>
            </div>
        </div>
    );
}

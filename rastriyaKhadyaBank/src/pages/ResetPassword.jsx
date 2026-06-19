import { useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../config/api";
import Seo from "../components/Seo";

const ResetPassword = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const passwordChecks = {
        minLength: password.length >= 8,
        hasUpperAndLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password)
    };

    const isStrongPassword =
        passwordChecks.minLength &&
        passwordChecks.hasUpperAndLower &&
        passwordChecks.hasNumber &&
        passwordChecks.hasSpecial;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setMessage(t("resetPassword.tokenMissing"));
            return;
        }
        if (!isStrongPassword) {
            setMessage(t("auth.passwordWeak"));
            return;
        }
        if (submitting) return;

        setSubmitting(true);
        setMessage("");
        try {
            const res = await axios.post(
                `${API_BASE}/api/auth/reset-password/${encodeURIComponent(token)}`,
                { password },
                { withCredentials: true }
            );
            setMessage(res.data?.message || t("resetPassword.success"));
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            setMessage(err.response?.data?.message || t("resetPassword.failed"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Seo
                title={t("seo.resetTitle")}
                description={t("seo.resetDesc")}
                path="/reset-password"
                noIndex
            />
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-6 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">{t("resetPassword.title")}</h2>
                    <p className="text-center text-sm text-gray-600">{t("resetPassword.subtitle")}</p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded-xl block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder={t("resetPassword.newPassword")}
                        />
                        <div className="px-1">
                            <p className="text-xs text-gray-600">{t("resetPassword.requirementsTitle")}</p>
                            <ul className="text-xs text-gray-600 space-y-1 mt-1 list-disc pl-5">
                                <li className={passwordChecks.minLength ? "text-green-700" : "text-red-600"}>
                                    {t("auth.pwReqMinLen")}
                                </li>
                                <li className={passwordChecks.hasUpperAndLower ? "text-green-700" : "text-red-600"}>
                                    {t("auth.pwReqCase")}
                                </li>
                                <li className={passwordChecks.hasNumber ? "text-green-700" : "text-red-600"}>
                                    {t("auth.pwReqNumber")}
                                </li>
                                <li className={passwordChecks.hasSpecial ? "text-green-700" : "text-red-600"}>
                                    {t("auth.pwReqSpecial")}
                                </li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                        >
                            {submitting ? t("resetPassword.updating") : t("resetPassword.updateButton")}
                        </button>
                    </form>

                    {message && <p className="text-sm text-center text-gray-700">{message}</p>}

                    <div className="text-center">
                        <Link to="/login" className="text-sm font-semibold text-green-700 hover:text-green-800 underline">
                            {t("resetPassword.backLogin")}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;

import { useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { API_BASE } from '../config/api';

const Login = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotSubmitting, setForgotSubmitting] = useState(false);
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotIsError, setForgotIsError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');
    const { login } = useContext(AuthContext);
    const { fetchCart } = useCart();

    const [searchParams] = useSearchParams();
    const verifiedFromEmail = searchParams.get("verified") === "true";
    const verifyError = searchParams.get("verifyError");
    const successMessage = verifiedFromEmail
        ? t("auth.emailVerifiedSuccess")
        : location.state?.message;

    const clearErrors = () => {
        setEmailError('');
        setPasswordError('');
        setGeneralError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (submitting) return;
        clearErrors();

        setSubmitting(true);
        try {
            const res = await axios.post(`${API_BASE}/api/auth/login`,
                { email: email.trim().toLowerCase(), password },
                { withCredentials: true }
            );
            login(res.data.user);
            await fetchCart();
            navigate('/profile');
        } catch (err) {
            const message =
                err.response?.data?.message ||
                (err.request ? t('auth.serverUnavailable') || 'Server unavailable. Please try again.' : '') ||
                t('auth.error') ||
                'Login failed';

            const lower = message.toLowerCase();
            if (lower.includes('verify your email')) {
                setGeneralError(message);
            } else if (lower.includes('user not found')) {
                setEmailError(message);
            } else if (lower.includes('credentials') || lower.includes('invalid') || lower.includes('password')) {
                setPasswordError(message);
            } else {
                setGeneralError(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (forgotSubmitting || !forgotEmail) return;

        setForgotSubmitting(true);
        setForgotMessage('');
        setForgotIsError(false);
        try {
            const res = await axios.post(
                `${API_BASE}/api/auth/forgot-password`,
                { email: forgotEmail.trim().toLowerCase() },
                { withCredentials: true }
            );
            setForgotIsError(false);
            setForgotMessage(res.data?.message || t("auth.resetLinkSent"));
        } catch (err) {
            setForgotIsError(true);
            setForgotMessage(err.response?.data?.message || t("auth.resetLinkFailed"));
        } finally {
            setForgotSubmitting(false);
        }
    };

    return (
        <section className="min-h-[90vh] flex items-center justify-center bg-[#f8fafc] px-4 py-20 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative w-full max-w-[480px]">
                <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(16,24,40,0.06)] border border-slate-100 p-8 sm:p-12">
                    <div className="mb-10 text-center">
                        <h2 className="text-[32px] font-bold tracking-tight text-slate-900 mb-3">
                            {t('auth.login')}
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {t('auth.loginTitle')}
                        </p>
                    </div>

                    {successMessage && (
                        <div className="mb-8 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-sm text-emerald-700 font-bold leading-tight">{successMessage}</p>
                        </div>
                    )}

                    {verifyError && (
                        <div className="mb-8 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <p className="text-sm text-amber-700 font-bold leading-tight">{verifyError}</p>
                        </div>
                    )}

                    {generalError && (
                        <div className="mb-8 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <p className="text-sm text-red-700 font-bold leading-tight">{generalError}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-5">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                                    <FaEnvelope />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className={`w-full block pl-11 pr-4 py-4 rounded-2xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 ${emailError ? 'border-red-400 ring-4 ring-red-500/5' : 'border-slate-200'}`}
                                    placeholder={t('auth.email')}
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                                />
                                {emailError && <p className="mt-2 text-xs text-red-600 font-medium pl-1">{emailError}</p>}
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                                    <FaLock />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className={`w-full block pl-11 pr-4 py-4 rounded-2xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 ${passwordError ? 'border-red-400 ring-4 ring-red-500/5' : 'border-slate-200'}`}
                                    placeholder={t('auth.password')}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                                />
                                {passwordError && <p className="mt-2 text-xs text-red-600 font-medium pl-1">{passwordError}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center justify-center w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold text-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? t('auth.loggingIn') : t('auth.login')}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(!showForgotPassword)}
                            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                            {showForgotPassword ? t("auth.closeForgotPassword") : t("auth.forgotPassword")}
                        </button>
                    </div>

                    {showForgotPassword && (
                        <div className="mt-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                            <p className="text-sm text-slate-600 mb-4 font-medium">{t("auth.forgotPasswordHint")}</p>
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <input
                                    type="email"
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    placeholder={t('auth.email')}
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={forgotSubmitting}
                                    className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
                                >
                                    {forgotSubmitting ? t("auth.sendingResetLink") : t("auth.sendResetLink")}
                                </button>
                            </form>
                            {forgotMessage && (
                                <p className={`mt-3 text-xs font-bold text-center ${forgotIsError ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {forgotMessage}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-500 font-medium">
                            {t('auth.noAccount')}{' '}
                            <Link to="/register" className="text-emerald-600 font-bold hover:underline">
                                {t('auth.register')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
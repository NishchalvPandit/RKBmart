import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { API_BASE } from '../config/api';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [registrationDone, setRegistrationDone] = useState(false);
    const [resendingVerification, setResendingVerification] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [bannerTone, setBannerTone] = useState(null);
    const passwordChecks = {
        minLength: formData.password.length >= 8,
        hasUpperAndLower: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
        hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
    };
    const isStrongPassword =
        passwordChecks.minLength &&
        passwordChecks.hasUpperAndLower &&
        passwordChecks.hasNumber &&
        passwordChecks.hasSpecial;
    const showPasswordHints = formData.password.length > 0 && !isStrongPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (!isStrongPassword) {
            setBannerTone('error');
            setStatusMessage(t('auth.passwordWeak'));
            return;
        }

        setSubmitting(true);
        setBannerTone(null);
        setStatusMessage('');
        try {
            const res = await axios.post(
                `${API_BASE}/api/auth/register`,
                {
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                },
                { withCredentials: true }
            );
            setRegistrationDone(true);
            setStatusMessage(res.data?.message || t("auth.verifyEmailAfterRegister"));
        } catch (err) {
            setBannerTone('error');
            const message =
                err.response?.data?.message ||
                (err.request ? t("auth.serverUnavailable") : "") ||
                t("auth.error") ||
                t('auth.registrationFailed');
            setStatusMessage(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        if (!formData.email || resendingVerification) return;

        setResendingVerification(true);
        try {
            const res = await axios.post(
                `${API_BASE}/api/auth/resend-verification`,
                { email: formData.email.trim().toLowerCase() },
                { withCredentials: true }
            );
            setStatusMessage(res.data?.message || t("auth.resendVerificationSuccess"));
        } catch (err) {
            setStatusMessage(err.response?.data?.message || t("auth.error"));
        } finally {
            setResendingVerification(false);
        }
    };

    return (
        <section className="min-h-[90vh] flex items-center justify-center bg-[#f8fafc] px-4 py-20 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />
            
            <div className="relative w-full max-w-[520px]">
                <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(16,24,40,0.06)] border border-slate-100 p-8 sm:p-12">
                    <div className="mb-10 text-center">
                        <h2 className="text-[32px] font-bold tracking-tight text-slate-900 mb-3">
                            {t("auth.register")}
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {t("auth.registerTitle")}
                        </p>
                    </div>

                    {statusMessage && !registrationDone && (
                        <div className={`mb-8 px-4 py-3 border rounded-2xl flex items-center gap-3 ${bannerTone === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                            <div className={`w-2 h-2 rounded-full ${bannerTone === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            <p className="text-sm font-bold leading-tight">{statusMessage}</p>
                        </div>
                    )}

                    {!registrationDone ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                                        <FaUser />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full block pl-11 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                                        placeholder={t("auth.name")}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                                        <FaEnvelope />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="w-full block pl-11 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                                        placeholder={t("auth.email")}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                                        <FaLock />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full block pl-11 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200"
                                        placeholder={t("auth.password")}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                {showPasswordHints && (
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('auth.passwordRequirementsTitle')}</p>
                                        <ul className="space-y-2">
                                            {[
                                                { labelKey: 'auth.pwReqMinLen', met: passwordChecks.minLength },
                                                { labelKey: 'auth.pwReqCase', met: passwordChecks.hasUpperAndLower },
                                                { labelKey: 'auth.pwReqNumber', met: passwordChecks.hasNumber },
                                                { labelKey: 'auth.pwReqSpecial', met: passwordChecks.hasSpecial }
                                            ].map((check, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${check.met ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    <span className={check.met ? 'text-emerald-700 font-medium' : 'text-slate-400'}>{t(check.labelKey)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center justify-center w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold text-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-[0.98] disabled:opacity-70"
                            >
                                {submitting ? t("auth.creatingAccount") : t("auth.register")}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaEnvelope className="text-3xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('auth.checkEmailTitle')}</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                                {statusMessage}
                            </p>
                            
                            <div className="space-y-4">
                                <button
                                    onClick={handleResendVerification}
                                    disabled={resendingVerification}
                                    className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                                >
                                    {resendingVerification ? t("auth.resendingVerification") : t("auth.resendVerification")}
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full h-14 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                                >
                                    {t("auth.goToLogin")}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-500 font-medium">
                            {t("auth.hasAccount")}{' '}
                            <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                                {t("auth.login")}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;
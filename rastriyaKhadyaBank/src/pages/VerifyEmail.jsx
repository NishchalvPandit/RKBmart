import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaEnvelopeOpenText, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import { API_BASE } from "../config/api";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState("pending"); // pending, success, error
    const [verificationMessage, setVerificationMessage] = useState("");

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            // No token at all — user landed here directly without a link
            setVerifying(false);
            return;
        }

        const performVerification = async () => {
            try {
                await axios.get(`${API_BASE}/api/auth/verify-email`, {
                    params: { token }
                });
                navigate("/login", {
                    replace: true,
                    state: { message: "Email verified successfully! You can now log in." }
                });
            } catch (err) {
                const msg =
                    err.response?.data?.message ||
                    "Verification failed. The link may be expired or already used.";
                setVerificationStatus("error");
                setVerificationMessage(msg);
            } finally {
                setVerifying(false);
            }
        };

        performVerification();
    }, [token, navigate]);

    const isSuccess = verificationStatus === "success";
    const shouldShowLogin = isSuccess || verificationMessage.toLowerCase().includes("log in");
    const title = verifying ? "Verifying your email..." : isSuccess ? "Email verified" : "Verification status";
    const description = verificationMessage || (token ? "Please wait while we verify your account." : "Open the verification link from your inbox to verify your account.");
    
    const Icon = verifying ? FaSpinner : isSuccess ? FaCheckCircle : (verificationStatus === "error" ? FaExclamationCircle : FaEnvelopeOpenText);
    const iconClassName = isSuccess ? "text-green-600" : (verificationStatus === "error" ? "text-red-500" : "text-amber-500");

    return (
        <section className="min-h-[90vh] flex items-center justify-center bg-[#f8fafc] px-4 py-20">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[5%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
                <div className="absolute -bottom-[10%] -left-[5%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-xl">
                <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(16,24,40,0.08)] border border-slate-100 overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-2 bg-emerald-600 w-full" />
                    
                    <div className="px-8 pt-12 pb-10 sm:px-12 text-center">
                        {/* Status Icon */}
                        <div className="relative mx-auto mb-8 w-24 h-24">
                            <div className={`absolute inset-0 rounded-full opacity-10 animate-pulse ${isSuccess ? 'bg-emerald-600' : (verificationStatus === 'error' ? 'bg-red-600' : 'bg-amber-500')}`} />
                            <div className="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-sm border border-slate-50">
                                <Icon className={`text-4xl ${iconClassName} ${verifying ? 'animate-spin' : ''}`} />
                            </div>
                        </div>

                        <h1 className="text-[32px] font-bold tracking-tight text-slate-900 mb-4 leading-tight">
                            {title}
                        </h1>
                        
                        <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-[90%] mx-auto">
                            {description}
                        </p>

                        {!verifying && (
                            <div className="flex flex-col gap-4">
                                <Link
                                    to={shouldShowLogin ? "/login" : "/register"}
                                    className="flex items-center justify-center w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold text-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-[0.98]"
                                >
                                    {shouldShowLogin ? "Continue to Login" : "Back to Registration"}
                                </Link>
                                
                                <Link
                                    to="/"
                                    className="flex items-center justify-center w-full h-14 rounded-2xl bg-slate-50 text-slate-600 font-semibold text-base transition-all duration-300 hover:bg-slate-100 active:scale-[0.98]"
                                >
                                    Return to Home
                                </Link>
                            </div>
                        )}

                        {verifying && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-600 animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
                                </div>
                                <span className="text-sm font-medium text-slate-400">Security Check in Progress</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50/50 py-6 px-8 sm:px-12 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-400">
                             Rastriya Khadya Bank Mart &copy; {new Date().getFullYear()} • Secure Authentication
                        </p>
                    </div>
                </div>

                {/* Footer Assistance */}
                {!verifying && !shouldShowLogin && (
                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            Having trouble? <Link to="/contact" className="text-emerald-600 font-semibold hover:underline">Contact Support</Link>
                        </p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}} />
        </section>
    );
};

export default VerifyEmail;

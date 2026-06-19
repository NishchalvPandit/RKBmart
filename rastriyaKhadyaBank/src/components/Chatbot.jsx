import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../config/api";

const SUGGESTION_KEYS = [
    "suggestionAll",
    "suggestionUnder300",
    "suggestionAbove500",
    "suggestionOrganic",
    "suggestionCheapGrains",
    "suggestionDelivery",
    "suggestionReturn",
    "suggestionTrack",
];

export default function Chatbot() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const quickSuggestions = useMemo(
        () => SUGGESTION_KEYS.map((key) => t(`chatbot.${key}`)),
        [t]
    );

    useEffect(() => {
        setMessages([{ role: "bot", type: "text", text: t("chatbot.greeting") }]);
    }, [t]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const sendMessage = async (text) => {
        const userMsg = text || input.trim();
        if (!userMsg) return;

        setMessages((prev) => [...prev, { role: "user", type: "text", text: userMsg }]);
        setInput("");
        setIsTyping(true);

        try {
            const res = await fetch(`${API_BASE}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message: userMsg }),
            });
            const data = await res.json();

            if (!res.ok || !data.response) {
                throw new Error(data.error || data.message || t("chatbot.connectionError"));
            }

            setMessages((prev) => [...prev, { role: "bot", ...data.response }]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    type: "text",
                    text: err.message || t("chatbot.connectionError"),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 z-[9999] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
                aria-label={isOpen ? t("chatbot.closeChat") : t("chatbot.openChat")}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
                        <circle cx="8" cy="10" r="1" /><circle cx="12" cy="10" r="1" /><circle cx="16" cy="10" r="1" />
                    </svg>
                )}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                )}
            </button>

            <div
                className={`fixed bottom-24 right-5 z-[9998] w-[370px] max-w-[calc(100vw-2rem)] transition-all duration-300 origin-bottom-right ${isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-0 opacity-0 pointer-events-none"}`}
                style={{ height: "min(580px, calc(100vh - 140px))" }}
            >
                <div className="flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                    <div
                        className="flex items-center gap-3 px-4 py-3 text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #15803d, #16a34a)" }}
                    >
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm leading-tight">{t("chatbot.assistantName")}</p>
                            <p className="text-[11px] text-green-100 leading-tight">{t("chatbot.onlineStatus")}</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-full hover:bg-white/20 transition"
                            aria-label={t("chatbot.closeChat")}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" aria-live="polite">
                        {messages.map((msg, i) => (
                            <MessageBubble key={`${msg.role}-${i}-${msg.text?.slice(0, 20)}`} msg={msg} />
                        ))}
                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length <= 2 && (
                        <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-gray-50 border-t border-gray-100">
                            {quickSuggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="text-[11px] px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition font-medium"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-200 bg-white shrink-0">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t("chatbot.placeholder")}
                            className="flex-1 min-w-0 px-3 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim()}
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition disabled:opacity-40"
                            style={{ background: input.trim() ? "linear-gradient(135deg, #16a34a, #15803d)" : "#e5e7eb" }}
                            aria-label={t("chatbot.send")}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={input.trim() ? "#fff" : "#9ca3af"}>
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function MessageBubble({ msg }) {
    const isUser = msg.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${isUser ? "order-2" : ""}`}>
                <div
                    className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                        isUser
                            ? "bg-green-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                    }`}
                >
                    {msg.text}
                </div>

                {msg.type === "products" && msg.products && (
                    <div className="mt-2 space-y-2">
                        {msg.products.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                )}

                {msg.type === "order_status" && msg.order && (
                    <OrderStatusCard order={msg.order} />
                )}
            </div>
        </div>
    );
}

function ProductCard({ product }) {
    return (
        <Link
            to={`/products/${product._id}`}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-200 hover:border-green-300 hover:shadow-md transition group"
        >
            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-green-700 transition">
                    {product.name}
                </p>
                <p className="text-[11px] text-gray-500">{product.category}</p>
                <p className="text-sm font-bold text-green-700 mt-0.5">Rs. {product.price}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" className="shrink-0 opacity-0 group-hover:opacity-100 transition">
                <path d="M9 18l6-6-6-6" />
            </svg>
        </Link>
    );
}

function OrderStatusCard({ order }) {
    const steps = order.statusSteps || [];
    const current = order.currentStep;

    return (
        <div className="mt-2 p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Order Status</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.isCancelled ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                    {order.status}
                </span>
            </div>

            {!order.isCancelled && (
                <div className="flex items-center gap-1 my-2">
                    {steps.map((step, i) => (
                        <div key={step} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                    i <= current
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-200 text-gray-400"
                                }`}
                            >
                                {i <= current ? "✓" : i + 1}
                            </div>
                            <span className="text-[8px] text-gray-500 text-center capitalize leading-tight">{step}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <span>{order.itemCount} item{order.itemCount > 1 ? "s" : ""}</span>
                <span className="font-bold text-gray-800">Rs. {order.totalPrice}</span>
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        </div>
    );
}

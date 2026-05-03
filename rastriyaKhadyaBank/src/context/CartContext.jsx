/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
} from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { API_BASE } from "../config/api";

const CartContext = createContext(null);

const api = axios.create({
    baseURL: `${API_BASE}/api/cart`,
    withCredentials: true,
    validateStatus: (s) => s < 500,
});

function normalize(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map((i) => ({
        productId: String(i.productId ?? i.product?._id ?? i._id ?? ""),
        name: i.name ?? i.product?.name ?? "Product",
        price: Number(i.price ?? i.product?.price) || 0,
        image: i.image ?? i.product?.image ?? "",
        stock: i.stock ?? i.product?.stock ?? 0,
        quantity: Number(i.quantity) || 1,
    }));
}

export function CartProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState("");
    const prevUserRef = useRef(undefined);

    const fetchCart = useCallback(async () => {
        setCartLoading(true);
        setCartError("");
        try {
            const res = await api.get("/");
            if (res.status === 401) {
                setItems([]);
                return;
            }
            setItems(normalize(res.data?.items));
        } catch {
            setCartError("Failed to load cart");
        } finally {
            setCartLoading(false);
        }
    }, []);

    useEffect(() => {
        const prevUser = prevUserRef.current;
        prevUserRef.current = user;

        if (user) {
            if (prevUser === undefined || prevUser === null || prevUser?._id !== user._id) {
                fetchCart();
            }
        } else if (prevUser !== undefined && prevUser !== null) {
            setItems([]);
        }
    }, [user, fetchCart]);

    const addToCart = useCallback(
        async (product, quantity = 1) => {
            if (!user) {
                setCartError("Please login to add items to cart");
                return;
            }
            const productId = String(product._id ?? product.id);
            const addQty =
                Number.isFinite(quantity) && quantity >= 1 ? quantity : 1;

            setItems((prev) => {
                const found = prev.find((i) => i.productId === productId);
                if (found) {
                    return prev.map((i) =>
                        i.productId === productId
                            ? { ...i, quantity: i.quantity + addQty }
                            : i,
                    );
                }
                return [
                    ...prev,
                    {
                        productId,
                        name: product.name ?? "Product",
                        price: Number(product.price) || 0,
                        image: product.image || "",
                        stock: product.stock ?? 0,
                        quantity: addQty,
                    },
                ];
            });

            try {
                const res = await api.post("/add", {
                    productId,
                    quantity: addQty,
                });
                if (res.status >= 400) {
                    await fetchCart();
                    setCartError(res.data?.message || "Failed to add item");
                    return;
                }
                setItems(normalize(res.data?.items));
                setCartError("");
            } catch {
                await fetchCart();
                setCartError("Network error – could not add item");
            }
        },
        [user, fetchCart],
    );

    const removeFromCart = useCallback(
        async (productId) => {
            const id = String(productId);

            setItems((prev) => prev.filter((i) => i.productId !== id));

            if (!user) return;
            try {
                const res = await api.delete(`/remove/${id}`);
                if (res.status >= 400) {
                    await fetchCart();
                    return;
                }
                setItems(normalize(res.data?.items));
            } catch {
                await fetchCart();
            }
        },
        [user, fetchCart],
    );

    const updateQuantity = useCallback(
        async (productId, quantity) => {
            const id = String(productId);
            const q = parseInt(quantity, 10);

            if (!Number.isFinite(q) || q < 1) {
                removeFromCart(id);
                return;
            }

            setItems((prev) =>
                prev.map((i) =>
                    i.productId === id ? { ...i, quantity: q } : i,
                ),
            );

            if (!user) return;
            try {
                const res = await api.put(`/update/${id}`, { quantity: q });
                if (res.status >= 400) {
                    await fetchCart();
                    return;
                }
                setItems(normalize(res.data?.items));
            } catch {
                await fetchCart();
            }
        },
        [user, removeFromCart, fetchCart],
    );

    const clearCart = useCallback(async () => {
        setItems([]);
        if (!user) return;
        try {
            await api.delete("/clear");
        } catch {
            /* server clear is best-effort; local state already empty */
        }
    }, [user]);

    const itemCount = useMemo(
        () => items.reduce((sum, i) => sum + i.quantity, 0),
        [items],
    );

    const grandTotal = useMemo(
        () =>
            items.reduce(
                (sum, i) => sum + Number(i.price) * i.quantity,
                0,
            ),
        [items],
    );

    const value = useMemo(
        () => ({
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            fetchCart,
            itemCount,
            grandTotal,
            cartLoading,
            cartError,
        }),
        [
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            fetchCart,
            itemCount,
            grandTotal,
            cartLoading,
            cartError,
        ],
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within CartProvider");
    }
    return ctx;
}

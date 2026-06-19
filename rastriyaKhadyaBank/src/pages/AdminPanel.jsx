import { useState, useEffect, useContext, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../config/api";
import Seo from "../components/Seo";

const API = `${API_BASE}/api`;
const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  image: "",
  video: "",
};

const cfg = { withCredentials: true };

export default function AdminPanel() {
  const { t } = useTranslation();
  const { user, loading, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    verifiedUsers: 0,
    adminUsers: 0,
    totalOrders: 0,
  });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contactLoadingId, setContactLoadingId] = useState(null);

  // Product modal
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/admin/stats`, cfg);
      setStats(data);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to load stats", "error");
    }
  }, [showToast]);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/products`, cfg);
      setProducts(data);
    } catch (e) {
      showToast(
        e.response?.data?.message || "Failed to load products",
        "error",
      );
    }
  }, [showToast]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/admin/users`, cfg);
      setUsers(data);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to load users", "error");
    }
  }, [showToast]);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/orders`, cfg);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to load orders", "error");
    }
  }, [showToast]);

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      await axios.put(`${API}/orders/${orderId}/status`, { status }, cfg);
      showToast("Order status updated");
      fetchOrders();
      fetchStats();
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to update status", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/contact`, { credentials: "include" });
      const text = await res.text();
      let data = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        throw new Error("Invalid response");
      }
      if (!res.ok)
        throw new Error(data?.message || "Failed to load messages");
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast(e.message || "Failed to load messages", "error");
    }
  }, [showToast]);

  const markContactRead = async (id, read) => {
    setContactLoadingId(id);
    try {
      const res = await fetch(
        `${API}/contact/${id}/${read ? "read" : "unread"}`,
        { method: "PUT", credentials: "include" },
      );
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }
      if (!res.ok)
        throw new Error(data.message || "Update failed");
      showToast(read ? "Marked as read" : "Marked as unread");
      fetchContacts();
    } catch (e) {
      showToast(e.message || "Failed to update", "error");
    } finally {
      setContactLoadingId(null);
    }
  };

  useEffect(() => {
    if (!loading && user?.isAdmin) fetchStats();
  }, [loading, user, fetchStats]);

  useEffect(() => {
    if (activeTab === "products") fetchProducts();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "messages") fetchContacts();
    if (activeTab === "dashboard") fetchStats();
  }, [activeTab, fetchProducts, fetchUsers, fetchOrders, fetchContacts, fetchStats]);

  // ─── Guards ───────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: "4px solid #16a34a",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (!user.isAdmin) return <Navigate to="/" />;

  // ─── Handler helpers ──────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price ?? "",
      category: p.category || "",
      stock: p.stock ?? "",
      image: p.image || "",
      video: p.video || "",
    });
    setShowModal(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
      };
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct._id}`, payload, cfg);
        showToast("Product updated");
      } else {
        await axios.post(`${API}/products`, payload, cfg);
        showToast("Product created");
      }
      setShowModal(false);
      fetchProducts();
      fetchStats();
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to save product", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const confirmAndDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === "product") {
        await axios.delete(`${API}/products/${confirmDelete.id}`, cfg);
        showToast("Product deleted");
        fetchProducts();
      } else if (confirmDelete.type === "contact") {
        const res = await fetch(`${API}/contact/${confirmDelete.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const text = await res.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = {};
        }
        if (!res.ok)
          throw new Error(data.message || "Failed to delete");
        showToast("Message deleted");
        fetchContacts();
      } else {
        await axios.delete(`${API}/admin/users/${confirmDelete.id}`, cfg);
        showToast("User deleted");
        fetchUsers();
      }
      fetchStats();
      setConfirmDelete(null);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to delete", "error");
    }
  };

  const toggleAdmin = async (uid) => {
    try {
      const { data } = await axios.patch(
        `${API}/admin/users/${uid}/toggle-admin`,
        {},
        cfg,
      );
      showToast(data.message);
      fetchUsers();
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to toggle admin", "error");
    }
  };

  // ─── Sidebar tabs config ──────────────────────────────────────────────────
  const tabs = [
    { 
      id: "dashboard", 
      label: t("admin.dashboard"), 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
        </svg>
      )
    },
    { 
      id: "products", 
      label: t("admin.products"), 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
        </svg>
      )
    },
    { 
      id: "users", 
      label: t("admin.users"), 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    { 
      id: "orders", 
      label: t("admin.orders"), 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
    { 
      id: "messages", 
      label: t("admin.messages"), 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
      )
    },
  ];

  // ─── Stats cards config ───────────────────────────────────────────────────
  const statCards = [
    { 
      label: t("admin.totalProducts"), 
      value: stats.totalProducts, 
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
        </svg>
      ) 
    },
    { 
      label: t("admin.totalUsers"), 
      value: stats.totalUsers, 
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ) 
    },
    { 
      label: t("admin.verifiedUsers"), 
      value: stats.verifiedUsers, 
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) 
    },
    { 
      label: t("admin.adminUsers"), 
      value: stats.adminUsers, 
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ) 
    },
    { 
      label: t("admin.totalOrders"), 
      value: stats.totalOrders, 
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ) 
    },
  ];

  const S = styles;

  return (
    <>
    <Seo
      title={t("seo.adminTitle")}
      description={t("seo.adminDesc")}
      path="/admin"
      noIndex
    />
    <div style={S.root} className="admin-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-overlay"
          aria-label={t("admin.closeMenu")}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside style={S.sidebar} className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Header */}
        <div style={S.sidebarHeader}>
          <h1
            style={{ color: "#000", fontWeight: 900, fontSize: 14, margin: 0 }}
          >
            {t("admin.title")}
          </h1>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setSidebarOpen(false);
              }}
              style={{
                ...S.navBtn,
                ...(activeTab === id ? S.navBtnActive : {}),
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid #e5e5e5",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Link to="/" style={S.navBtn}>
            <span style={{ display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span> 
            {t("admin.backToSite")}
          </Link>
          <button onClick={logout} style={{ ...S.navBtn, color: "#f87171" }}>
            <span style={{ display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {t("admin.logout")}
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main style={S.main} className="admin-main">
        {/* Header */}
        <header style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? t("admin.closeMenu") : t("admin.openMenu")}
            >
              ☰
            </button>
            <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: "#000",
                textTransform: "capitalize",
              }}
            >
              {tabs.find((tab) => tab.id === activeTab)?.label || activeTab}
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#666" }}>
              {t("admin.subtitle")}
            </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 700,
                color: "#000",
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#000",
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "#666",
                  fontWeight: 600,
                }}
              >
                Administrator
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: 32 }}>
          {/* ── DASHBOARD ──────────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stats grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 20,
                  marginBottom: 28,
                }}
              >
                {statCards.map(({ label, value, icon }) => (
                  <div key={label} style={S.statCard}>
                    <div style={S.statIcon}>
                      <span style={{ display: "flex", alignItems: "center", color: "#334155" }}>{icon}</span>
                    </div>
                    <p
                      style={{
                        margin: "12px 0 4px",
                        fontSize: 32,
                        fontWeight: 900,
                        color: "#000",
                      }}
                    >
                      {value ?? "—"}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#666",
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div style={S.card}>
                <h2
                  style={{
                    margin: "0 0 16px",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  Quick Actions
                </h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      setActiveTab("products");
                      openAdd();
                    }}
                    style={S.btnGreen}
                  >
                    + Add Product
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    style={{ ...S.btnGray, display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    View Users
                  </button>
                  <button
                    onClick={() => setActiveTab("products")}
                    style={{ ...S.btnGray, display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
                    </svg>
                    View Products
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    style={{ ...S.btnGray, display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                    </svg>
                    View Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("messages")}
                    style={{ ...S.btnGray, display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    View Messages
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ───────────────────────────────────────────── */}
          {activeTab === "products" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
                  {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                  total
                </p>
                <button onClick={openAdd} style={S.btnGreen}>
                  + Add Product
                </button>
              </div>

              <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
                <div className="admin-table-wrap">
                <table style={S.table}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Product", "Category", "Price", "Stock", "Actions"].map(
                        (h) => (
                          <th key={h} style={S.th}>
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "60px 24px",
                            textAlign: "center",
                            color: "#666",
                          }}
                        >
                          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", color: "#e2e8f0" }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
                            </svg>
                          </div>
                          <p
                            style={{
                              fontWeight: 600,
                              margin: "0 0 4px",
                              color: "#000",
                            }}
                          >
                            No products yet
                          </p>
                          <p style={{ fontSize: 13, margin: 0 }}>
                            Click "Add Product" to get started
                          </p>
                        </td>
                      </tr>
                    ) : (
                      products.map((p, idx) => (
                        <tr
                          key={p._id}
                          style={{
                            background: idx % 2 === 0 ? "#fff" : "#fafafa",
                            transition: "background 0.15s",
                          }}
                        >
                          <td style={S.td}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  loading="lazy"
                                  decoding="async"
                                  style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                    background: "#f5f5f5",
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 8,
                                    background: "#f5f5f5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: "#000",
                                  }}
                                >
                                  {p.name?.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p
                                  style={{
                                    margin: 0,
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: "#000",
                                  }}
                                >
                                  {p.name}
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 12,
                                    color: "#666",
                                    maxWidth: 200,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {p.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td style={S.td}>
                            <span
                              style={{
                                background: "#f5f5f5",
                                color: "#000",
                                fontSize: 12,
                                fontWeight: 600,
                                padding: "3px 10px",
                                borderRadius: 99,
                              }}
                            >
                              {p.category || "—"}
                            </span>
                          </td>
                          <td style={S.td}>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#000",
                                fontSize: 14,
                              }}
                            >
                              Rs {p.price}
                            </span>
                          </td>
                          <td style={S.td}>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 14,
                                color: !p.stock
                                  ? "#d32f2f"
                                  : p.stock < 10
                                    ? "#ff8f00"
                                    : "#000",
                              }}
                            >
                              {p.stock ?? "—"}
                            </span>
                          </td>
                          <td style={S.td}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => openEdit(p)}
                                style={S.btnEdit}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmDelete({
                                    type: "product",
                                    id: p._id,
                                    name: p.name,
                                  })
                                }
                                style={S.btnDelete}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ──────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <div>
              <p style={{ margin: "0 0 20px", color: "#666", fontSize: 14 }}>
                {users.length} registered user{users.length !== 1 ? "s" : ""}
              </p>
              <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
                <div className="admin-table-wrap">
                <table style={S.table}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {[
                        "User",
                        "Email",
                        "Verified",
                        "Role",
                        "Joined",
                        "Actions",
                      ].map((h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: "60px 24px",
                            textAlign: "center",
                            color: "#94a3b8",
                          }}
                        >
                          <div style={{ marginBottom: 16, display: "center", justifyContent: "center", color: "#e2e8f0" }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                          </div>
                          <p style={{ fontWeight: 600, margin: 0 }}>
                            No users found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      users.map((u, idx) => (
                        <tr
                          key={u._id}
                          style={{
                            background: idx % 2 === 0 ? "#fff" : "#fafafa",
                          }}
                        >
                          <td style={S.td}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  background: "#f5f5f5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: "#000",
                                  flexShrink: 0,
                                }}
                              >
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <span
                                style={{
                                  fontWeight: 600,
                                  fontSize: 14,
                                  color: "#000",
                                }}
                              >
                                {u.name}
                              </span>
                            </div>
                          </td>
                          <td style={{ ...S.td, fontSize: 13, color: "#666" }}>
                            {u.email}
                          </td>
                          <td style={S.td}>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                padding: "3px 10px",
                                borderRadius: 99,
                                background: u.isVerified
                                  ? "#f0f0f0"
                                  : "#f5f5f5",
                                color: u.isVerified ? "#000" : "#666",
                              }}
                            >
                              {u.isVerified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td style={S.td}>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                padding: "3px 10px",
                                borderRadius: 99,
                                background: u.isAdmin ? "#f0f0f0" : "#f5f5f5",
                                color: u.isAdmin ? "#000" : "#666",
                              }}
                            >
                              {u.isAdmin ? "Admin" : "User"}
                            </span>
                          </td>
                          <td style={{ ...S.td, fontSize: 12, color: "#666" }}>
                            {new Date(u.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td style={S.td}>
                            {u._id === user._id ? (
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "#666",
                                  fontStyle: "italic",
                                }}
                              >
                                (You)
                              </span>
                            ) : (
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  onClick={() => toggleAdmin(u._id)}
                                  style={{
                                    ...S.btnEdit,
                                    background: u.isAdmin
                                      ? "#f0f0f0"
                                      : "#f5f5f5",
                                    color: u.isAdmin ? "#000" : "#666",
                                  }}
                                >
                                  {u.isAdmin ? "Revoke Admin" : "Make Admin"}
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmDelete({
                                      type: "user",
                                      id: u._id,
                                      name: u.name,
                                    })
                                  }
                                  style={S.btnDelete}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}
          {/* ── ORDERS ─────────────────────────────────────────────── */}
          {activeTab === "orders" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
                  {orders.length} order{orders.length !== 1 ? "s" : ""} total
                </p>
                <button onClick={fetchOrders} style={S.btnGray}>↻ Refresh</button>
              </div>

              <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <div className="admin-table-wrap">
                <table style={S.table}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", "Action"].map((h) => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: "60px 24px", textAlign: "center", color: "#666" }}>
                            <div style={{ marginBottom: 16, display: "center", justifyContent: "center", color: "#e2e8f0" }}>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                              </svg>
                            </div>
                            <p style={{ fontWeight: 600, margin: "0 0 4px", color: "#000" }}>No orders yet</p>
                            <p style={{ fontSize: 13, margin: 0 }}>Orders will appear here once customers checkout</p>
                          </td>
                        </tr>
                      ) : (
                        orders.map((o, idx) => {
                          const statusColors = {
                            pending:    { bg: "#f1f5f9", color: "#475569" },
                            confirmed:  { bg: "#f1f5f9", color: "#475569" },
                            processing: { bg: "#f1f5f9", color: "#475569" },
                            shipped:    { bg: "#334155", color: "#ffffff" }, 
                            delivered:  { bg: "#0f172a", color: "#ffffff" }, 
                            cancelled:  { bg: "#fee2e2", color: "#7f1d1d" },
                          };
                          const sc = statusColors[o.status] || { bg: "#f5f5f5", color: "#333" };
                          const isUpdating = updatingOrderId === o._id;

                          return (
                            <tr key={o._id} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                              {/* Order ID */}
                              <td style={{ ...S.td, fontSize: 12, fontFamily: "monospace", color: "#666", maxWidth: 120 }}>
                                <span title={o._id}>{o._id?.slice(-8)}</span>
                              </td>

                              {/* Customer */}
                              <td style={S.td}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#000" }}>
                                  {o.shippingAddress?.fullName || o.userId?.name || "—"}
                                </p>
                                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                                  {o.shippingAddress?.email || o.userId?.email || ""}
                                </p>
                              </td>

                              {/* Items count */}
                              <td style={{ ...S.td, fontSize: 13 }}>
                                {o.items?.length ?? 0} item{o.items?.length !== 1 ? "s" : ""}
                              </td>

                              {/* Total */}
                              <td style={S.td}>
                                <span style={{ fontWeight: 700, fontSize: 14, color: "#000" }}>
                                  Rs {Number(o.totalPrice).toLocaleString()}
                                </span>
                              </td>

                              {/* Payment */}
                              <td style={{ ...S.td, fontSize: 12 }}>
                                {o.paymentMethod?.replace(/_/g, " ") || "—"}
                              </td>

                              {/* Status badge */}
                              <td style={S.td}>
                                <span style={{
                                  fontSize: 12, fontWeight: 600, padding: "3px 10px",
                                  borderRadius: 99, background: sc.bg, color: sc.color,
                                  textTransform: "capitalize"
                                }}>
                                  {o.status}
                                </span>
                              </td>

                              {/* Date */}
                              <td style={{ ...S.td, fontSize: 12, color: "#666" }}>
                                {new Date(o.createdAt).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", year: "numeric"
                                })}
                              </td>

                              {/* Status dropdown */}
                              <td style={S.td}>
                                <select
                                  value={o.status}
                                  disabled={isUpdating}
                                  onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                                  style={{
                                    ...S.input,
                                    padding: "6px 10px",
                                    fontSize: 13,
                                    width: "auto",
                                    minWidth: 130,
                                    cursor: isUpdating ? "not-allowed" : "pointer",
                                    opacity: isUpdating ? 0.6 : 1,
                                  }}
                                >
                                  {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                                    <option key={s} value={s} style={{ textTransform: "capitalize" }}>
                                      {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ── CONTACT MESSAGES ───────────────────────────────────── */}
          {activeTab === "messages" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
                  {messages.filter((m) => !m.isRead).length} unread ·{" "}
                  {messages.length} total
                </p>
                <button onClick={fetchContacts} style={S.btnGray}>
                  ↻ Refresh
                </button>
              </div>

              <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <div className="admin-table-wrap">
                <table style={S.table}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {[
                          "Name",
                          "Email",
                          "Subject",
                          "Message",
                          "Date",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th key={h} style={S.th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            style={{
                              padding: "60px 24px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            <div style={{ marginBottom: 16, display: "center", justifyContent: "center", color: "#e2e8f0" }}>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                              </svg>
                            </div>
                            <p
                              style={{
                                fontWeight: 600,
                                margin: "0 0 4px",
                                color: "#000",
                              }}
                            >
                              No messages yet
                            </p>
                            <p style={{ fontSize: 13, margin: 0 }}>
                              Contact form submissions will appear here
                            </p>
                          </td>
                        </tr>
                      ) : (
                        messages.map((m, idx) => {
                          const busy = contactLoadingId === m._id;
                          const unread = !m.isRead;
                          return (
                            <tr
                              key={m._id}
                              style={{
                                background: unread
                                  ? "#fffbeb"
                                  : idx % 2 === 0
                                    ? "#fff"
                                    : "#fafafa",
                                borderLeft: unread
                                  ? "4px solid #f59e0b"
                                  : "4px solid transparent",
                              }}
                            >
                              <td
                                style={{
                                  ...S.td,
                                  fontWeight: unread ? 700 : 600,
                                }}
                              >
                                {m.name}
                              </td>
                              <td
                                style={{ ...S.td, fontSize: 13, color: "#666" }}
                              >
                                {m.email}
                              </td>
                              <td style={{ ...S.td, maxWidth: 160 }}>
                                <span
                                  style={{
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                  title={m.subject}
                                >
                                    {m.subject}
                                  </span>
                                </td>
                                <td style={{ ...S.td, maxWidth: 280 }}>
                                <span
                                  style={{
                                    display: "block",
                                    maxHeight: 56,
                                    overflow: "hidden",
                                    fontSize: 13,
                                  }}
                                  title={m.message}
                                >
                                  {m.message}
                                </span>
                              </td>
                              <td
                                style={{
                                  ...S.td,
                                  fontSize: 12,
                                  color: "#666",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {new Date(m.createdAt).toLocaleString()}
                              </td>
                              <td style={S.td}>
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    padding: "3px 10px",
                                    borderRadius: 99,
                                    background: unread ? "#f1f5f9" : "#334155",
                                    color: unread ? "#475569" : "#ffffff",
                                  }}
                                >
                                  {unread ? "Unread" : "Read"}
                                </span>
                              </td>
                              <td style={S.td}>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 6,
                                    alignItems: "center",
                                  }}
                                >
                                  {unread ? (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() =>
                                        markContactRead(m._id, true)
                                      }
                                      style={S.btnEdit}
                                    >
                                      Mark read
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() =>
                                        markContactRead(m._id, false)
                                      }
                                      style={S.btnEdit}
                                    >
                                      Mark unread
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmDelete({
                                        type: "contact",
                                        id: m._id,
                                        name:
                                          (m.subject || "").slice(0, 40) ||
                                          "message",
                                      })
                                    }
                                    style={S.btnDelete}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── PRODUCT MODAL ─────────────────────────────────────────────────── */}
      {showModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e5e5e5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#000",
                }}
              >
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                  color: "#999",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveProduct}
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                overflowY: "auto",
                maxHeight: "60vh",
              }}
            >
              {[
                {
                  key: "name",
                  label: "Product Name",
                  type: "text",
                  required: true,
                },
                { key: "description", label: "Description", type: "textarea" },
                {
                  key: "price",
                  label: "Price (Rs)",
                  type: "number",
                  required: true,
                  min: 0,
                },
                { key: "category", label: "Category", type: "text" },
                {
                  key: "stock",
                  label: "Stock Quantity",
                  type: "number",
                  min: 0,
                },
                { key: "image", label: "Image URL", type: "url" },
                { key: "video", label: "Video URL (mp4…)", type: "url" },
              ].map(({ key, label, type, ...rest }) => (
                <div key={key}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#000",
                      marginBottom: 6,
                    }}
                  >
                    {label}
                  </label>
                  {type === "textarea" ? (
                    <textarea
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      style={S.input}
                      rows={3}
                      {...rest}
                    />
                  ) : (
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      style={S.input}
                      {...rest}
                    />
                  )}
                </div>
              ))}

              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    ...S.btnGray,
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: 12,
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    ...S.btnGreen,
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: 12,
                    fontWeight: 700,
                    opacity: formLoading ? 0.7 : 1,
                  }}
                >
                  {formLoading
                    ? "Saving…"
                    : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE MODAL ──────────────────────────────────────────── */}
      {confirmDelete && (
        <div style={S.overlay}>
          <div
            style={{
              ...S.modal,
              maxWidth: 400,
              padding: 32,
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", color: "#f59e0b" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 18,
                fontWeight: 800,
                color: "#1e293b",
              }}
            >
              Confirm Delete
            </h3>
            <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 14 }}>
              Are you sure you want to delete{" "}
              <strong style={{ color: "#1e293b" }}>{confirmDelete.name}</strong>
              ? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  ...S.btnGray,
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAndDelete}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  fontWeight: 700,
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === "error" ? "#dc2626" : "#334155",
            color: "#fff",
            padding: "14px 20px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "slideUp 0.3s ease",
          }}
        >
          <span>
            {toast.type === "error" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </span>
          {toast.message}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .admin-menu-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            background: #fff;
            font-size: 20px;
            cursor: pointer;
          }
          .admin-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 25;
            border: none;
            cursor: pointer;
          }
          .admin-header-user {
            display: none;
          }
        }
        @media (min-width: 769px) {
          .admin-menu-btn,
          .admin-overlay {
            display: none;
          }
        }
        .admin-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
        }
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        table tr:hover { background: #f8fafc !important; }
        button:hover { filter: brightness(0.96); }
        a:hover { filter: brightness(0.96); }
      `}</style>
    </div>
    </>
  );
}

// ─── Inline styles ─────────────────────────────────────────────────────────────
const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#f5f5f5",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  sidebar: {
    width: 240,
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 30,
    boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
    borderRight: "1px solid #e5e5e5",
  },
  sidebarHeader: {
    padding: "24px 20px",
    borderBottom: "1px solid #e5e5e5",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoBox: { display: "none" },
  navBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 8,
    border: "none",
    background: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    textAlign: "left",
    transition: "all 0.15s",
  },
  navBtnActive: { background: "#f0f0f0", color: "#000", fontWeight: 600 },
  main: {
    flex: 1,
    marginLeft: 240,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid #e5e5e5",
    padding: "20px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    padding: 24,
  },
  statCard: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    padding: 24,
    transition: "box-shadow 0.2s",
    cursor: "default",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px 20px",
    fontSize: 12,
    fontWeight: 700,
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e5e5e5",
    background: "#fafafa",
  },
  td: {
    padding: "14px 20px",
    borderBottom: "1px solid #f5f5f5",
    verticalAlign: "middle",
    color: "#333",
  },
  input: {
    width: "100%",
    border: "1px solid #d5d5d5",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "#000",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#fff",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: 520,
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  btnGreen: {
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "background 0.15s",
  },
  btnGray: {
    background: "#f5f5f5",
    color: "#000",
    border: "1px solid #d5d5d5",
    borderRadius: 8,
    padding: "10px 20px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "background 0.15s",
    textDecoration: "none",
  },
  btnEdit: {
    background: "#f0f0f0",
    color: "#000",
    border: "1px solid #d5d5d5",
    borderRadius: 6,
    padding: "6px 12px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  btnDelete: {
    background: "#fafafa",
    color: "#d32f2f",
    border: "1px solid #ffcdd2",
    borderRadius: 6,
    padding: "6px 12px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
};

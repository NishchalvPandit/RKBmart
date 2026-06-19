import React, { useContext, useState, useEffect, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import {
  NEPAL_PROVINCES,
  NEPAL_DISTRICTS_BY_PROVINCE,
  NEPAL_CITIES_BY_PROVINCE,
} from "../data/nepalProvinces";

const ADDRESS_LABEL_DISPLAY = { home: "Home", work: "Work", other: "Other" };

const EMPTY_ADDRESS_FORM = {
  label: "home",
  recipientName: "",
  phoneNumber: "",
  landmark: "",
  street: "",
  province: "",
  district: "",
  city: "",
  zipCode: "",
  country: "Nepal",
  isDefault: false,
};

const inputClass =
  "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

const btnPrimary =
  "rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:from-green-800 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2";

const btnOutline =
  "rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300";

function orderStatusBadgeClass(status) {
  const map = {
    delivered: "bg-green-100 text-green-800",
    shipped: "bg-blue-100 text-blue-800",
    pending: "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    processing: "bg-violet-100 text-violet-800",
  };
  return map[status] || map.pending;
}

const UserProfile = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({ ...EMPTY_ADDRESS_FORM });

  const addressDistrictOptions = useMemo(
    () =>
      addressForm.province
        ? NEPAL_DISTRICTS_BY_PROVINCE[addressForm.province] || []
        : [],
    [addressForm.province],
  );

  const addressCityOptions = useMemo(
    () =>
      addressForm.province
        ? NEPAL_CITIES_BY_PROVINCE[addressForm.province] || []
        : [],
    [addressForm.province],
  );

  const API = "http://localhost:8080/api";
  const cfg = { withCredentials: true };

  const showNotification = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await axios.get(`${API}/users/profile`, cfg);
      setProfileData(res.data);
      setEditForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to load profile",
        "error",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchOrders = async () => {
    setProfileLoading(true);
    try {
      const res = await axios.get(`${API}/orders/my-orders`, cfg);
      setOrders(res.data);
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to load orders",
        "error",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setProfileLoading(true);
    try {
      const res = await axios.get(`${API}/users/addresses`, cfg);
      setAddresses(res.data);
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to load addresses",
        "error",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      if (activeTab === "profile") {
        fetchProfile();
      } else if (activeTab === "orders") {
        fetchOrders();
      } else if (activeTab === "addresses") {
        fetchAddresses();
      }
    }
  }, [activeTab, loading, user]);

  useEffect(() => {
    if (!showAddressModal && !showPasswordModal) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showAddressModal) {
        setEditingAddressId(null);
        setAddressForm({ ...EMPTY_ADDRESS_FORM });
        setShowAddressModal(false);
      } else {
        setShowPasswordModal(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddressModal, showPasswordModal]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API}/users/profile`, editForm, cfg);
      setProfileData(res.data.user);
      setEditMode(false);
      showNotification(res.data.message);
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to update profile",
        "error",
      );
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${API}/users/change-password`,
        passwordForm,
        cfg,
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordModal(false);
      showNotification(res.data.message);
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to change password",
        "error",
      );
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const recipientName = addressForm.recipientName.trim();
    const phoneNumber = addressForm.phoneNumber.trim();
    const street = addressForm.street.trim();
    if (!recipientName) {
      showNotification("Full name is required", "error");
      return;
    }
    if (!phoneNumber) {
      showNotification("Phone number is required", "error");
      return;
    }
    if (!addressForm.province) {
      showNotification("Please select a province / region", "error");
      return;
    }
    if (!addressForm.city) {
      showNotification("Please select a city / municipality", "error");
      return;
    }
    if (!street) {
      showNotification("Street address is required", "error");
      return;
    }

    const payload = {
      label: addressForm.label,
      recipientName,
      landmark: addressForm.landmark.trim(),
      street,
      city: addressForm.city,
      state: addressForm.province,
      zipCode: addressForm.zipCode.trim(),
      country: addressForm.country || "Nepal",
      phoneNumber,
      isDefault: addressForm.isDefault,
    };

    try {
      if (editingAddressId) {
        const res = await axios.put(
          `${API}/users/addresses/${editingAddressId}`,
          payload,
          cfg,
        );
        showNotification(res.data.message);
      } else {
        const res = await axios.post(`${API}/users/addresses`, payload, cfg);
        showNotification(res.data.message);
      }
      resetAddressForm();
      fetchAddresses();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to save address",
        "error",
      );
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const res = await axios.delete(
          `${API}/users/addresses/${addressId}`,
          cfg,
        );
        showNotification(res.data.message);
        fetchAddresses();
      } catch (err) {
        showNotification(
          err.response?.data?.message || "Failed to delete address",
          "error",
        );
      }
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        const res = await axios.put(`${API}/orders/${orderId}/cancel`, {}, cfg);
        showNotification(res.data.message);
        fetchOrders();
      } catch (err) {
        showNotification(
          err.response?.data?.message || "Failed to cancel order",
          "error",
        );
      }
    }
  };

  const handleEditAddress = (address) => {
    const lbl = ["home", "work", "other"].includes(address.label)
      ? address.label
      : "home";
    const province = NEPAL_PROVINCES.includes(address.state)
      ? address.state
      : "";
    const districtsForProvince = province
      ? NEPAL_DISTRICTS_BY_PROVINCE[province] || []
      : [];
    const districtOk = districtsForProvince.includes(address.district);
    const citiesForProvince = province
      ? NEPAL_CITIES_BY_PROVINCE[province] || []
      : [];
    const cityOk = citiesForProvince.includes(address.city);
    setEditingAddressId(address._id);
    setAddressForm({
      label: lbl,
      recipientName: address.recipientName || "",
      phoneNumber: address.phoneNumber || "",
      landmark: address.landmark || "",
      street: address.street || "",
      province,
      district: districtOk ? address.district : "",
      city: cityOk ? address.city : "",
      zipCode: address.zipCode || "",
      country: address.country || "Nepal",
      isDefault: Boolean(address.isDefault),
    });
    setShowAddressModal(true);
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm({ ...EMPTY_ADDRESS_FORM });
    setShowAddressModal(false);
  };

  const handleAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({ ...EMPTY_ADDRESS_FORM });
    setShowAddressModal(true);
  };

  const handleSetDefaultAddress = async (address) => {
    try {
      const payload = {
        label: ["home", "work", "other"].includes(address.label)
          ? address.label
          : "home",
        recipientName: address.recipientName ?? "",
        landmark: address.landmark ?? "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        country: address.country || "Nepal",
        phoneNumber: address.phoneNumber || "",
        isDefault: true,
      };
      const res = await axios.put(
        `${API}/users/addresses/${address._id}`,
        payload,
        cfg,
      );
      showNotification(res.data.message || "Default address updated");
      fetchAddresses();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to set default address",
        "error",
      );
    }
  };

  const navItems = [
    {
      id: "profile",
      label: "Profile Info",
      icon: (
        <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      id: "orders",
      label: "My Orders",
      icon: (
        <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
        </svg>
      ),
    },
    {
      id: "addresses",
      label: "Address Book",
      icon: (
        <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (
        <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-green-700"
          aria-hidden
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 font-sans md:py-10">
      <div className="mx-auto max-w-5xl">
        {success && (
          <div
            className="fixed top-6 right-6 z-[1000] max-w-sm rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-lg"
            role="status"
          >
            {success}
          </div>
        )}
        {error && (
          <div
            className="fixed top-6 right-6 z-[1000] max-w-sm rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            My Account
          </h1>
          <p className="mt-1 text-gray-600">
            Manage your profile, orders and addresses
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="flex flex-col gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-green-500 text-3xl font-extrabold text-white shadow-md">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="mt-1 text-sm text-gray-500">
                Member since {new Date().getFullYear()}
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${
                    activeTab === item.id
                      ? "border-green-600 bg-green-50 text-green-800"
                      : "border-transparent text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <div className="my-1 h-px bg-gray-200" />
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
              >
                <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </nav>
          </aside>

          <main className="min-h-[400px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            {activeTab === "profile" && profileData && (
              <div>
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                  <svg className="text-green-600" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Profile Information
                </h3>

                {!editMode ? (
                  <div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {[
                        ["Full Name", profileData.name],
                        ["Email Address", profileData.email],
                        ["Phone Number", profileData.phone || "Not provided"],
                        [
                          "Verification Status",
                          <span key="v" className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${profileData.isVerified ? "bg-green-500" : "bg-gray-300"}`}
                            />
                            {profileData.isVerified ? "Verified User" : "Unverified"}
                          </span>,
                        ],
                      ].map(([lab, val]) => (
                        <div
                          key={lab}
                          className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                        >
                          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                            {lab}
                          </div>
                          <div className="font-semibold text-gray-900">{val}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className={`${btnPrimary} mt-8`}
                      onClick={() => setEditMode(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="max-w-lg space-y-5">
                    <div>
                      <label htmlFor="pf-name" className={labelClass}>Full Name</label>
                      <input id="pf-name" className={inputClass} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="pf-email" className={labelClass}>Email Address</label>
                      <input id="pf-email" className={inputClass} type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="pf-phone" className={labelClass}>Phone Number</label>
                      <input id="pf-phone" className={inputClass} type="tel" value={editForm.phone} placeholder="+977-" onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" className={btnPrimary}>Save Changes</button>
                      <button type="button" className={btnOutline} onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                  <svg className="text-green-600" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                  </svg>
                  Order History
                </h3>

                {profileLoading ? (
                  <p className="animate-pulse py-12 text-center font-medium text-gray-400">
                    Loading orders…
                  </p>
                ) : orders.length === 0 ? (
                  <div className="rounded-2xl py-14 text-center">
                    <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-emerald-50 text-green-600">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                    </div>
                    <p className="font-bold text-gray-800">No orders yet</p>
                    <p className="mx-auto mt-2 max-w-xs text-sm text-gray-500">
                      Browse products and place your first order.
                    </p>
                    <Link to="/products" className={`${btnPrimary} mt-6 inline-block text-center`}>
                      Start shopping
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order._id}
                      className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-md"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Order ID
                          </p>
                          <p className="mt-1 font-mono text-sm font-semibold text-gray-900 break-all">
                            {order._id}
                          </p>
                          <p className="mt-2 text-sm font-medium text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${orderStatusBadgeClass(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="mb-4 border-t border-gray-100 pt-3">
                        {order.items.map((item, idx) => {
                          const populatedProduct =
                            item.productId && typeof item.productId === "object"
                              ? item.productId
                              : null;
                          const thumbSrc =
                            item.image || populatedProduct?.image || "";
                          return (
                            <div
                              key={idx}
                              className="mb-2 flex items-center justify-between gap-3 text-sm last:mb-0"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                                  {thumbSrc ? (
                                    <img
                                      src={thumbSrc}
                                      alt=""
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-xs font-semibold text-gray-400">
                                      —
                                    </div>
                                  )}
                                </div>
                                <span className="truncate font-medium text-gray-800">
                                  {item.name}{" "}
                                  <span className="font-normal text-gray-400">× {item.quantity}</span>
                                </span>
                              </div>
                              <span className="shrink-0 font-medium text-gray-600">
                                Rs {item.price * item.quantity}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-lg font-extrabold text-gray-900">
                          Rs {order.totalPrice}
                        </span>
                        {["pending", "confirmed"].includes(order.status) && (
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order._id)}
                            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            Cancel order
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div className="min-w-[200px] flex-1">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                      <svg className="shrink-0 text-green-600" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      Address book
                    </h3>
                  </div>
                  <button type="button" className={`${btnPrimary} shrink-0 px-5 py-2.5 text-xs`} onClick={handleAddAddress}>
                    + Add address
                  </button>
                </div>

                {profileLoading ? (
                  <p className="animate-pulse py-12 text-center font-medium text-gray-400">
                    Loading addresses…
                  </p>
                ) : addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-emerald-50 text-green-600">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <p className="font-bold text-gray-800">No addresses saved</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                      Add where we should deliver your RKB Mart orders. You can set one as default.
                    </p>
                    <button type="button" className={`${btnPrimary} mt-6`} onClick={handleAddAddress}>
                      + Add your first address
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`rounded-2xl border p-4 transition hover:shadow-md sm:p-5 ${
                          address.isDefault
                            ? "border-green-300 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
                              address.isDefault
                                ? "bg-green-200/80 text-green-900"
                                : "bg-gray-200/80 text-gray-600"
                            }`}
                          >
                            {ADDRESS_LABEL_DISPLAY[address.label] || address.label}
                            {address.isDefault && (
                              <>
                                <span aria-hidden>•</span>
                                <span>Default</span>
                              </>
                            )}
                          </span>
                          <div className="flex flex-wrap justify-end gap-1">
                            {!address.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(address)}
                                className="rounded-lg px-2.5 py-1 text-xs font-bold text-green-800 hover:bg-white/80"
                              >
                                Set default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEditAddress(address)}
                              className="rounded-lg px-2.5 py-1 text-xs font-bold text-green-700 hover:bg-white/80"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(address._id)}
                              className="rounded-lg px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {address.recipientName && (
                          <p className="mb-2 font-bold text-gray-900">{address.recipientName}</p>
                        )}
                        <p className="mb-1 font-semibold leading-snug text-gray-700">{address.street}</p>
                        {address.landmark && (
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold text-gray-400">Landmark </span>
                            {address.landmark}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state}
                          {address.zipCode ? ` · ${address.zipCode}` : ""}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-gray-500">{address.phoneNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div>
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                  <svg className="text-green-600" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Account Settings
                </h3>
                <div className="flex max-w-sm flex-col gap-4">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <p className="font-bold text-gray-900">Security</p>
                    <p className="mt-1 text-sm text-gray-500">Update your login password regularly.</p>
                    <button type="button" className={`${btnOutline} mt-4 w-full`} onClick={() => setShowPasswordModal(true)}>
                      Update Password
                    </button>
                  </div>
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="font-bold text-red-900">Sign Out</p>
                    <p className="mt-1 text-sm text-red-800/80">Sign out on this device.</p>
                    <button type="button" className={`${btnOutline} mt-4 w-full border-red-200 text-red-600 hover:bg-red-100`} onClick={logout}>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showAddressModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={resetAddressForm}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
            className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 md:px-6">
              <h2 id="address-modal-title" className="text-lg font-extrabold text-gray-900">
                {editingAddressId ? "Edit address" : "New delivery address"}
              </h2>
              <button
                type="button"
                aria-label="Close"
                className="shrink-0 rounded-xl bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                onClick={resetAddressForm}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="max-h-[min(72vh,560px)] overflow-y-auto px-5 py-5 md:px-6 space-y-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Recipient</p>
              <div>
                <label htmlFor="addr-label" className={labelClass}>Label</label>
                <select id="addr-label" className={`${inputClass} bg-white`} value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="addr-name" className={labelClass}>Full name</label>
                <input id="addr-name" className={inputClass} required value={addressForm.recipientName} onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })} placeholder="Recipient full name" />
              </div>
              <div>
                <label htmlFor="addr-phone" className={labelClass}>Phone number</label>
                <input id="addr-phone" className={inputClass} type="tel" required value={addressForm.phoneNumber} onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })} placeholder="+977-98xxxxxxxx" />
              </div>
              <div>
                <label htmlFor="addr-landmark" className={labelClass}>Landmark (optional)</label>
                <input id="addr-landmark" className={inputClass} value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} placeholder="e.g. Near Pepsicola Chowk" />
              </div>

              <p className="pt-1 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Location</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="addr-province" className={labelClass}>Province / region</label>
                  <select
                    id="addr-province"
                    className={`${inputClass} bg-white`}
                    required
                    value={addressForm.province}
                    onChange={(e) => {
                      const province = e.target.value;
                      setAddressForm((f) => ({ ...f, province, district: "", city: "" }));
                    }}
                  >
                    <option value="">Select province</option>
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="addr-district" className={labelClass}>District</label>
                  <select
                    id="addr-district"
                    className={`${inputClass} bg-white`}
                    required={Boolean(addressForm.province)}
                    disabled={!addressForm.province}
                    value={addressForm.district}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, district: e.target.value, city: "" }))
                    }
                  >
                    <option value="">
                      {!addressForm.province ? "Select province first" : "Select district"}
                    </option>
                    {addressDistrictOptions.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {!addressForm.province && (
                    <p className="mt-1.5 text-xs text-gray-400">Choose a province first.</p>
                  )}
                </div>
                <div>
                  <label htmlFor="addr-city" className={labelClass}>City / municipality</label>
                  <select
                    id="addr-city"
                    className={`${inputClass} bg-white`}
                    required={Boolean(addressForm.province)}
                    disabled={!addressForm.province}
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  >
                    <option value="">
                      {!addressForm.province ? "Select province first" : "Select city"}
                    </option>
                    {addressCityOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="addr-street" className={labelClass}>Street / ward / house</label>
                <input id="addr-street" className={inputClass} required value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} placeholder="Street, ward, building no." />
              </div>
              <div>
                <label htmlFor="addr-zip" className={labelClass}>Postal code (optional)</label>
                <input id="addr-zip" className={inputClass} value={addressForm.zipCode} onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })} placeholder="Zip / postal code" />
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                Set as default address
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" className={`${btnPrimary} flex-1 min-w-[120px]`}>{editingAddressId ? "Update" : "Save address"}</button>
                <button type="button" className={`${btnOutline} flex-1 min-w-[120px]`} onClick={resetAddressForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwd-modal-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 md:px-6">
              <h2 id="pwd-modal-title" className="text-lg font-extrabold text-gray-900">Update Password</h2>
              <button
                type="button"
                aria-label="Close"
                className="rounded-xl bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                onClick={() => setShowPasswordModal(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4 px-5 py-5 md:px-6">
              <div>
                <label htmlFor="pwd-curr" className={labelClass}>Current Password</label>
                <input id="pwd-curr" className={inputClass} type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div>
                <label htmlFor="pwd-new" className={labelClass}>New Password</label>
                <input id="pwd-new" className={inputClass} type="password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <div>
                <label htmlFor="pwd-confirm" className={labelClass}>Confirm New Password</label>
                <input id="pwd-confirm" className={inputClass} type="password" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" className={`${btnPrimary} flex-1`}>Update Password</button>
                <button type="button" className={`${btnOutline} flex-1`} onClick={() => setShowPasswordModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

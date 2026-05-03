import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile edit states
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Address states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nepal",
    phoneNumber: "",
    isDefault: false,
  });

  const API = "http://localhost:8080/api";
  const cfg = { withCredentials: true };

  // Show notification
  const showNotification = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Fetch profile data
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

  // Fetch orders
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

  // Fetch addresses
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

  // Fetch data when tab changes
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

  // Update profile
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

  // Change password
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

  // Add/Update address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        const res = await axios.put(
          `${API}/users/addresses/${editingAddressId}`,
          addressForm,
          cfg,
        );
        showNotification(res.data.message);
      } else {
        const res = await axios.post(
          `${API}/users/addresses`,
          addressForm,
          cfg,
        );
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

  // Delete address
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

  // Cancel order
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

  // Edit address
  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phoneNumber: address.phoneNumber,
      isDefault: address.isDefault,
    });
    setShowAddressModal(true);
  };

  // Reset address form
  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: "home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Nepal",
      phoneNumber: "",
      isDefault: false,
    });
    setShowAddressModal(false);
  };

  if (loading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f9f9f9" }}>
        <p style={{ fontSize: "1.1rem", color: "#555", letterSpacing: "0.05em" }}>Loading...</p>
      </div>
    );
  if (!user) return <Navigate to="/login" />;

  const S = {
    page: { minHeight: "100vh", background: "#f5f5f5", padding: "48px 16px", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
    wrap: { maxWidth: "100%", margin: "0 auto" },
    notifSuccess: { marginBottom: 20, padding: "14px 20px", background: "#1a1a1a", color: "#fff", borderRadius: 8, fontSize: "0.9rem", letterSpacing: "0.02em" },
    notifError: { marginBottom: 20, padding: "14px 20px", background: "#fff", color: "#1a1a1a", border: "1.5px solid #1a1a1a", borderRadius: 8, fontSize: "0.9rem" },
    card: { background: "#fff", borderRadius: 14, boxShadow: "0 2px 18px rgba(0,0,0,0.08)", border: "1px solid #e8e8e8", marginBottom: 20, overflow: "hidden" },
    banner: { background: "#1a1a1a", height: 110, display: "flex", alignItems: "flex-end", padding: "0 32px 20px" },
    avatar: { height: 72, width: 72, background: "#fff", borderRadius: "50%", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 800, color: "#1a1a1a", boxShadow: "0 2px 12px rgba(0,0,0,0.18)" },
    userInfo: { padding: "20px 32px 24px" },
    userName: { fontSize: "1.7rem", fontWeight: 700, color: "#111", margin: 0, letterSpacing: "-0.02em" },
    userSub: { fontSize: "0.88rem", color: "#888", marginTop: 4 },
    tabBar: { display: "flex", borderBottom: "1.5px solid #e8e8e8" },
    tab: (active) => ({ flex: 1, padding: "16px 8px", fontWeight: 600, fontSize: "0.88rem", background: "none", border: "none", cursor: "pointer", color: active ? "#111" : "#888", borderBottom: active ? "2.5px solid #111" : "2.5px solid transparent", marginBottom: -1.5, letterSpacing: "0.04em", textTransform: "uppercase", transition: "color 0.15s" }),
    body: { padding: 32 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 },
    field: { padding: "14px 16px", background: "#f9f9f9", borderRadius: 10, border: "1px solid #ebebeb" },
    fieldLabel: { fontSize: "0.72rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 },
    fieldVal: { fontSize: "1rem", fontWeight: 600, color: "#111" },
    btnPrimary: { background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", letterSpacing: "0.04em", transition: "background 0.15s" },
    btnSecondary: { background: "#f0f0f0", color: "#333", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", letterSpacing: "0.04em" },
    btnDanger: { background: "none", color: "#555", border: "1.5px solid #ddd", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" },
    input: { width: "100%", padding: "11px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: "0.95rem", color: "#111", background: "#fff", boxSizing: "border-box", outline: "none", transition: "border 0.15s" },
    label: { display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#555", marginBottom: 8, letterSpacing: "0.03em" },
    formRow: { marginBottom: 16 },
    btnRow: { display: "flex", gap: 12, marginTop: 24 },
    orderCard: { border: "1.5px solid #e8e8e8", borderRadius: 12, padding: 24, marginBottom: 16 },
    badge: (status) => {
      const map = { delivered: { bg: "#f0f0f0", color: "#111" }, shipped: { bg: "#1a1a1a", color: "#fff" }, pending: { bg: "#f5f5f5", color: "#555" }, cancelled: { bg: "#fff", color: "#aaa", border: "1px solid #ddd" } };
      const s = map[status] || map.pending;
      return { padding: "5px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: s.bg, color: s.color, border: s.border || "none" };
    },
    addrCard: (def) => ({ border: def ? "2px solid #111" : "1.5px solid #e8e8e8", borderRadius: 12, padding: 20, background: def ? "#fafafa" : "#fff" }),
    modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 },
    modalBox: { background: "#fff", borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", maxWidth: 480, width: "100%", overflow: "hidden" },
    modalHead: { padding: "22px 28px", borderBottom: "1.5px solid #ebebeb" },
    modalTitle: { fontSize: "1.25rem", fontWeight: 800, color: "#111", margin: 0, letterSpacing: "-0.01em" },
    modalBody: { padding: 28 },
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* Notifications */}
        {success && <div style={S.notifSuccess}>{success}</div>}
        {error && <div style={S.notifError}>{error}</div>}

        {/* Unified Profile Container */}
        <div style={S.card}>
          {/* Header Section */}
          <div style={S.banner}>
            <div style={S.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
          </div>
          <div style={S.userInfo}>
            <h1 style={S.userName}>{user.name}</h1>
            <p style={S.userSub}>Rastriya Khadya Bank Member</p>
          </div>

          {/* Tabs Section */}
          <div style={S.tabBar}>
            {["profile", "orders", "addresses", "settings"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={S.tab(activeTab === tab)}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={S.body}>
            {/* PROFILE TAB */}
            {activeTab === "profile" && profileData && (
              <div>
                {!editMode ? (
                  <div>
                    <div style={S.grid2}>
                      <div style={S.field}>
                        <div style={S.fieldLabel}>Full Name</div>
                        <div style={S.fieldVal}>{profileData.name}</div>
                      </div>
                      <div style={S.field}>
                        <div style={S.fieldLabel}>Email Address</div>
                        <div style={S.fieldVal}>{profileData.email}</div>
                      </div>
                      <div style={S.field}>
                        <div style={S.fieldLabel}>Phone Number</div>
                        <div style={S.fieldVal}>{profileData.phone || "—"}</div>
                      </div>
                      <div style={S.field}>
                        <div style={S.fieldLabel}>Account Status</div>
                        <div style={{ ...S.fieldVal, display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: profileData.isVerified ? "#111" : "#bbb", display: "inline-block" }} />
                          {profileData.isVerified ? "Verified" : "Pending Verification"}
                        </div>
                      </div>
                    </div>
                    <button style={S.btnPrimary} onClick={() => setEditMode(true)}>Edit Profile</button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile}>
                    <div style={S.formRow}>
                      <label style={S.label}>Full Name</label>
                      <input style={S.input} type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div style={S.formRow}>
                      <label style={S.label}>Email Address</label>
                      <input style={S.input} type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    </div>
                    <div style={S.formRow}>
                      <label style={S.label}>Phone Number</label>
                      <input style={S.input} type="tel" value={editForm.phone} placeholder="+977-" onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                    </div>
                    <div style={S.btnRow}>
                      <button type="submit" style={S.btnPrimary}>Save Changes</button>
                      <button type="button" style={S.btnSecondary} onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div>
                {profileLoading ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>Loading...</div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <p style={{ color: "#aaa", fontSize: "1rem" }}>No orders yet</p>
                  </div>
                ) : (
                  <div>
                    {orders.map((order) => (
                      <div key={order._id} style={S.orderCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                          <div>
                            <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: 4 }}>Order #{order._id.slice(-8).toUpperCase()}</p>
                            <p style={{ fontSize: "0.85rem", color: "#777" }}>
                              {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </p>
                          </div>
                          <span style={S.badge(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div style={{ marginBottom: 16, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#555", padding: "6px 0", borderBottom: "1px solid #f5f5f5" }}>
                              <span>{item.name} × {item.quantity}</span>
                              <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#111" }}>Rs {order.totalPrice.toFixed(2)}</span>
                          {["pending", "confirmed"].includes(order.status) && (
                            <button onClick={() => handleCancelOrder(order._id)} style={{ background: "none", border: "1px solid #ddd", color: "#555", padding: "6px 16px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div>
                {profileLoading ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>Loading...</div>
                ) : (
                  <>
                    <button style={{ ...S.btnPrimary, marginBottom: 24 }} onClick={() => resetAddressForm()}>
                      + Add New Address
                    </button>
                    {addresses.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <p style={{ color: "#aaa", fontSize: "1rem" }}>No addresses saved</p>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {addresses.map((address) => (
                          <div key={address._id} style={S.addrCard(address.isDefault)}>
                            <div style={{ marginBottom: 10 }}>
                              <p style={{ fontWeight: 700, color: "#111", textTransform: "capitalize", marginBottom: 2 }}>{address.label}</p>
                              {address.isDefault && (
                                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", background: "#e8e8e8", padding: "2px 8px", borderRadius: 4 }}>Default</span>
                              )}
                            </div>
                            <p style={{ fontSize: "0.88rem", color: "#555", marginBottom: 4 }}>{address.street}</p>
                            <p style={{ fontSize: "0.88rem", color: "#555", marginBottom: 4 }}>{address.city}, {address.state} {address.zipCode}</p>
                            <p style={{ fontSize: "0.88rem", color: "#777", marginBottom: 16 }}>{address.phoneNumber}</p>
                            <div style={{ display: "flex", gap: 10 }}>
                              <button onClick={() => handleEditAddress(address)} style={{ background: "none", border: "1.5px solid #111", color: "#111", padding: "5px 14px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>Edit</button>
                              <button onClick={() => handleDeleteAddress(address._id)} style={{ background: "none", border: "1.5px solid #ddd", color: "#888", padding: "5px 14px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 340 }}>
                <button style={{ ...S.btnPrimary, padding: "13px 24px", fontSize: "0.9rem", textAlign: "left" }} onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </button>
                <button style={{ ...S.btnSecondary, padding: "13px 24px", fontSize: "0.9rem", textAlign: "left", border: "1.5px solid #ddd" }} onClick={logout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <div style={S.modalHead}>
              <h2 style={S.modalTitle}>{editingAddressId ? "Edit Address" : "Add New Address"}</h2>
            </div>
            <form onSubmit={handleSaveAddress} style={S.modalBody}>
              <div style={S.formRow}>
                <label style={S.label}>Type</label>
                <select style={S.input} value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={S.formRow}>
                <label style={S.label}>Street Address</label>
                <input style={S.input} type="text" required value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={S.label}>City</label>
                  <input style={S.input} type="text" required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                </div>
                <div>
                  <label style={S.label}>State</label>
                  <input style={S.input} type="text" required value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={S.label}>Zip Code</label>
                  <input style={S.input} type="text" required value={addressForm.zipCode} onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })} />
                </div>
                <div>
                  <label style={S.label}>Phone</label>
                  <input style={S.input} type="tel" required value={addressForm.phoneNumber} onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })} />
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, fontSize: "0.88rem", color: "#555", cursor: "pointer" }}>
                <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} style={{ width: 16, height: 16 }} />
                Set as default address
              </label>
              <div style={{ display: "flex", gap: 12, paddingTop: 16, borderTop: "1px solid #ebebeb" }}>
                <button type="submit" style={{ ...S.btnPrimary, flex: 1 }}>{editingAddressId ? "Update" : "Add Address"}</button>
                <button type="button" style={{ ...S.btnSecondary, flex: 1 }} onClick={resetAddressForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <div style={S.modalHead}>
              <h2 style={S.modalTitle}>Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} style={S.modalBody}>
              <div style={S.formRow}>
                <label style={S.label}>Current Password</label>
                <input style={S.input} type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div style={S.formRow}>
                <label style={S.label}>New Password</label>
                <input style={S.input} type="password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <div style={S.formRow}>
                <label style={S.label}>Confirm New Password</label>
                <input style={S.input} type="password" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 12, paddingTop: 16, borderTop: "1px solid #ebebeb" }}>
                <button type="submit" style={{ ...S.btnPrimary, flex: 1 }}>Change Password</button>
                <button type="button" style={{ ...S.btnSecondary, flex: 1 }} onClick={() => setShowPasswordModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;


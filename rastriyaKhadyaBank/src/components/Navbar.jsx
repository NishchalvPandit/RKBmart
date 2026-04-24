import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaSearch, FaShoppingCart, FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import TopBar from "./TopBar";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: t("navbar.home"), path: "/" },
    { name: t("navbar.products"), path: "/products" },
    { name: t("navbar.gallery"), path: "/gallery" },
    { name: t("navbar.contact"), path: "/contact" },
  ];

  // Prevent body scroll when menu is open and handle Escape key
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";

      const handleEscapeKey = (e) => {
        if (e.key === "Escape") {
          setIsMobileMenuOpen(false);
        }
      };

      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
        document.body.style.overflow = "unset";
      };
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* MAIN NAVBAR */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm w-full">
        <TopBar />
        <div className="flex items-center h-16 px-4 md:px-6 max-w-7xl mx-auto">

          {/* Left Side: Desktop Navigation (Hidden on mobile) */}
          <nav className="hidden xl:flex items-center gap-8 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition ${isActive(link.path)
                  ? "text-green-600"
                  : "text-gray-600 hover:text-green-600"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Center: Logo & Title */}
          <div className="flex-shrink-0 flex justify-center xl:flex-1">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="Rastriya Khadya Bank Logo"
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
              />
              <div className="text-center xl:text-left">
                <div className="font-bold text-green-700 text-base md:text-lg tracking-tight leading-tight">
                  राष्ट्रिय खाद्य बैंक लिमिटेड
                </div>
                <div className="text-[9px] md:text-[10px] text-gray-500 -mt-1 hidden sm:block">
                  Rastriya Khadya Bank Limited
                </div>
              </div>
            </Link>
          </div>

          {/* Right Side: Search, Cart, Auth */}
          <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-48 xl:w-60 focus-within:w-64 transition-all">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none ml-3 text-sm w-full"
              />
            </div>

            {/* Cart */}
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
              <FaShoppingCart className="text-lg md:text-xl text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                0
              </span>
            </button>

            {/* Auth Links - Desktop */}
            <div className="hidden md:flex items-center gap-1 border-l pl-3 ml-1">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition"
                  >
                    <FaUserCircle className="text-xl" />
                    <span className="max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="p-1 text-gray-500 hover:text-red-600 transition"
                    title="Logout"
                  >
                    <FaSignOutAlt />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-green-600 text-white text-xs lg:text-sm font-bold px-4 py-2 rounded-full hover:bg-green-700 transition shadow-sm"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200 ml-1"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ====================== BACKDROP OVERLAY ====================== */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 xl:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ====================== MOBILE MENU - FIXED POSITIONING ====================== */}
      <div
        className={`fixed top-[100px] left-0 right-0 bg-white z-50 xl:hidden overflow-y-auto shadow-lg transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-[calc(100vh-100px)]" : "hidden"
          }`}
      >
        <div className="px-6 py-6 flex flex-col gap-6">
          {/* Mobile Search Bar */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none ml-3 text-sm w-full"
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base font-semibold py-3 px-4 rounded-lg transition duration-200 ${isActive(link.path)
                  ? "bg-green-50 text-green-600 border-l-4 border-green-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-green-600"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t pt-4">
            {/* Cart Link in Mobile Menu */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <span className="text-sm font-semibold text-gray-700">
                My Cart
              </span>
              <button className="relative inline-flex items-center p-2 hover:bg-gray-100 rounded-full transition">
                <FaShoppingCart className="text-lg text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  0
                </span>
              </button>
            </div>

            {/* Mobile Auth Links */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Account
              </div>
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-4 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                  >
                    <FaUserCircle className="text-xl text-green-600" />
                    Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/login'); }}
                    className="flex items-center gap-3 py-3 px-4 rounded-lg text-red-600 font-semibold hover:bg-red-50 transition text-left"
                  >
                    <FaSignOutAlt className="text-xl" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>

            {/* Support Section */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Need help?
              </div>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

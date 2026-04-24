import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaSearch, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: t("navbar.home"), path: "/" },
    { name: t("navbar.products"), path: "/products" },
    { name: t("navbar.about"), path: "/about" },
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
        <div className="flex items-center h-16 px-4 md:px-8 max-w-7xl mx-auto">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Rastriya Khadya Bank Logo"
              className="h-12 w-12 object-contain"
            />
            <div>
              <div className="font-bold text-green-700 text-lg tracking-tight">
                राष्ट्रिय खाद्य बैंक
              </div>
              <div className="text-[10px] text-gray-500 -mt-1">
                Rastriya Khadya Bank
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-10 ml-12">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition ${
                  isActive(link.path)
                    ? "text-green-600"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="ml-auto flex items-center gap-4">
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-60 focus-within:w-72 transition-all">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none ml-3 text-sm w-full"
              />
            </div>

            {/* Cart */}
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
              <FaShoppingCart className="text-xl text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                0
              </span>
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
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
        className={`fixed top-16 left-0 right-0 bg-white z-50 xl:hidden overflow-y-auto shadow-lg transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-[calc(100vh-64px)]" : "hidden"
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
                className={`text-base font-semibold py-3 px-4 rounded-lg transition duration-200 ${
                  isActive(link.path)
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

            {/* Support Section */}
            <div>
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

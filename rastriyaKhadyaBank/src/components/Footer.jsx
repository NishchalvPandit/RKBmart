import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChevronRight,
  FaArrowUp,
  FaGlobe,
  FaUserCircle,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import khaltiLogo from "../assets/khaltiLogo.png";
import esewaLogo from "../assets/esewaLogo.png";

export default function Footer() {
  const [showTop, setShowTop] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const toggleLanguage = () => {
    const next = i18n.language === "en" ? "np" : "en";
    i18n.changeLanguage(next);
  };

  const isNepali = i18n.language === "np";

  /* Jankari links — only About Us */
  const infoLinks = [
    { label: isNepali ? "हाम्रो बारेमा" : "About Us", to: "/about" },
  ];

  return (
    <>
      {/* ── MAIN FOOTER ── */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Column 1 – Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Rastriya Khadya Bank Logo"
                className="h-20 w-20 object-contain"
              />
            </div>
            <div>
              <p className="text-green-700 font-bold text-lg leading-snug">
                {isNepali ? "राष्ट्रिय खाद बैंक लिमिटेड" : "Rastriya Khadya Bank Limited"}
              </p>
              <p className="text-gray-600 text-sm italic mt-0.5">
                {isNepali ? "- दिगो कृषि उत्पादन हाम्रो अभियान" : "- Sustainable Agriculture is Our Mission"}
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-3 text-lg mt-1">
              <a href="https://www.facebook.com/rastriyakhadyabankltd" target="_blank" rel="noopener noreferrer"
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                <FaFacebookF size={13} />
              </a>
              <a href="https://x.com/KhadyaBank" target="_blank" rel="noopener noreferrer"
                className="bg-sky-400 text-white p-2 rounded-full hover:bg-sky-500 transition">
                <FaTwitter size={13} />
              </a>
              <a href="https://www.instagram.com/rkb_mart/" target="_blank" rel="noopener noreferrer"
                className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition">
                <FaInstagram size={13} />
              </a>
              <a href="https://linkedin.com/in/RastriyaKhadyaBank" target="_blank" rel="noopener noreferrer"
                className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition">
                <FaLinkedinIn size={13} />
              </a>
              <a href="https://www.youtube.com/channel/UCL3JlnrNXSMeYBHiRn6Pkog" target="_blank" rel="noopener noreferrer"
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition">
                <FaYoutube size={13} />
              </a>
            </div>

            {/* ── Payment Methods ── */}
            <div className="mt-2">
              <p className="text-gray-700 font-semibold text-sm mb-2">
                {isNepali ? "भुक्तानी विधिहरू" : "Payment Methods"}
              </p>
              <div className="flex items-center gap-4">
                <img src={khaltiLogo} alt="Khalti" className="h-7 object-contain" />
                <img src={esewaLogo} alt="eSewa" className="h-7 object-contain" />
              </div>
            </div>
          </div>

          {/* Column 2 – Jankari */}
          <div>
            <h3 className="font-bold text-gray-800 text-base mb-4 border-b border-gray-300 pb-2">
              {isNepali ? "जानकारी" : "Information"}
            </h3>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label} className="flex items-start gap-2">
                  <FaChevronRight className="text-green-600 mt-1 shrink-0" size={10} />
                  {link.to ? (
                    <Link to={link.to} className="text-gray-600 text-sm hover:text-green-700 transition">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-gray-600 text-sm hover:text-green-700 transition">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {/* ── Sign In ── */}
            <div className="mt-6">
              <p className="text-gray-700 font-semibold text-sm mb-2">
                {isNepali ? "आफ्नो खाता" : "Your Account"}
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
              >
                <FaUserCircle size={15} />
                {isNepali ? "साइन इन गर्नुहोस्" : "Sign In"}
              </Link>
            </div>
          </div>

          {/* Column 3 – Contact */}
          <div>
            <h3 className="font-bold text-gray-800 text-base mb-4 border-b border-gray-300 pb-2">
              {isNepali ? "सम्पर्क" : "Contact"}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full shrink-0 mt-0.5">
                  <FaPhone className="text-green-700" size={12} />
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm">{isNepali ? "फोन" : "Phone"}</p>
                  <a href="tel:015906810" className="text-gray-600 text-xs hover:text-green-700 transition block">
                    01-5906810
                  </a>
                  <a href="https://wa.me/9779741802661" className="text-gray-600 text-xs hover:text-green-700 transition block">
                    WhatsApp: 977-9741802661
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full shrink-0 mt-0.5">
                  <FaEnvelope className="text-green-700" size={12} />
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm">{isNepali ? "इमेल" : "Email"}</p>
                  <a href="mailto:rastriyakhadyabank@gmail.com" className="text-gray-600 text-xs hover:text-green-700 transition block">
                    rastriyakhadyabank@gmail.com
                  </a>
                  <a href="mailto:info.rastriyakhadyabank@gmail.com" className="text-gray-600 text-xs hover:text-green-700 transition block">
                    info.rastriyakhadyabank@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full shrink-0 mt-0.5">
                  <FaMapMarkerAlt className="text-green-700" size={12} />
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm">{isNepali ? "ठेगाना" : "Address"}</p>
                  <p className="text-gray-600 text-xs leading-snug">
                    {isNepali
                      ? "मध्यपुर ठिमी -०२, दिव्यश्वरी प्लान्निङ"
                      : "Madhyapur Thimi -02, Divyashwori Planning"}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">

            {/* Left – Officials info */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-gray-300">
              <div>
                <span className="text-gray-400">{isNepali ? "अध्यक्ष" : "President"}</span>
                <p className="text-white font-semibold">{isNepali ? "किशोर कुमार प्रधान" : "Kishor Kumar Pradhan"}</p>
              </div>
              <div className="h-8 border-l border-gray-600 hidden md:block" />
              <div>
                <span className="text-gray-400">{isNepali ? "संस्थापक अध्यक्ष" : "Founder Chairman"}</span>
                <p className="text-white font-semibold">{isNepali ? "शंकर नाथ उप्रेती" : "Shankar Nath Upreti"}</p>
              </div>
              <div className="h-8 border-l border-gray-600 hidden md:block" />
              <div>
                <span className="text-gray-400">{isNepali ? "पान नम्बर" : "PAN Number"}</span>
                <p className="text-white font-semibold">{isNepali ? "६०९८३५५८२" : "609835582"}</p>
              </div>
              <div className="h-8 border-l border-gray-600 hidden md:block" />
              <div>
                <span className="text-gray-400">{isNepali ? "दर्ता नम्बर" : "Registration No."}</span>
                <p className="text-white font-semibold">{isNepali ? "२४५८०३/०७७/०७८" : "245803/077/078"}</p>
              </div>
            </div>

            {/* Right – Language toggle + Copyright */}
            <div className="flex flex-col items-center md:items-end gap-2">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 bg-gray-700 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition border border-gray-600 hover:border-green-500"
              >
                <FaGlobe size={11} />
                {isNepali ? "English" : "नेपाली"}
              </button>

              {/* Copyright */}
              <p className="text-gray-400 text-center md:text-right">
                © {new Date().getFullYear()}{" "}
                <span className="text-white">
                  {isNepali ? "राष्ट्रिय खाद्य बैंक लिमिटेड" : "Rastriya Khadya Bank Limited"}
                </span>{" "}
                {isNepali ? "| दिगो कृषि उत्पादन हाम्रो अभियान" : "| Sustainable Agriculture is Our Mission"}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── FLOATING: Scroll to Top ── */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition"
          aria-label="Scroll to top"
        >
          <FaArrowUp size={14} />
        </button>
      )}
    </>
  );
}

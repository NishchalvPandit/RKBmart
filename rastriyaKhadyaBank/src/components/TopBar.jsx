import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const TopBar = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = () => {
    const newLang = i18n.language === "en" ? "np" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="hidden md:flex bg-gray-700 text-white text-sm px-6 py-1 flex-col md:flex-row md:justify-around items-center gap-2">
      {/* LEFT SIDE */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Email */}
        <div className="flex items-center gap-2">
          <FaEnvelope className="text-red-400" />
          <a
            href="mailto:rastriyakhadyabank@gmail.com"
            className="hover:text-red-300 hover:underline transition"
          >
            {t("topbar.email")}
          </a>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-red-300" />
          <a
            href="https://www.google.com/maps?q=मध्यपुर+ठिमी+-०२,+दिव्यश्वरी+प्लान्निङ"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-300 hover:underline transition"
          >
            {t("topbar.address")}
          </a>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 text-lg">
        <a
          href="https://www.facebook.com/rastriyakhadyabankltd"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-500"
        >
          <FaFacebookF />
        </a>

        <a
          href="https://x.com/KhadyaBank"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-sky-400"
        >
          <FaTwitter />
        </a>

        <a
          href="https://www.instagram.com/rkb_mart/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pink-400"
        >
          <FaInstagram />
        </a>

        <a
          href="https://linkedin.com/in/RastriyaKhadyaBank"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-300"
        >
          <FaLinkedinIn />
        </a>

        <a
          href="https://www.youtube.com/channel/UCL3JlnrNXSMeYBHiRn6Pkog"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-500"
        >
          <FaYoutube />
        </a>

        {/* LANGUAGE SWITCHER */}
        <button
          onClick={handleLanguageChange}
          className="ml-2 px-1.5 py-0.5 border border-white rounded hover:bg-white hover:text-black transition text-xs"
          title={
            i18n.language === "en" ? "Switch to Nepali" : "Switch to English"
          }
        >
          {i18n.language === "en" ? "🇺🇸 ENG" : "🇳🇵 नेपाली"}
        </button>
      </div>
    </div>
  );
};

export default TopBar;

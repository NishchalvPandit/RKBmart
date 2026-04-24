import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Products from "./pages/Products";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import Register from "./pages/Register";

const App = () => {
  const { t } = useTranslation();

  return (
    <BrowserRouter>
      <Navbar />

      <main className="pt-16 md:pt-[100px]">
        {/* Slim White Branding Bar (Static) */}
        <div className="bg-white border-b border-gray-100 py-1.5 px-4 shadow-sm relative z-40">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-center">
            <span className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-widest">
              {t("branding.operatedBy")}
            </span>
            <span className="text-base md:text-2xl font-black text-green-700 uppercase tracking-tighter">
              {t("branding.martName")}
            </span>
            <a 
              href="https://www.google.com/maps/search/Rastriya+Khadya+Bank+Bhaktapur+Pepsicola" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] md:text-xs text-gray-400 hover:text-green-600 transition underline underline-offset-2"
            >
              {t("branding.location")}
            </a>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
};

export default App;

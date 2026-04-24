import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import TopBar from "./components/TopBar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Products from "./pages/Products";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";

const App = () => {
  return (
    <BrowserRouter>
      <TopBar />
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 relative z-50">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center gap-6 h-16">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <Navbar />
            </div>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;

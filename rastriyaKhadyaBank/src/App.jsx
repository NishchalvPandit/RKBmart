import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Products from "./pages/Products";
import ProductDetailSkeleton from "./components/ProductDetailSkeleton";
import RouteSeo from "./components/RouteSeo";
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
import Cart from "./pages/Cart";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import Chatbot from "./components/Chatbot";

const AppLayout = () => {
  const { t } = useTranslation();

  return (
    <>
      <RouteSeo />
      <Navbar />
      <main id="main-content" className="pt-16 md:pt-[100px]">
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
          <Route
            path="/products/:id"
            element={
              <Suspense fallback={<ProductDetailSkeleton />}>
                <ProductDetails />
              </Suspense>
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

  return (
    <>
      <Routes>
        <Route
          path="/admin"
          element={
            <Suspense fallback={<ProductDetailSkeleton />}>
              <AdminPanel />
            </Suspense>
          }
        />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
      {!isAdminPage && <Chatbot />}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;

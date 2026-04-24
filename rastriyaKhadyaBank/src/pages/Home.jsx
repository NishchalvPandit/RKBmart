import { useTranslation } from "react-i18next";
import Hero from "../components/Hero";
import { products } from "../data/products";
import galleryImage from "../assets/galleryimage1.jpeg";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Hero />

      {/* Featured Banner Image */}
      <div 
        className="w-full h-64 md:h-[400px] bg-center bg-cover my-8 shadow-md"
        style={{ backgroundImage: `url(${galleryImage})` }}
      >
      </div>

      <section className="px-8 py-12 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">{t("pages.products.title")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

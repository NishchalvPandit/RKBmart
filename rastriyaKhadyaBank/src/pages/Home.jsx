import { useTranslation } from "react-i18next";
import Hero from "../components/Hero";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Hero />

      <section className="p-8">
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

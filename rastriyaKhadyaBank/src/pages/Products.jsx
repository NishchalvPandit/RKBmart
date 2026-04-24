import { useTranslation } from "react-i18next";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{t("pages.products.title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

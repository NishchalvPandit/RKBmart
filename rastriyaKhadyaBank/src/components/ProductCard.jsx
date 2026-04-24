import { useTranslation } from "react-i18next";

const ProductCard = ({ product }) => {
  const { t } = useTranslation();

  return (
    <div className="border rounded-lg overflow-hidden shadow">
      <img src={product.image} className="h-40 w-full object-cover" />

      <div className="p-4">
        <h3 className="font-bold">{product.name}</h3>
        <p className="text-gray-600">Rs {product.price}</p>

        <button className="mt-3 bg-green-600 text-white px-4 py-1 rounded">
          {t("pages.products.addToCart")}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

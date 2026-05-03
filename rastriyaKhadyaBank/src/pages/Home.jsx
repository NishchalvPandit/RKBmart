import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import { API_BASE } from "../config/api";
import { homeBanner } from "../assets/imageManifests";

const Home = () => {
    const { t } = useTranslation();
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/products`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                if (!cancelled && Array.isArray(data)) setFeatured(data.slice(0, 3));
            } catch {
                if (!cancelled) setFeatured([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div>
            <Hero />

            {homeBanner ? (
                <div className="relative w-full h-64 md:h-[400px] my-8 shadow-md overflow-hidden">
                    <img
                        src={homeBanner.src}
                        srcSet={homeBanner.srcSet}
                        sizes="100vw"
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            ) : null}

            <section className="px-8 py-12 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">
                    {t("pages.products.title")}
                </h2>

                {loading && (
                    <p className="text-sm text-gray-600 mb-6">{t("pages.home.loadingFeatured")}</p>
                )}
                {!loading && featured.length === 0 && (
                    <p className="text-sm text-gray-600 mb-6">
                        {t("pages.home.featuredEmpty")}
                    </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featured.map((p) => (
                        <ProductCard key={p._id} product={p} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <>
            <Seo
                title={t("notFound.title")}
                description={t("notFound.description")}
                path="/404"
                noIndex
            />
            <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
                <p className="text-6xl font-black text-green-700">404</p>
                <h1 className="mt-4 text-2xl font-bold text-gray-900">{t("notFound.title")}</h1>
                <p className="mt-2 max-w-md text-gray-600">{t("notFound.description")}</p>
                <Link
                    to="/"
                    className="mt-8 rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
                >
                    {t("notFound.backHome")}
                </Link>
            </section>
        </>
    );
}

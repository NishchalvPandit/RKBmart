import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const SITE_URL =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
    "https://rkbmart.com";

const DEFAULT_OG_IMAGE = "/logo.webp";

export default function Seo({
    title,
    description,
    path = "",
    image = DEFAULT_OG_IMAGE,
    noIndex = false,
}) {
    const { i18n } = useTranslation();
    const lang = i18n.language === "np" ? "ne" : "en";
    const fullTitle = title ? `${title} | RKB Mart` : "RKB Mart | Rastriya Khadya Bank";
    const canonical = `${SITE_URL.replace(/\/$/, "")}${path || ""}`;
    const ogImage = image.startsWith("http") ? image : `${SITE_URL.replace(/\/$/, "")}${image}`;

    return (
        <Helmet htmlAttributes={{ lang }}>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:locale" content={lang === "ne" ? "ne_NP" : "en_US"} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
            <meta name="theme-color" content="#15803d" />
        </Helmet>
    );
}

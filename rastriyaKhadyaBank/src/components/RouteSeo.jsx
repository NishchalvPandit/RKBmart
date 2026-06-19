import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import Seo from "./Seo";

const ROUTE_SEO = {
    "/": { titleKey: "seo.homeTitle", descKey: "seo.homeDesc" },
    "/products": { titleKey: "seo.productsTitle", descKey: "seo.productsDesc" },
    "/gallery": { titleKey: "seo.galleryTitle", descKey: "seo.galleryDesc" },
    "/contact": { titleKey: "seo.contactTitle", descKey: "seo.contactDesc" },
    "/login": { titleKey: "seo.loginTitle", descKey: "seo.loginDesc" },
    "/register": { titleKey: "seo.registerTitle", descKey: "seo.registerDesc" },
    "/cart": { titleKey: "seo.cartTitle", descKey: "seo.cartDesc" },
    "/checkout": { titleKey: "seo.checkoutTitle", descKey: "seo.checkoutDesc" },
    "/profile": { titleKey: "seo.profileTitle", descKey: "seo.profileDesc" },
    "/verify-email": { titleKey: "seo.verifyTitle", descKey: "seo.verifyDesc" },
    "/reset-password": { titleKey: "seo.resetTitle", descKey: "seo.resetDesc" },
    "/order-success": { titleKey: "seo.orderSuccessTitle", descKey: "seo.orderSuccessDesc" },
    "/admin": { titleKey: "seo.adminTitle", descKey: "seo.adminDesc", noIndex: true },
};

export default function RouteSeo() {
    const { t } = useTranslation();
    const { pathname } = useLocation();

    if (pathname.startsWith("/products/")) {
        return null;
    }

    const meta = ROUTE_SEO[pathname] || {
        titleKey: "seo.defaultTitle",
        descKey: "seo.defaultDesc",
    };

    return (
        <Seo
            title={t(meta.titleKey)}
            description={t(meta.descKey)}
            path={pathname}
            noIndex={meta.noIndex}
        />
    );
}

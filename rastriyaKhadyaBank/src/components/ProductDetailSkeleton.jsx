import { useTranslation } from "react-i18next";

/**
 * Layout shell matching ProductDetails.jsx — same grids / aspect-ratio boxes to minimise CLS.
 */
export default function ProductDetailSkeleton({ messageKey = "pages.productDetails.loading" }) {
  const { t } = useTranslation();

  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8 lg:py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">{t(messageKey)}</p>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Video column — mirrors loaded layout */}
        <div className="lg:col-span-4 space-y-2 order-1 min-h-[0]">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse lg:hidden mb-1" aria-hidden />
          <div
            className="w-full rounded-xl bg-gray-200 animate-pulse aspect-video shadow-inner"
            style={{ aspectRatio: "16 / 9" }}
          />
        </div>

        {/* Copy column — reserve vertical space */}
        <div className="lg:col-span-4 order-2 flex flex-col gap-4 min-h-[280px]">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse max-w-xl w-full" aria-hidden />
          <div className="space-y-2 flex-1" aria-hidden>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6 hidden sm:block" />
          </div>
          <div className="pt-2 space-y-2 border-t border-gray-100" aria-hidden>
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-12 w-full sm:w-48 bg-gray-200 rounded-xl animate-pulse mt-2" aria-hidden />
          <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" aria-hidden />
        </div>

        {/* Image column — locked aspect + max height */}
        <div className="lg:col-span-4 order-3 space-y-2 min-h-[0]">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse lg:hidden" aria-hidden />
          <div
            className="w-full mx-auto rounded-xl bg-gray-200 animate-pulse border border-gray-100 overflow-hidden shadow-inner max-h-[480px]"
            style={{ aspectRatio: "1 / 1" }}
          />
        </div>
      </div>
    </div>
  );
}

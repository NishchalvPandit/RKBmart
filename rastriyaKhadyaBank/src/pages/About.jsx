import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function About() {
  const { t } = useTranslation();

  const pillars = [
    { titleKey: "pages.about.objective", textKey: "pages.about.objectiveText", icon: "🎯" },
    { titleKey: "pages.about.goal", textKey: "pages.about.goalText", icon: "🏆" },
    { titleKey: "pages.about.mission", textKey: "pages.about.missionText", icon: "🌾" },
    { titleKey: "pages.about.vision", textKey: "pages.about.visionText", icon: "🌿" },
  ];

  const whyItems = t("pages.about.why", { returnObjects: true });
  const whoForItems = t("pages.about.whoFor", { returnObjects: true });

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Banner */}
      <div className="bg-green-700 text-white py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-200 text-xs tracking-widest uppercase mb-3">
            <Link to="/" className="hover:text-white transition">
              {t("navbar.home")}
            </Link>
            {" > "}
            {t("pages.about.title")}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {t("pages.about.title")}
          </h1>
          <p className="text-green-100 text-base">
            {t("pages.about.tagline")}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* Pillars */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-green-600 pl-3">
            {t("pages.about.pillarsTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((p) => (
              <div key={p.titleKey} className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{p.icon}</span>
                  <h3 className="font-bold text-gray-800">{t(p.titleKey)}</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{t(p.textKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why needed */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-1 border-l-4 border-green-600 pl-3">
            {t("pages.about.whyTitle")}
          </h2>
          <ol className="space-y-2">
            {Array.isArray(whyItems) && whyItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="bg-gray-200 text-gray-800 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Who is involved */}
        <section className="rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-green-600 pl-3">
            {t("pages.about.whoInvolvedTitle")}
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">{t("pages.about.whoInvolvedText")}</p>
        </section>

        {/* Who it is for */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-1 border-l-4 border-green-600 pl-3">
            {t("pages.about.whoForTitle")}
          </h2>
          <p className="text-gray-600 text-sm mb-5">{t("pages.about.whoForIntro")}</p>
          <ol className="space-y-2">
            {Array.isArray(whoForItems) && whoForItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="bg-gray-200 text-gray-800 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </section>



      </div>
    </div>
  );
}

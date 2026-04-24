import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("pages.contact.title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">
            {t("pages.contact.email")}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            {t("pages.contact.message")}
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full border px-4 py-2 rounded h-32"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          {t("pages.contact.send")}
        </button>
      </form>
    </div>
  );
}

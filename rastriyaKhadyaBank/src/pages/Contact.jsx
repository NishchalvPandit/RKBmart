import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../config/api";

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fieldClass =
    "w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send message");
      }
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("pages.contact.title")}</h1>
      <p className="text-gray-600 text-sm mb-6">
        {t("pages.contact.subtitle", "We will get back to you as soon as we can.")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">
            {t("pages.contact.name", "Name")}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className={fieldClass}
            required
          />
        </div>

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
            className={fieldClass}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            {t("pages.contact.subject", "Subject")}
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            className={fieldClass}
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
            className={`${fieldClass} h-36 resize-y`}
            required
          />
        </div>

        {success && (
          <p className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            {t("pages.contact.success", "Message sent successfully")}
          </p>
        )}
        {error && (
          <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 font-semibold transition-colors"
        >
          {submitting
            ? t("pages.contact.sending", "Sending…")
            : t("pages.contact.send")}
        </button>
      </form>
    </div>
  );
}

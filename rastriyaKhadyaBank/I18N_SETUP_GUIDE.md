# React i18n Implementation Guide

## ✅ Installation Complete!

Your React project now has full internationalization (i18n) support with **English (ENG)** and **Nepali (नेपाली)** languages.

### Installed Packages

```bash
✓ i18next - Core i18n framework
✓ react-i18next - React bindings for i18next
✓ i18next-browser-languagedetector - Automatic language detection
```

---

## 📁 Project Structure

```
src/
├── i18n/
│   ├── en.json              # English translations
│   ├── np.json              # Nepali translations
│   └── i18n.js              # i18n configuration
├── components/
│   ├── TopBar.jsx           # (Updated with i18n)
│   ├── Navbar.jsx           # (Updated with i18n)
│   ├── Hero.jsx             # (Updated with i18n)
│   └── ProductCard.jsx      # (Updated with i18n)
├── pages/
│   ├── Home.jsx             # (Updated with i18n)
│   ├── Products.jsx         # (Updated with i18n)
│   ├── About.jsx            # (Updated with i18n)
│   └── Contact.jsx          # (Updated with i18n)
├── main.jsx                 # (Updated - i18n initialized here)
└── data/
    └── products.js
```

---

## 🔧 Implementation Details

### 1. **Global i18n Initialization** `src/i18n/i18n.js`

```javascript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslations from "./en.json";
import npTranslations from "./np.json";

const resources = {
  en: { translation: enTranslations },
  np: { translation: npTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
```

**Key Features:**

- **LanguageDetector**: Automatically detects browser language
- **localStorage**: Saves user's language preference
- **Fallback**: Defaults to English if language not found
- **XSS Protection**: React's built-in protection enabled

### 2. **Initialize in main.jsx**

```javascript
import "./i18n/i18n.js"; // Must import BEFORE rendering App
```

---

## 📝 Translation Files Structure

### English Translations `src/i18n/en.json`

```json
{
  "topbar": {
    "email": "rastriyakhadyabank@gmail.com",
    "address": "Madhyapur Thimi -02, Divyashwori Planning",
    "language": "ENG"
  },
  "navbar": {
    "home": "Home",
    "products": "Products",
    "about": "About",
    "contact": "Contact",
    "cart": "Cart"
  },
  "pages": {
    "home": {
      "title": "Welcome to Rastriya Khadya Bank",
      "subtitle": "Quality Food Products"
    },
    "products": {
      "title": "Our Products",
      "addToCart": "Add to Cart"
    }
  }
}
```

### Nepali Translations `src/i18n/np.json`

```json
{
  "topbar": {
    "email": "rastriyakhadyabank@gmail.com",
    "address": "मध्यपुर ठिमी -०२, दिव्यश्वरी प्लान्निङ",
    "language": "नेपाली"
  }
  // ... rest of translations
}
```

---

## 🎯 How to Use in Components

### Basic Usage with useTranslation Hook

**TopBar.jsx Example** (Already Implemented):

```jsx
import { useTranslation } from "react-i18next";

const TopBar = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = () => {
    const newLang = i18n.language === "en" ? "np" : "en";
    i18n.changeLanguage(newLang); // Updates ALL components instantly
  };

  return (
    <div>
      {/* Display translated text */}
      <p>{t("topbar.email")}</p>

      {/* Language switcher button */}
      <button onClick={handleLanguageChange}>
        {i18n.language === "en" ? "🇺🇸 ENG" : "🇳🇵 नेपाली"}
      </button>
    </div>
  );
};
```

### Usage in Other Components

**Any Component - Example:**

```jsx
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.home.title")}</h1>
      <p>{t("pages.home.description")}</p>
      <button>{t("pages.products.addToCart")}</button>
    </div>
  );
};
```

---

## 🌍 Language Switching Flow

```
User clicks language button
        ↓
handleLanguageChange() triggered
        ↓
i18n.changeLanguage(newLang) called
        ↓
i18next automatically:
  • Loads new language resources
  • Saves to localStorage
  • Notifies all useTranslation() hooks
        ↓
ALL components re-render with new language
        ↓
Language persists on page refresh
```

---

## 💾 LocalStorage Persistence

The language preference is **automatically saved** to localStorage:

- First visit: Detects browser language or defaults to English
- Subsequent visits: Loads language from localStorage
- Manual switch: New language saved automatically

**Storage key:** `i18nextLng`

---

## 🚀 How to Add New Translations

### Step 1: Add key to both JSON files

**src/i18n/en.json:**

```json
{
  "newSection": {
    "newKey": "New English Text"
  }
}
```

**src/i18n/np.json:**

```json
{
  "newSection": {
    "newKey": "नयाँ नेपाली पाठ"
  }
}
```

### Step 2: Use in component

```jsx
const { t } = useTranslation();

<h1>{t("newSection.newKey")}</h1>;
```

---

## 🎨 Currently Translated Components

| Component   | Status | Details                      |
| ----------- | ------ | ---------------------------- |
| TopBar      | ✅     | Language switcher integrated |
| Navbar      | ✅     | Navigation links translated  |
| Hero        | ✅     | Hero section with greeting   |
| ProductCard | ✅     | "Add to Cart" button         |
| Home        | ✅     | Featured products title      |
| Products    | ✅     | Product listing page         |
| About       | ✅     | About page content           |
| Contact     | ✅     | Contact form labels          |

---

## 📋 Translation Keys Reference

```
topbar.email
topbar.address
topbar.language

navbar.home
navbar.products
navbar.about
navbar.contact
navbar.cart

pages.home.title
pages.home.subtitle
pages.home.description

pages.products.title
pages.products.addToCart
pages.products.viewDetails

pages.about.title
pages.about.description

pages.contact.title
pages.contact.email
pages.contact.phone
pages.contact.message
pages.contact.send

common.language
common.nepali
common.english
```

---

## ⚙️ Configuration Options

### Change Default Language

In `src/i18n/i18n.js`:

```javascript
.init({
  fallbackLng: 'np', // Change to Nepali
  // ...
})
```

### Change Detection Order

In `src/i18n/i18n.js`:

```javascript
detection: {
  order: ['localStorage', 'sessionStorage', 'navigator'],
  caches: ['localStorage'],
}
```

---

## ✨ Features

✅ **Global Language Switching** - Instant updates across all pages
✅ **Persistent Storage** - Language preference saved in localStorage
✅ **Auto-Detection** - Detects browser language on first visit
✅ **Fallback Language** - Defaults to English if translation missing
✅ **Production-Ready** - Full XSS protection built-in
✅ **Easy to Extend** - Add new languages by creating new JSON files
✅ **Component-Level** - Each component can have its own translations
✅ **Performance** - No API calls, all translations loaded upfront

---

## 🔍 Troubleshooting

### Why isn't the language changing?

1. Ensure i18n is imported in `main.jsx` BEFORE `<App />`
2. Check component uses `useTranslation()` hook
3. Clear browser localStorage and refresh

### Some text not translating?

1. Verify translation key exists in JSON files
2. Check key structure matches: `t("section.key")`
3. Ensure JSON syntax is valid (use JSON validator)

### Language doesn't persist after refresh?

1. Check localStorage permission is enabled
2. Verify LanguageDetector is in i18n plugins
3. Check browser console for errors

---

## 📚 Example: Adding a New Language (e.g., German)

1. Create `src/i18n/de.json` with German translations
2. Update `src/i18n/i18n.js`:

```javascript
import deTranslations from "./de.json";

const resources = {
  en: { translation: enTranslations },
  np: { translation: npTranslations },
  de: { translation: deTranslations }, // Add this
};
```

3. Update TopBar language switcher logic as needed

---

## 🎓 Next Steps

1. **Test the implementation:**
   - Click the 🇺🇸 ENG / 🇳🇵 नेपाली button in TopBar
   - Navigate between pages
   - Refresh the page and verify language persists

2. **Add more translations:**
   - Update JSON files with all your static text
   - Replace hardcoded strings with `t()` calls

3. **Extend to more languages:**
   - Create new JSON files following the same structure
   - Add language detection/switcher logic

---

## 📖 Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Guide](https://react.i18next.com/)
- [i18next Browser Language Detector](https://github.com/i18next/i18next-browser-languageDetector)

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "en");

  // Load saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && saved !== lang) {
      setLang(saved);
      i18n.changeLanguage(saved);
    }
  }, []);

  // Save language and switch i18n
  const switchLang = (newLang) => {
    setLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <div className="lang-switch">
      <button
        className={`lang-btn ${lang === "en" ? "active" : ""}`}
        onClick={() => switchLang("en")}
      >
        <span className="flag">🇬🇧</span> EN
      </button>
      <button
        className={`lang-btn ${lang === "el" ? "active" : ""}`}
        onClick={() => switchLang("el")}
      >
        <span className="flag">🇬🇷</span> EL
      </button>
    </div>
  );
}

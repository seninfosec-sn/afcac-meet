"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Lang, Translations } from "@/lib/i18n";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "FR",
  setLang: () => {},
  t: translations["FR"],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("FR");

  useEffect(() => {
    const saved = localStorage.getItem("afcac_lang") as Lang | null;
    if (saved && (saved === "EN" || saved === "FR" || saved === "PT")) {
      setLangState(saved);
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("afcac_lang", l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

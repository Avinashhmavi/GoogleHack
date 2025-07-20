"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import hi from "@/locales/hi.json";
import bn from "@/locales/bn.json";
import ta from "@/locales/ta.json";
import te from "@/locales/te.json";

type Language = "en" | "es" | "fr" | "hi" | "bn" | "ta" | "te";

type Translations = {
  [key: string]: string;
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
  t: (key: string) => string;
};

const translationsMap = { en, es, fr, hi, bn, ta, te };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(translationsMap.en);

  useEffect(() => {
    // @ts-ignore
    setCurrentTranslations(translationsMap[language] || translationsMap.en);
  }, [language]);

  const t = (key: string): string => {
    return currentTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations: currentTranslations, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageMeta,
  LanguageMeta,
} from "./languages";
import { dictionaries, TranslationDictionary } from "./dictionaries";

interface LanguageContextType {
  language: SupportedLanguage;
  currentLanguageMeta: LanguageMeta;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  dictionary: TranslationDictionary;
  supportedLanguages: LanguageMeta[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "georadar_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        setLanguageState(stored);
        document.documentElement.lang = stored;
      } else {
        const browserLang = navigator.language.split("-")[0] as SupportedLanguage;
        if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
          setLanguageState(browserLang);
          document.documentElement.lang = browserLang;
        }
      }
    } catch {}

    setMounted(true);
  }, []);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
      window.dispatchEvent(
        new CustomEvent("georadar_language_changed", { detail: { language: newLang } })
      );
    } catch {}
  }, []);

  const dictionary = useMemo(() => {
    return dictionaries[language] || dictionaries[DEFAULT_LANGUAGE];
  }, [language]);

  const fallbackDictionary = dictionaries[DEFAULT_LANGUAGE];

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split(".");
      
      let current: any = dictionary;
      let fallbackCurrent: any = fallbackDictionary;

      for (const key of keys) {
        current = current ? current[key] : undefined;
        fallbackCurrent = fallbackCurrent ? fallbackCurrent[key] : undefined;
      }

      let result = typeof current === "string" ? current : typeof fallbackCurrent === "string" ? fallbackCurrent : path;

      if (params && typeof result === "string") {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          result = result.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue));
        }
      }

      return result;
    },
    [dictionary, fallbackDictionary]
  );

  const currentLanguageMeta = useMemo(() => {
    return getLanguageMeta(language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      currentLanguageMeta,
      setLanguage,
      t,
      dictionary,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, currentLanguageMeta, setLanguage, t, dictionary]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return {
    t: context.t,
    language: context.language,
    currentLanguageMeta: context.currentLanguageMeta,
    setLanguage: context.setLanguage,
    dictionary: context.dictionary,
    supportedLanguages: context.supportedLanguages,
  };
}

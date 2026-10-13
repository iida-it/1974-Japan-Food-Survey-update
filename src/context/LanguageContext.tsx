import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { en, TranslationKey } from '../locales/en';
import { ja } from '../locales/ja';

export type Language = 'en' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
  tCategory: (cat: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'app_language_preference';

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === 'en' || saved === 'ja') {
      return saved;
    }
    // Fallback to navigator.language
    if (navigator.language && navigator.language.toLowerCase().startsWith('ja')) {
      return 'ja';
    }
  }
  return 'ja'; // Default to Japanese as this is a 1974 Japan survey digitizer
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage errors (e.g. private browsing quota)
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'ja' ? 'en' : 'ja');
  }, [language, setLanguage]);

  // Sync documentElement.lang for accessibility
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      const dict = language === 'ja' ? (ja as Record<string, any>) : (en as Record<string, any>);
      let val = dict[key];

      if (val === undefined) {
        // Fallback to Japanese then English
        val = (ja as Record<string, any>)[key] ?? (en as Record<string, any>)[key] ?? key;
      }

      if (typeof val !== 'string') {
        return String(val);
      }

      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          val = (val as string).replaceAll(`{${paramKey}}`, String(paramVal));
        });
      }

      return val;
    },
    [language]
  );

  const tCategory = useCallback(
    (cat: string): string => {
      if (language === 'en') {
        return (en.categories as Record<string, string>)[cat] || cat;
      }
      return cat;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        tCategory,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

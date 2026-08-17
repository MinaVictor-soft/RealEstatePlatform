import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import en from './en.json';
import ar from './ar.json';

export type Language = 'en' | 'ar';
type Messages = typeof en;

const dictionaries: Record<Language, Messages> = { en, ar };
const STORAGE_KEY = 'pcfp-language';

interface I18nValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Messages) => string;
}

const I18nContext = createContext<I18nValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'ar';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => dictionaries[language][key],
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

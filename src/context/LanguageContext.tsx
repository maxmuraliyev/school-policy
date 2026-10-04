'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { translations, Language } from '@/lib/translations';

export type { Language };

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'uz',
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('uz');
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shs_lang') as Language;
      if (saved === 'uz' || saved === 'en') {
        setLangState(saved);
        document.cookie = `app_lang=${saved}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('shs_lang', newLang);
      document.cookie = `app_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    } catch {
      // Ignore storage errors
    }
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

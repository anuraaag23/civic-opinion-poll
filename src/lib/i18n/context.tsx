'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, TranslationKeys } from './translations';
import { Language } from '../types';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('civic_poll_lang') as Language;
        if (stored === 'en' || stored === 'hi') {
          return stored;
        }
        if (navigator.language.startsWith('hi')) {
          return 'hi';
        }
      } catch {
        // Fallback
      }
    }
    return 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('civic_poll_lang', newLang);
    } catch {
      // Ignore in restricted environments
    }
  };

  const t: TranslationKeys = useMemo(() => {
    return (translations[language] || translations.en) as unknown as TranslationKeys;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

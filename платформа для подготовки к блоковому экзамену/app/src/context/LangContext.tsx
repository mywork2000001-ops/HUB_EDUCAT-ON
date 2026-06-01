import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { I18n, Lang } from '@/types';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (i18n: I18n) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem('dim_lang') as Lang) ?? 'ru',
  );

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('dim_lang', l);
  };

  return (
    <LangContext.Provider
      value={{ lang, setLang: handleSetLang, t: (i18n) => i18n[lang] }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

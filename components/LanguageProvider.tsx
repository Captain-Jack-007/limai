'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { type Bi, type DictKey, type Lang, pick, translate } from '@/lib/i18n';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: DictKey) => string;
  b: (v: Bi | string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

const STORAGE_KEY = 'scibridge.lang';

export function LanguageProvider({
  children,
  defaultLang = 'zh',
}: {
  children: React.ReactNode;
  defaultLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'zh') setLangState(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'zh' : 'en');
  }, [lang, setLang]);

  const t = useCallback((key: DictKey) => translate(key, lang), [lang]);
  const b = useCallback((v: Bi | string) => pick(v, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, b }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): Ctx {
  const c = useContext(LanguageContext);
  if (!c) {
    throw new Error('useLang must be used inside <LanguageProvider>');
  }
  return c;
}

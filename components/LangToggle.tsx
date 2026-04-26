'use client';

import { useLang } from '@/components/LanguageProvider';

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={
          'px-2 py-1.5 rounded-md transition-colors ' +
          (lang === 'en'
            ? 'bg-white text-ink-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700')
        }
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('zh')}
        className={
          'px-2 py-1.5 rounded-md transition-colors ' +
          (lang === 'zh'
            ? 'bg-white text-ink-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700')
        }
      >
        中文
      </button>
    </div>
  );
}

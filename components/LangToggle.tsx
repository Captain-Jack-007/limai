'use client';

import { useLang } from '@/components/LanguageProvider';

export default function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-lg p-0.5 text-xs font-medium"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      {(['en', 'zh'] as const).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className="px-2.5 py-1.5 rounded-md transition-colors"
            style={{
              background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.4)',
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            {l === 'en' ? 'EN' : '中文'}
          </button>
        );
      })}
    </div>
  );
}

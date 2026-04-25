'use client';

import { Bell, Search } from 'lucide-react';
import { activeProject } from '@/lib/mock-data';
import { useLang } from '@/components/LanguageProvider';
import { stageDictKey } from '@/lib/types';
import UserMenu from './UserMenu';

export default function TopBar() {
  const { t, b, lang, setLang } = useLang();
  return (
    <header className="no-print h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <span className="text-slate-500">{t('top_project')}</span>
          <span className="font-medium">{b(activeProject.name)}</span>
        </div>
        <span className="chip bg-slate-100 text-slate-600">
          {t(stageDictKey[activeProject.stage])}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input placeholder={t('top_search')} className="input pl-9 w-64" />
        </div>
        <div
          role="group"
          aria-label="Language"
          className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium"
        >
          <button
            type="button"
            onClick={() => setLang('en')}
            className={
              'px-2 py-1 rounded-md transition-colors ' +
              (lang === 'en'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900')
            }
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('zh')}
            className={
              'px-2 py-1 rounded-md transition-colors ' +
              (lang === 'zh'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900')
            }
          >
            中文
          </button>
        </div>
        <button className="btn-ghost" aria-label={t('top_notifications')}>
          <Bell size={18} />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}

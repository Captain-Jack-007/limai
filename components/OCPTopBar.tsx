'use client';

import { Bell, Search } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import UserMenu from './UserMenu';
import ViewSwitch from './ViewSwitch';
import LangToggle from './LangToggle';

export default function OCPTopBar() {
  const { t } = useLang();
  return (
    <header className="no-print h-14 bg-[#05060d]/95 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            placeholder={t('top_search')}
            className="w-72 h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-white/25 focus:bg-white/10 transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ViewSwitch />
        <LangToggle />
        <button
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={t('top_notifications')}
        >
          <Bell size={16} />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}

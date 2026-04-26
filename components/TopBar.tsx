'use client';

import { Bell, Search } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import UserMenu from './UserMenu';
import ViewSwitch from './ViewSwitch';
import LangToggle from './LangToggle';

export default function TopBar() {
  const { t } = useLang();
  return (
    <header className="no-print h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input placeholder={t('top_search')} className="input pl-9 w-72" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ViewSwitch />
        <LangToggle />
        <button className="btn-ghost" aria-label={t('top_notifications')}>
          <Bell size={18} />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}

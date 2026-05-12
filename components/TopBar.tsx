'use client';

import { Bell, Search } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import UserMenu from './UserMenu';
import ViewSwitch from './ViewSwitch';
import LangToggle from './LangToggle';

export default function TopBar() {
  const { t } = useLang();
  return (
    <header
      className="no-print h-14 px-6 flex items-center justify-between backdrop-blur-xl"
      style={{
        background: 'rgba(10,10,12,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          />
          <input
            placeholder={t('top_search')}
            className="pl-9 pr-3 py-1.5 text-sm rounded-xl outline-none w-64 transition-all placeholder:text-white/45"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              boxShadow: '0 0 10px rgba(255,255,255,0.03)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.05)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255,255,255,0.03)';
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ViewSwitch />
        <LangToggle />
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.65)' }}
          aria-label={t('top_notifications')}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
        >
          <Bell size={18} />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}

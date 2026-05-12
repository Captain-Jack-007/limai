'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle2 } from 'lucide-react';
import { getAuthedEmail, signOut } from '@/lib/auth';
import { useLang } from '@/components/LanguageProvider';

export default function UserMenu() {
  const router = useRouter();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEmail(getAuthedEmail());
  }, []);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleLogout() {
    signOut();
    setOpen(false);
    router.replace('/');
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="p-2 rounded-lg transition-colors"
        style={{ color: 'rgba(255,255,255,0.5)' }}
        aria-label={t('user_account')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
      >
        <UserCircle2 size={20} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl z-20 overflow-hidden"
          style={{
            background: '#151517',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {email && (
            <div
              className="px-3 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('user_signedIn')}
              </div>
              <div className="text-sm truncate font-medium text-white">{email}</div>
            </div>
          )}
          <button
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <LogOut size={14} />
            {t('user_signOut')}
          </button>
        </div>
      )}
    </div>
  );
}

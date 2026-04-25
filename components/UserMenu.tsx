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
        className="btn-ghost"
        aria-label={t('user_account')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <UserCircle2 size={20} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden"
        >
          {email && (
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="text-[11px] text-slate-400">
                {t('user_signedIn')}
              </div>
              <div className="text-sm truncate font-medium">{email}</div>
            </div>
          )}
          <button
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut size={14} />
            {t('user_signOut')}
          </button>
        </div>
      )}
    </div>
  );
}

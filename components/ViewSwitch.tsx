'use client';

import { useRouter, usePathname } from 'next/navigation';
import { FlaskConical, Building2 } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';

const SCIENTIST_HOME = '/dashboard';
const ENTERPRISE_HOME = '/enterprise/dashboard';

export default function ViewSwitch() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { t } = useLang();
  const mode: 'scientist' | 'enterprise' = pathname.startsWith('/enterprise')
    ? 'enterprise'
    : 'scientist';

  function go(target: 'scientist' | 'enterprise') {
    if (target === mode) return;
    router.push(target === 'scientist' ? SCIENTIST_HOME : ENTERPRISE_HOME);
  }

  return (
    <div
      role="group"
      aria-label={t('view_switchHint')}
      className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium"
    >
      <button
        type="button"
        onClick={() => go('scientist')}
        aria-pressed={mode === 'scientist'}
        title={t('view_scientist')}
        className={
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ' +
          (mode === 'scientist'
            ? 'bg-white text-ink-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700')
        }
      >
        <FlaskConical size={14} />
        {t('view_scientist')}
      </button>
      <button
        type="button"
        onClick={() => go('enterprise')}
        aria-pressed={mode === 'enterprise'}
        title={t('view_enterprise')}
        className={
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ' +
          (mode === 'enterprise'
            ? 'bg-white text-ink-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700')
        }
      >
        <Building2 size={14} />
        {t('view_enterprise')}
      </button>
    </div>
  );
}

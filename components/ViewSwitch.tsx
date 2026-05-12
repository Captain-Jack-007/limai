'use client';

import { useRouter, usePathname } from 'next/navigation';
import { FlaskConical, Building2, Cpu } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';

const SCIENTIST_HOME = '/dashboard';
const ENTERPRISE_HOME = '/enterprise/dashboard';
const OCP_HOME = '/ocp/overview';

type Mode = 'scientist' | 'enterprise' | 'ocp';

export default function ViewSwitch() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { t } = useLang();

  const mode: Mode = pathname.startsWith('/enterprise')
    ? 'enterprise'
    : pathname.startsWith('/ocp')
    ? 'ocp'
    : 'scientist';

  function go(target: Mode) {
    if (target === mode) return;
    if (target === 'scientist') router.push(SCIENTIST_HOME);
    else if (target === 'enterprise') router.push(ENTERPRISE_HOME);
    else router.push(OCP_HOME);
  }

  const tabs: { key: Mode; icon: React.ElementType; labelKey: Parameters<typeof t>[0] }[] = [
    { key: 'scientist', icon: FlaskConical, labelKey: 'view_scientist' },
    { key: 'enterprise', icon: Building2, labelKey: 'view_enterprise' },
    { key: 'ocp', icon: Cpu, labelKey: 'view_ocp' },
  ];

  return (
    <div
      role="group"
      aria-label={t('view_switchHint')}
      className="flex items-center rounded-lg p-0.5 text-xs font-medium"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      {tabs.map(({ key, icon: Icon, labelKey }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => go(key)}
            aria-pressed={active}
            title={t(labelKey)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors"
            style={{
              background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.6)',
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <Icon size={14} />
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}

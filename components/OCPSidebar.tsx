'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquareText,
  Bot,
  Target,
  Megaphone,
  Wallet,
  Handshake,
  Settings,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import type { DictKey } from '@/lib/i18n';

const companyNav: { href: string; key: DictKey; icon: any }[] = [
  { href: '/ocp/overview', key: 'ocp_nav_overview', icon: LayoutDashboard },
  { href: '/ocp/command', key: 'ocp_nav_command', icon: MessageSquareText },
  { href: '/ocp/missions', key: 'ocp_nav_missions', icon: Target },
];

const systemNav: { href: string; key: DictKey; icon: any }[] = [
  { href: '/ocp/agents', key: 'ocp_nav_agents', icon: Bot },
  { href: '/ocp/content', key: 'ocp_nav_content', icon: Megaphone },
  { href: '/ocp/finance', key: 'ocp_nav_finance', icon: Wallet },
  { href: '/ocp/outreach', key: 'ocp_nav_outreach', icon: Handshake },
  { href: '/ocp/settings', key: 'ocp_nav_settings', icon: Settings },
];

export default function OCPSidebar() {
  const pathname = usePathname() || '';
  const { t } = useLang();

  function renderLink({
    href,
    key,
    icon: Icon,
  }: {
    href: string;
    key: DictKey;
    icon: any;
  }) {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        key={href}
        href={href}
        className={
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ' +
          (active
            ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/5')
        }
      >
        <Icon size={16} className={active ? 'text-fuchsia-300' : ''} />
        {t(key)}
      </Link>
    );
  }

  return (
    <aside className="no-print w-60 shrink-0 border-r border-white/10 bg-[#07080f] h-screen sticky top-0 flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 text-white grid place-items-center shadow-[0_0_20px_-4px_rgba(217,70,239,0.6)]">
          <Cpu size={15} />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm tracking-tight text-white">
            {t('ocp_brand')}
          </div>
          <div className="text-[11px] text-slate-500">
            {t('ocp_brand_tagline')}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">
          {t('ocp_nav_companyHeader')}
        </div>
        <div className="text-sm font-medium mt-0.5 text-slate-100 truncate">
          {t('ocp_company_name')}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {t('ocp_company_role')}
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="pb-1 px-3 text-[10px] uppercase tracking-wider text-slate-500">
          {t('ocp_nav_workspace')}
        </div>
        {companyNav.map(renderLink)}

        <div className="pt-4 pb-1 px-3 text-[10px] uppercase tracking-wider text-slate-500">
          {t('ocp_nav_systemHeader')}
        </div>
        {systemNav.map(renderLink)}
      </nav>

      <div className="p-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-500">
        <Sparkles size={12} className="text-fuchsia-400" />
        {t('ocp_footer')}
      </div>
    </aside>
  );
}

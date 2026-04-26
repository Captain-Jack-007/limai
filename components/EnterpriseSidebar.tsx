'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  KanbanSquare,
  Users2,
  Briefcase,
  TrendingUp,
  FileBarChart2,
  Settings,
  Building2,
  Orbit,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import type { DictKey } from '@/lib/i18n';

const nav: { href: string; key: DictKey; icon: any }[] = [
  {
    href: '/enterprise/dashboard',
    key: 'ent_nav_dashboard',
    icon: LayoutDashboard,
  },
  { href: '/enterprise/map', key: 'ent_nav_map', icon: Orbit },
  { href: '/enterprise/pipeline', key: 'ent_nav_pipeline', icon: KanbanSquare },
  { href: '/enterprise/experts', key: 'ent_nav_experts', icon: Users2 },
  { href: '/enterprise/investors', key: 'ent_nav_investors', icon: Briefcase },
  { href: '/enterprise/deals', key: 'ent_nav_deals', icon: TrendingUp },
  { href: '/enterprise/reports', key: 'ent_nav_reports', icon: FileBarChart2 },
  { href: '/enterprise/settings', key: 'ent_nav_settings', icon: Settings },
];

export default function EnterpriseSidebar() {
  const pathname = usePathname() || '';
  const { t } = useLang();
  return (
    <aside className="no-print w-64 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-200">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ink-900 to-brand-700 text-white grid place-items-center shadow-sm">
          <Building2 size={16} />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm tracking-tight">Sci-Bridge</div>
          <div className="text-[11px] text-slate-500">
            {t('ent_brand_tagline')}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-slate-200">
        <div className="text-[10px] uppercase tracking-wider text-slate-400">
          {t('ent_nav_orgHeader')}
        </div>
        <div className="text-sm font-medium mt-0.5 truncate">
          {t('ent_org_name')}
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="pb-1 px-3 text-[10px] uppercase tracking-wider text-slate-400">
          {t('ent_nav_workspaceHeader')}
        </div>
        {nav.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ' +
                (active
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100')
              }
            >
              <Icon size={16} />
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 text-[11px] text-slate-400 border-t border-slate-200 leading-relaxed">
        {t('sidebar_footer')}
      </div>
    </aside>
  );
}

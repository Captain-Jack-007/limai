'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquareText,
  Users,
  FileOutput,
  Settings,
  Sparkles,
  Plus,
  FolderOpen,
  Layers,
  Bookmark,
} from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';
import { useLang } from '@/components/LanguageProvider';
import type { DictKey } from '@/lib/i18n';

const primaryNav: { href: string; key: DictKey; icon: any }[] = [
  { href: '/dashboard', key: 'nav_home', icon: LayoutDashboard },
  { href: '/chat', key: 'nav_workspace', icon: MessageSquareText },
  { href: '/investors', key: 'nav_investors', icon: Users },
  { href: '/outputs', key: 'nav_outputs', icon: FileOutput },
  { href: '/settings', key: 'nav_settings', icon: Settings },
];

const utilityNav: { href: string; key: DictKey; icon: any }[] = [
  { href: '/dashboard?tab=templates', key: 'nav_templates', icon: Layers },
  { href: '/dashboard?tab=saved', key: 'nav_savedReports', icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t, b } = useLang();
  return (
    <aside className="no-print w-64 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-200">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-fuchsia-500 text-white grid place-items-center shadow-sm">
          <Sparkles size={16} />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm tracking-tight">Sci-Bridge</div>
          <div className="text-[11px] text-slate-500">{t('brand_tagline')}</div>
        </div>
      </div>

      <div className="p-3">
        <Link
          href="/chat?new=1"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium bg-ink-900 text-white hover:bg-ink-800 transition-colors"
        >
          <Plus size={16} />
          {t('nav_newProject')}
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {primaryNav.map(({ href, key, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href));
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

        <div className="pt-4 pb-1 px-3 text-[10px] uppercase tracking-wider text-slate-400">
          {t('nav_projectsHeader')}
        </div>
        {mockProjects.map((p) => (
          <Link
            key={p.id}
            href={`/chat?project=${p.id}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            title={b(p.summary)}
          >
            <FolderOpen size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{b(p.name)}</span>
          </Link>
        ))}

        <div className="pt-4 pb-1 px-3 text-[10px] uppercase tracking-wider text-slate-400">
          {t('nav_libraryHeader')}
        </div>
        {utilityNav.map(({ href, key, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon size={14} className="text-slate-400" />
            {t(key)}
          </Link>
        ))}
      </nav>

      <div className="p-3 text-[11px] text-slate-400 border-t border-slate-200 leading-relaxed">
        {t('sidebar_footer')}
      </div>
    </aside>
  );
}

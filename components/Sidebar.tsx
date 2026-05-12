'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquareText,
  Users,
  FileOutput,
  Settings,
  Zap,
  Plus,
  FolderOpen,
  Layers,
  Bookmark,
} from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';
import { useLang } from '@/components/LanguageProvider';
import type { DictKey } from '@/lib/i18n';

const primaryNav: { href: string; key: DictKey; icon: React.ElementType }[] = [
  { href: '/dashboard', key: 'nav_home', icon: LayoutDashboard },
  { href: '/chat', key: 'nav_workspace', icon: MessageSquareText },
  { href: '/investors', key: 'nav_investors', icon: Users },
  { href: '/outputs', key: 'nav_outputs', icon: FileOutput },
  { href: '/settings', key: 'nav_settings', icon: Settings },
];

const utilityNav: { href: string; key: DictKey; icon: React.ElementType }[] = [
  { href: '/dashboard?tab=templates', key: 'nav_templates', icon: Layers },
  { href: '/dashboard?tab=saved', key: 'nav_savedReports', icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t, b } = useLang();

  return (
    <aside
      className="no-print w-64 shrink-0 h-screen sticky top-0 flex flex-col"
      style={{
        background: '#0a0a0c',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '1px 0 20px rgba(255,255,255,0.04)',
      }}
    >
      {/* Logo */}
      <div
        className="h-14 flex items-center gap-2 px-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div
          className="w-8 h-8 rounded-xl grid place-items-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <Zap size={15} style={{ color: 'rgba(255,255,255,0.9)' }} />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm text-white tracking-tight">Sci-Bridge</div>
          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {t('brand_tagline')}
          </div>
        </div>
      </div>

      {/* New project */}
      <div className="p-3">
        <Link
          href="/chat?new=1"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            boxShadow: '0 0 12px rgba(255,255,255,0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          }}
        >
          <Plus size={15} />
          {t('nav_newProject')}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {primaryNav.map(({ href, key, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={16} />
              {t(key)}
            </Link>
          );
        })}

        <div
          className="pt-5 pb-1.5 px-3 text-[10px] uppercase tracking-wider font-medium"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {t('nav_projectsHeader')}
        </div>

        {mockProjects.map((p) => (
          <Link
            key={p.id}
            href={`/chat?project=${p.id}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            title={b(p.summary)}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <FolderOpen size={14} style={{ color: 'rgba(255,255,255,0.4)' }} className="shrink-0" />
            <span className="truncate">{b(p.name)}</span>
          </Link>
        ))}

        <div
          className="pt-5 pb-1.5 px-3 text-[10px] uppercase tracking-wider font-medium"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {t('nav_libraryHeader')}
        </div>

        {utilityNav.map(({ href, key, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon size={14} style={{ color: 'rgba(255,255,255,0.45)' }} />
            {t(key)}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="p-3 text-[11px] leading-relaxed"
        style={{
          color: 'rgba(255,255,255,0.5)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {t('sidebar_footer')}
      </div>
    </aside>
  );
}

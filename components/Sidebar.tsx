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

const primaryNav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/chat', label: 'Agent Workspace', icon: MessageSquareText },
  { href: '/investors', label: 'Investor Match', icon: Users },
  { href: '/outputs', label: 'Generated Outputs', icon: FileOutput },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const utilityNav = [
  { href: '/dashboard?tab=templates', label: 'Templates', icon: Layers },
  { href: '/dashboard?tab=saved', label: 'Saved Reports', icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="no-print w-64 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-200">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-fuchsia-500 text-white grid place-items-center shadow-sm">
          <Sparkles size={16} />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm tracking-tight">Sci-Bridge</div>
          <div className="text-[11px] text-slate-500">Agent · 科研商业化</div>
        </div>
      </div>

      <div className="p-3">
        <Link
          href="/chat?new=1"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium bg-ink-900 text-white hover:bg-ink-800 transition-colors"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {primaryNav.map(({ href, label, icon: Icon }) => {
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
              {label}
            </Link>
          );
        })}

        <div className="pt-4 pb-1 px-3 text-[10px] uppercase tracking-wider text-slate-400">
          Projects
        </div>
        {mockProjects.map((p) => (
          <Link
            key={p.id}
            href={`/chat?project=${p.id}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            title={p.summary}
          >
            <FolderOpen size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{p.name}</span>
          </Link>
        ))}

        <div className="pt-4 pb-1 px-3 text-[10px] uppercase tracking-wider text-slate-400">
          Library
        </div>
        {utilityNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon size={14} className="text-slate-400" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 text-[11px] text-slate-400 border-t border-slate-200 leading-relaxed">
        Sci-Bridge Agent · prototype build
      </div>
    </aside>
  );
}

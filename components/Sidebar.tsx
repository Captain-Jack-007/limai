'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

const nav = [
  { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/upload', label: '数据上传', icon: Upload },
  { href: '/issues', label: '风险问题', icon: AlertTriangle },
  { href: '/report', label: '风险报告', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="no-print w-60 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center">
          <ShieldCheck size={18} />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm">力迈 AI</div>
          <div className="text-[11px] text-slate-500">税务风险检测</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
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
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 text-[11px] text-slate-400 border-t border-slate-200 leading-relaxed">
        由 北京纳瓦纳科技有限公司 开发
      </div>
    </aside>
  );
}

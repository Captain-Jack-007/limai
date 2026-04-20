'use client';

import { Bell, Search, UserCircle2 } from 'lucide-react';
import { mockRisk } from '@/lib/mock-data';

export default function TopBar() {
  return (
    <header className="no-print h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <span className="text-slate-500">企业：</span>
          <span className="font-medium">{mockRisk.company}</span>
        </div>
        <span className="chip bg-slate-100 text-slate-600">
          期间：{mockRisk.period}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input placeholder="搜索问题、员工…" className="input pl-9 w-64" />
        </div>
        <button className="btn-ghost" aria-label="通知">
          <Bell size={18} />
        </button>
        <button className="btn-ghost" aria-label="账户">
          <UserCircle2 size={20} />
        </button>
      </div>
    </header>
  );
}

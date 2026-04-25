'use client';

import { Bell, Search, Sparkles } from 'lucide-react';
import { activeProject } from '@/lib/mock-data';
import { stageLabel } from '@/lib/types';
import UserMenu from './UserMenu';

export default function TopBar() {
  return (
    <header className="no-print h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-sm flex items-center gap-2 min-w-0">
          <span className="text-slate-500">Project:</span>
          <span className="font-medium truncate">{activeProject.name}</span>
        </div>
        <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          {activeProject.field}
        </span>
        <span className="chip bg-slate-100 text-slate-600">
          {stageLabel(activeProject.stage)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search projects, investors…"
            className="input pl-9 w-72"
          />
        </div>
        <button
          className="btn-outline gap-1.5 text-brand-700 border-brand-200 bg-brand-50 hover:bg-brand-100"
          aria-label="Upgrade"
        >
          <Sparkles size={14} />
          Pro
        </button>
        <button className="btn-ghost" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}

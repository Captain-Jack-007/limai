'use client';

import { Briefcase } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { mockInvestors } from '@/lib/mock-data';

export default function EnterpriseInvestorsPage() {
  const { t, b } = useLang();
  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('ent_nav_investors')}</h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          {t('dl_subhead')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockInvestors.map((inv) => (
          <div key={inv.id} className="card p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center text-slate-500 shrink-0">
                <Briefcase size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold truncate">{inv.name}</div>
                  <span className="chip bg-brand-50 text-brand-700">{inv.matchScore}</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {b(inv.region)} · {b(inv.stage)}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">{b(inv.thesis)}</p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">{b(inv.focus)}</span>
              <span className="font-medium text-slate-700">{b(inv.ticket)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

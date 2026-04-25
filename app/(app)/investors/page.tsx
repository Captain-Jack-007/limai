'use client';

import { useMemo, useState } from 'react';
import {
  Building2,
  Globe2,
  Target,
  TrendingUp,
  Mail,
  Sparkles,
} from 'lucide-react';
import { mockInvestors, activeProject } from '@/lib/mock-data';
import { useLang } from '@/components/LanguageProvider';
import type { DictKey } from '@/lib/i18n';

type RegionKey = 'all' | 'china' | 'asia' | 'global' | 'chinaGlobal';

const regions: { key: RegionKey; labelKey: DictKey; matchEn: string }[] = [
  { key: 'all', labelKey: 'inv_region_all', matchEn: '' },
  { key: 'china', labelKey: 'inv_region_china', matchEn: 'China' },
  { key: 'asia', labelKey: 'inv_region_asia', matchEn: 'Asia' },
  { key: 'global', labelKey: 'inv_region_global', matchEn: 'Global' },
  {
    key: 'chinaGlobal',
    labelKey: 'inv_region_chinaGlobal',
    matchEn: 'China / Global',
  },
];

export default function InvestorsPage() {
  const { t, b } = useLang();
  const [region, setRegion] = useState<RegionKey>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const target = regions.find((r) => r.key === region)?.matchEn ?? '';
    return mockInvestors
      .filter((i) =>
        region === 'all'
          ? true
          : i.region.en.toLowerCase().includes(target.toLowerCase())
      )
      .filter((i) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          i.name.toLowerCase().includes(s) ||
          i.focus.en.toLowerCase().includes(s) ||
          i.focus.zh.toLowerCase().includes(s) ||
          i.thesis.en.toLowerCase().includes(s) ||
          i.thesis.zh.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [region, q]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header>
        <div className="inline-flex items-center gap-1.5 chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 mb-2">
          <Sparkles size={12} /> {t('inv_matchedFor')} {b(activeProject.name)}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('inv_title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t('inv_subhead')}</p>
      </header>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('inv_searchPlaceholder')}
          className="input flex-1 min-w-[240px]"
        />
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {regions.map((r) => (
            <button
              key={r.key}
              onClick={() => setRegion(r.key)}
              className={
                'px-3 py-1.5 text-xs rounded-md transition-colors ' +
                (region === r.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900')
              }
            >
              {t(r.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((inv) => (
          <article key={inv.id} className="card p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center text-slate-500">
                  <Building2 size={18} />
                </div>
                <div>
                  <div className="font-semibold text-[15px] leading-tight">
                    {inv.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {b(inv.focus)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold tabular-nums leading-none">
                  {inv.matchScore}
                  <span className="text-sm text-slate-400">%</span>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">
                  {t('inv_match')}
                </div>
              </div>
            </div>

            <div className="text-sm text-slate-600 leading-relaxed">
              {b(inv.thesis)}
            </div>

            <dl className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100">
              <div>
                <dt className="text-slate-400 flex items-center gap-1 mb-0.5">
                  <TrendingUp size={11} /> {t('inv_stage')}
                </dt>
                <dd className="font-medium text-slate-700">{b(inv.stage)}</dd>
              </div>
              <div>
                <dt className="text-slate-400 flex items-center gap-1 mb-0.5">
                  <Globe2 size={11} /> {t('inv_region')}
                </dt>
                <dd className="font-medium text-slate-700">{b(inv.region)}</dd>
              </div>
              <div>
                <dt className="text-slate-400 flex items-center gap-1 mb-0.5">
                  <Target size={11} /> {t('inv_ticket')}
                </dt>
                <dd className="font-medium text-slate-700">{b(inv.ticket)}</dd>
              </div>
            </dl>

            <div className="flex items-center justify-between pt-1">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex-1 mr-3">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-fuchsia-500 rounded-full"
                  style={{ width: `${inv.matchScore}%` }}
                />
              </div>
              <button className="btn-outline text-xs">
                <Mail size={12} /> {t('inv_outreach')}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

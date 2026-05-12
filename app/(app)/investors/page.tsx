'use client';

import { useMemo, useState } from 'react';
import { Building2, Globe2, Target, TrendingUp, Mail } from 'lucide-react';
import { mockInvestors, activeProject } from '@/lib/mock-data';
import { useLang } from '@/components/LanguageProvider';
import type { DictKey } from '@/lib/i18n';

type RegionKey = 'all' | 'china' | 'asia' | 'global' | 'chinaGlobal';

const regions: { key: RegionKey; labelKey: DictKey; matchEn: string }[] = [
  { key: 'all', labelKey: 'inv_region_all', matchEn: '' },
  { key: 'china', labelKey: 'inv_region_china', matchEn: 'China' },
  { key: 'asia', labelKey: 'inv_region_asia', matchEn: 'Asia' },
  { key: 'global', labelKey: 'inv_region_global', matchEn: 'Global' },
  { key: 'chinaGlobal', labelKey: 'inv_region_chinaGlobal', matchEn: 'China / Global' },
];

export default function InvestorsPage() {
  const { t, b } = useLang();
  const [region, setRegion] = useState<RegionKey>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const target = regions.find((r) => r.key === region)?.matchEn ?? '';
    return mockInvestors
      .filter((i) =>
        region === 'all' ? true : i.region.en.toLowerCase().includes(target.toLowerCase())
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
      <header className="space-y-1">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {t('inv_matchedFor')} {b(activeProject.name)}
        </p>
        <h1 className="text-2xl font-semibold text-white">{t('inv_title')}</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {t('inv_subhead')}
        </p>
      </header>

      {/* Filters */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center gap-3 glow-border"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('inv_searchPlaceholder')}
          className="flex-1 min-w-[240px] px-3 py-2 rounded-xl text-sm outline-none transition-all placeholder:text-white/45"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        />
        <div
          className="flex gap-1 rounded-lg p-1"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {regions.map((r) => {
            const active = region === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setRegion(r.key)}
                className="px-3 py-1.5 text-xs rounded-md transition-colors"
                style={{
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                {t(r.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((inv) => (
          <article
            key={inv.id}
            className="rounded-xl p-5 flex flex-col gap-3 glow-border"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl grid place-items-center"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)' }}
                >
                  <Building2 size={18} />
                </div>
                <div>
                  <div className="font-semibold text-[15px] text-white leading-tight">{inv.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {b(inv.focus)}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-semibold text-white tabular-nums leading-none">
                  {inv.matchScore}
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>%</span>
                </div>
                <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {t('inv_match')}
                </div>
              </div>
            </div>

            <div className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {b(inv.thesis)}
            </div>

            <dl
              className="grid grid-cols-3 gap-3 text-xs pt-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              {[
                { icon: TrendingUp, label: t('inv_stage'), val: b(inv.stage) },
                { icon: Globe2, label: t('inv_region'), val: b(inv.region) },
                { icon: Target, label: t('inv_ticket'), val: b(inv.ticket) },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label}>
                  <dt className="flex items-center gap-1 mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <Icon size={11} /> {label}
                  </dt>
                  <dd className="font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{val}</dd>
                </div>
              ))}
            </dl>

            <div className="flex items-center justify-between pt-1">
              <div
                className="h-1.5 rounded-full overflow-hidden flex-1 mr-3"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${inv.matchScore}%`,
                    background: 'rgba(255,255,255,0.4)',
                  }}
                />
              </div>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: 'rgba(255,255,255,0.75)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                }}
              >
                <Mail size={12} /> {t('inv_outreach')}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

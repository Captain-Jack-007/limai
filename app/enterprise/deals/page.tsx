'use client';

import Link from 'next/link';
import { TrendingUp, CheckCircle2, Activity } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { mockDeals, dealStageDictKey, type Deal } from '@/lib/enterprise-data';

const STATUS_TONE: Record<Deal['status'], string> = {
  active: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  won: 'bg-emerald-50 text-emerald-700',
  lost: 'bg-rose-50 text-rose-700',
};

const STATUS_KEY: Record<Deal['status'], 'dl_status_active' | 'dl_status_pending' | 'dl_status_won' | 'dl_status_lost'> = {
  active: 'dl_status_active',
  pending: 'dl_status_pending',
  won: 'dl_status_won',
  lost: 'dl_status_lost',
};

function formatUsd(n: number, lang: string) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')}`;
}

export default function DealsPage() {
  const { t, b, lang } = useLang();

  const totalPipeline = mockDeals
    .filter((d) => d.status === 'active' || d.status === 'pending')
    .reduce((s, d) => s + d.amountUsd, 0);
  const activeCount = mockDeals.filter((d) => d.status === 'active').length;
  const closedCount = mockDeals.filter((d) => d.status === 'won').length;

  const kpis = [
    {
      key: 'pipeline',
      titleKey: 'dl_kpi_pipeline' as const,
      value: formatUsd(totalPipeline, lang),
      icon: TrendingUp,
      tone: 'text-brand-600 bg-brand-50',
    },
    {
      key: 'active',
      titleKey: 'dl_kpi_active' as const,
      value: String(activeCount),
      icon: Activity,
      tone: 'text-blue-600 bg-blue-50',
    },
    {
      key: 'closed',
      titleKey: 'dl_kpi_closed' as const,
      value: String(closedCount),
      icon: CheckCircle2,
      tone: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('dl_title')}</h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">{t('dl_subhead')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.key} className="card p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">{t(k.titleKey)}</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{k.value}</div>
              </div>
              <div className={`w-10 h-10 rounded-lg grid place-items-center ${k.tone}`}>
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t('dl_table_project')}</th>
              <th className="text-left px-4 py-3 font-medium">{t('dl_table_investor')}</th>
              <th className="text-right px-4 py-3 font-medium">{t('dl_table_amount')}</th>
              <th className="text-left px-4 py-3 font-medium">{t('dl_table_stage')}</th>
              <th className="text-left px-4 py-3 font-medium">{t('dl_table_status')}</th>
              <th className="text-left px-4 py-3 font-medium">{t('dl_table_updated')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockDeals.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/enterprise/projects/${d.projectId}`}
                    className="font-medium hover:text-brand-700"
                  >
                    {b(d.projectName)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{d.investor}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatUsd(d.amountUsd, lang)}
                </td>
                <td className="px-4 py-3">
                  <span className="chip bg-slate-100 text-slate-600">
                    {t(dealStageDictKey[d.stage])}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={'chip ' + STATUS_TONE[d.status]}>
                    {t(STATUS_KEY[d.status])}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(d.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

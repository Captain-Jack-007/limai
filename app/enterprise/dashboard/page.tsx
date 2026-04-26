'use client';

import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Briefcase,
  ClipboardCheck,
  Layers,
  Percent,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import {
  mockKpis,
  mockEnterpriseProjects,
  pipelineStages,
  pipelineStageDictKey,
  industryDistribution,
  monthlyDealFlow,
  aiInsights,
} from '@/lib/enterprise-data';
import EnterpriseCharts from '@/components/EnterpriseCharts';
import type { DictKey } from '@/lib/i18n';

const kpiMeta: Record<
  string,
  { titleKey: DictKey; icon: any; tone: string }
> = {
  projects: { titleKey: 'ed_kpi_projects', icon: Layers, tone: 'text-brand-600 bg-brand-50' },
  evaluations: { titleKey: 'ed_kpi_evaluations', icon: ClipboardCheck, tone: 'text-amber-600 bg-amber-50' },
  matches: { titleKey: 'ed_kpi_matches', icon: Briefcase, tone: 'text-emerald-600 bg-emerald-50' },
  conversion: { titleKey: 'ed_kpi_conversion', icon: Percent, tone: 'text-fuchsia-600 bg-fuchsia-50' },
};

export default function EnterpriseDashboardPage() {
  const { t, b, lang } = useLang();

  const projectsByStage = pipelineStages.map((s) => ({
    stage: t(pipelineStageDictKey[s]),
    count: mockEnterpriseProjects.filter((p) => p.pipeline === s).length,
  }));

  const industryData = industryDistribution.map((d) => ({
    name: b(d.name),
    value: d.value,
  }));

  const dealFlowData = monthlyDealFlow.map((m) => ({
    month: m.month.slice(5),
    submitted: m.submitted,
    matched: m.matched,
    closed: m.closed,
  }));

  const recent = [...mockEnterpriseProjects]
    .sort((a, b2) => (a.updatedAt < b2.updatedAt ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <span className="chip bg-white border border-slate-200 text-slate-500">
          <Sparkles size={12} className="text-brand-600" />
          {t('ed_chip')}
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{t('ed_title')}</h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">{t('ed_subhead')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKpis.map((kpi) => {
          const meta = kpiMeta[kpi.key];
          const Icon = meta.icon;
          const positive = kpi.delta >= 0;
          return (
            <div key={kpi.key} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500">{t(meta.titleKey)}</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">
                    {kpi.value.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                    {kpi.unit === '%' ? '%' : ''}
                  </div>
                </div>
                <div className={`w-9 h-9 rounded-lg grid place-items-center ${meta.tone}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div
                className={
                  'mt-3 inline-flex items-center gap-1 text-xs font-medium ' +
                  (positive ? 'text-emerald-600' : 'text-rose-600')
                }
              >
                {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {positive ? '+' : ''}
                {kpi.delta}% {lang === 'zh' ? '环比' : 'vs prev.'}
              </div>
            </div>
          );
        })}
      </div>

      <EnterpriseCharts
        pipelineData={projectsByStage}
        industryData={industryData}
        dealFlowData={dealFlowData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-1 bg-gradient-to-br from-brand-50 via-white to-fuchsia-50/40 border-brand-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white grid place-items-center text-brand-600 shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold">{t('ed_aiInsight')}</div>
              <div className="text-[11px] text-slate-500">{t('ed_aiInsightSub')}</div>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {aiInsights.slice(0, 3).map((ins, i) => (
              <li key={i} className="text-sm text-slate-700 leading-relaxed">
                <span className="text-brand-600 mr-1.5">●</span>
                {b(ins)}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{t('ed_recent')}</div>
            <Link
              href="/enterprise/pipeline"
              className="text-xs text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 font-medium"
            >
              {t('ed_viewAll')} <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/enterprise/projects/${p.id}`}
                className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{b(p.name)}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {b(p.scientist)} · {b(p.org)} · {b(p.industry)}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="chip bg-slate-100 text-slate-600">
                    TRL {p.trl}
                  </span>
                  <span className="chip bg-brand-50 text-brand-700">
                    {p.score}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

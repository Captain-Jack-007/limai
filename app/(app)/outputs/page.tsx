'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Presentation,
  Map,
  Users,
  Download,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  activeProject,
  mockEvaluation,
  mockInvestors,
  mockPitchDeck,
  mockRoadmap,
} from '@/lib/mock-data';
import { useLang } from '@/components/LanguageProvider';
import type { DictKey } from '@/lib/i18n';

type Tab = 'report' | 'deck' | 'roadmap' | 'investors';

const tabs: { key: Tab; labelKey: DictKey; icon: any }[] = [
  { key: 'report', labelKey: 'out_tab_report', icon: FileText },
  { key: 'deck', labelKey: 'out_tab_deck', icon: Presentation },
  { key: 'roadmap', labelKey: 'out_tab_roadmap', icon: Map },
  { key: 'investors', labelKey: 'out_tab_investors', icon: Users },
];

function OutputsBody() {
  const params = useSearchParams();
  const initial = (params.get('tab') as Tab) || 'report';
  const [tab, setTab] = useState<Tab>(initial);
  const { t, b } = useLang();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 no-print">
        <div>
          <div className="inline-flex items-center gap-1.5 chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 mb-2">
            <Sparkles size={12} /> {t('out_chip')}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {b(activeProject.name)}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('out_subhead')}</p>
        </div>
        <button onClick={() => window.print()} className="btn-primary">
          <Download size={14} /> {t('out_export')}
        </button>
      </div>

      <div className="card p-1 inline-flex no-print">
        {tabs.map(({ key, labelKey, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              'flex items-center gap-2 px-3.5 py-1.5 text-sm rounded-lg transition-colors ' +
              (tab === key
                ? 'bg-ink-900 text-white'
                : 'text-slate-600 hover:bg-slate-100')
            }
          >
            <Icon size={14} />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {tab === 'report' && <ReportView />}
      {tab === 'deck' && <DeckView />}
      {tab === 'roadmap' && <RoadmapView />}
      {tab === 'investors' && <InvestorsView />}
    </div>
  );
}

function ReportView() {
  const ev = mockEvaluation;
  const { lang, t, b } = useLang();
  const summaryTpl = lang === 'zh' ? t('out_summary_zh') : t('out_summary_en');
  const summary = summaryTpl
    .replace('{name}', b(activeProject.name))
    .replace('{field}', b(ev.overview.field))
    .replace('{innovation}', b(ev.overview.innovation))
    .replace('{application}', b(ev.overview.application))
    .replace('{trl}', String(ev.scores[0].value))
    .replace('{market}', String(ev.scores[1].value));
  return (
    <article className="card p-8 space-y-6 print:shadow-none print:border-0">
      <header className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-fuchsia-500 text-white grid place-items-center">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="font-semibold text-sm">{t('out_reportTitle')}</div>
            <div className="text-xs text-slate-500">
              {new Date().toLocaleDateString(
                lang === 'zh' ? 'zh-CN' : 'en-US',
                { dateStyle: 'long' }
              )}
            </div>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium">{b(activeProject.name)}</div>
          <div className="text-slate-500 text-xs">{b(activeProject.field)}</div>
        </div>
      </header>
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ev.scores.map((s) => (
          <div key={s.key} className="border border-slate-200 rounded-xl p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">
              {b(s.label)}
            </div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">
              {s.value}
              <span className="text-base text-slate-400">/{s.scale}</span>
            </div>
          </div>
        ))}
      </section>
      <section>
        <h2 className="text-sm font-semibold mb-2">
          {t('out_executiveSummary')}
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
      </section>
      <section>
        <h2 className="text-sm font-semibold mb-2">{t('out_keyInsights')}</h2>
        <ul className="text-sm space-y-1.5 text-slate-700 list-disc pl-5 marker:text-brand-500">
          {ev.insights.map((i, idx) => (
            <li key={idx}>{b(i)}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-semibold mb-2">{t('out_risks')}</h2>
        <ul className="text-sm space-y-1.5 text-slate-700 list-disc pl-5 marker:text-rose-400">
          {ev.risks.map((r, idx) => (
            <li key={idx}>{b(r)}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-semibold mb-2">{t('out_nextSteps')}</h2>
        <ol className="text-sm space-y-1.5 text-slate-700 list-decimal pl-5 marker:text-slate-400">
          {ev.nextSteps.map((n, idx) => (
            <li key={idx}>{b(n)}</li>
          ))}
        </ol>
      </section>
      <footer className="pt-4 border-t border-slate-200 text-xs text-slate-500">
        {t('out_footer')}
      </footer>
    </article>
  );
}

function DeckView() {
  const { lang, t, b } = useLang();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {mockPitchDeck.map((s) => (
        <div
          key={s.index}
          className="card aspect-[16/10] p-5 flex flex-col bg-gradient-to-br from-white to-slate-50"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider">
            <span>
              {lang === 'zh'
                ? `${t('out_slide')} ${s.index} ${t('out_slideSuffix')}`
                : `${t('out_slide')} ${s.index}`}
            </span>
            <span>{b(activeProject.name)}</span>
          </div>
          <h3 className="text-lg font-semibold mt-2">{b(s.title)}</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5 marker:text-brand-500">
            {s.bullets.map((bl, idx) => (
              <li key={idx}>{b(bl)}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function RoadmapView() {
  const { b } = useLang();
  return (
    <div className="card p-6">
      <ol className="relative border-l-2 border-slate-200 ml-3 space-y-5">
        {mockRoadmap.map((m, idx) => (
          <li key={idx} className="pl-5">
            <span className="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 ring-4 ring-white" />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={12} /> {b(m.quarter)}
            </div>
            <div className="font-medium text-sm mt-0.5">{b(m.title)}</div>
            <div className="text-sm text-slate-600 mt-0.5">{b(m.detail)}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function InvestorsView() {
  const { b } = useLang();
  return (
    <div className="card divide-y divide-slate-100">
      {mockInvestors.map((i) => (
        <div key={i.id} className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center text-slate-500">
            <Users size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{i.name}</div>
            <div className="text-xs text-slate-500 line-clamp-1">
              {b(i.focus)} · {b(i.stage)} · {b(i.region)}
            </div>
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {i.matchScore}%
          </div>
        </div>
      ))}
    </div>
  );
}

function OutputsLoading() {
  const { t } = useLang();
  return <div className="p-6 text-sm text-slate-400">{t('loading')}</div>;
}

export default function OutputsPage() {
  return (
    <Suspense fallback={<OutputsLoading />}>
      <OutputsBody />
    </Suspense>
  );
}

'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Sparkles,
  User2,
  Building2,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import {
  mockEnterpriseProjects,
  mockExperts,
  pipelineStageDictKey,
} from '@/lib/enterprise-data';
import { mockInvestors } from '@/lib/mock-data';

const VOTE_META = {
  approve: { icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
  reject: { icon: XCircle, tone: 'text-rose-600 bg-rose-50' },
  revision: { icon: AlertCircle, tone: 'text-amber-600 bg-amber-50' },
} as const;

export default function EnterpriseProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { t, b, lang } = useLang();
  const project = mockEnterpriseProjects.find((p) => p.id === params.id);
  if (!project) notFound();

  const tech = Math.min(10, Math.round(project.score / 10));
  const market = Math.max(4, Math.min(10, Math.round(project.score / 11) + 1));
  const team = Math.max(4, Math.min(10, Math.round(project.score / 12) + 2));
  const scale = Math.max(4, Math.min(10, Math.round(project.trl + 2)));
  const final = Math.round((tech + market + team + scale) * 2.5);

  const criteria = [
    { key: 'pd_critTech', value: tech },
    { key: 'pd_critMarket', value: market },
    { key: 'pd_critTeam', value: team },
    { key: 'pd_critScale', value: scale },
  ] as const;

  const recommendedInvestors = mockInvestors.slice(0, 3);
  const expertPanel = mockExperts.slice(0, 3);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/enterprise/pipeline"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={12} />
          {t('pd_back')}
        </Link>
        <div className="flex items-center gap-2">
          <button className="btn-outline">
            <ClipboardCheck size={14} />
            {t('pd_assignExpert')}
          </button>
          <button className="btn-accent">
            {t('pd_action_advance')}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="chip bg-brand-50 text-brand-700">
                {t(pipelineStageDictKey[project.pipeline])}
              </span>
              <span className="chip bg-slate-100 text-slate-600">TRL {project.trl}</span>
              <span className="chip bg-slate-100 text-slate-600">{b(project.industry)}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">{b(project.name)}</h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">{b(project.summary)}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">{t('pd_aiScore')}</div>
            <div className="text-3xl font-semibold gradient-text">{project.score}</div>
            <div className="text-[11px] text-slate-400">/ 100</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-5">
            <div className="text-sm font-semibold mb-3">{t('pd_overview')}</div>
            <dl className="space-y-3 text-sm">
              <Field icon={User2} label={t('pd_scientist')} value={b(project.scientist)} />
              <Field icon={Building2} label={t('pd_org')} value={b(project.org)} />
              <Field icon={Briefcase} label={t('pd_industry')} value={b(project.industry)} />
              <Field
                icon={Calendar}
                label={t('pd_submitted')}
                value={new Date(project.submittedAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
              />
              <Field
                icon={Calendar}
                label={t('pd_updated')}
                value={new Date(project.updatedAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
              />
              {project.evaluator && (
                <Field icon={ClipboardCheck} label={t('pd_evaluator')} value={b(project.evaluator)} />
              )}
            </dl>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold mb-3">{t('pd_files')}</div>
            <ul className="space-y-2 text-sm">
              {['Whitepaper.pdf', 'Patent-Filing.pdf', 'Lab-Validation.xlsx'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer">
                  <FileText size={14} className="text-slate-400" />
                  <span className="truncate">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand-600" />
              <div className="text-sm font-semibold">{t('pd_evalTitle')}</div>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t('pd_evalSub')}</p>
            <ul className="mt-4 space-y-3">
              {criteria.map((c) => (
                <li key={c.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{t(c.key)}</span>
                    <span className="font-medium">{c.value}/10</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-fuchsia-500"
                      style={{ width: `${c.value * 10}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium">{t('pd_critFinal')}</span>
              <span className="text-xl font-semibold gradient-text">{final}/100</span>
            </div>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold mb-3">{t('pd_expertPanel')}</div>
            <div className="space-y-3">
              {expertPanel.map((ex) => {
                const meta = ex.vote ? VOTE_META[ex.vote] : null;
                const VIcon = meta?.icon;
                return (
                  <div key={ex.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center text-slate-500 shrink-0">
                      <User2 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium truncate">{b(ex.name)}</div>
                        {meta && VIcon && (
                          <span className={'chip ' + meta.tone}>
                            <VIcon size={11} />
                            {ex.vote === 'approve'
                              ? t('pd_voteApprove')
                              : ex.vote === 'reject'
                                ? t('pd_voteReject')
                                : t('pd_voteRevision')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {b(ex.field)} · {b(ex.org)}
                      </div>
                      {ex.comment && (
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{b(ex.comment)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5">
            <div className="text-sm font-semibold mb-3">{t('pd_recInvestors')}</div>
            <div className="space-y-2.5">
              {recommendedInvestors.map((inv) => (
                <div key={inv.id} className="p-3 rounded-lg border border-slate-100 hover:border-brand-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">{inv.name}</div>
                    <span className="chip bg-brand-50 text-brand-700">{inv.matchScore}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{b(inv.focus)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold mb-3">{t('pd_actions')}</div>
            <div className="space-y-2">
              <button className="btn-outline w-full justify-between">
                {t('pd_action_match')}
                <ArrowRight size={14} />
              </button>
              <button className="btn-outline w-full justify-between">
                {t('pd_action_report')}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-slate-500">{label}</div>
        <div className="text-sm text-slate-800 truncate">{value}</div>
      </div>
    </div>
  );
}

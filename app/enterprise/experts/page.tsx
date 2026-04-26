'use client';

import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  User2,
  Star,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { mockExperts } from '@/lib/enterprise-data';

const VOTE_META = {
  approve: {
    icon: CheckCircle2,
    tone: 'text-emerald-600 bg-emerald-50',
    keyApprove: true,
  },
  reject: { icon: XCircle, tone: 'text-rose-600 bg-rose-50' },
  revision: { icon: AlertCircle, tone: 'text-amber-600 bg-amber-50' },
} as const;

export default function ExpertsPage() {
  const { t, b } = useLang();
  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('ex_title')}</h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">{t('ex_subhead')}</p>
        </div>
        <button className="btn-accent">
          <Plus size={14} />
          {t('ex_addExpert')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockExperts.map((ex) => {
          const meta = ex.vote ? VOTE_META[ex.vote] : null;
          const VIcon = meta?.icon;
          return (
            <div key={ex.id} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 grid place-items-center text-white shrink-0">
                  <User2 size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold truncate">{b(ex.name)}</div>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-medium shrink-0">
                      <Star size={12} fill="currentColor" />
                      {ex.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {b(ex.field)} · {b(ex.org)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                  <span className="font-medium text-ink-900">{ex.assigned}</span>{' '}
                  {t('ex_assignedProjects')}
                </span>
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

              {ex.comment && (
                <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  “{b(ex.comment)}”
                </p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button className="btn-outline flex-1 justify-center text-xs py-1.5">
                  {t('ex_request')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

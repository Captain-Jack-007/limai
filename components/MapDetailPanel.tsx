'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  X,
  Send,
  UserPlus,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import {
  type EnterpriseProject,
  type MapNode,
  pipelineStageDictKey,
} from '@/lib/enterprise-data';

type Props = {
  selected: MapNode | null;
  related: EnterpriseProject[];
  onClose: () => void;
  onPickRelated: (id: string) => void;
};

export default function MapDetailPanel({
  selected,
  related,
  onClose,
  onPickRelated,
}: Props) {
  const { t, b } = useLang();
  if (!selected) {
    return (
      <aside className="absolute right-4 top-[88px] z-10 w-80 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-6 text-center">
        <div className="text-xs text-slate-400 leading-relaxed">{t('map_empty')}</div>
      </aside>
    );
  }

  const p = selected.project;
  const c = selected.cluster;

  // A small "why this matters" narrative derived from project signals.
  const whyEn = `Score ${p.score}/100 with TRL ${p.trl}, sitting in the ${c.id.replace(/_/g, ' ')} cluster — currently in ${p.pipeline.replace(/_/g, ' ')}. Strong signal for ${b(p.industry).toLowerCase()} portfolio coverage.`;
  const whyZh = `综合评分 ${p.score}/100，TRL ${p.trl}，位于 ${t(c.nameKey)} 集群，处于 ${t(pipelineStageDictKey[p.pipeline])} 阶段。是 ${b(p.industry)} 赛道的关键覆盖项目。`;

  return (
    <aside className="absolute right-4 top-[88px] z-10 w-80 max-h-[calc(100vh-7.5rem)] overflow-y-auto rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-5 space-y-4 text-slate-100">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: c.color, boxShadow: `0 0 10px ${c.color}` }}
            />
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {t(c.nameKey)}
            </span>
          </div>
          <h3 className="mt-1 text-base font-semibold leading-snug text-white">{b(p.name)}</h3>
        </div>
        <button
          onClick={onClose}
          aria-label={t('map_close')}
          className="w-7 h-7 grid place-items-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{b(p.summary)}</p>

      <div className="grid grid-cols-3 gap-2">
        <Stat label={t('map_score')} value={String(p.score)} accent />
        <Stat label={t('map_trl')} value={String(p.trl)} />
        <Stat label={t('map_stage')} value={t(pipelineStageDictKey[p.pipeline])} />
      </div>

      <div className="text-xs text-slate-300 space-y-1">
        <Row label={t('map_scientist')} value={b(p.scientist)} />
        <Row label={t('map_org')} value={b(p.org)} />
        <Row label={t('map_filter_industry')} value={b(p.industry)} />
      </div>

      {/* Why this matters */}
      <div className="rounded-lg p-3 bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 border border-indigo-500/30">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-semibold">
          <Sparkles size={11} />
          {t('map_why_title')}
        </div>
        <p className="mt-1.5 text-[11px] text-slate-200 leading-relaxed">
          {b({ en: whyEn, zh: whyZh })}
        </p>
      </div>

      {/* Related projects */}
      {related.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1.5">
            {t('map_related_title')}
          </div>
          <div className="space-y-1">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => onPickRelated(r.id)}
                className="w-full flex items-center justify-between gap-2 text-left px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <span className="text-xs text-slate-200 truncate">{b(r.name)}</span>
                <span className="text-[10px] text-slate-400 shrink-0">{r.score}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested actions */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1.5">
          {t('map_actions_title')}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <ActionBtn icon={UserPlus} label={t('map_action_assign')} />
          <ActionBtn icon={Send} label={t('map_action_match')} />
          <ActionBtn icon={FileText} label={t('map_action_report')} />
        </div>
      </div>

      <Link
        href={`/enterprise/projects/${p.id}`}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white text-slate-900 text-sm font-medium hover:bg-slate-200 transition"
      >
        {t('map_open_project')}
        <ArrowUpRight size={14} />
      </Link>
    </aside>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg px-2.5 py-1.5 border ${accent ? 'bg-indigo-500/15 border-indigo-500/30' : 'bg-white/5 border-white/10'}`}>
      <div className="text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`text-xs font-semibold truncate ${accent ? 'text-white' : 'text-slate-200'}`}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-xs text-slate-200 truncate">{value}</span>
    </div>
  );
}

function ActionBtn({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button
      title={label}
      aria-label={label}
      className="flex flex-col items-center gap-1 py-2 rounded-md bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition"
    >
      <Icon size={13} />
      <span className="text-[9px] leading-none text-center">{label}</span>
    </button>
  );
}

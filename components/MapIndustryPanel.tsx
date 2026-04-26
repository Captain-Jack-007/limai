'use client';

import { ArrowUpRight, X, Sparkles } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import {
  type AmbientNode,
  type EnterpriseProject,
  pipelineStageDictKey,
} from '@/lib/enterprise-data';

type Props = {
  industry: AmbientNode;
  matches: EnterpriseProject[];
  fallback: boolean;
  onClose: () => void;
  onPickProject: (id: string) => void;
};

export default function MapIndustryPanel({
  industry,
  matches,
  fallback,
  onClose,
  onPickProject,
}: Props) {
  const { t, b } = useLang();
  const c = industry.cluster;

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
          <h3 className="mt-1 text-base font-semibold leading-snug text-white">
            {b(industry.label)}
          </h3>
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            {t('map_industry_label')}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={t('map_close')}
          className="w-7 h-7 grid place-items-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      {/* Headline: how many projects matched */}
      <div className="rounded-lg p-3 bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 border border-indigo-500/30">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-semibold">
          <Sparkles size={11} />
          {fallback ? t('map_industry_no_match') : t('map_industry_match_title')}
        </div>
        <p className="mt-1.5 text-[11px] text-slate-200 leading-relaxed">
          {fallback
            ? t('map_industry_fallback_body')
            : t('map_industry_match_body').replace(
                '{n}',
                String(matches.length)
              )}
        </p>
      </div>

      {/* Matching projects list */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1.5">
          {fallback
            ? t('map_industry_in_cluster')
            : t('map_industry_matches_list')}
        </div>
        {matches.length === 0 ? (
          <div className="text-xs text-slate-400 px-1 py-2">
            {t('map_empty')}
          </div>
        ) : (
          <div className="space-y-1.5">
            {matches.map((p) => (
              <button
                key={p.id}
                onClick={() => onPickProject(p.id)}
                className="w-full text-left rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition px-3 py-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-100 truncate">
                      {b(p.name)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {b(p.industry)} · TRL {p.trl} ·{' '}
                      {t(pipelineStageDictKey[p.pipeline])}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        background: `${c.color}22`,
                        color: c.color,
                      }}
                    >
                      {p.score}
                    </span>
                    <ArrowUpRight
                      size={12}
                      className="text-slate-500 group-hover:text-white transition"
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

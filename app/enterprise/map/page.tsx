'use client';

import { useMemo, useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import InnovationMap from '@/components/InnovationMap';
import MapDetailPanel from '@/components/MapDetailPanel';
import MapIndustryPanel from '@/components/MapIndustryPanel';
import {
  type AmbientNode,
  buildAmbientNodes,
  buildMapNodes,
  clusters,
  industryDistribution,
  pipelineStageDictKey,
  pipelineStages,
  projectsForSubdomain,
  relatedProjects,
} from '@/lib/enterprise-data';

export default function MapPage() {
  const { t, b } = useLang();
  const allNodes = useMemo(() => buildMapNodes(), []);
  const ambient = useMemo(() => buildAmbientNodes(), []);

  const [q, setQ] = useState('');
  const [industry, setIndustry] = useState<string>('all');
  const [trl, setTrl] = useState<string>('all');
  const [stage, setStage] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<AmbientNode | null>(
    null
  );
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Mutually exclusive selections: clicking a project clears the industry,
  // clicking an industry clears the project.
  function pickProject(id: string | null) {
    setSelectedId(id);
    if (id) setSelectedIndustry(null);
  }
  function pickIndustry(a: AmbientNode) {
    setSelectedIndustry(a);
    setSelectedId(null);
  }

  const matched = useMemo(() => {
    const set = new Set<string>();
    const ql = q.trim().toLowerCase();
    for (const n of allNodes) {
      const p = n.project;
      if (industry !== 'all' && p.industry.en !== industry) continue;
      if (trl !== 'all') {
        const lo = parseInt(trl, 10);
        if (p.trl < lo || p.trl > lo + 2) continue;
      }
      if (stage !== 'all' && p.pipeline !== stage) continue;
      if (ql) {
        const hay = (
          p.name.en +
          p.name.zh +
          p.industry.en +
          p.industry.zh +
          p.summary.en +
          p.summary.zh
        ).toLowerCase();
        if (!hay.includes(ql)) continue;
      }
      set.add(p.id);
    }
    return set;
  }, [allNodes, q, industry, trl, stage]);

  const selectedNode = selectedId
    ? allNodes.find((n) => n.project.id === selectedId) ?? null
    : null;

  // Projects matched by the currently selected sub-industry dot.
  const industryMatches = useMemo(() => {
    if (!selectedIndustry) return null;
    return projectsForSubdomain(
      selectedIndustry.label,
      selectedIndustry.cluster,
      8
    );
  }, [selectedIndustry]);

  function reset() {
    setQ('');
    setIndustry('all');
    setTrl('all');
    setStage('all');
  }
  const anyFilter =
    !!q || industry !== 'all' || trl !== 'all' || stage !== 'all';

  return (
    // Break out of the layout's p-6 padding so the canvas fills everything below the TopBar (h-14 = 3.5rem).
    <div className="-m-6 relative h-[calc(100vh-3.5rem)] bg-[#05060d] text-slate-100 overflow-hidden">
      <InnovationMap
        nodes={allNodes}
        ambient={ambient}
        matchedIds={anyFilter ? matched : new Set()}
        selectedId={selectedId}
        onSelect={pickProject}
        selectedIndustry={
          selectedIndustry
            ? {
                clusterId: selectedIndustry.cluster.id,
                en: selectedIndustry.label.en,
              }
            : null
        }
        onSelectIndustry={pickIndustry}
      />

      {/* Top: title chip + search + filter toggle */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-start gap-3 pointer-events-none">
        <div className="pointer-events-auto px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            {t('ent_brand_tagline')}
          </div>
          <div className="text-sm font-semibold text-white leading-tight mt-0.5">
            {t('map_title')}
          </div>
        </div>
        <div className="flex-1" />
        <div className="pointer-events-auto relative w-full max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('map_search_ph')}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
          />
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="pointer-events-auto px-3 h-[42px] rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 backdrop-blur-md inline-flex items-center gap-1.5 text-sm"
        >
          <SlidersHorizontal size={14} />
          {t('map_filters')}
        </button>
      </div>

      {/* Floating left filter panel */}
      {filtersOpen && (
        <aside className="absolute left-4 top-[88px] z-10 w-64 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-4 space-y-3 max-h-[calc(100vh-7.5rem)] overflow-y-auto">
          <FilterRow label={t('map_filter_industry')}>
            <Select
              value={industry}
              onChange={setIndustry}
              options={[
                { v: 'all', label: t('map_filter_all') },
                ...industryDistribution.map((i) => ({
                  v: i.name.en,
                  label: b(i.name),
                })),
              ]}
            />
          </FilterRow>
          <FilterRow label={t('map_filter_trl')}>
            <Select
              value={trl}
              onChange={setTrl}
              options={[
                { v: 'all', label: t('map_filter_all') },
                { v: '1', label: 'TRL 1–3' },
                { v: '4', label: 'TRL 4–6' },
                { v: '7', label: 'TRL 7–9' },
              ]}
            />
          </FilterRow>
          <FilterRow label={t('map_filter_stage')}>
            <Select
              value={stage}
              onChange={setStage}
              options={[
                { v: 'all', label: t('map_filter_all') },
                ...pipelineStages.map((s) => ({
                  v: s,
                  label: t(pipelineStageDictKey[s]),
                })),
              ]}
            />
          </FilterRow>

          {anyFilter && (
            <button
              onClick={reset}
              className="w-full text-[11px] text-slate-400 hover:text-white inline-flex items-center justify-center gap-1 py-1"
            >
              <X size={11} />
              {t('map_filter_reset')}
            </button>
          )}

          <div className="pt-3 border-t border-white/10">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">
              {t('map_legend_short')}
            </div>
            <div className="space-y-1.5">
              {clusters.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 text-xs text-slate-300"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: c.color,
                      boxShadow: `0 0 8px ${c.color}`,
                    }}
                  />
                  {t(c.nameKey)}
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Right floating panel — industry mode takes priority over project mode */}
      {selectedIndustry && industryMatches ? (
        <MapIndustryPanel
          industry={selectedIndustry}
          matches={industryMatches.matches}
          fallback={industryMatches.fallback}
          onClose={() => setSelectedIndustry(null)}
          onPickProject={pickProject}
        />
      ) : (
        <MapDetailPanel
          selected={selectedNode}
          related={selectedNode ? relatedProjects(selectedNode.project, 3) : []}
          onClose={() => pickProject(null)}
          onPickRelated={pickProject}
        />
      )}

      {/* Bottom-center status pill */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] text-slate-300">
        <span className="font-semibold text-white">
          {anyFilter ? matched.size : allNodes.length}
        </span>
        <span className="text-slate-500 mx-1">/</span>
        <span>{allNodes.length}</span>
        <span className="ml-1.5 text-slate-400">
          {anyFilter ? t('map_results') : t('map_total_projects')}
        </span>
      </div>

      {/* Floating AI narrative (bottom-left) — hidden when any panel is open */}
      {!selectedNode && !selectedIndustry && (
        <div className="absolute bottom-5 left-4 z-10 max-w-xs rounded-xl p-4 bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 border border-indigo-500/30 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-semibold">
            <Sparkles size={11} />
            {t('map_insight_title')}
          </div>
          <p className="mt-1.5 text-xs text-slate-200 leading-relaxed">
            {t('map_insight_body')}
          </p>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2.5 py-1.5 rounded-md bg-[#0b1020] border border-white/10 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
    >
      {options.map((o) => (
        <option key={o.v} value={o.v} className="bg-[#0b1020]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

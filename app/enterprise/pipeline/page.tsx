'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, Table2 } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import {
  mockEnterpriseProjects,
  pipelineStages,
  pipelineStageDictKey,
  type EnterpriseProject,
  type PipelineStage,
} from '@/lib/enterprise-data';
import PipelineKanban from '@/components/PipelineKanban';

export default function PipelinePage() {
  const { t, b } = useLang();
  const [projects, setProjects] = useState<EnterpriseProject[]>(mockEnterpriseProjects);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState<string>('all');

  const industries = useMemo(() => {
    const set = new Set(projects.map((p) => p.industry.en));
    return Array.from(set);
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (industry !== 'all' && p.industry.en !== industry) return false;
      if (!q) return true;
      return (
        p.name.en.toLowerCase().includes(q) ||
        p.name.zh.includes(query) ||
        p.scientist.en.toLowerCase().includes(q) ||
        p.scientist.zh.includes(query) ||
        p.industry.en.toLowerCase().includes(q)
      );
    });
  }, [projects, query, industry]);

  function moveProject(id: string, target: PipelineStage) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, pipeline: target, updatedAt: new Date().toISOString() } : p,
      ),
    );
  }

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('ep_title')}</h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">{t('ep_subhead')}</p>
        </div>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium">
          <button
            onClick={() => setView('kanban')}
            className={
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ' +
              (view === 'kanban' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')
            }
          >
            <LayoutGrid size={14} />
            {t('ep_view_kanban')}
          </button>
          <button
            onClick={() => setView('table')}
            className={
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ' +
              (view === 'table' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')
            }
          >
            <Table2 size={14} />
            {t('ep_view_table')}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ep_searchPlaceholder')}
            className="input pl-9"
          />
        </div>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="input w-auto"
        >
          <option value="all">{t('ep_industryAll')}</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {view === 'kanban' ? (
        <PipelineKanban projects={filtered} onMove={moveProject} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">{t('ep_table_project')}</th>
                <th className="text-left px-4 py-2.5 font-medium">{t('ep_table_scientist')}</th>
                <th className="text-left px-4 py-2.5 font-medium">{t('ep_industry')}</th>
                <th className="text-left px-4 py-2.5 font-medium">{t('ep_table_stage')}</th>
                <th className="text-right px-4 py-2.5 font-medium">{t('ep_score')}</th>
                <th className="text-right px-4 py-2.5 font-medium">{t('ep_trl')}</th>
                <th className="text-left px-4 py-2.5 font-medium">{t('ep_table_updated')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/enterprise/projects/${p.id}`} className="font-medium hover:text-brand-700">
                      {b(p.name)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b(p.scientist)}</td>
                  <td className="px-4 py-3 text-slate-600">{b(p.industry)}</td>
                  <td className="px-4 py-3">
                    <span className="chip bg-slate-100 text-slate-600">
                      {t(pipelineStageDictKey[p.pipeline])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{p.score}</td>
                  <td className="px-4 py-3 text-right text-slate-600">TRL {p.trl}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

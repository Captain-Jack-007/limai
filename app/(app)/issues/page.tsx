'use client';

import { useMemo, useState } from 'react';
import IssueRow from '@/components/IssueRow';
import { mockRisk } from '@/lib/mock-data';
import type { RiskCategory, RiskLevel } from '@/lib/types';

const categories: { value: RiskCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'employment', label: '用工' },
  { value: 'expense', label: '费用' },
  { value: 'tax', label: '税务' },
  { value: 'entity', label: '主体' },
];

const levels: { value: RiskLevel | 'all'; label: string }[] = [
  { value: 'all', label: '全部级别' },
  { value: 'high', label: '高风险' },
  { value: 'medium', label: '中风险' },
  { value: 'low', label: '低风险' },
];

export default function IssuesPage() {
  const [cat, setCat] = useState<RiskCategory | 'all'>('all');
  const [lvl, setLvl] = useState<RiskLevel | 'all'>('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    return mockRisk.issues
      .filter((i) => (cat === 'all' ? true : i.category === cat))
      .filter((i) => (lvl === 'all' ? true : i.severity === lvl))
      .filter((i) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          i.title.toLowerCase().includes(s) ||
          i.titleZh.includes(q) ||
          i.summary.toLowerCase().includes(s) ||
          i.id.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => b.score - a.score);
  }, [cat, lvl, q]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">风险问题</h1>
        <p className="text-sm text-slate-500">
          共检测出 {mockRisk.issues.length} 条问题，涵盖 4 个类别
        </p>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="按关键词、编号或中文搜索…"
          className="input flex-1 min-w-[220px]"
        />
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={
                'px-3 py-1.5 text-xs rounded-md transition-colors ' +
                (cat === c.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900')
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <select
          value={lvl}
          onChange={(e) => setLvl(e.target.value as RiskLevel | 'all')}
          className="input w-auto"
        >
          {levels.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            当前筛选条件下没有匹配的问题。
          </div>
        ) : (
          filtered.map((i) => <IssueRow key={i.id} issue={i} />)
        )}
      </div>
    </div>
  );
}

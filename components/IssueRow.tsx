import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import type { Issue } from '@/lib/types';

const categoryLabels: Record<Issue['category'], string> = {
  employment: '用工',
  expense: '费用',
  tax: '税务',
  entity: '主体',
};

export default function IssueRow({ issue }: { issue: Issue }) {
  return (
    <Link
      href={`/issues/${issue.id}`}
      className="group flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
    >
      <div className="w-16 shrink-0 text-center">
        <div className="text-2xl font-semibold tabular-nums">{issue.score}</div>
        <div className="text-[10px] text-slate-400 tracking-wide">评分</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <SeverityBadge level={issue.severity} />
          <span className="chip bg-slate-100 text-slate-600">
            {categoryLabels[issue.category]}
          </span>
          <span className="text-xs text-slate-400 font-mono">{issue.id}</span>
        </div>
        <div className="font-medium text-slate-800 truncate">{issue.title}</div>
        <div className="text-sm text-slate-500 mt-0.5 line-clamp-1">
          {issue.summary}
        </div>
      </div>
      <ChevronRight
        size={18}
        className="text-slate-300 group-hover:text-slate-500 transition-colors"
      />
    </Link>
  );
}

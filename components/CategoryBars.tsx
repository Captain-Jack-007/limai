import type { CategoryScore } from '@/lib/types';
import { levelFromScore } from '@/lib/types';

export default function CategoryBars({ items }: { items: CategoryScore[] }) {
  return (
    <div className="space-y-4">
      {items.map((c) => {
        const level = levelFromScore(c.score);
        const color =
          level === 'high'
            ? 'bg-red-500'
            : level === 'medium'
            ? 'bg-amber-500'
            : 'bg-emerald-500';
        return (
          <div key={c.key}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">{c.label}</span>
              <span className="tabular-nums text-slate-600">{c.score}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all`}
                style={{ width: `${c.score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

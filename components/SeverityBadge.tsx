import type { RiskLevel } from '@/lib/types';

const styles: Record<RiskLevel, string> = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  high: 'bg-red-50 text-red-700 ring-red-200',
};

const labels: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

export default function SeverityBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`chip ring-1 ${styles[level]}`}
      aria-label={`风险等级 ${labels[level]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          level === 'high'
            ? 'bg-red-500'
            : level === 'medium'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`}
      />
      {labels[level]}
    </span>
  );
}

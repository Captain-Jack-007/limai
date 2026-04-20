import { levelFromScore } from '@/lib/types';

export default function RiskGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const level = levelFromScore(clamped);
  const color =
    level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#10b981';

  const radius = 72;
  const stroke = 14;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center">
      <svg width={200} height={120} viewBox="0 0 200 120" aria-hidden>
        <path
          d={`M 18 110 A ${radius} ${radius} 0 0 1 182 110`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M 18 110 A ${radius} ${radius} 0 0 1 182 110`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text
          x={100}
          y={92}
          textAnchor="middle"
          fontSize={34}
          fontWeight={700}
          fill="#0f172a"
        >
          {clamped}
        </text>
        <text x={100} y={112} textAnchor="middle" fontSize={11} fill="#64748b">
          / 100
        </text>
      </svg>
      <div
        className="chip ring-1 mt-1"
        style={{
          background:
            level === 'high'
              ? '#fef2f2'
              : level === 'medium'
              ? '#fffbeb'
              : '#ecfdf5',
          color,
        }}
      >
        {level === 'high' ? '高风险' : level === 'medium' ? '中风险' : '低风险'}
      </div>
    </div>
  );
}

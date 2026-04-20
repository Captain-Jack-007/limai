'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { mockRisk } from '@/lib/mock-data';

export function SalaryVsSocialChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={mockRisk.salaryVsSocial}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
        <YAxis
          stroke="#94a3b8"
          fontSize={12}
          tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(v: number) => `¥${v.toLocaleString()}`}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="salary"
          name="工资总额"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="social"
          name="社保缴费基数"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TaxBenchmarkChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={mockRisk.taxBenchmark}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
        <Tooltip
          formatter={(v: number) => `${v}%`}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="company"
          name="本企业"
          fill="#2563eb"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="industry"
          name="行业均值"
          fill="#94a3b8"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, FileText } from 'lucide-react';
import RiskGauge from '@/components/RiskGauge';
import CategoryBars from '@/components/CategoryBars';
import IssueRow from '@/components/IssueRow';
import { SalaryVsSocialChart, TaxBenchmarkChart } from '@/components/Charts';
import { mockRisk } from '@/lib/mock-data';

export default function DashboardPage() {
  const topIssues = [...mockRisk.issues]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const counts = {
    high: mockRisk.issues.filter((i) => i.severity === 'high').length,
    medium: mockRisk.issues.filter((i) => i.severity === 'medium').length,
    low: mockRisk.issues.filter((i) => i.severity === 'low').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">风险概览</h1>
          <p className="text-sm text-slate-500">
            {mockRisk.company} · {mockRisk.period} 的 AI 检测结果
          </p>
        </div>
        <Link href="/report" className="btn-primary">
          <FileText size={16} />
          生成报告
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col items-center justify-center">
          <div className="text-sm text-slate-500 mb-2">综合风险评分</div>
          <RiskGauge score={mockRisk.overallScore} />
          <div className="text-xs text-slate-400 mt-2">
            由各类别评分加权得出
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium">分类评分</div>
            <div className="flex gap-2 text-xs">
              <span className="chip bg-red-50 text-red-700">
                {counts.high} 高风险
              </span>
              <span className="chip bg-amber-50 text-amber-700">
                {counts.medium} 中风险
              </span>
              <span className="chip bg-emerald-50 text-emerald-700">
                {counts.low} 低风险
              </span>
            </div>
          </div>
          <CategoryBars items={mockRisk.categories} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">工资 vs 社保缴费基数</div>
              <div className="text-xs text-slate-500">
                月度工资总额与社保缴费基数对比
              </div>
            </div>
          </div>
          <SalaryVsSocialChart />
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">税负 vs 行业均值</div>
              <div className="text-xs text-slate-500">
                增值税 / 企业所得税 / 个人所得税 实际税率
              </div>
            </div>
          </div>
          <TaxBenchmarkChart />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="font-medium">主要风险问题</span>
          </div>
          <Link
            href="/issues"
            className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"
          >
            查看全部 <ArrowUpRight size={14} />
          </Link>
        </div>
        <div>
          {topIssues.map((i) => (
            <IssueRow key={i.id} issue={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Printer, ShieldCheck } from 'lucide-react';
import SeverityBadge from '@/components/SeverityBadge';
import CategoryBars from '@/components/CategoryBars';
import RiskGauge from '@/components/RiskGauge';
import { mockRisk } from '@/lib/mock-data';

export default function ReportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-semibold">审计级风险报告</h1>
          <p className="text-sm text-slate-500">
            打印友好版汇总。可使用浏览器打印功能另存为 PDF。
          </p>
        </div>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={16} />
          导出 PDF
        </button>
      </div>

      <div className="card p-8 space-y-6 print:shadow-none print:border-0">
        <header className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-600 text-white grid place-items-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="font-semibold">力迈 AI 税务风险报告</div>
              <div className="text-xs text-slate-500">
                生成时间：{new Date().toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium">{mockRisk.company}</div>
            <div className="text-slate-500 text-xs">
              期间：{mockRisk.period}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <RiskGauge score={mockRisk.overallScore} />
          </div>
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold mb-3">分类评分明细</h2>
            <CategoryBars items={mockRisk.categories} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-3">执行摘要</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            本企业综合税务风险评分为{' '}
            <strong>{mockRisk.overallScore} / 100</strong>，风险等级为{' '}
            <strong>
              {mockRisk.level === 'high'
                ? '高风险'
                : mockRisk.level === 'medium'
                ? '中风险'
                : '低风险'}
            </strong>
            。风险信号主要集中在用工类别（社保基数低于实际工资）和费用类别（无票支出偏高）。共有{' '}
            {mockRisk.issues.filter((i) => i.severity === 'high').length}{' '}
            条高风险问题需要立即关注。
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-3">问题清单</h2>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
            {mockRisk.issues
              .sort((a, b) => b.score - a.score)
              .map((i) => (
                <div key={i.id} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SeverityBadge level={i.severity} />
                    <span className="text-xs text-slate-400 font-mono">
                      {i.id}
                    </span>
                    <span className="ml-auto text-sm font-semibold tabular-nums">
                      {i.score}
                    </span>
                  </div>
                  <div className="font-medium text-sm">{i.title}</div>
                  <div className="text-sm text-slate-600 mt-1">{i.summary}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    <strong className="text-slate-700">法规依据：</strong>
                    {i.regulation}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    <strong className="text-slate-700">整改建议：</strong>
                    {i.recommendation}
                  </div>
                </div>
              ))}
          </div>
        </section>

        <footer className="pt-4 border-t border-slate-200 text-xs text-slate-500">
          本报告由力迈 AI 规则引擎与 AI
          解释层自动生成，仅供参考，不构成法律或税务意见。
        </footer>
      </div>
    </div>
  );
}

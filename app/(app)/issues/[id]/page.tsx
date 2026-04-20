import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Lightbulb,
  AlertOctagon,
  ClipboardList,
} from 'lucide-react';
import SeverityBadge from '@/components/SeverityBadge';
import { getIssueById } from '@/lib/mock-data';

const categoryLabels: Record<string, string> = {
  employment: '用工',
  expense: '费用',
  tax: '税务',
  entity: '主体',
};

export default function IssueDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const issue = getIssueById(params.id);
  if (!issue) return notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/issues"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} />
        返回问题列表
      </Link>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <SeverityBadge level={issue.severity} />
          <span className="chip bg-slate-100 text-slate-600">
            {categoryLabels[issue.category]}
          </span>
          <span className="text-xs text-slate-400 font-mono">{issue.id}</span>
          <div className="ml-auto text-right">
            <div className="text-3xl font-semibold tabular-nums">
              {issue.score}
            </div>
            <div className="text-[10px] text-slate-400 tracking-wide">
              风险评分
            </div>
          </div>
        </div>
        <h1 className="text-xl font-semibold">{issue.title}</h1>
        <p className="text-sm text-slate-600 mt-2">{issue.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section
          icon={<AlertOctagon size={16} className="text-red-500" />}
          title="问题分析"
        >
          <p className="text-sm text-slate-700 leading-relaxed">
            {issue.detail}
          </p>
        </Section>

        <Section
          icon={<BookOpen size={16} className="text-brand-600" />}
          title="法规依据"
        >
          <p className="text-sm text-slate-700 leading-relaxed">
            {issue.regulation}
          </p>
        </Section>

        <Section
          icon={<ClipboardList size={16} className="text-slate-600" />}
          title="证据数据"
        >
          <dl className="divide-y divide-slate-100 text-sm">
            {issue.evidence.map((e) => (
              <div key={e.label} className="flex justify-between py-2">
                <dt className="text-slate-500">{e.label}</dt>
                <dd className="font-medium tabular-nums">{e.value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section
          icon={<Lightbulb size={16} className="text-amber-500" />}
          title="整改建议"
        >
          <p className="text-sm text-slate-700 leading-relaxed">
            {issue.recommendation}
          </p>
        </Section>
      </div>

      <div className="text-xs text-slate-400">
        检测时间：{new Date(issue.detectedAt).toLocaleString('zh-CN')} · 解释由
        AI 生成，请结合您的税务顾问意见核实。
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="font-medium text-sm">{title}</div>
      </div>
      {children}
    </div>
  );
}

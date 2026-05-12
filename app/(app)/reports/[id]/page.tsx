'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { getProjectById, getReportContent, deleteProject } from '@/lib/recent-projects';
import type { RecentProject } from '@/lib/recent-projects';
import MarkdownContent from '@/components/MarkdownContent';

function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-5">
      {[80, 55, 90, 45, 70].map((w, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg"
          style={{
            height: i === 0 ? 32 : 18,
            width: `${w}%`,
            background: 'rgba(255,255,255,0.07)',
          }}
        />
      ))}
    </div>
  );
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<RecentProject | null>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    const p = getProjectById(id);
    const r = getReportContent(id) as { content?: string } | null;
    setProject(p);
    setContent(r?.content ?? '');
    setLoading(false);
  }, [id]);

  function handleDelete() {
    deleteProject(id);
    router.push('/dashboard');
  }

  if (loading) return <Skeleton />;

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          报告不存在或已被删除
        </p>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        >
          <ArrowLeft size={14} /> 返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2 min-w-0">
          <h1 className="text-2xl font-semibold text-white truncate">
            {project.projectName}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {project.industry && (
              <span
                className="text-xs rounded-full px-2.5 py-0.5"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }}
              >
                {project.industry}
              </span>
            )}
            {project.trlScore > 0 && (
              <span
                className="text-xs rounded-full px-2.5 py-0.5"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }}
              >
                TRL {project.trlScore}
              </span>
            )}
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {new Date(project.createdAt).toLocaleString('zh-CN')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.65)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
          >
            <ArrowLeft size={14} /> 返回首页
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ border: '1px solid rgba(239,68,68,0.25)', color: 'rgba(252,165,165,0.8)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Trash2 size={14} /> 删除报告
          </button>
        </div>
      </div>

      {/* Report content */}
      {content ? (
        <div
          className="rounded-xl px-6 py-6 glow-border"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <MarkdownContent dark>{content}</MarkdownContent>
        </div>
      ) : (
        <div
          className="rounded-xl px-6 py-10 text-sm text-center glow-border"
          style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)' }}
        >
          报告内容不可用
        </div>
      )}
    </div>
  );
}

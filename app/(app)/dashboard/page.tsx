'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowUp, Paperclip } from 'lucide-react';
import { getRecentProjects } from '@/lib/recent-projects';
import type { RecentProject } from '@/lib/recent-projects';

const ParticleSphere = dynamic(() => import('@/components/ParticleSphere'), { ssr: false });

const QUICK_ACTIONS = [
  { label: '智能评估', prompt: '' as string | null, href: null as string | null },
  { label: '生成研报', prompt: '请生成完整技术评估研报', href: null },
  { label: '商业化方案', prompt: null, href: '/outputs' },
];

export default function DashboardPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [projects, setProjects] = useState<RecentProject[]>([]);

  useEffect(() => {
    setProjects(getRecentProjects(6));
  }, []);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function focusInput(prefill: string) {
    setText(prefill);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      autoResize(el);
    });
  }

  function send() {
    const q = text.trim();
    if (!q) return;
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="flex flex-col" style={{ background: '#0a0a0c', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-16">

        <ParticleSphere />

        <div className="text-center space-y-2">
          <h1
            className="font-semibold"
            style={{ fontSize: 36, color: '#fff', lineHeight: 1.25 }}
          >
            准备好了吗？从科研到市场。
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
            赛乔 AI 技术经理人 · 生成专业商业调研和方案
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center flex-wrap justify-center gap-3">
          {QUICK_ACTIONS.map(({ label, prompt, href }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (href) { router.push(href); return; }
                focusInput(prompt ?? '');
              }}
              className="relative rounded-full px-5 py-2.5 text-sm transition-all glow-border glow-border-hover"
              style={{ background: '#111113', color: 'rgba(255,255,255,0.9)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          className="relative w-full max-w-[720px] rounded-2xl glow-border glow-border-focus"
          style={{ background: '#111113' }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            rows={1}
            placeholder="输入项目名称、科学家姓名、或上传 BP 文件..."
            onChange={(e) => {
              setText(e.target.value);
              autoResize(e.target);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="w-full resize-none bg-transparent outline-none px-4 pt-4 pb-2 placeholder:text-white/45"
            style={{ color: '#fff', fontSize: 15, caretColor: '#fff', minHeight: 28 }}
          />
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              <Paperclip size={15} />
              Attach
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.doc,.docx,.ppt,.pptx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setText((prev) => prev ? `${prev} ${f.name}` : f.name);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={!text.trim()}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity disabled:opacity-30"
              style={{ background: '#fff' }}
            >
              <ArrowUp size={16} color="#0a0a0c" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent projects */}
      <section className="px-6 pb-16 w-full max-w-5xl mx-auto">
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
          最近的评估项目
        </p>

        {projects.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            还没有评估项目，从上方开始你的第一次评估
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => router.push(`/reports/${p.id}`)}
                className="relative text-left rounded-xl p-4 transition-all glow-border glow-border-hover"
                style={{ background: '#111113' }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-medium text-sm" style={{ color: '#fff' }}>
                    {p.projectName}
                  </span>
                  {p.trlScore > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                    >
                      TRL {p.trlScore}
                    </span>
                  )}
                </div>
                {p.industry && (
                  <span
                    className="text-xs rounded-full px-2 py-0.5 mb-2 inline-block"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                  >
                    {p.industry}
                  </span>
                )}
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {formatDate(p.createdAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

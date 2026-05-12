'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, ChevronDown, ChevronUp, ArrowUp, BookOpen, Minus, Plus, FileText } from 'lucide-react';
import sampleData from '@/lib/sample-report.json';

const { meta, chapters } = sampleData;

const CH_LABELS: Record<string, string> = {
  '第一章': '01', '第二章': '02', '第三章': '03', '第四章': '04',
  '第五章': '05', '第六章': '06', '第七章': '07', '第八章': '08',
  '第九章': '09', '第十章': '10', '参考文献': 'Ref',
};

const REPORT_CONTENT_CSS = `
.sc-h2 { font-size: 0.875rem; font-weight: 700; color: rgba(255,255,255,0.9); margin: 1.5rem 0 0.55rem; padding-bottom: 0.3rem; border-bottom: 1px solid rgba(255,255,255,0.08); line-height: 1.5; }
.sc-h2:first-child { margin-top: 0; }
.sc-h3 { font-size: 0.8125rem; font-weight: 600; color: rgba(255,255,255,0.75); margin: 1.1rem 0 0.35rem; line-height: 1.5; }
.sc-p { font-size: 0.875rem; line-height: 1.85; color: rgba(255,255,255,0.78); margin-bottom: 0.7rem; }
.sc-p:last-child { margin-bottom: 0; }
.sc-strong { font-weight: 600; color: rgba(255,255,255,0.95); }
.sc-table-wrap { overflow-x: auto; margin: 0.9rem 0; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); }
.sc-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.sc-table th { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.72); font-weight: 600; text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
.sc-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.72); vertical-align: top; line-height: 1.6; }
.sc-table tr:last-child td { border-bottom: none; }
.sc-table tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
.sc-ul { margin: 0.4rem 0 0.7rem 1.1rem; list-style: none; }
.sc-li { font-size: 0.875rem; line-height: 1.75; color: rgba(255,255,255,0.78); margin-bottom: 0.2rem; padding-left: 1rem; position: relative; }
.sc-li::before { content: "•"; position: absolute; left: 0; color: rgba(255,255,255,0.45); font-size: 0.9em; }
`;

function transformHtml(html: string): string {
  return html
    .replace(/<h2>(<strong>)?(.*?)(<\/strong>)?<\/h2>/g, '<div class="sc-h2">$2</div>')
    .replace(/<h3>(<strong>)?(.*?)(<\/strong>)?<\/h3>/g, '<div class="sc-h3">$2</div>')
    .replace(/<p>(.*?)<\/p>/g, '<p class="sc-p">$1</p>')
    .replace(/<strong>(.*?)<\/strong>/g, '<strong class="sc-strong">$1</strong>')
    .replace(/<table>/g, '<div class="sc-table-wrap"><table class="sc-table">')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<ul>/g, '<ul class="sc-ul">')
    .replace(/<li>(.*?)<\/li>/g, '<li class="sc-li">$1</li>');
}

export default function SampleReportView() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? '');
  const [progress, setProgress] = useState(0);
  const [showBackTop, setShowBackTop] = useState(false);

  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  // ── Reading progress + back-to-top ────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min(100, (scrollY / docH) * 100) : 0);
      setShowBackTop(scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── IntersectionObserver: highlight active TOC item ───────────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    chapters.forEach((ch) => {
      const el = cardRefs.current.get(ch.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(ch.id); },
        { threshold: 0, rootMargin: '-25% 0px -65% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function scrollToChapter(id: string) {
    cardRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleAll() {
    const anyExpanded = chapters.some((c) => !collapsed[c.id]);
    setCollapsed(
      anyExpanded
        ? Object.fromEntries(chapters.map((c) => [c.id, true]))
        : {}
    );
  }

  const anyExpanded = chapters.some((c) => !collapsed[c.id]);

  return (
    <div className="mt-12">
      {/* Inject scoped CSS */}
      <style>{REPORT_CONTENT_CSS}</style>

      {/* ── Section divider ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <BookOpen size={12} />
          示例研报展示
        </div>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* ── Reading progress bar ── */}
      <div className="sticky top-0 z-40 h-[2px] rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-75"
          style={{ width: `${progress}%`, background: 'rgba(255,255,255,0.4)' }}
        />
      </div>

      {/* ── Report header card ── */}
      <div className="rounded-xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 15px rgba(255,255,255,0.04)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                  示例研报
                </span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>科技转化评估 · 专业研报示例</span>
              </div>
              <h2 className="text-[15px] font-bold text-white leading-snug">
                赛乔 · AI智能体科技转化评估研究报告
              </h2>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {meta.date.replace('报告日期：', '')}
              </p>
            </div>
          </div>
          <a
            href="/api/sample-report-download"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium shrink-0 transition-opacity hover:opacity-90"
            style={{ background: '#fff', color: '#0a0a0c' }}
          >
            <Download size={13} />
            下载完整研报
          </a>
        </div>
      </div>

      {/* ── Main layout: TOC left + Content right ── */}
      <div className="flex gap-5 items-start">

        {/* ── Left TOC (sticky, desktop only) ── */}
        <div className="hidden lg:block w-52 shrink-0 sticky top-4 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 12px rgba(255,255,255,0.04)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2.5 px-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              目录导航
            </div>
            <nav className="space-y-0.5">
              {chapters.map((ch) => {
                const active = activeId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => scrollToChapter(ch.id)}
                    className="w-full text-left flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs transition-all"
                    style={{
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                      fontWeight: active ? 600 : 400,
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    <span className="shrink-0 font-mono text-[10px] mt-0.5 w-6"
                      style={{ color: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>
                      {CH_LABELS[ch.num] ?? ch.num}
                    </span>
                    <span className="leading-snug">{ch.shortTitle || ch.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Right: chapter cards ── */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Controls bar */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{chapters.length} 个章节</p>
            <button
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            >
              {anyExpanded ? <Minus size={11} /> : <Plus size={11} />}
              {anyExpanded ? '全部折叠' : '全部展开'}
            </button>
          </div>

          {chapters.map((ch) => {
            const isCollapsed = collapsed[ch.id];
            const label = CH_LABELS[ch.num] ?? ch.num;
            const isRef = ch.num === '参考文献';

            return (
              <div
                key={ch.id}
                id={ch.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(ch.id, el);
                  else cardRefs.current.delete(ch.id);
                }}
                className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 12px rgba(255,255,255,0.03)' }}
              >
                {/* Chapter header */}
                <button
                  onClick={() => toggleCollapse(ch.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors"
                  style={{ borderBottom: !isCollapsed ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span
                    className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: activeId === ch.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                      color: activeId === ch.id ? '#fff' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {isRef ? 'Ref' : label}
                  </span>
                  <span className="flex-1 text-sm font-semibold leading-snug text-white">
                    {ch.title}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown size={14} className="shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  ) : (
                    <ChevronUp size={14} className="shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  )}
                </button>

                {/* Chapter body */}
                {!isCollapsed && (
                  <div
                    className="px-6 py-5"
                    dangerouslySetInnerHTML={{ __html: transformHtml(ch.html) }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Back to top ── */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="返回顶部"
          className="fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full shadow-lg grid place-items-center transition-opacity hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <ArrowUp size={15} />
        </button>
      )}
    </div>
  );
}

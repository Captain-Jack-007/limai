'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Sparkles,
  User2,
  Building2,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Send,
  X,
  Loader2,
  Bot,
} from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import {
  mockEnterpriseProjects,
  mockExperts,
  pipelineStageDictKey,
} from '@/lib/enterprise-data';
import { mockInvestors } from '@/lib/mock-data';

// ─── Constants ────────────────────────────────────────────────────────────────

const VOTE_META = {
  approve: { icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
  reject: { icon: XCircle, tone: 'text-rose-600 bg-rose-50' },
  revision: { icon: AlertCircle, tone: 'text-amber-600 bg-amber-50' },
} as const;

const REPORT_SECTIONS = [
  { id: 'tech', zh: '技术分析和优势', en: 'Technology Analysis & Advantages' },
  { id: 'industry', zh: '行业现状和市场分析', en: 'Industry & Market Analysis' },
  { id: 'application', zh: '应用场景深度剖析', en: 'Application Scenarios Analysis' },
  { id: 'investment', zh: '投资价值', en: 'Investment Value' },
  { id: 'risk', zh: '风险评估', en: 'Risk Assessment' },
] as const;

type SectionId = (typeof REPORT_SECTIONS)[number]['id'];

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EnterpriseProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { t, b, lang } = useLang();
  const project = mockEnterpriseProjects.find((p) => p.id === params.id);
  if (!project) notFound();

  // Scores
  const tech = Math.min(10, Math.round(project.score / 10));
  const market = Math.max(4, Math.min(10, Math.round(project.score / 11) + 1));
  const team = Math.max(4, Math.min(10, Math.round(project.score / 12) + 2));
  const scale = Math.max(4, Math.min(10, Math.round(project.trl + 2)));
  const final = Math.round((tech + market + team + scale) * 2.5);

  const criteria = [
    { key: 'pd_critTech', value: tech },
    { key: 'pd_critMarket', value: market },
    { key: 'pd_critTeam', value: team },
    { key: 'pd_critScale', value: scale },
  ] as const;

  const recommendedInvestors = mockInvestors.slice(0, 3);
  const expertPanel = mockExperts.slice(0, 3);

  // ── Report generation state ──────────────────────────────────────────────
  const [selectedSections, setSelectedSections] = useState<SectionId[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<Partial<Record<SectionId, string>>>({});
  const [generateError, setGenerateError] = useState('');

  // ── Chat state ───────────────────────────────────────────────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Project info shared with API calls ───────────────────────────────────
  const projectContext = {
    name: b(project.name),
    scientist: b(project.scientist),
    org: b(project.org),
    industry: b(project.industry),
    trl: project.trl,
    score: project.score,
    summary: b(project.summary),
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  function toggleSection(id: SectionId) {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedSections(REPORT_SECTIONS.map((s) => s.id));
  }

  function clearAll() {
    setSelectedSections([]);
  }

  async function handleGenerate() {
    if (selectedSections.length === 0 || isGenerating) return;
    setIsGenerating(true);
    setGenerateError('');
    setReport({});

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectInfo: projectContext, sections: selectedSections }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '生成失败');
      setReport(data.sections ?? {});
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSendMessage() {
    const text = chatInput.trim();
    if (!text || isChatLoading) return;

    const userMsg: ChatMsg = { role: 'user', content: text };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, projectContext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '对话失败');
      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err: unknown) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err instanceof Error
              ? `抱歉，出现错误：${err.message}`
              : '抱歉，服务暂时不可用，请稍后重试。',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }

  function handleChatKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/enterprise/pipeline"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={12} />
          {t('pd_back')}
        </Link>
        <div className="flex items-center gap-2">
          <button className="btn-outline">
            <ClipboardCheck size={14} />
            {t('pd_assignExpert')}
          </button>
          <button className="btn-accent">
            {t('pd_action_advance')}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Project summary card ── */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="chip bg-brand-50 text-brand-700">
                {t(pipelineStageDictKey[project.pipeline])}
              </span>
              <span className="chip bg-slate-100 text-slate-600">TRL {project.trl}</span>
              <span className="chip bg-slate-100 text-slate-600">{b(project.industry)}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">{b(project.name)}</h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">{b(project.summary)}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">{t('pd_aiScore')}</div>
            <div className="text-3xl font-semibold gradient-text">{project.score}</div>
            <div className="text-[11px] text-slate-400">/ 100</div>
          </div>
        </div>
      </div>

      {/* ── Main 3-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left col */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-5">
            <div className="text-sm font-semibold mb-3">{t('pd_overview')}</div>
            <dl className="space-y-3 text-sm">
              <Field icon={User2} label={t('pd_scientist')} value={b(project.scientist)} />
              <Field icon={Building2} label={t('pd_org')} value={b(project.org)} />
              <Field icon={Briefcase} label={t('pd_industry')} value={b(project.industry)} />
              <Field
                icon={Calendar}
                label={t('pd_submitted')}
                value={new Date(project.submittedAt).toLocaleDateString(
                  lang === 'zh' ? 'zh-CN' : 'en-US'
                )}
              />
              <Field
                icon={Calendar}
                label={t('pd_updated')}
                value={new Date(project.updatedAt).toLocaleDateString(
                  lang === 'zh' ? 'zh-CN' : 'en-US'
                )}
              />
              {project.evaluator && (
                <Field
                  icon={ClipboardCheck}
                  label={t('pd_evaluator')}
                  value={b(project.evaluator)}
                />
              )}
            </dl>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold mb-3">{t('pd_files')}</div>
            <ul className="space-y-2 text-sm">
              {['Whitepaper.pdf', 'Patent-Filing.pdf', 'Lab-Validation.xlsx'].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <FileText size={14} className="text-slate-400" />
                  <span className="truncate">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle col */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand-600" />
              <div className="text-sm font-semibold">{t('pd_evalTitle')}</div>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t('pd_evalSub')}</p>
            <ul className="mt-4 space-y-3">
              {criteria.map((c) => (
                <li key={c.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{t(c.key)}</span>
                    <span className="font-medium">{c.value}/10</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-fuchsia-500"
                      style={{ width: `${c.value * 10}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium">{t('pd_critFinal')}</span>
              <span className="text-xl font-semibold gradient-text">{final}/100</span>
            </div>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold mb-3">{t('pd_expertPanel')}</div>
            <div className="space-y-3">
              {expertPanel.map((ex) => {
                const meta = ex.vote ? VOTE_META[ex.vote] : null;
                const VIcon = meta?.icon;
                return (
                  <div
                    key={ex.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center text-slate-500 shrink-0">
                      <User2 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium truncate">{b(ex.name)}</div>
                        {meta && VIcon && (
                          <span className={'chip ' + meta.tone}>
                            <VIcon size={11} />
                            {ex.vote === 'approve'
                              ? t('pd_voteApprove')
                              : ex.vote === 'reject'
                                ? t('pd_voteReject')
                                : t('pd_voteRevision')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {b(ex.field)} · {b(ex.org)}
                      </div>
                      {ex.comment && (
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {b(ex.comment)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5">
            <div className="text-sm font-semibold mb-3">{t('pd_recInvestors')}</div>
            <div className="space-y-2.5">
              {recommendedInvestors.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-lg border border-slate-100 hover:border-brand-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">{inv.name}</div>
                    <span className="chip bg-brand-50 text-brand-700">{inv.matchScore}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {b(inv.focus)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold mb-3">{t('pd_actions')}</div>
            <div className="space-y-2">
              <button className="btn-outline w-full justify-between">
                {t('pd_action_match')}
                <ArrowRight size={14} />
              </button>
              <button className="btn-outline w-full justify-between">
                {t('pd_action_report')}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI 研报生成 ──────────────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={15} className="text-brand-600" />
          <h2 className="text-sm font-semibold">
            {lang === 'zh' ? 'AI 智能研报生成' : 'AI Research Report Generator'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {lang === 'zh'
            ? '选择需要分析的板块，AI 将基于项目信息生成专业深度研究报告'
            : 'Select sections to analyze. AI will generate a professional in-depth report based on project data.'}
        </p>

        {/* Section checkboxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
          {REPORT_SECTIONS.map((s) => {
            const checked = selectedSections.includes(s.id);
            return (
              <label
                key={s.id}
                className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                  checked
                    ? 'border-brand-400 bg-brand-50 text-brand-800'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSection(s.id)}
                  className="mt-0.5 w-3.5 h-3.5 accent-brand-600 shrink-0"
                />
                <span className="leading-snug">{lang === 'zh' ? s.zh : s.en}</span>
              </label>
            );
          })}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleGenerate} disabled={selectedSections.length === 0 || isGenerating} className="btn-accent">
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {lang === 'zh'
              ? isGenerating
                ? '生成中，请稍候…'
                : '开始评估'
              : isGenerating
                ? 'Generating…'
                : 'Start Analysis'}
          </button>
          <button onClick={selectAll} className="btn-ghost text-xs px-3 py-1.5">
            {lang === 'zh' ? '全选' : 'Select All'}
          </button>
          <button onClick={clearAll} className="btn-ghost text-xs px-3 py-1.5">
            {lang === 'zh' ? '清空' : 'Clear'}
          </button>
          {selectedSections.length > 0 && (
            <span className="text-xs text-slate-500">
              {lang === 'zh'
                ? `已选 ${selectedSections.length} 个板块`
                : `${selectedSections.length} section(s) selected`}
            </span>
          )}
        </div>

        {/* Error */}
        {generateError && (
          <div className="mt-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-lg px-4 py-3">
            <AlertCircle size={14} className="shrink-0" />
            {generateError}
          </div>
        )}

        {/* Generated report sections */}
        {Object.keys(report).length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={13} className="text-emerald-500" />
              {lang === 'zh' ? '研报已生成，以下为各板块分析内容' : 'Report generated successfully'}
            </div>
            {REPORT_SECTIONS.filter((s) => report[s.id]).map((s) => (
              <div key={s.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-50 to-fuchsia-50 border-b border-slate-200">
                  <Sparkles size={12} className="text-brand-600" />
                  <span className="text-xs font-semibold text-brand-800">
                    {lang === 'zh' ? s.zh : s.en}
                  </span>
                </div>
                <div className="px-4 py-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {report[s.id]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating chat widget ─────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chat panel */}
        {isChatOpen && (
          <div className="w-[360px] h-[520px] card flex flex-col shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-600 to-fuchsia-600 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={16} />
                <div>
                  <div className="text-sm font-semibold leading-none">赛乔 Agent</div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {lang === 'zh' ? '专业科技成果转化顾问' : 'Tech Commercialization Advisor'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-brand-50 grid place-items-center">
                    <Bot size={22} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {lang === 'zh' ? '你好！我是赛乔 Agent' : "Hi! I'm Saiqiao Agent"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'zh'
                        ? `可以问我关于「${b(project.name)}」的任何问题`
                        : `Ask me anything about "${b(project.name)}"`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    {[
                      lang === 'zh' ? '这个项目的核心竞争力是什么？' : "What's the core competitiveness?",
                      lang === 'zh' ? '商业化路径有哪些建议？' : 'What are the commercialization paths?',
                      lang === 'zh' ? '主要风险点在哪里？' : 'What are the main risks?',
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setChatInput(q);
                        }}
                        className="text-left text-xs px-3 py-2 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-slate-600"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-brand-100 grid place-items-center shrink-0 mt-0.5">
                      <Bot size={13} className="text-brand-700" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-100 grid place-items-center shrink-0 mt-0.5">
                    <Bot size={13} className="text-brand-700" />
                  </div>
                  <div className="bg-slate-100 px-3 py-2.5 rounded-2xl rounded-tl-sm">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-slate-100 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder={
                    lang === 'zh' ? '输入问题，按 Enter 发送…' : 'Ask a question, press Enter…'
                  }
                  className="input text-xs py-2 flex-1"
                  disabled={isChatLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="btn-accent px-3 py-2 shrink-0"
                >
                  {isChatLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setIsChatOpen((v) => !v)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isChatOpen
              ? 'bg-slate-700 hover:bg-slate-800'
              : 'bg-gradient-to-br from-brand-600 to-fuchsia-600 hover:opacity-90'
          }`}
          title={lang === 'zh' ? '与 AI 对话' : 'Chat with AI'}
        >
          {isChatOpen ? (
            <X size={20} className="text-white" />
          ) : (
            <MessageSquare size={20} className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-slate-500">{label}</div>
        <div className="text-sm text-slate-800 truncate">{value}</div>
      </div>
    </div>
  );
}

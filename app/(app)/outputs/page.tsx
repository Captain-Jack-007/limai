'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Presentation,
  Map,
  Users,
  Download,
  Calendar,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  FileUp,
  BookOpen,
  FileDown,
  Sparkles,
} from 'lucide-react';
import {
  activeProject,
  mockInvestors,
  mockPitchDeck,
  mockRoadmap,
} from '@/lib/mock-data';
import { useLang } from '@/components/LanguageProvider';
import MarkdownContent from '@/components/MarkdownContent';
import SampleReportView from '@/components/SampleReportView';
import type { DictKey } from '@/lib/i18n';
import { saveProject } from '@/lib/recent-projects';
import type { RecentProject } from '@/lib/recent-projects';

type Tab = 'report' | 'deck' | 'roadmap' | 'investors';

const tabs: { key: Tab; labelKey: DictKey; icon: React.ElementType }[] = [
  { key: 'report', labelKey: 'out_tab_report', icon: FileText },
  { key: 'deck', labelKey: 'out_tab_deck', icon: Presentation },
  { key: 'roadmap', labelKey: 'out_tab_roadmap', icon: Map },
  { key: 'investors', labelKey: 'out_tab_investors', icon: Users },
];

const PROGRESS_STEPS = [
  { label: '正在解析文件…', en: 'Parsing file…', delay: 0 },
  { label: 'AI 正在分析内容…', en: 'AI is analyzing…', delay: 3000 },
  { label: '正在生成 PPT 幻灯片…', en: 'Generating slides…', delay: 20000 },
  { label: '即将完成，正在打包文件…', en: 'Finalizing…', delay: 40000 },
];

const REPORT_SECTIONS = [
  { id: 'tech', zh: '技术分析和优势', en: 'Technology Analysis' },
  { id: 'industry', zh: '行业现状和市场', en: 'Industry & Market' },
  { id: 'application', zh: '应用场景剖析', en: 'Application Scenarios' },
  { id: 'competition', zh: '技术对比与竞争优势', en: 'Competitive Analysis' },
  { id: 'investment', zh: '投资价值', en: 'Investment Value' },
  { id: 'risk', zh: '风险评估', en: 'Risk Assessment' },
] as const;

type SectionId = (typeof REPORT_SECTIONS)[number]['id'];

// ── Shared dark styles ──────────────────────────────────────────────────────────
const darkCard = {
  background: 'rgba(255,255,255,0.03)',
} as const;

// ── OutputsBody ───────────────────────────────────────────────────────────────

function OutputsBody() {
  const params = useSearchParams();
  const initial = (params.get('tab') as Tab) || 'report';
  const [tab, setTab] = useState<Tab>(initial);
  const { t, b } = useLang();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="no-print">
        <h1 className="text-2xl font-bold text-white">生成、预览和导出</h1>
      </div>

      {/* Tabs */}
      <div
        className="no-print rounded-xl p-1 inline-flex glow-border"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        {tabs.map(({ key, labelKey, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-sm rounded-lg transition-colors"
            style={{
              background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: tab === key ? '#fff' : 'rgba(255,255,255,0.6)',
            }}
          >
            <Icon size={14} />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {tab === 'report' && (
        <>
          <ReportView />
          <SampleReportView />
        </>
      )}
      {tab === 'deck' && <DeckView />}
      {tab === 'roadmap' && <RoadmapView />}
      {tab === 'investors' && <InvestorsView />}
    </div>
  );
}

// ── ReportView ────────────────────────────────────────────────────────────────

function ReportView() {
  const { lang } = useLang();
  const zh = lang === 'zh';

  const [reportName, setReportName] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSections, setSelectedSections] = useState<SectionId[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<Partial<Record<SectionId, string>>>({});
  const [generateError, setGenerateError] = useState('');
  const [fileWarnings, setFileWarnings] = useState<string[]>([]);
  const [searchCount, setSearchCount] = useState(0);
  const [competitionPhase, setCompetitionPhase] = useState<'idle' | 'searching' | 'generating'>('idle');
  const competitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  const [fullContent, setFullContent] = useState('');
  const [fullProjectName, setFullProjectName] = useState('');
  const [fullError, setFullError] = useState('');
  const [fullDone, setFullDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fullFileWarnings, setFullFileWarnings] = useState<string[]>([]);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    if (isGeneratingFull) {
      elapsedRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    }
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [isGeneratingFull]);

  function toggleSection(id: SectionId) {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  const canSubmit = reportDesc.trim().length > 0 || uploadedFiles.length > 0;

  async function handleGenerate() {
    if (!canSubmit || selectedSections.length === 0 || isGenerating) return;
    setIsGenerating(true);
    setGenerateError('');
    setReport({});
    setFileWarnings([]);
    setSearchCount(0);

    const hasCompetition = (selectedSections as string[]).includes('competition');
    if (hasCompetition) {
      setCompetitionPhase('searching');
      competitionTimerRef.current = setTimeout(() => setCompetitionPhase('generating'), 8000);
    }

    try {
      const form = new FormData();
      form.append('projectInfo', JSON.stringify({
        name: reportName.trim() || (zh ? '未命名项目' : 'Untitled Project'),
        scientist: '',
        org: '',
        industry: '',
        trl: 0,
        score: 0,
        summary: reportDesc.trim() || (zh ? '（请根据上传的文件内容进行分析）' : '(Please analyze based on the uploaded files)'),
      }));
      form.append('sections', JSON.stringify(selectedSections));
      uploadedFiles.forEach((f) => form.append('files', f));

      const res = await fetch('/api/ai/generate', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (zh ? '生成失败' : 'Generation failed'));
      setReport(data.sections ?? {});
      if (data.searchCount) setSearchCount(data.searchCount);
      if (data.warnings?.length) setFileWarnings(data.warnings);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : zh ? '生成失败，请重试' : 'Generation failed');
    } finally {
      if (competitionTimerRef.current) clearTimeout(competitionTimerRef.current);
      setCompetitionPhase('idle');
      setIsGenerating(false);
    }
  }

  async function handleGenerateFull() {
    if (!canSubmit || isGeneratingFull) return;
    setIsGeneratingFull(true);
    setFullError('');
    setFullContent('');
    setFullDone(false);
    setElapsed(0);
    setExportError('');
    setFullFileWarnings([]);

    try {
      const form = new FormData();
      form.append('projectInfo', JSON.stringify({
        name: reportName.trim() || (zh ? '未命名项目' : 'Untitled Project'),
        summary: reportDesc.trim() || (zh ? '（请根据上传的文件内容进行分析）' : '(Please analyze based on the uploaded files)'),
      }));
      uploadedFiles.forEach((f) => form.append('files', f));

      const res = await fetch('/api/ai/generate-full-report', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (zh ? '生成失败' : 'Generation failed'));

      const savedContent = data.content ?? '';
      const savedName = data.projectName ?? (reportName.trim() || '未命名项目');
      setFullContent(savedContent);
      setFullProjectName(savedName);
      if (data.warnings?.length) setFullFileWarnings(data.warnings);
      setFullDone(true);

      try {
        const newProject: RecentProject = {
          id: crypto.randomUUID(),
          projectName: savedName,
          researcher: '',
          industry: '',
          description: reportDesc.trim().slice(0, 100),
          trlScore: 0,
          selectedModules: [],
          createdAt: Date.now(),
        };
        saveProject(newProject, { content: savedContent });
      } catch { /* noop */ }
    } catch (err) {
      setFullError(err instanceof Error ? err.message : zh ? '生成失败，请重试' : 'Generation failed');
    } finally {
      setIsGeneratingFull(false);
    }
  }

  async function handleExportDocx() {
    if (!fullContent || isExporting) return;
    setIsExporting(true);
    setExportError('');
    try {
      const res = await fetch('/api/ai/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${fullProjectName}科技转化评估研究报告`,
          content: fullContent,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? 'Word 导出失败');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fullProjectName}科技转化评估研究报告.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Word 导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  }

  const elapsedStr = `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`;

  const inputCls = 'w-full px-3 py-2 rounded-xl text-sm outline-none transition-all placeholder:text-white/45';
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.03)' } as React.CSSProperties;

  return (
    <div className="space-y-6">
      {/* Input card */}
      <div className="rounded-xl p-6 space-y-5 glow-border" style={darkCard}>
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
          >
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-white">
              {zh ? 'AI 智能研报生成' : 'AI Research Report Generator'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {zh
                ? '描述技术成果，分板块深度分析或一键生成完整十大章节专业研报（可导出 Word）'
                : 'Describe your technology, generate section analysis or a full 10-chapter report (Word export)'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder={zh ? '项目名称（选填）' : 'Project name (optional)'}
            className={inputCls}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.06)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(255,255,255,0.03)'; }}
          />
          <textarea
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
            rows={5}
            placeholder={
              zh
                ? '请描述项目的技术成果，包括核心技术原理、创新点、已有实验数据、应用方向、团队背景等…\n（内容越详细，研报质量越高）'
                : 'Describe your technology: core principles, innovations, experimental data, applications, team background...'
            }
            className={`${inputCls} resize-none`}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.06)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(255,255,255,0.03)'; }}
          />

          {/* File upload */}
          <div>
            <div className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {zh ? '参考资料上传（选填，最多 5 个文件）' : 'Reference files (optional, up to 5)'}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {uploadedFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors"
                  style={{ border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  <FileUp size={12} />
                  {zh ? '添加文件' : 'Add file'}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setUploadedFiles((prev) => [...prev, ...files].slice(0, 5));
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              />
              {uploadedFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <FileText size={11} className="shrink-0" />
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,100,100,0.8)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              {uploadedFiles.length > 0 && (
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {uploadedFiles.length}/5
                </span>
              )}
            </div>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {zh ? '支持 PDF、Word、图片、TXT，每个最大 10MB' : 'PDF, Word, images, TXT — max 10 MB each'}
            </p>
          </div>
        </div>

        {/* Section checkboxes */}
        <div>
          <div className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {zh ? '分板块生成 — 选择分析板块' : 'Section analysis — select sections'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {REPORT_SECTIONS.map((s) => {
              const checked = selectedSections.includes(s.id);
              return (
                <label
                  key={s.id}
                  className="flex items-start gap-2 p-2.5 rounded-lg cursor-pointer text-xs transition-all"
                  style={{
                    border: checked ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.12)',
                    background: checked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                    color: checked ? '#fff' : 'rgba(255,255,255,0.75)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSection(s.id)}
                    className="mt-0.5 w-3.5 h-3.5 shrink-0"
                    style={{ accentColor: '#fff' }}
                  />
                  <span className="leading-snug">{zh ? s.zh : s.en}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleGenerate}
            disabled={!canSubmit || selectedSections.length === 0 || isGenerating || isGeneratingFull}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {zh ? (isGenerating ? '生成中…' : '开始评估') : (isGenerating ? 'Generating…' : 'Analyze Sections')}
          </button>

          <button
            onClick={handleGenerateFull}
            disabled={!canSubmit || isGenerating || isGeneratingFull}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ background: '#fff', color: '#0a0a0c' }}
          >
            {isGeneratingFull ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {zh ? (isGeneratingFull ? `生成完整研报中… ${elapsedStr}` : '生成完整研报') : (isGeneratingFull ? `Generating… ${elapsedStr}` : 'Generate Full Report')}
          </button>

          <button
            onClick={() => setSelectedSections(REPORT_SECTIONS.map((s) => s.id))}
            className="px-3 py-1.5 text-xs rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            {zh ? '全选' : 'All'}
          </button>
          <button
            onClick={() => setSelectedSections([])}
            className="px-3 py-1.5 text-xs rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            {zh ? '清空' : 'Clear'}
          </button>
        </div>

        {/* Progress / errors */}
        {isGenerating && competitionPhase !== 'idle' && (
          <div
            className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3"
            style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', color: 'rgba(125,211,252,0.9)' }}
          >
            <Loader2 size={15} className="animate-spin shrink-0" />
            {competitionPhase === 'searching'
              ? (zh ? '正在联网搜索竞品信息…' : 'Searching for competitor data…')
              : (zh ? '竞品数据已获取，正在生成竞争分析…' : 'Competitor data retrieved, generating analysis…')}
          </div>
        )}

        {isGeneratingFull && (
          <div
            className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            <Loader2 size={15} className="animate-spin shrink-0" />
            <span>
              {zh ? 'AI 正在严格按照十大章节框架和 WSJ 写作规范生成完整研报，请耐心等待…' : 'AI is generating a full 10-chapter report…'}
            </span>
            <span className="text-xs ml-auto font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{elapsedStr}</span>
          </div>
        )}

        {generateError && (
          <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(252,165,165,0.9)' }}>
            <AlertCircle size={14} className="shrink-0" />
            {generateError}
          </div>
        )}

        {fullError && (
          <div className="flex items-start gap-2 text-sm rounded-xl px-4 py-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(252,165,165,0.9)' }}>
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span className="flex-1">{fullError}</span>
            <button onClick={() => setFullError('')} style={{ color: 'rgba(252,165,165,0.6)' }}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Section report display */}
      {Object.keys(report).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>{zh ? '分板块分析已生成' : 'Section analysis generated'}</span>
            {searchCount > 0 && (
              <span
                className="ml-auto px-2 py-0.5 rounded-full text-[11px]"
                style={{ background: 'rgba(56,189,248,0.1)', color: 'rgba(125,211,252,0.8)', border: '1px solid rgba(56,189,248,0.15)' }}
              >
                {zh ? `联网搜索：${searchCount} 条竞品数据` : `Web search: ${searchCount} sources`}
              </span>
            )}
          </div>
          {fileWarnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 text-xs rounded-xl px-3 py-2"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', color: 'rgba(253,230,138,0.9)' }}>
              <AlertCircle size={12} className="shrink-0" />{w}
            </div>
          ))}
          {REPORT_SECTIONS.filter((s) => report[s.id]).map((s) => (
            <div key={s.id} className="rounded-xl overflow-hidden glow-border" style={darkCard}>
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
              >
                <Sparkles size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {zh ? s.zh : s.en}
                </span>
              </div>
              <div className="px-4 py-4">
                <MarkdownContent dark>{report[s.id] ?? ''}</MarkdownContent>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full report display */}
      {fullDone && fullContent && (
        <div className="space-y-4">
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}
          >
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <div className="text-sm text-emerald-300 flex-1">
              {zh ? '完整研报已生成（十大章节 · WSJ 风格 · 数据来源标注）' : 'Full 10-chapter report generated.'}
            </div>
            <button
              onClick={handleExportDocx}
              disabled={isExporting}
              className="inline-flex items-center gap-2 shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ background: '#fff', color: '#0a0a0c' }}
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
              {zh ? (isExporting ? '导出中…' : '导出 Word') : (isExporting ? 'Exporting…' : 'Export Word')}
            </button>
          </div>

          {exportError && (
            <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(252,165,165,0.9)' }}>
              <AlertCircle size={14} className="shrink-0" />{exportError}
            </div>
          )}

          {fullFileWarnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 text-xs rounded-xl px-3 py-2"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', color: 'rgba(253,230,138,0.9)' }}>
              <AlertCircle size={12} className="shrink-0" />{w}
            </div>
          ))}

          <div className="rounded-xl overflow-hidden glow-border" style={darkCard}>
            <div
              className="flex items-center gap-2 px-4 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
            >
              <FileText size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {zh ? '研报预览（可滚动查看全文）' : 'Report preview (scrollable)'}
              </span>
              <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {zh ? `约 ${fullContent.length} 字` : `~${fullContent.length} chars`}
              </span>
            </div>
            <div className="max-h-[600px] overflow-y-auto px-6 py-5">
              <MarkdownContent dark>{fullContent}</MarkdownContent>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DeckView ──────────────────────────────────────────────────────────────────

type GenState = 'idle' | 'running' | 'done' | 'error';

function DeckView() {
  const { lang } = useLang();
  const zh = lang === 'zh';

  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [genState, setGenState] = useState<GenState>('idle');
  const [stepLabel, setStepLabel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadHref, setDownloadHref] = useState('');
  const [downloadName, setDownloadName] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }

  function reset() {
    clearTimers();
    setSelectedFile(null);
    setGenState('idle');
    setStepLabel('');
    setErrorMsg('');
    if (downloadHref) URL.revokeObjectURL(downloadHref);
    setDownloadHref('');
    setDownloadName('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setSelectedFile(f); setGenState('idle'); setErrorMsg(''); }
  }

  async function handleGenerate() {
    if (!selectedFile || genState === 'running') return;
    clearTimers();
    setGenState('running');
    setErrorMsg('');

    const steps = zh ? PROGRESS_STEPS.map(s => s.label) : PROGRESS_STEPS.map(s => s.en);
    setStepLabel(steps[0]);
    PROGRESS_STEPS.slice(1).forEach((step, i) => {
      const t = setTimeout(() => setStepLabel(steps[i + 1]), step.delay);
      timers.current.push(t);
    });

    try {
      const form = new FormData();
      form.append('file', selectedFile);
      const res = await fetch('/api/ai/generate-pptx', { method: 'POST', body: form });
      clearTimers();
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `服务错误 (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const fname = selectedFile.name.replace(/\.[^.]+$/, '') + (zh ? '-路演PPT.pptx' : '-pitch-deck.pptx');
      setDownloadHref(url);
      setDownloadName(fname);
      setGenState('done');
      const a = document.createElement('a');
      a.href = url;
      a.download = fname;
      a.click();
    } catch (err) {
      clearTimers();
      setErrorMsg(err instanceof Error ? err.message : '生成失败，请重试');
      setGenState('error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6 space-y-5 glow-border" style={darkCard}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
            <Presentation size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-white">
              {zh ? '上传商业计划书，自动生成路演 PPT' : 'Upload Business Plan → Auto-generate Pitch Deck'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {zh ? 'AI 解析您的商业计划书，生成 12-14 页专业路演 PPT，支持下载 .pptx 文件' : 'AI parses your business plan and generates a professional pitch deck in .pptx format'}
            </p>
          </div>
        </div>

        <div
          className="relative rounded-xl cursor-pointer transition-colors"
          style={{
            border: selectedFile ? '1px solid rgba(255,255,255,0.2)' : '2px dashed rgba(255,255,255,0.1)',
            background: selectedFile ? 'rgba(255,255,255,0.04)' : 'transparent',
          }}
          onClick={() => genState !== 'running' && fileRef.current?.click()}
          onMouseEnter={(e) => { if (!selectedFile) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={(e) => { if (!selectedFile) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.md" onChange={onFileChange} className="hidden" disabled={genState === 'running'} />
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            {selectedFile ? (
              <>
                <FileUp size={28} style={{ color: 'rgba(255,255,255,0.6)' }} />
                <div className="text-sm font-medium text-white">{selectedFile.name}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{(selectedFile.size / 1024).toFixed(0)} KB</div>
              </>
            ) : (
              <>
                <UploadCloud size={28} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {zh ? '点击上传或拖入文件' : 'Click to upload or drag and drop'}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {zh ? '支持 PDF、Word、TXT，最大 10MB' : 'PDF, Word, TXT — max 10 MB'}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleGenerate}
            disabled={!selectedFile || genState === 'running'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ background: '#fff', color: '#0a0a0c' }}
          >
            {genState === 'running' ? <Loader2 size={14} className="animate-spin" /> : <Presentation size={14} />}
            {zh ? (genState === 'running' ? stepLabel : '生成路演 PPT') : (genState === 'running' ? stepLabel : 'Generate Pitch Deck')}
          </button>
          {selectedFile && genState !== 'running' && (
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
              <X size={13} /> {zh ? '重置' : 'Reset'}
            </button>
          )}
        </div>

        {genState === 'running' && (
          <div className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
            <Loader2 size={15} className="animate-spin shrink-0" />
            <span>{stepLabel}</span>
            <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {zh ? '通常需要 30-90 秒' : 'Usually 30–90 seconds'}
            </span>
          </div>
        )}

        {genState === 'done' && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <div className="text-sm text-emerald-300 flex-1">
              {zh ? 'PPT 已生成！如果没有自动下载，请点击右侧按钮' : "PPT generated! Click to download if it didn't start automatically."}
            </div>
            <a href={downloadHref} download={downloadName}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium shrink-0"
              style={{ background: '#fff', color: '#0a0a0c' }}>
              <Download size={14} /> {zh ? '下载 PPT' : 'Download PPT'}
            </a>
          </div>
        )}

        {genState === 'error' && (
          <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(252,165,165,0.9)' }}>
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div className="text-sm flex-1">{errorMsg}</div>
            <button onClick={() => { setGenState('idle'); setErrorMsg(''); }} style={{ color: 'rgba(252,165,165,0.5)' }}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Sample deck preview */}
      <div>
        <div className="text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <Presentation size={11} />
          {zh ? '示例幻灯片预览' : 'Sample slide preview'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockPitchDeck.map((s) => (
            <div key={s.index} className="rounded-xl aspect-[16/10] p-5 flex flex-col glow-border" style={darkCard}>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <span>{zh ? `幻灯片 ${s.index}` : `Slide ${s.index}`}</span>
                <span className="truncate max-w-[120px]">{activeProject.name[lang]}</span>
              </div>
              <h3 className="text-base font-semibold mt-2 text-white">{s.title[lang]}</h3>
              <ul className="mt-3 space-y-2 text-sm list-disc pl-5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {s.bullets.map((bl, idx) => <li key={idx}>{bl[lang]}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── RoadmapView ───────────────────────────────────────────────────────────────

function RoadmapView() {
  const { b } = useLang();
  return (
    <div className="rounded-xl p-6 glow-border" style={darkCard}>
      <ol className="relative ml-3 space-y-5" style={{ borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
        {mockRoadmap.map((m, idx) => (
          <li key={idx} className="pl-5">
            <span
              className="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full ring-4"
              style={{ background: 'rgba(255,255,255,0.5)' }}
            />
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <Calendar size={12} /> {b(m.quarter)}
            </div>
            <div className="font-medium text-sm mt-0.5 text-white">{b(m.title)}</div>
            <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{b(m.detail)}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── InvestorsView ─────────────────────────────────────────────────────────────

function InvestorsView() {
  const { b } = useLang();
  return (
    <div className="rounded-xl overflow-hidden glow-border" style={darkCard}>
      {mockInvestors.map((i, idx) => (
        <div
          key={i.id}
          className="p-4 flex items-center gap-4"
          style={{ borderBottom: idx < mockInvestors.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
        >
          <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }}>
            <Users size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-white">{i.name}</div>
            <div className="text-xs mt-0.5 line-clamp-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {b(i.focus)} · {b(i.stage)} · {b(i.region)}
            </div>
          </div>
          <div className="text-sm font-semibold tabular-nums text-white">{i.matchScore}%</div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function OutputsLoading() {
  const { t } = useLang();
  return <div className="p-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('loading')}</div>;
}

export default function OutputsPage() {
  return (
    <Suspense fallback={<OutputsLoading />}>
      <OutputsBody />
    </Suspense>
  );
}

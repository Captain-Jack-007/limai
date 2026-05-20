// ---------- Domain: scientific projects & commercialization ----------

import type { Bi, DictKey } from './i18n';

export type ProjectStage = 'idea' | 'lab' | 'prototype' | 'pilot' | 'scaling';

export interface Project {
  id: string;
  name: Bi;
  field: Bi;
  stage: ProjectStage;
  updatedAt: string; // ISO
  summary: Bi;
}

export interface ScoreMetric {
  key: string;
  label: Bi;
  value: number; // 0-10 or 0-100 depending on scale
  scale: 10 | 100;
  hint?: Bi;
}

export interface Evaluation {
  overview: {
    field: Bi;
    innovation: Bi;
    application: Bi;
  };
  scores: ScoreMetric[]; // TRL, market potential, etc.
  insights: Bi[];
  risks: Bi[];
  nextSteps: Bi[];
}

// ---------- Chat ----------

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatAttachment {
  id: string;
  name: string; // filenames stay as-is
  size: number; // bytes
  kind: 'pdf' | 'ppt' | 'doc' | 'image';
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: Bi;
  attachments?: ChatAttachment[];
  createdAt: string; // ISO
}

// ---------- Deep analysis ----------

export interface AnalysisStep {
  key: string;
  label: Bi;
  durationMs: number;
}

// ---------- Investors ----------

export interface Investor {
  id: string;
  name: string; // proper noun, not translated
  focus: Bi;
  stage: Bi;
  region: Bi;
  ticket: Bi;
  matchScore: number; // 0-100
  thesis: Bi;
}

// ---------- Pitch deck ----------

export interface PitchSlide {
  index: number;
  title: Bi;
  bullets: Bi[];
}

// ---------- Roadmap ----------

export interface RoadmapMilestone {
  quarter: Bi;
  title: Bi;
  detail: Bi;
}

// ---------- File upload ----------

export interface UploadFileMeta {
  id: string;
  name: string;
  size: number;
  kind: ChatAttachment['kind'];
  status: 'queued' | 'uploading' | 'parsed' | 'error';
  progress: number;
}

// ---------- Helpers ----------

export const stageDictKey: Record<ProjectStage, DictKey> = {
  idea: 'stage_idea',
  lab: 'stage_lab',
  prototype: 'stage_prototype',
  pilot: 'stage_pilot',
  scaling: 'stage_scaling',
};

// ============ Skeptic Pipeline Types ============

export type SourceType = 'paper' | 'patent' | 'news' | 'company' | 'policy' | 'ai_inference';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'disputed';

export interface EvidenceItem {
  id: string;              // 形如 'ev_001'
  type: SourceType;
  title: string;
  url?: string;
  doi?: string;
  snippet: string;         // 原文片段，<= 300 字
  date?: string;
  source: 'serper' | 'semantic_scholar' | 'user_upload' | 'minimax_tool';
}

export interface Claim {
  id: string;              // 形如 'cl_ch3_007'
  chapter: number;         // 1..10
  text: string;            // 原子声明文本
  evidenceIds: string[];   // 引用的 evidence id 列表
  sourceType: SourceType;
  confidence?: ConfidenceLevel;  // 由 Skeptic 评定
  skepticNote?: string;          // Skeptic 评定理由
}

export interface SkepticContradiction {
  claimIds: string[];
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface SkepticDissent {
  targetClaimId: string;
  counterArgument: string;
  counterEvidenceIds?: string[];
}

export interface SkepticReport {
  claims: Claim[];
  contradictions: SkepticContradiction[];
  dissents: SkepticDissent[];
  unsupportedClaims: string[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    disputed: number;
  };
}

// ============ Editor Pipeline Types ============

export interface TermCluster {
  canonical: string;
  aliases: string[];
  abbreviation?: string;
}

export interface EditorReport {
  finalMarkdown: string;
  referenceList: Array<{
    index: number;
    evidenceId: string;
    title: string;
    url?: string;
    type: SourceType;
  }>;
  stats: {
    citationsRenumbered: number;
    termsNormalized: number;
    hedgesInjected: number;
    dissentsWoven: number;
    skippedSteps: string[];
  };
}

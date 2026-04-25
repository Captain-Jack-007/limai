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

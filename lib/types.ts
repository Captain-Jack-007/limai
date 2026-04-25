// ---------- Domain: scientific projects & commercialization ----------

export type ProjectStage = 'idea' | 'lab' | 'prototype' | 'pilot' | 'scaling';

export interface Project {
  id: string;
  name: string;
  field: string;
  stage: ProjectStage;
  updatedAt: string; // ISO
  summary: string;
}

export interface ScoreMetric {
  key: string;
  label: string;
  value: number; // 0-10 or 0-100 depending on scale
  scale: 10 | 100;
  hint?: string;
}

export interface Evaluation {
  overview: {
    field: string;
    innovation: string;
    application: string;
  };
  scores: ScoreMetric[]; // TRL, market potential, etc.
  insights: string[];
  risks: string[];
  nextSteps: string[];
}

// ---------- Chat ----------

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatAttachment {
  id: string;
  name: string;
  size: number; // bytes
  kind: 'pdf' | 'ppt' | 'doc' | 'image';
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  attachments?: ChatAttachment[];
  createdAt: string; // ISO
}

// ---------- Deep analysis ----------

export interface AnalysisStep {
  key: string;
  label: string;
  durationMs: number;
}

// ---------- Investors ----------

export interface Investor {
  id: string;
  name: string;
  focus: string;
  stage: string;
  region: string;
  ticket: string;
  matchScore: number; // 0-100
  thesis: string;
}

// ---------- Pitch deck ----------

export interface PitchSlide {
  index: number;
  title: string;
  bullets: string[];
}

// ---------- Roadmap ----------

export interface RoadmapMilestone {
  quarter: string;
  title: string;
  detail: string;
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

export function stageLabel(s: ProjectStage): string {
  const map: Record<ProjectStage, string> = {
    idea: 'Idea',
    lab: 'Lab',
    prototype: 'Prototype',
    pilot: 'Pilot',
    scaling: 'Scaling',
  };
  return map[s];
}

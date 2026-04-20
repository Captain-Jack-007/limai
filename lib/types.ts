export type RiskCategory = "employment" | "expense" | "tax" | "entity";

export type RiskLevel = "low" | "medium" | "high";

export interface CategoryScore {
  key: RiskCategory;
  label: string;
  labelZh: string;
  score: number; // 0-100
}

export interface Issue {
  id: string;
  category: RiskCategory;
  title: string;
  titleZh: string;
  severity: RiskLevel;
  score: number; // 0-100 contribution
  summary: string;
  detail: string;
  regulation: string;
  recommendation: string;
  evidence: { label: string; value: string }[];
  detectedAt: string; // ISO
}

export interface CompanyRisk {
  company: string;
  period: string;
  overallScore: number;
  level: RiskLevel;
  categories: CategoryScore[];
  issues: Issue[];
  salaryVsSocial: { month: string; salary: number; social: number }[];
  taxBenchmark: { label: string; company: number; industry: number }[];
}

export interface UploadFileMeta {
  id: string;
  name: string;
  size: number;
  kind:
    | "payroll"
    | "social_security"
    | "invoice"
    | "bank"
    | "tax_declaration";
  status: "queued" | "uploading" | "parsed" | "error";
  progress: number;
}

export function levelFromScore(score: number): RiskLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

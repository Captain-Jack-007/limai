import type { Claim, EvidenceItem, ConfidenceLevel, SkepticReport, SkepticContradiction } from './types';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface SkepticReviewInput {
  chapterIndex: number;
  chapterBody: string;
  claims: Claim[];
  evidence: EvidenceItem[];
}

export interface CrossChapterInput {
  claims: Claim[];
  evidence: EvidenceItem[];
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const SKEPTIC_SYSTEM_PROMPT = `你是一位严苛的同行评审人（devil's advocate）。你的任务不是写作，而是质疑。

你将收到：研报某一章正文、该章原子声明列表（每条带 evidenceIds）、相关 Evidence Pool 原文。

你必须执行以下任务：

【任务 1：可信度评级】
基于 evidenceIds 对应的实际证据原文，为每条 claim 评级：
- "high"：该 claim 由至少 2 个独立来源（不同 domain、不同作者）的证据共同支持，且证据原文与 claim 表述实质一致
- "medium"：仅 1 个可靠来源支持（论文 / 政府文件 / 知名企业披露）
- "low"：evidenceIds 为空（纯 AI 推断），或仅来自单一二手新闻/博客
- "disputed"：不同 evidence 之间存在实质矛盾（如同一指标数字差异 >30%）

判定原则：evidence 标题/snippet 必须与 claim 内容实际相关，仅仅"属于同一行业"不足以判定为支持。如果 evidence 内容根本没提到 claim 描述的事实，视为无支持。

【任务 2：未支撑声明识别】
列出所有 evidenceIds 为空、但正文表述为确定事实（非"预计""可能""有望"）的 claim id。

【任务 3：反方论证】
对该章中最乐观的 2-3 条 claim（市场规模预测、技术领先性、商业前景），写出基于现有证据的反方论点。如果 Evidence Pool 中有支持反方的内容，引用其 ev_id。

【严格输出格式】
只输出 JSON 对象，无 markdown 代码块包裹，无任何额外解释文字。Schema：

{
  "claims": [
    {"id": "cl_xxx", "confidence": "high|medium|low|disputed", "reason": "10-40字判定依据"}
  ],
  "unsupportedClaims": ["cl_xxx", ...],
  "dissents": [
    {"targetClaimId": "cl_xxx", "counterArgument": "反方论点", "counterEvidenceIds": ["ev_xxx"]}
  ]
}`;

const CROSS_CHAPTER_SYSTEM_PROMPT = `你是研报跨章节矛盾检测器。

你将收到一份十章研报中所有章节的声明列表（每条声明含章节号和 ID）。

【任务】
找出不同章节之间存在实质矛盾的声明对或声明组。矛盾定义：
- 数值矛盾：同一指标（市场规模、增速、技术参数等）在不同章节数字差异 >20%
- 逻辑矛盾：一章断言某事为真，另一章断言同一事为假（如"国内已实现量产"vs"国内尚无量产案例"）
- 评估矛盾：对同一技术/竞品/市场的定性描述截然相反

【排除】
- 同一事实的不同维度描述（如TAM vs SAM不算矛盾）
- 时间点不同导致的合理差异（如2023年数据 vs 2025年预测）
- 合理的正反两面论述（如风险章节的谨慎表述）

只输出 JSON，无 markdown 包裹。Schema：
{
  "contradictions": [
    {
      "claimIds": ["cl_ch2_001", "cl_ch4_003"],
      "description": "矛盾说明（30字以内，描述核心冲突）",
      "severity": "high|medium|low"
    }
  ]
}

若无矛盾，返回 {"contradictions": []}`;

// ── Shared DeepSeek caller ────────────────────────────────────────────────────

async function callDeepSeek(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
  temperature: number,
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY 未配置');

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature,
      response_format: { type: 'json_object' },
      thinking: { type: 'disabled' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API 错误: ${res.status} ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  let content: string = data.choices?.[0]?.message?.content ?? '';
  if (!content && data.choices?.[0]?.message?.reasoning_content) {
    console.warn('[DeepSeek] content 字段为空，使用 reasoning_content 兜底');
    content = data.choices[0].message.reasoning_content as string;
  }
  return content;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function safeParseJson(raw: string): Record<string, unknown> {
  const cleaned = raw
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/```json\s*/g, '')
    .replace(/```\s*$/g, '')
    .trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        // fall through
      }
    }
    return {};
  }
}

function buildReviewUserMessage(
  chapterIndex: number,
  chapterBody: string,
  claims: Claim[],
  evidence: EvidenceItem[],
): string {
  const evidenceText = evidence
    .map((e) => `[${e.id}] (${e.type}) ${e.title}\n${e.snippet}\n${e.url ?? ''}`)
    .join('\n\n');

  const claimsText = claims
    .map((c) => `${c.id} | evidence: [${c.evidenceIds.join(', ') || '空'}]\n  ${c.text}`)
    .join('\n');

  return `# 章节正文（Chapter ${chapterIndex}）

${chapterBody}

---

# 该章 Claims

${claimsText}

---

# 相关 Evidence Pool

${evidenceText || '（无相关 evidence）'}`;
}

function verifyHighConfidence(claim: Claim, evidence: EvidenceItem[]): Claim {
  if (claim.confidence !== 'high') return claim;
  const refs = claim.evidenceIds
    .map((id) => evidence.find((e) => e.id === id))
    .filter((e): e is EvidenceItem => e !== undefined);

  if (refs.length < 2) return { ...claim, confidence: 'medium' };

  const domains = new Set(
    refs.map((e) => {
      try {
        return new URL(e.url ?? '').hostname.split('.').slice(-2).join('.');
      } catch {
        return e.url ?? e.id;
      }
    }),
  );
  if (domains.size < 2) {
    return {
      ...claim,
      confidence: 'medium',
      skepticNote: (claim.skepticNote ?? '') + '（程序校验：来源域名不独立，降级）',
    };
  }

  const nonNewsCount = refs.filter((e) => e.type !== 'news').length;
  if (nonNewsCount === 0 && refs.length < 3) {
    return {
      ...claim,
      confidence: 'medium',
      skepticNote: (claim.skepticNote ?? '') + '（程序校验：仅新闻类来源，降级）',
    };
  }

  return claim;
}

function summarize(claims: Claim[]): SkepticReport['summary'] {
  const s = { total: claims.length, high: 0, medium: 0, low: 0, disputed: 0 };
  for (const c of claims) {
    if (c.confidence) s[c.confidence] += 1;
  }
  return s;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function runSkepticReview(input: SkepticReviewInput): Promise<SkepticReport> {
  const { chapterIndex, chapterBody, claims, evidence } = input;

  if (!claims || claims.length === 0) {
    return {
      claims: [],
      contradictions: [],
      dissents: [],
      unsupportedClaims: [],
      summary: { total: 0, high: 0, medium: 0, low: 0, disputed: 0 },
    };
  }

  const referencedEvIds = new Set(claims.flatMap((c) => c.evidenceIds));
  const relevantEvidence = evidence.filter((e) => referencedEvIds.has(e.id));
  const userMessage = buildReviewUserMessage(chapterIndex, chapterBody, claims, relevantEvidence);

  const raw = await callDeepSeek(SKEPTIC_SYSTEM_PROMPT, userMessage, 8000, 0.2);
  const parsed = safeParseJson(raw);

  const claimMap = new Map(claims.map((c) => [c.id, { ...c }]));
  const reviewedClaims = Array.isArray(parsed.claims)
    ? (parsed.claims as Array<{ id: string; confidence: string; reason: string }>)
    : [];
  for (const review of reviewedClaims) {
    const c = claimMap.get(review.id);
    if (c) {
      c.confidence = (review.confidence as ConfidenceLevel) || 'low';
      c.skepticNote = review.reason;
    }
  }
  const enrichedClaims = Array.from(claimMap.values()).map((c) => ({
    ...c,
    confidence: c.confidence || ('low' as ConfidenceLevel),
  }));

  const verifiedClaims = enrichedClaims.map((c) => verifyHighConfidence(c, evidence));

  return {
    claims: verifiedClaims,
    contradictions: [],
    dissents: Array.isArray(parsed.dissents) ? parsed.dissents : [],
    unsupportedClaims: Array.isArray(parsed.unsupportedClaims) ? parsed.unsupportedClaims : [],
    summary: summarize(verifiedClaims),
  };
}

export async function runCrossChapterCheck(
  input: CrossChapterInput,
): Promise<{ contradictions: SkepticContradiction[] }> {
  const { claims, evidence } = input;

  if (!claims || claims.length === 0) {
    return { contradictions: [] };
  }

  const byChapter = new Map<number, Claim[]>();
  for (const c of claims) {
    const arr = byChapter.get(c.chapter) ?? [];
    arr.push(c);
    byChapter.set(c.chapter, arr);
  }

  const claimsText = Array.from(byChapter.entries())
    .sort(([a], [b]) => a - b)
    .map(([chapter, chs]) => {
      const lines = chs
        .slice(0, 20)
        .map((c) => `  ${c.id}: ${c.text.substring(0, 100)}`)
        .join('\n');
      return `【第 ${chapter} 章】\n${lines}`;
    })
    .join('\n\n');

  const evIndex = evidence
    .slice(0, 30)
    .map((e) => `[${e.id}] ${e.title}`)
    .join('\n');

  const userMessage =
    `## 研报声明列表（按章节）\n\n${claimsText}` +
    (evIndex ? `\n\n## Evidence 索引（供参考）\n\n${evIndex}` : '');

  try {
    const raw = await callDeepSeek(CROSS_CHAPTER_SYSTEM_PROMPT, userMessage, 4000, 0.1);
    const parsed = safeParseJson(raw);
    const contradictions: SkepticContradiction[] = Array.isArray(parsed.contradictions)
      ? (parsed.contradictions as SkepticContradiction[])
      : [];
    return { contradictions };
  } catch (e) {
    console.warn('skeptic-cross-chapter DeepSeek error:', e);
    return { contradictions: [] };
  }
}

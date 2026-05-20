import type { Claim, EvidenceItem, SkepticDissent, TermCluster, EditorReport, SourceType } from './types';
import { renumberCitations, formatReferences } from './citation-renumber';
import { maskCitations, restoreCitations, validatePlaceholders } from './citation-placeholder';
import { extractCandidateTerms, applyTermClusters } from './term-normalize';
import { injectHedges, HEDGE_INSTRUCTIONS } from './hedge-inject';

export interface EditorInput {
  chapterBodies: string[];
  claims: Claim[];
  evidence: EvidenceItem[];
  dissents: SkepticDissent[];
}

/**
 * Runs the full Phase 6 Editor pipeline as a direct function call (no HTTP).
 * Any LLM sub-step failure is caught and recorded in stats.skippedSteps.
 * Never throws — the caller should always get an EditorReport back.
 */
function countChapterHeadings(text: string): number {
  return (text.match(/^## 第\d+章/gm) ?? []).length;
}

function applyLlmResult(
  label: string,
  current: string,
  masked: string,
  placeholderMap: Map<string, string>,
  llmOutput: string,
  skippedSteps: string[],
  skipKey: string,
): string {
  const missing = validatePlaceholders(llmOutput, placeholderMap);
  if (missing.length > 0) {
    skippedSteps.push(`${skipKey}:placeholder-lost`);
    console.warn(`[Editor] ${label} placeholder 丢失 ${missing.length} 个，拒绝应用`);
    return current;
  }

  const lossRatio = masked.length > 0 ? (masked.length - llmOutput.length) / masked.length : 0;
  const origHeadings = countChapterHeadings(masked);
  const newHeadings = countChapterHeadings(llmOutput);

  if (lossRatio > 0.5) {
    console.warn(`[Editor] ${label} 内容损失 ${(lossRatio * 100).toFixed(1)}% (${masked.length}→${llmOutput.length})，拒绝应用`);
    skippedSteps.push(`${skipKey}:truncation-detected`);
    return current;
  }

  if (origHeadings > 0 && newHeadings < origHeadings) {
    console.warn(`[Editor] ${label} 章节数减少 ${origHeadings}→${newHeadings}，拒绝应用`);
    skippedSteps.push(`${skipKey}:chapter-loss-detected`);
    return current;
  }

  return restoreCitations(llmOutput, placeholderMap);
}

export async function runEditorPipeline(input: EditorInput): Promise<EditorReport> {
  const { chapterBodies, claims, evidence, dissents } = input;
  const skippedSteps: string[] = [];
  const stats = {
    citationsRenumbered: 0,
    termsNormalized: 0,
    hedgesInjected: 0,
    dissentsWoven: 0,
    skippedSteps,
  };

  let current = chapterBodies.join('\n\n---\n\n');
  console.log('[Editor] 开始: chapterBodies=', chapterBodies.length, '章，total=', current.length);

  // Step 6.1: Hedge injection (program — always succeeds)
  try {
    const { markdown: hedged, hedgesInjected } = injectHedges(current, claims ?? []);
    current = hedged;
    stats.hedgesInjected = hedgesInjected;
  } catch {
    skippedSteps.push('hedge-inject');
  }
  console.log('[Editor] 6.1 injectHedges:', current.length);

  // Step 6.2: Term normalization (LLM — degradable)
  try {
    const candidates = extractCandidateTerms(current);
    if (candidates.length >= 3) {
      const clusters = await llmClusterTerms(candidates);
      const { markdown: normalized, replacements } = applyTermClusters(current, clusters);
      current = normalized;
      stats.termsNormalized = replacements;
    }
  } catch {
    skippedSteps.push('term-normalize');
  }
  console.log('[Editor] 6.2 termNormalize:', current.length);

  // Step 6.3: Citation renumber (program — always succeeds)
  const { markdown: renumbered, orderedEvidenceIds, citationsRenumbered } = renumberCitations(
    current,
    claims ?? [],
    evidence ?? [],
  );
  current = renumbered;
  stats.citationsRenumbered = citationsRenumbered;
  console.log('[Editor] 6.3 renumberCitations:', current.length);

  // Step 6.4: Placeholder isolation + Dissent weaving (LLM — degradable)
  let woven = 0;
  try {
    const { masked, placeholderMap } = maskCitations(current);
    console.log('[Editor] 6.4 mask: size=', placeholderMap.size, 'len=', masked.length);
    const { markdown: weavedMasked, woven: w } = await llmWeaveDissents(masked, dissents ?? []);
    console.log('[Editor] 6.4 weave: output=', weavedMasked.length);
    const restored = applyLlmResult('6.4', current, masked, placeholderMap, weavedMasked, skippedSteps, 'dissent-weave');
    if (restored !== current) woven = w;
    current = restored;
  } catch {
    skippedSteps.push('dissent-weave');
  }
  stats.dissentsWoven = woven;
  console.log('[Editor] 6.4 dissent-weave:', current.length);

  // Step 6.5: Hedge naturalization (LLM — degradable)
  try {
    const { masked, placeholderMap } = maskCitations(current);
    console.log('[Editor] 6.5 mask: size=', placeholderMap.size, 'len=', masked.length);
    const naturalized = await llmNaturalizeHedges(masked);
    console.log('[Editor] 6.5 naturalize: output=', naturalized.length);
    current = applyLlmResult('6.5', current, masked, placeholderMap, naturalized, skippedSteps, 'hedge-naturalize');
  } catch {
    skippedSteps.push('hedge-naturalize');
  }
  console.log('[Editor] 6.5 hedge-naturalize:', current.length);

  // Step 6.5b: Replace stray [^ev_NNN] literals that chapter writers accidentally produced
  // (they should have used [^cl_chN_NNN] instead; these bypass renumberCitations)
  current = current.replace(/\[\^ev_(\d+)\]/gi, (_match, num: string) => {
    const id = `ev_${num.padStart(3, '0')}`;
    const ev = (evidence ?? []).find((e) => e.id === id);
    return ev ? ' <sup>[来源]</sup>' : '';
  });

  // Step 6.6: Build reference list
  const referenceMarkdown = formatReferences(orderedEvidenceIds, evidence ?? []);
  const referenceList = orderedEvidenceIds.map((evId, i) => {
    const ev = (evidence ?? []).find((e) => e.id === evId);
    return {
      index: i + 1,
      evidenceId: evId,
      title: ev?.title ?? evId,
      url: ev?.url,
      type: (ev?.type ?? 'news') as SourceType,
    };
  });

  const finalMarkdown = referenceMarkdown
    ? current + '\n\n---\n\n' + referenceMarkdown
    : current;
  console.log('[Editor] 6.6 finalMarkdown:', finalMarkdown.length);

  return { finalMarkdown, referenceList, stats };
}

// ── Private LLM helpers (moved from app/api/ai/editor/route.ts) ───────────────

async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = false,
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
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 16000,
      temperature: 0.3,
      thinking: { type: 'disabled' },
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DeepSeek API 错误: ${res.status} ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  let content: string = data.choices?.[0]?.message?.content ?? '';
  if (!content && data.choices?.[0]?.message?.reasoning_content) {
    console.warn('[DeepSeek] content 字段为空，使用 reasoning_content 兜底');
    content = data.choices[0].message.reasoning_content as string;
  }
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

async function llmClusterTerms(candidates: string[]): Promise<TermCluster[]> {
  if (candidates.length === 0) return [];

  const system = `你是术语归一化助手。输入是从研报正文中提取的候选术语列表。
请将同义/近义术语聚合为 cluster，每个 cluster 选一个 canonical（最规范的中文表达），列出 aliases（变体写法）。
只输出 JSON 数组，无 markdown 包裹。Schema：
[{"canonical":"规范术语","aliases":["变体1","变体2"],"abbreviation":"可选缩写"}]
注意：只聚合确实是同一概念的术语，不要强行合并不相关词语。若无需归一化，返回 []。`;

  const user = `候选术语列表（共 ${candidates.length} 条）：\n${candidates.slice(0, 100).join('\n')}`;

  try {
    const raw = await callDeepSeek(system, user, true);
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? (parsed as TermCluster[]) : [];
  } catch {
    return [];
  }
}

async function llmWeaveDissents(
  markdown: string,
  dissents: SkepticDissent[],
): Promise<{ markdown: string; woven: number }> {
  if (dissents.length === 0) return { markdown, woven: 0 };

  const dissentText = dissents
    .map(
      (d) => `针对引用 ${d.targetClaimId} 附近的论断：\n反方论点：${d.counterArgument}`,
    )
    .join('\n\n');

  const system = `你是研报编辑助手。你将收到研报正文（Markdown）和若干反方论点（由 Skeptic Agent 生成）。
你的任务是将反方论点自然地插入正文对应段落附近，用一小段平衡性表述呈现（"然而，也有观点认为……"、"值得注意的是……"），
保持专业客观，不改动原有事实性表述，不删除 {{CITE:N}} 占位符，不改动表格结构。
直接输出修改后的完整 Markdown 正文，无需解释。`;

  const user = `## 研报正文\n\n${markdown.substring(0, 20000)}\n\n---\n\n## 需要插入的反方论点\n\n${dissentText}`;

  try {
    const rewritten = await callDeepSeek(system, user, false);
    return { markdown: rewritten, woven: dissents.length };
  } catch {
    return { markdown, woven: 0 };
  }
}

async function llmNaturalizeHedges(markdown: string): Promise<string> {
  if (!markdown.includes('{{HEDGE:')) return markdown;

  const system = `你是研报润色助手。${HEDGE_INSTRUCTIONS}
除替换占位符外，不改动正文其他内容，不删除 {{CITE:N}} 占位符，不改动表格。
直接输出修改后的完整 Markdown 正文。`;

  const user = markdown.substring(0, 20000);

  try {
    return await callDeepSeek(system, user, false);
  } catch {
    return markdown
      .replace(/\{\{HEDGE:single-source\}\}/g, '据相关报道，')
      .replace(/\{\{HEDGE:disputed\}\}/g, '业界对此存在不同看法，');
  }
}

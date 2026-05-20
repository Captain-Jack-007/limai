import { INTAKE_AGENT_SYSTEM_PROMPT, buildIntakeUserPrompt } from './prompts/intake-agent';
import { buildSearchQueries } from './prompts/search-agent';
import { CHAPTER_CONFIG } from './prompts/chapter-writers';
import { EvidencePool } from './evidence-pool';
import type { SerperResult } from './serper';
import type { Claim, SourceType } from './types';

// ── Output types ──────────────────────────────────────────────────────────────

export interface ChapterResult {
  index: number;
  body: string;
  claims: Claim[];
}

export interface ChapterPhasesResult {
  chapterResults: ChapterResult[];
  evidencePool: EvidencePool;
  finalProjectName: string;
  warnings: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function cleanupBody(body: string): string {
  return body
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/===CHAPTER_BODY===/g, '')
    .replace(/===CLAIMS_JSON===/g, '')
    .replace(/===END===/g, '')
    .replace(/=\s*=\s*=\s*CHAPTER_BODY\s*=\s*=\s*=/g, '')
    .replace(/=\s*=\s*=\s*CLAIMS_JSON\s*=\s*=\s*=/g, '')
    .replace(/=\s*=\s*=\s*END\s*=\s*=\s*=/g, '')
    .replace(/^```(?:markdown|md)?\s*/i, '')
    .replace(/```\s*$/, '')
    .replace(/\[ev_[a-z0-9_]+\]/gi, '')
    .trim();
}

// ── API callers ───────────────────────────────────────────────────────────────

const MINIMAX_API_URL = 'https://api.minimaxi.com/v1/chat/completions';

async function callMiniMax(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4000,
  signal?: AbortSignal,
): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY || '';
  const res = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.5-highspeed',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
    }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('MiniMax API error:', res.status, errText);
    throw new Error('MiniMax API 错误: ' + res.status + ' ' + errText.slice(0, 200));
  }

  const data = await res.json();

  if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
    console.error('MiniMax app error:', data.base_resp);
    throw new Error('MiniMax 服务错误: ' + data.base_resp.status_msg);
  }

  const choices = data?.choices;
  if (!choices || choices.length === 0) {
    console.error('MiniMax empty choices:', JSON.stringify(data).slice(0, 500));
    throw new Error('MiniMax 返回空结果');
  }

  const content: string = choices[0]?.message?.content || '';
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

async function callDeepSeekReport(
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
      max_tokens: 4000,
      temperature: 0.1,
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
    console.warn('[DeepSeek/report] content 字段为空，使用 reasoning_content 兜底');
    content = data.choices[0].message.reasoning_content as string;
  }
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

// ── Phase 1: Intake Agent ────────────────────────────────────────────────────

export async function runIntakeAgent(
  userText: string,
  fileText: string | null,
): Promise<Record<string, unknown>> {
  const raw = await callMiniMax(
    INTAKE_AGENT_SYSTEM_PROMPT,
    buildIntakeUserPrompt(userText, fileText),
    2000,
  );
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      projectName: userText?.substring(0, 50) || '未知项目',
      domain: '未知',
      estimatedTRL: 5,
      competitorKeywords: [],
      academicKeywords: [],
    };
  }
}

// ── Phase 2: Search Agent ────────────────────────────────────────────────────

export async function runSearchAgent(
  intake: Record<string, unknown>,
): Promise<{ context: string; serperResults: SerperResult[] }> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) {
    return { context: '（未配置搜索 API，跳过网络搜索）', serperResults: [] };
  }

  const queries = buildSearchQueries(intake);
  const allSerperResults: SerperResult[] = [];
  const seenLinks = new Set<string>();

  const searchPromises = queries.slice(0, 6).map(async (q) => {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: q.query,
          search_depth: 'advanced',
          include_answer: false,
          max_results: 5,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return { lines: '', results: [] as SerperResult[] };
      const data = await res.json();
      const hits: Array<{ title: string; content?: string; url: string; published_date?: string }> =
        data.results ?? [];
      const mapped: SerperResult[] = hits.map((r) => ({
        title: r.title,
        snippet: (r.content ?? '').substring(0, 200),
        link: r.url,
        date: r.published_date,
      }));
      const lines = mapped
        .map((r) => '[搜索:' + q.type + '] ' + r.title + ' — ' + r.snippet + ' (' + r.link + ')')
        .join('\n');
      return { lines, results: mapped };
    } catch {
      return { lines: '', results: [] as SerperResult[] };
    }
  });

  const settled = await Promise.all(searchPromises);
  const contextLines: string[] = [];
  for (const { lines, results } of settled) {
    if (lines) contextLines.push(lines);
    for (const r of results) {
      if (!seenLinks.has(r.link)) {
        seenLinks.add(r.link);
        allSerperResults.push(r);
      }
    }
  }

  const fullContext = contextLines.join('\n\n');
  return {
    context: fullContext.substring(0, 15000),
    serperResults: allSerperResults,
  };
}

// ── Phase 3: Chapter Writers (two-pass) ──────────────────────────────────────

function buildIntakeContextForChapter(intakeJsonStr: string, chapterIndex: number): string {
  let intake: Record<string, unknown>;
  try {
    intake = JSON.parse(intakeJsonStr) as Record<string, unknown>;
  } catch {
    return intakeJsonStr;
  }

  const core = {
    projectName: intake.projectName,
    domain: intake.domain,
    coreTechDescription: intake.coreTechDescription,
    innovation: intake.innovation,
    estimatedTRL: intake.estimatedTRL,
  };

  const chapterSpecific: Record<number, Record<string, unknown>> = {
    1: { targetMarkets: intake.targetMarkets, existingAssets: intake.existingAssets },
    2: { researchers: intake.researchers, companyInfo: intake.companyInfo, teamSize: intake.teamSize },
    3: { existingAssets: intake.existingAssets, academicKeywords: intake.academicKeywords },
    4: { targetMarkets: intake.targetMarkets, potentialApplications: intake.potentialApplications },
    5: { competitorKeywords: intake.competitorKeywords, academicKeywords: intake.academicKeywords },
    6: { potentialApplications: intake.potentialApplications },
    7: { existingAssets: intake.existingAssets, targetMarkets: intake.targetMarkets },
    8: { targetMarkets: intake.targetMarkets, trlReason: intake.trlReason, existingAssets: intake.existingAssets },
    9: { trlReason: intake.trlReason, estimatedTRL: intake.estimatedTRL },
    10: { targetMarkets: intake.targetMarkets, companyInfo: intake.companyInfo },
  };

  const merged = { ...core, ...(chapterSpecific[chapterIndex] ?? {}) };
  return JSON.stringify(merged, null, 2);
}

function buildPass1SystemPrompt(
  chapterNum: string,
  chapterTitle: string,
  wordTarget: string,
  tables: string,
  focus: string,
): string {
  return `你是赛乔（Sci-Bridge Agent）的研报写作智能体，负责撰写第${chapterNum}章「${chapterTitle}」。

## 写作标准（华尔街日报深度报道风格）

1. **长度**：${wordTarget}，不能少于下限
2. **结构**：分 3-5 个小节，用 ### 三级标题
3. **表格**：必须包含${tables}，每张表格用 Markdown 表格语法，标题格式「表格N：XXXXX」
4. **数据标注**：每个事实性声明（数字、市场规模、技术参数、企业名称、年份等）在句末用脚注 [^cl_ch${chapterNum}_NNN] 标记，NNN 从 001 开始
5. **风格**：专业深度、数据驱动、逻辑严密、不空泛
6. **重点关注**：${focus}

## 引用格式（严格遵守）

正文中**只能**用 [^cl_ch${chapterNum}_NNN] 脚注，**严禁**使用 [ev_xxx]、[来源：xxx] 或自编数字角标。

## 表格设计

- 每张表格至少 4 列，包含对比维度
- 竞品对比表必须列出本项目和 2-3 个竞争对手（从 intakeJson 的 competitorKeywords 中选）
- 数字必须标注来源脚注

## 输出格式

直接输出章节正文 Markdown。不要输出章节标题行（如"第X章 XXX"），直接从 ### 小节标题或正文段落开始。
本次任务**只写正文**，不要在末尾输出任何 JSON、元数据或分隔符。`;
}

function buildPass1UserPrompt(
  intakeJsonStr: string,
  chapterIndex: number,
  searchContext: string,
  evidenceContext: string,
): string {
  const intakeForChapter = buildIntakeContextForChapter(intakeJsonStr, chapterIndex);
  return (
    '## 项目信息\n\n' +
    intakeForChapter +
    '\n\n## 搜索参考资料\n\n' +
    (searchContext || '（无）') +
    (evidenceContext ? '\n\n' + evidenceContext : '')
  );
}

async function extractClaimsFromBody(
  body: string,
  chapterIndex: number,
  chapterNum: string,
): Promise<Claim[]> {
  const systemPrompt = `你是一个精确的事实抽取工具。从给定的研报章节正文中，识别所有 [^cl_ch${chapterNum}_NNN] 脚注对应的事实声明，输出 JSON 数组。

【任务】
对正文中每一个 [^cl_ch${chapterNum}_NNN] 脚注：
1. 找到该脚注所在句子
2. 提取该句子的核心事实声明（去除前置连接词，保留事实本身）
3. 输出一个 claim 条目

【输出格式】只输出 JSON 数组，无任何前缀后缀：

[
  {
    "id": "cl_ch${chapterNum}_001",
    "text": "该脚注对应的事实声明文本",
    "evidenceIds": [],
    "sourceType": "ai_inference"
  }
]

【规则】
- id 必须严格匹配正文中的脚注 id（如 cl_ch${chapterNum}_001）
- text 是声明本身，不含 [^cl_xxx] 标记
- evidenceIds 默认为空数组，sourceType 默认 "ai_inference"
- 只输出 JSON 数组，不要任何解释文字`;

  const userPrompt = `## 章节正文（请提取所有脚注对应的 claims）\n\n${body}`;

  const raw = await callDeepSeekReport(systemPrompt, userPrompt, true);
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(cleaned);
  const arr: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as Record<string, unknown>).claims)
      ? ((parsed as Record<string, unknown>).claims as unknown[])
      : [];
  return arr
    .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
    .map((c) => ({
      id: c.id as string,
      chapter: chapterIndex,
      text: c.text as string,
      evidenceIds: Array.isArray(c.evidenceIds) ? (c.evidenceIds as string[]) : [],
      sourceType: ((c.sourceType as string) || 'ai_inference') as SourceType,
    }));
}

async function writeOneChapter(
  chapterNum: string,
  chapterTitle: string,
  wordTarget: string,
  tables: string,
  focus: string,
  intakeJson: string,
  searchContext: string,
  evidencePool: EvidencePool,
): Promise<ChapterResult> {
  const chapterIndex = parseInt(chapterNum, 10) || 0;
  const rawEvidenceContext = evidencePool.toPromptContext();
  const evidenceContext = rawEvidenceContext
    ? `# Evidence Pool（证据库）\n\n下列是本研报可引用的证据列表，每条有唯一 ID（ev_001、ev_002 ...）。\n\n【提醒】正文中**只能**用 [^cl_chN_NNN] 脚注，**不能**直接使用 ev_ ID。\n\n${rawEvidenceContext}`
    : '';

  const chapterHeader = '## 第' + chapterNum + '章 ' + chapterTitle + '\n\n';

  // Pass 1: Generate body only (MiniMax, maxTokens=8000, 90s timeout)
  const pass1System = buildPass1SystemPrompt(chapterNum, chapterTitle, wordTarget, tables, focus);
  const pass1User = buildPass1UserPrompt(intakeJson, chapterIndex, searchContext, evidenceContext);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  let body: string;
  try {
    const rawBody = await callMiniMax(pass1System, pass1User, 8000, controller.signal);
    clearTimeout(timeoutId);
    body = cleanupBody(rawBody);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if ((err as Error).name === 'AbortError') {
      console.error(`[Chapter ${chapterIndex}] Pass 1 超时 180 秒，跳过`);
      return {
        index: chapterIndex,
        body: chapterHeader + '（本章生成超时，请重试）',
        claims: [],
      };
    }
    throw err;
  }

  if (!body || body.length < 500) {
    console.warn(`[Chapter ${chapterIndex}] Pass 1 正文过短(${body.length}字)，跳过 Pass 2`);
    return { index: chapterIndex, body: chapterHeader + body, claims: [] };
  }

  console.log(`[Chapter ${chapterIndex}] Pass 1 完成，正文 ${body.length} 字`);

  // Pass 2: Extract claims from body (DeepSeek, fault-tolerant)
  let claims: Claim[] = [];
  try {
    claims = await extractClaimsFromBody(body, chapterIndex, chapterNum);
    console.log(`[Chapter ${chapterIndex}] Pass 2 提取到 ${claims.length} 条 claims`);
  } catch (err) {
    console.warn(`[Chapter ${chapterIndex}] Pass 2 claims 提取失败，使用空 claims:`, err);
  }

  return { index: chapterIndex, body: chapterHeader + body, claims };
}


// ── Main export: Phases 1-3 ───────────────────────────────────────────────────

export async function runChapterPhases(
  userText: string,
  fileText: string | null,
  projectName?: string,
): Promise<ChapterPhasesResult> {
  const warnings: string[] = [];

  const truncatedFileText =
    fileText && fileText.length > 50000 ? fileText.substring(0, 15000) : fileText;
  if (fileText && fileText.length > 50000) {
    warnings.push(
      `文件内容较长（${Math.round(fileText.length / 1000)}K 字），已自动截取前 15000 字用于分析`,
    );
  }

  // Phase 1
  const intake = await runIntakeAgent(userText, truncatedFileText);
  const finalProjectName = projectName || (intake.projectName as string) || '未命名项目';
  const intakeJson = JSON.stringify(intake, null, 2);

  // Phase 2: search + build evidence pool
  const { context: searchContext, serperResults } = await runSearchAgent(intake);
  if (!searchContext || searchContext.includes('未配置搜索')) {
    warnings.push('未配置搜索 API，研报中竞品和市场数据将基于 AI 知识库生成');
  }
  const evidencePool = new EvidencePool();
  if (serperResults.length > 0) {
    evidencePool.addFromSerper(serperResults);
  }

  // Phase 3: batch processing — 4 chapters per batch to avoid MiniMax QPS limits
  const allChapters = CHAPTER_CONFIG.flatMap((g) => g.chapters);
  const BATCH_SIZE = 4;
  const chapterResults: ChapterResult[] = [];

  for (let i = 0; i < allChapters.length; i += BATCH_SIZE) {
    const batch = allChapters.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    console.log(
      `[Phase 3] 开始批次 ${batchNum}，章节: ${batch.map((c) => c.num).join(', ')}`,
    );

    const batchResults = await Promise.allSettled(
      batch.map((ch) =>
        writeOneChapter(
          ch.num,
          ch.title,
          ch.wordTarget,
          ch.tables,
          ch.focus,
          intakeJson,
          searchContext,
          evidencePool,
        ),
      ),
    );

    for (let j = 0; j < batchResults.length; j++) {
      const r = batchResults[j];
      const ch = batch[j];
      if (r.status === 'fulfilled') {
        chapterResults.push(r.value);
      } else {
        console.warn(`[Chapter ${ch.num}] 生成失败:`, r.reason);
        warnings.push(`第 ${ch.num} 章生成失败，已跳过`);
        chapterResults.push({
          index: parseInt(ch.num, 10) || 0,
          body: '## 第' + ch.num + '章 ' + ch.title + '\n\n（本章生成失败，请重试）',
          claims: [],
        });
      }
    }
  }

  // Already appended in batch order; sort defensively
  chapterResults.sort((a, b) => a.index - b.index);

  return { chapterResults, evidencePool, finalProjectName, warnings };
}

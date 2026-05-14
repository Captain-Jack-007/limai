import { INTAKE_AGENT_SYSTEM_PROMPT, buildIntakeUserPrompt } from './prompts/intake-agent';
import { buildSearchQueries } from './prompts/search-agent';
import { CHAPTER_CONFIG, buildChapterSystemPrompt } from './prompts/chapter-writers';
import { EDITOR_AGENT_SYSTEM_PROMPT } from './prompts/editor-agent';

const MINIMAX_API_URL = 'https://api.minimaxi.com/v1/chat/completions';

// ── Base LLM call ────────────────────────────────────────────────────────────

async function callMiniMax(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4000,
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
  });
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content || '';
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
  serperApiKey: string,
): Promise<string> {
  if (!serperApiKey || serperApiKey === '待填写') {
    return '（未配置搜索 API，跳过网络搜索）';
  }

  const queries = buildSearchQueries(intake);

  const searchPromises = queries.slice(0, 6).map(async (q) => {
    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': serperApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: q.query, gl: 'cn', hl: 'zh-cn', num: 5 }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      const organic: Array<{ title: string; snippet?: string; link: string }> = data.organic || [];
      return organic
        .map((r) => '[搜索:' + q.type + '] ' + r.title + ' — ' + (r.snippet || '') + ' (' + r.link + ')')
        .join('\n');
    } catch {
      return '';
    }
  });

  const results = await Promise.all(searchPromises);
  return results.filter(Boolean).join('\n\n');
}

// ── Phase 3: Chapter Writers ─────────────────────────────────────────────────

async function writeOneChapter(
  chapterNum: string,
  chapterTitle: string,
  wordTarget: string,
  tables: string,
  focus: string,
  intakeJson: string,
  searchContext: string,
): Promise<string> {
  const systemPrompt = buildChapterSystemPrompt(chapterNum, chapterTitle, wordTarget, tables, focus);
  const baseUserPrompt =
    '## 项目信息\n\n' + intakeJson + '\n\n## 搜索参考资料\n\n' + searchContext;

  const wordMin = parseInt(wordTarget) || 3000;

  if (wordMin >= 4500) {
    // Long chapter: two serial calls, second builds on first
    const half = Math.floor(wordMin / 2);
    const p1 = await callMiniMax(
      systemPrompt,
      baseUserPrompt +
        '\n\n请先写本章的前半部分（前 2-3 个小节），约 ' +
        half +
        ' 字，包含前半部分的表格。',
      4000,
    );
    const p2 = await callMiniMax(
      systemPrompt,
      baseUserPrompt +
        '\n\n请写本章的后半部分（剩余小节），约 ' +
        half +
        ' 字，包含后半部分的表格。接续前文，不要重复已写内容。\n\n前半部分已写内容摘要：' +
        p1.substring(0, 1000),
      4000,
    );
    return '## 第' + chapterNum + '章 ' + chapterTitle + '\n\n' + p1 + '\n\n' + p2;
  }

  const result = await callMiniMax(systemPrompt, baseUserPrompt, 4000);
  return '## 第' + chapterNum + '章 ' + chapterTitle + '\n\n' + result;
}

async function writeChapterGroup(
  group: (typeof CHAPTER_CONFIG)[0],
  intakeJson: string,
  searchContext: string,
): Promise<string[]> {
  const results: string[] = [];
  for (const ch of group.chapters) {
    const text = await writeOneChapter(
      ch.num,
      ch.title,
      ch.wordTarget,
      ch.tables,
      ch.focus,
      intakeJson,
      searchContext,
    );
    results.push(text);
  }
  return results;
}

// ── Phase 4: Editor Agent ────────────────────────────────────────────────────

async function runEditorAgent(allChapters: string): Promise<string> {
  const userPrompt =
    '以下是完整研报正文，请生成参考文献列表和编辑审校备注：\n\n' +
    allChapters.substring(0, 12000);
  return callMiniMax(EDITOR_AGENT_SYSTEM_PROMPT, userPrompt, 3000);
}

// ── Main orchestrator ────────────────────────────────────────────────────────

export async function generateFullReport(
  userText: string,
  fileText: string | null,
  projectName?: string,
): Promise<{ content: string; projectName: string; warnings: string[] }> {
  const warnings: string[] = [];

  // Phase 1
  const intake = await runIntakeAgent(userText, fileText);
  const finalProjectName = projectName || (intake.projectName as string) || '未命名项目';
  const intakeJson = JSON.stringify(intake, null, 2);

  // Phase 2 (parallel with nothing else — Serper can be slow)
  const serperKey = process.env.SERPER_API_KEY || '';
  const searchContext = await runSearchAgent(intake, serperKey);
  if (searchContext.includes('未配置搜索')) {
    warnings.push('未配置 Serper API，研报中竞品和市场数据将基于 AI 知识库生成');
  }

  // Phase 3: 5 groups in parallel, chapters within each group are serial
  const groupResults = await Promise.allSettled(
    CHAPTER_CONFIG.map((group) => writeChapterGroup(group, intakeJson, searchContext)),
  );

  const orderedChapters: string[] = [];
  for (let i = 0; i < groupResults.length; i++) {
    const r = groupResults[i];
    if (r.status === 'fulfilled') {
      orderedChapters.push(...r.value);
    } else {
      const group = CHAPTER_CONFIG[i];
      warnings.push(`第 ${group.group} 组章节生成失败，已跳过`);
      for (const ch of group.chapters) {
        orderedChapters.push(
          '## 第' + ch.num + '章 ' + ch.title + '\n\n（本章生成失败，请重试）',
        );
      }
    }
  }

  const allChapters = orderedChapters.join('\n\n---\n\n');

  // Phase 4
  const editorOutput = await runEditorAgent(allChapters);

  const today = new Date().toISOString().split('T')[0];
  const toc =
    '## 目录\n\n' +
    CHAPTER_CONFIG.flatMap((g) => g.chapters)
      .map((ch) => '- 第' + ch.num + '章 ' + ch.title)
      .join('\n') +
    '\n- 参考文献\n\n---\n\n';

  const content =
    '# ' +
    finalProjectName +
    ' 深度调研报告\n\n' +
    '> 项目深度调研报告 | ' +
    today +
    ' | 共十章\n\n' +
    toc +
    allChapters +
    '\n\n---\n\n' +
    editorOutput;

  return { content, projectName: finalProjectName, warnings };
}

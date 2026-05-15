import { NextRequest, NextResponse } from 'next/server';
import { extractFileText, buildFileContext } from '@/lib/extractFileText';
import { searchCompetition, buildCompetitionContext, COMPETITION_FORCE_PROMPT } from '@/lib/serper';

const MINIMAX_API_URL = 'https://api.minimaxi.com/v1/chat/completions';
const MINIMAX_MODEL = 'MiniMax-M2.5-highspeed';

function stripThinking(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

const SECTION_LABELS: Record<string, string> = {
  tech: '技术分析和优势',
  industry: '行业现状和市场分析',
  application: '应用场景深度剖析',
  competition: '技术对比与竞争优势',
  investment: '投资价值',
  risk: '风险评估',
};

function parseSections(content: string, selectedIds: string[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (let i = 0; i < selectedIds.length; i++) {
    const id = selectedIds[i];
    const label = SECTION_LABELS[id];
    const nextLabel = i < selectedIds.length - 1 ? SECTION_LABELS[selectedIds[i + 1]] : null;

    const headerPatterns = [
      `## ${label}`,
      `### ${label}`,
      `**${label}**`,
      `【${label}】`,
      label + '\n',
    ];

    let headerEnd = -1;
    for (const pat of headerPatterns) {
      const idx = content.indexOf(pat);
      if (idx !== -1) {
        headerEnd = idx + pat.length;
        break;
      }
    }

    if (headerEnd === -1) {
      if (i === 0) result[id] = content.trim();
      continue;
    }

    let endIdx = content.length;
    if (nextLabel) {
      const nextPatterns = [
        `## ${nextLabel}`,
        `### ${nextLabel}`,
        `**${nextLabel}**`,
        `【${nextLabel}】`,
      ];
      for (const pat of nextPatterns) {
        const idx = content.indexOf(pat, headerEnd);
        if (idx !== -1) {
          endIdx = idx;
          break;
        }
      }
    }

    result[id] = content.slice(headerEnd, endIdx).trim();
  }

  return result;
}

const SYSTEM_PROMPT = `你是一位顶级科技投资研究分析师，严格遵循以下写作规范：

【华尔街日报（WSJ）写作风格——强制执行】
1. 去形容词化：禁止"颠覆性"、"巨大的"、"革命性"等空洞形容词，一律用具体数字替代
2. 经济逻辑驱动：每个论点围绕利润/成本/护城河/资本回报率展开
3. 怀疑论视角：每个正面论点后，必须紧跟风险因素或结构性阻碍
4. 混合句式：极短句（10字以内）与复杂长句（50字以上）交替，禁止句子等长
5. 禁用连接词：绝对禁止"此外"、"不仅...而且"、"因此"、"所以"、"综上所述"、"总而言之"
6. 禁止排比：绝对禁止"第一...第二...第三"结构
7. 禁止空洞修辞："开启新篇章"、"注入新动能"等一律禁止

【数据规范——最高优先级】
- 每个数据标注来源：数字[编号]（可信度：★★★★★）
- 绝对禁止捏造数据：无法核实的数字必须写"本报告分析估算，非实际数据"
- 绝对禁止捏造来源：只引用真实存在的机构/报告
- 推测性结论必须标注"本报告分析估算，非实际数据"
- 文末参考文献顺序编码制：[1] 机构名. 报告名, 年份. ★★★★★（级别/类型）

【分析要求】
- 每个板块不少于600字，充分且有深度
- 结合行业数据、技术趋势、市场环境
- 结合项目具体特点，避免泛泛而谈
- 若有用户上传的参考资料，必须优先基于这些资料进行分析`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) return NextResponse.json({ error: '服务配置错误' }, { status: 500 });

    // ── Parse request (FormData or JSON) ─────────────────────────────────────
    let projectInfo: Record<string, unknown>;
    let sections: string[];
    let uploadedFiles: File[] = [];

    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const piRaw = form.get('projectInfo');
      const secRaw = form.get('sections');
      if (!piRaw || !secRaw) {
        return NextResponse.json({ error: '参数缺失' }, { status: 400 });
      }
      projectInfo = JSON.parse(piRaw as string);
      sections = JSON.parse(secRaw as string);
      uploadedFiles = form.getAll('files') as File[];
    } else {
      const body = await req.json();
      projectInfo = body.projectInfo;
      sections = body.sections;
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json({ error: '请至少选择一个分析板块' }, { status: 400 });
    }

    // ── Extract file texts ────────────────────────────────────────────────────
    const fileResults = await Promise.all(uploadedFiles.slice(0, 5).map(extractFileText));
    const fileContext = buildFileContext(fileResults);
    const fileWarnings = fileResults.filter((r) => r.warn).map((r) => r.warn as string);

    // ── Tavily search for competition section ─────────────────────────────────
    let competitionContext = '';
    let searchCount = 0;
    if (sections.includes('competition')) {
      const tavilyKey = process.env.TAVILY_API_KEY;
      if (tavilyKey) {
        try {
          const projectName = String(projectInfo.name ?? '').trim() || String(projectInfo.summary ?? '').slice(0, 20);
          const industry = String(projectInfo.industry ?? '').trim();
          const { results, count } = await searchCompetition(projectName, industry);
          competitionContext = buildCompetitionContext(results);
          searchCount = count;
        } catch {
          // Search failure is non-fatal — continue without it
        }
      }
    }

    // ── Build prompt ──────────────────────────────────────────────────────────
    const sectionInstructions = sections
      .map((s: string) => {
        const label = SECTION_LABELS[s] ?? s;
        if (s === 'competition') {
          const searchNote = competitionContext
            ? `\n（上方已提供联网搜索竞品数据，必须充分引用，标注来源URL和可信度）`
            : `\n（未获得联网搜索数据，请基于AI训练数据输出真实竞品，并注明"来源：AI训练数据，建议人工核实"）`;
          return `## ${label}\n${COMPETITION_FORCE_PROMPT}${searchNote}`;
        }
        return `## ${label}\n请在此处输出不少于600字的深度专业分析内容，严格遵守WSJ风格和数据规范。`;
      })
      .join('\n\n');

    const metaLines = [
      projectInfo.name && `- 项目名称：${projectInfo.name}`,
      projectInfo.scientist && `- 科研人员：${projectInfo.scientist}`,
      projectInfo.org && `- 所属机构：${projectInfo.org}`,
      projectInfo.industry && `- 行业领域：${projectInfo.industry}`,
      (projectInfo.trl as number) > 0 && `- 技术成熟度（TRL）：${projectInfo.trl}/9`,
      (projectInfo.score as number) > 0 && `- AI综合评分：${projectInfo.score}/100`,
      projectInfo.summary && `- 项目描述：${projectInfo.summary}`,
    ]
      .filter(Boolean)
      .join('\n');

    const userPrompt = `请对以下科技项目进行专业深度分析，生成结构化研究报告。

**项目基本信息：**
${metaLines}${fileContext}${competitionContext}

**分析要求：**
1. 每个板块不少于600字，充分深度
2. 每个数据标注来源[n]和可信度★★★★★
3. 无法核实的数据必须标注"本报告分析估算，非实际数据"
4. 严格遵守WSJ风格：去形容词化、怀疑论视角、禁用连接词、禁止排比
5. 若有上传参考资料，必须优先基于这些资料分析
${sections.includes('competition') && competitionContext ? `6. 竞争板块必须引用上方联网搜索的竞品数据（标注来源URL）` : ''}

请严格按以下格式输出（每个板块使用 ## 标题，不要改变标题名称）：

${sectionInstructions}

文末附参考文献：
## 参考文献
[1] 机构名. 报告名称, 年份. ★★★★★（级别/类型）`;

    // ── Call MiniMax ──────────────────────────────────────────────────────────
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200000);

    let response: Response;
    try {
      response = await fetch(MINIMAX_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MINIMAX_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 16000,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('MiniMax API error:', response.status, errText);
      return NextResponse.json(
        { error: `AI 服务调用失败（${response.status}），请稍后重试` },
        { status: 502 }
      );
    }

    const data = await response.json();
    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      return NextResponse.json({ error: `AI 服务错误：${data.base_resp.status_msg}` }, { status: 502 });
    }

    const raw: string = data.choices?.[0]?.message?.content ?? '';
    const content = stripThinking(raw);
    if (!content) {
      return NextResponse.json({ error: 'AI 未返回有效内容，请重试' }, { status: 502 });
    }

    const parsed = parseSections(content, sections);
    return NextResponse.json({ sections: parsed, warnings: fileWarnings, searchCount });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: '请求超时，请重试' }, { status: 408 });
    }
    console.error('Generate route error:', err);
    return NextResponse.json({ error: '服务暂时不可用，请稍后重试' }, { status: 500 });
  }
}

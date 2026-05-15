import { NextRequest, NextResponse } from 'next/server';
import { extractFileText, buildFileContext } from '@/lib/extractFileText';
import { searchCompetition, buildCompetitionContext, COMPETITION_FORCE_PROMPT } from '@/lib/serper';

const MINIMAX_API_URL = 'https://api.minimaxi.com/v1/chat/completions';
const MINIMAX_MODEL = 'MiniMax-M2.5-highspeed';

function stripThinking(s: string) {
  return s.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

// 严格遵守 research-report.md 全部规范的 System Prompt
const SYSTEM_PROMPT = `你是一位顶级科技投资研究分析师，严格遵循以下写作规范生成完整十大章节研究报告：

【华尔街日报（WSJ）写作风格——强制执行】
1. 去形容词化：禁止"颠覆性"、"巨大的"、"革命性"、"卓越"等空洞形容词，一律用具体数字替代
2. 经济逻辑驱动：每个论点围绕利润/成本/护城河/资本回报率展开
3. 怀疑论视角：每个正面论点后，必须紧跟风险因素或结构性阻碍
4. 混合句式：极短句（10字以内）与复杂长句（50字以上）交替，禁止句子等长
5. 禁用连接词：绝对禁止"此外"、"不仅...而且"、"因此"、"所以"、"综上所述"、"总而言之"、"由此可见"
6. 禁止排比：绝对禁止"第一...第二...第三"结构
7. 禁止空洞修辞："开启新篇章"、"注入新动能"、"迎来新机遇"等一律禁止

【数据规范——最高优先级，违者视为不合格】
- 每个数据标注来源：数字[编号]（可信度：★★★★★）
- 绝对禁止捏造数据：无法核实的数字必须写"本报告分析估算，非实际数据"
- 绝对禁止捏造来源：只引用真实存在的机构/报告，严禁编造机构名称或报告标题
- 推测性结论必须标注"本报告分析估算，非实际数据"
- 文末参考文献顺序编码制：[1] 机构名. 报告名, 年份. ★★★★★（级别/类型）

【十大章节框架——不得缺章，不得改变顺序】
第一章 执行摘要（背景—冲突—答案三段论，含3-5个最关键数据）
第二章 公司与团队（工商信息、团队背景、学术+产业+资源覆盖）
第三章 技术原理深度解析（为什么以前不行现在行了、技术特性链）
第四章 行业现状与市场分析（TAM/SAM/SOM三层论证，数据≤12个月）
第五章 技术对比与竞争优势（必须包含：①真实竞品清单4-6家公司 ②8维度量化对比表格 ③竞争格局判断，遵守WSJ风格）
第六章 应用场景深度剖析（痛点—方案—挑战闭环，工程化难点）
第七章 产业链分析与国产化机遇（价值链定位、国产化时间表）
第八章 发展趋势与投资价值（规模化飞轮、财务预测有逻辑支撑）
第九章 风险评估（死亡之谷、具体风险描述、SWOT）
第十章 结语与后续计划（综合评价、分阶段行动建议）

【结构要求】
- 每章至少2个小节（1.1、1.2格式）
- 每章不少于600字
- 文末必须有参考文献列表
- 整体字数不少于10000字`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '服务配置错误' }, { status: 500 });
    }

    // ── Parse request (FormData or JSON) ─────────────────────────────────────
    let projectInfo: Record<string, string>;
    let uploadedFiles: File[] = [];

    const contentType = req.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const piRaw = form.get('projectInfo');
      if (!piRaw) return NextResponse.json({ error: '参数缺失' }, { status: 400 });
      projectInfo = JSON.parse(piRaw as string);
      uploadedFiles = form.getAll('files') as File[];
    } else {
      const body = await req.json();
      projectInfo = body.projectInfo;
    }

    if (!projectInfo?.summary?.trim()) {
      return NextResponse.json({ error: '请输入项目描述' }, { status: 400 });
    }

    // ── Extract file texts ────────────────────────────────────────────────────
    const fileResults = await Promise.all(uploadedFiles.slice(0, 5).map(extractFileText));
    const fileContext = buildFileContext(fileResults);
    const fileWarnings = fileResults.filter((r) => r.warn).map((r) => r.warn as string);

    // ── Serper search for chapter 5 competitor data ───────────────────────────
    let competitionContext = '';
    const serperKey = process.env.SERPER_API_KEY;
    if (serperKey && serperKey !== '待填写') {
      try {
        const nameForSearch = projectInfo.name?.trim() || projectInfo.summary?.slice(0, 20) || '';
        const industryForSearch = projectInfo.industry?.trim() || '';
        const { results } = await searchCompetition(nameForSearch, industryForSearch, serperKey);
        competitionContext = buildCompetitionContext(results);
      } catch {
        // non-fatal — continue without search data
      }
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    const projectName = projectInfo.name?.trim() || '未命名项目';

    const userPrompt = `请为以下科技项目生成完整十大章节专业研究报告。

**项目信息：**
- 项目名称：${projectName}
${projectInfo.scientist ? `- 负责人：${projectInfo.scientist}` : ''}
${projectInfo.org ? `- 所属机构：${projectInfo.org}` : ''}
${projectInfo.industry ? `- 行业领域：${projectInfo.industry}` : ''}
- 项目描述：${projectInfo.summary.trim()}${fileContext}

**输出格式要求（严格遵守，不得改变标题格式）：**

# ${projectName}科技转化评估研究报告

**报告日期：${dateStr}**

## 第一章 执行摘要

### 1.1 项目背景与定位
[背景—冲突—答案三段论，含最具冲击力的量化数据]

### 1.2 核心关键指标
| 指标 | 数据 | 来源 |
|------|------|------|
[填写3-5个核心数据]

## 第二章 公司与团队

### 2.1 基本信息
[工商信息、成立时间、注册资本等]

### 2.2 核心团队
[创始团队背景：学术+产业+资源覆盖]

## 第三章 技术原理深度解析

### 3.1 传统方法局限性
[为什么以前不行]

### 3.2 核心技术原理
[技术特性→微观结构→宏观性能链条]

### 3.3 技术成熟度评估
[TRL等级、局限性声明]

## 第四章 行业现状与市场分析

### 4.1 市场规模（TAM/SAM/SOM）
[三层论证，数据标注来源和日期]

### 4.2 市场驱动因素
[政策+技术+需求三维分析]

### 4.3 竞争格局
[主要竞争者分类：纯算法/传统巨头/垂直整合]

## 第五章 技术对比与竞争优势
${competitionContext ? `\n以下联网搜索竞品数据供参考（必须在本章引用，标注来源URL和可信度）：\n${competitionContext}\n` : ''}
${COMPETITION_FORCE_PROMPT}
${competitionContext ? '' : '（未获得联网搜索数据，请基于AI训练数据列出真实竞品，并在每条后注明"来源：AI训练数据，建议人工核实"）'}

## 第六章 应用场景深度剖析

### 6.1 主要应用场景分析
[每个场景：痛点—方案—挑战闭环]

### 6.2 工程化落地难点
[批次一致性、供应链、标准化等实际问题]

## 第七章 产业链分析与国产化机遇

### 7.1 产业链定位
[项目在价值链中的具体位置]

### 7.2 国产化替代空间与时间表
[分阶段演进：低端→中端→高端]

### 7.3 相关政策支持
[发改委、工信部等政策文件]

## 第八章 发展趋势与投资价值

### 8.1 技术迭代路径
[短期/中期/长期演进]

### 8.2 商业规模化飞轮
[工具→产品→平台路径]

### 8.3 财务预测
[营收/利润预测，必须有逻辑支撑，无法核实标注"本报告分析估算，非实际数据"]

## 第九章 风险评估

### 9.1 SWOT分析
[优势/劣势/机会/威胁]

### 9.2 主要风险矩阵
[技术放大风险、数据瓶颈、商业模式冲突、供应链脆弱性、死亡之谷]

### 9.3 风险缓解措施
[具体应对策略]

## 第十章 结语与后续计划

### 10.1 综合评价
[项目优势+劣势的清醒评估，强调"技术先进性≠商业可行性"]

### 10.2 行动建议
[对投资者的分阶段验证建议；对项目方的标准化+工程稳定性建议]

### 10.3 关键里程碑
[具体时间节点+可验证指标]

## 参考文献

[1] 机构名. 报告名称, 年份. ★★★★★（A级/官方）
[2] ...

---

**重要提醒**：
1. 严格遵守WSJ风格：去形容词化、怀疑论视角、禁用连接词、禁止排比
2. 每个数据必须标注来源[n]和可信度★，无法核实的必须写"本报告分析估算，非实际数据"
3. 禁止捏造任何数据或来源，宁可承认数据缺失
4. 整体输出不少于10000字`;

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 1200000);

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
      clearTimeout(tid);
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
      console.error('MiniMax app error:', data.base_resp);
      return NextResponse.json(
        { error: `AI 服务错误：${data.base_resp.status_msg}` },
        { status: 502 }
      );
    }

    const raw: string = data.choices?.[0]?.message?.content ?? '';
    const content = stripThinking(raw);

    if (!content) {
      return NextResponse.json({ error: 'AI 未返回有效内容，请重试' }, { status: 502 });
    }

    return NextResponse.json({ content, projectName, warnings: fileWarnings });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: '请求超时（超过20分钟），请重试' }, { status: 408 });
    }
    console.error('generate-full-report error:', err);
    return NextResponse.json({ error: '服务暂时不可用，请稍后重试' }, { status: 500 });
  }
}

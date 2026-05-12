// Serper API wrapper for real-time web search
// https://serper.dev — set SERPER_API_KEY in .env.local

export const COMPETITION_FORCE_PROMPT = `【强制输出要求——竞品分析，以下三部分不得跳过】

**一、市场竞品清单**
至少列出4-6个真实存在的竞争对手（来自联网搜索结果或AI训练数据）。格式：

- **[公司名]** | 产品/方向：[X] | 技术路线：[X] | 融资阶段：[X] | 最新融资：[金额或"未公开"] | 来源：[X]★★★★

若搜索无数据，须注明"来源：AI训练数据，建议人工核实"。禁止捏造公司。禁止写"某公司"、"若干企业"等模糊表述。

**二、竞品对比分析表格**
必须输出完整Markdown表格（8个维度，不得省略，用具体数据填写，无数据处标"待确认"）：

| 对比维度 | 本项目 | 竞品A | 竞品B | 竞品C | 竞品D |
|---------|--------|-------|-------|-------|-------|
| 核心技术路线 | | | | | |
| TRL成熟度 | | | | | |
| 性能指标（关键参数）| | | | | |
| 成本优势 | | | | | |
| 专利布局 | | | | | |
| 融资阶段 | | | | | |
| 商业化进度 | | | | | |
| 核心差异化 | | | | | |

**三、竞争格局判断**
遵循WSJ风格：每个正面论点后必须跟风险对冲，禁止空洞修辞，分析本项目独特生态位与差异化优势。`;

export interface SerperResult {
  title: string;
  snippet: string;
  link: string;
  date?: string;
}

const SERPER_URL = 'https://google.serper.dev/search';

async function search(query: string, apiKey: string, num = 3): Promise<SerperResult[]> {
  try {
    const res = await fetch(SERPER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ q: query, num, hl: 'zh-cn', gl: 'cn' }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.organic as SerperResult[]) ?? []).slice(0, num).map((r) => ({
      title: r.title,
      snippet: r.snippet,
      link: r.link,
      date: r.date,
    }));
  } catch {
    return [];
  }
}

export async function searchCompetition(
  projectName: string,
  industry: string,
  apiKey: string
): Promise<{ results: SerperResult[]; count: number }> {
  const queries = [
    `${projectName} 竞争对手 融资 2025 2026`,
    `${industry || projectName} 头部企业 市场份额 2025`,
    `${projectName} 竞品对比 技术路线`,
    `${industry || projectName} 赛道 融资 创业公司 2026`,
  ];

  const all: SerperResult[] = [];
  for (const q of queries) {
    const res = await search(q, apiKey, 3);
    for (const r of res) {
      // deduplicate by link
      if (!all.find((x) => x.link === r.link)) all.push(r);
    }
    if (all.length >= 9) break;
  }

  return { results: all.slice(0, 9), count: all.length };
}

export function buildCompetitionContext(results: SerperResult[]): string {
  if (results.length === 0) return '';

  const items = results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}${r.date ? `（${r.date}）` : ''}\n摘要：${r.snippet}\n来源：${r.link}`
    )
    .join('\n\n');

  return `\n\n---
【联网搜索：竞品最新动态（${results.length} 条，来自 Google 搜索）】
以下是实时搜索获取的竞品信息，请优先基于这些真实数据进行竞争格局分析。
引用时必须注明来源URL，可信度按★★★★☆标注（权威媒体 / 企业官网）：

${items}
---`;
}

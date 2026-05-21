import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildCompetitionPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT竞争格局页内容填写助手。

【幻灯片类型：competition（竞争格局）】
必填字段：
- cards: 竞争格局数组，必须恰好 4 条（页面为 2×2 网格布局），每条包含：
  • icon: 单个 emoji（我方用 🎯，竞品分别用 🏭 🤖 💊 🏢 🌐 等）
  • title: 竞争方名称或分类（4-10字，第1条通常是"我方"或项目名）
  • body: 该方的优/劣势描述（20-35字，客观陈述，我方描述优势，竞品描述局限）
  • stat: 差异化标签（4-12字，必须是具体的量化描述或明确的能力标签）

【stat 字段规范】
✅ 合格的 stat 示例：
   - 我方："准确率 97.3%"、"部署成本 <5万"、"支持 3 种模态"
   - 竞品："客单价 500万+"、"准确率 <85%"、"AI能力 缺失"、"仅支持云端"
✗ 不合格的 stat：
   - "行业领先"、"技术强大"、"生态完善"、"功能全面"（空泛，无法量化或验证）

严格约束：
1. cards 必须恰好 4 条（2×2 布局，不多不少）
2. 第 1 条代表我方优势，stat 体现核心竞争指标
3. 第 2-4 条代表不同类型的竞争对手/替代方案
4. 4 个 stat 各不相同，体现真实的差异化竞争格局

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：MedAI准确率97.3%，覆盖三模态，支持离线；传统PACS无AI；头部AI公司聚焦三甲，客单价500万+；互联网医疗平台准确率<85%。
输出：
{
  "index": 7,
  "slide_type": "competition",
  "cards": [
    {
      "icon": "🎯",
      "title": "MedAI（我方）",
      "body": "三模态AI融合，专为基层设计，支持本地离线部署，综合准确率行业最高",
      "stat": "准确率 97.3%"
    },
    {
      "icon": "🏭",
      "title": "传统PACS厂商",
      "body": "影像存储为主，无AI辅助诊断能力，接口封闭，难以接入第三方智能分析",
      "stat": "AI能力 缺失"
    },
    {
      "icon": "🤖",
      "title": "头部AI公司",
      "body": "聚焦三甲医院，单模态分析为主，价格高昂，基层医院预算难以承受",
      "stat": "客单价 500万+"
    },
    {
      "icon": "💊",
      "title": "互联网医疗平台",
      "body": "以在线问诊为主，影像分析为辅，精度不足，不支持本地离线部署",
      "stat": "准确率 <85%"
    }
  ]
}

【反例 — 不要这样做】
✗ stat 写："行业领先""技术先进""生态完善"（空泛，无法量化）
✗ cards 只有 3 条（必须是 4 条，因为是 2×2 布局）
✗ 4 个 stat 都是正面描述（竞品的 stat 应反映其局限性，形成对比）
✗ 竞品之间差异不明显（4 张卡片应覆盖不同类型的竞争方，不要列同类型竞品4次）`;

  return { system, user: buildUserBlock(ctx) };
}

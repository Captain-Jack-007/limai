import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildInvestmentPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT融资计划页内容填写助手。

【幻灯片类型：investment（融资计划）】
必填字段：
- ask_amount: 融资金额（字符串，含单位，如"5000万元""1000万美元"；原文无则留 ""）
- body: 融资轮次说明（格式"轮次 · 融资类型"，如"Pre-A轮 · 股权融资"，≤20字）
- ask_use: 资金用途分配，3-5条，每条包含：
  • label: 用途名称（4-8字，如"产品研发""市场拓展""团队扩张""运营储备"）
  • value: 百分比整数（所有 value 之和必须精确等于 100）

资金用途参考优先级（按常见分配顺序）：
① 产品研发（通常30-50%）
② 市场拓展/销售（通常20-35%）
③ 团队扩张/人才招募（通常15-25%）
④ 运营储备/流动资金（通常5-15%）

严格约束：
1. ask_amount 必须从原文提取；若原文无融资金额，留空字符串 "" 并在 body 注明轮次
2. ask_use 所有 value 之和必须精确等于 100（百分比总计为100%）
3. ask_use 条数 3-5条（不少于3，不超过5）
4. 资金用途分配比例要合理，产品研发+市场通常占70%以上

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：本轮融资5000万元人民币，Pre-A轮股权融资，资金用于产品研发40%、市场拓展30%、团队扩张20%、运营储备10%。
输出：
{
  "index": 11,
  "slide_type": "investment",
  "ask_amount": "5000万元",
  "body": "Pre-A轮 · 股权融资",
  "ask_use": [
    {"label": "产品研发", "value": 40},
    {"label": "市场拓展", "value": 30},
    {"label": "团队扩张", "value": 20},
    {"label": "运营储备", "value": 10}
  ]
}

【反例 — 不要这样做】
✗ ask_use value 之和不为100：40+30+20+20=110（必须精确等于100）
✗ ask_amount 填"待定"（若原文无金额，留空字符串 ""，不填任何占位文字）
✗ ask_use 只有1-2条（太粗糙，至少3条）
✗ ask_use 条目超过6条（太分散，投资人记不住，合并为3-5个主要类别）`;

  return { system, user: buildUserBlock(ctx) };
}

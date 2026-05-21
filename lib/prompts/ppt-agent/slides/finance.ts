import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildFinancePrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT财务预测页内容填写助手。

【幻灯片类型：finance（财务预测）】
必填字段：
- chart_values: 年收入预测柱状图，至少 3 个年份，每条包含：
  • label: 年份标签（历史年份直接写年份如"2023"，预测年份加"E"后缀如"2025E"）
  • value: 收入数字（整数类型，单位万元人民币，不是字符串）
- metrics: 关键财务指标，至少 4 条，每条包含：
  • label: 指标名称
  • value: 数值（字符串）
  • unit: 单位（%、倍、元、万元 等，可为空字符串）

【metrics 优先填写顺序（按重要性排序）】
① 毛利率（Gross Margin %）
② 净利率或净亏损率（Net Margin %）
③ 客单价或平均合同金额（AOV，万元）
④ 续约率 / 复购率（Renewal Rate %）
⑤ LTV/CAC 比例（如原文有）
⑥ 预计盈亏平衡时间（如"2026Q2"）

严格约束：
1. chart_values 至少 3 个年份（建议 1-2 个历史年份 + 2-3 个预测年份）
2. metrics 至少 4 条（不够 4 条时，用合理行业参考值并标注 (E)）
3. chart_values value 必须是数字，不是字符串（如 320，不是 "320万"）
4. 年收入增速要合理（早期公司可高速增长，但避免每年 >500% 的不合理预测）

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：2023年收入320万，2024年950万，预测2025年2800万，2026年7200万。毛利率72%，净亏损，平均合同额18万/年，续约率92%。
输出：
{
  "index": 9,
  "slide_type": "finance",
  "chart_values": [
    {"label": "2023",   "value": 320},
    {"label": "2024",   "value": 950},
    {"label": "2025E",  "value": 2800},
    {"label": "2026E",  "value": 7200}
  ],
  "metrics": [
    {"label": "毛利率",   "value": "72",  "unit": "%"},
    {"label": "净利率",   "value": "-18", "unit": "% (投入期)"},
    {"label": "平均客单价", "value": "18",  "unit": "万元/年"},
    {"label": "续约率",   "value": "92",  "unit": "%"}
  ]
}

【反例 — 不要这样做】
✗ chart_values 只有 2 个年份（必须至少 3 个，不够时用 (E) 标注预测年份）
✗ metrics 只有 2 条（必须至少 4 条，不足时用行业参考值标注 (E)）
✗ chart_values value 是字符串："320万"（必须是数字 320，单位统一为万元）
✗ metrics 全是增速类指标：YoY增速/MoM增速/季度增速（维度重复，应覆盖利润率/规模/质量等）
✗ 增速过于夸张：100万→10亿，3年增长100倍（预测需有支撑逻辑）`;

  return { system, user: buildUserBlock(ctx) };
}

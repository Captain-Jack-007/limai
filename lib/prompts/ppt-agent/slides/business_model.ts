import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildBusinessModelPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT商业模式页内容填写助手。

【幻灯片类型：business_model（商业模式）】
必填字段：
- cards: 盈利模式列表，2-3条，每条包含：
  • title: 收入模式名称（4-10字，如"SaaS年度订阅""按量付费""增值服务"）
  • body: 定价方式或收入逻辑（15-30字，包含具体定价区间或收费单位）
- chart_values: 收入结构占比饼图，与 cards 对应，2-4条，每条包含：
  • label: 收入模式名称（与 cards title 一致）
  • value: 占比整数（所有 value 之和必须精确等于 100）

严格约束：
1. chart_values 所有 value 之和必须等于 100（百分比合计）
2. cards 和 chart_values 的 label 必须一一对应
3. card body 需包含具体定价信息（价格区间/单价/收费频率）
4. 若原文无定价信息，参考行业常见定价模式并标注 (E)

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：MedAI按床位数定价10-20万/年/院，提供按张付费0.8-2元/张，定制培训5-50万/项目，SaaS占60%营收。
输出：
{
  "index": 6,
  "slide_type": "business_model",
  "cards": [
    {"title": "SaaS 年度订阅", "body": "按医院床位数定价，10-20万元/年/院，含系统部署与维护"},
    {"title": "按量付费",     "body": "每张影像报告0.8-2元，适合低频使用的小型诊所"},
    {"title": "增值服务",     "body": "定制培训及数据标注服务，5-50万元/项目"}
  ],
  "chart_values": [
    {"label": "SaaS 年度订阅", "value": 60},
    {"label": "按量付费",      "value": 25},
    {"label": "增值服务",      "value": 15}
  ]
}

【反例 — 不要这样做】
✗ chart_values 之和不等于100：60+30+20=110（必须精确等于100）
✗ card body 没有定价："提供订阅服务"（要有价格区间或收费逻辑）
✗ cards 和 chart_values label 不对应（必须完全一致）`;

  return { system, user: buildUserBlock(ctx) };
}

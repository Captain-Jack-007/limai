import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildTractionPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT牵引数据页内容填写助手。

【幻灯片类型：traction（牵引数据 / 关键指标）】
必填字段：
- metrics: 关键结果指标，数组必须有 4 条，每条包含：
  • label: 指标名称（4-8字）
  • value: 数值（字符串，如"128""3.2万""280"）
  • unit: 单位（如"家""/月""万元""%"，可为空字符串）

【结果指标 vs 过程里程碑】
✅ 可接受的结果指标（Product-Market Fit 的证明）：
   - 规模类：注册用户数、签约客户数、日/月活跃用户数
   - 营收类：月经常性收入(MRR)、年营收(ARR)、GMV、客单价
   - 增速类：月环比(MoM)、年同比(YoY)增长率
   - 质量类：客户留存率、续约率、NPS、净推荐值

❌ 不接受的过程里程碑（放 roadmap 页）：
   - "完成A轮融资""获得XX认证""完成产品研发""签署战略合作"
   - "荣获XX奖项""入选XX名单"

严格约束：
1. 必须恰好 4 条，不多不少
2. 四个指标覆盖不同维度（如：规模/营收/增速/留存），不要全是同一类
3. 数字从原文提取；原文无时，用合理估算值并标注 (E)

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：MedAI已签约128家医院，处理影像320万张，月经常性收入180万元，年同比增速280%。
输出：
{
  "index": 5,
  "slide_type": "traction",
  "metrics": [
    {"label": "签约医院数", "value": "128",  "unit": "家"},
    {"label": "累计处理影像", "value": "320", "unit": "万张"},
    {"label": "月经常性收入", "value": "180", "unit": "万元"},
    {"label": "年同比增速",   "value": "280", "unit": "%"}
  ]
}

【反例 — 不要这样做】
✗ "完成B轮融资1.2亿元"（融资是里程碑，不是结果指标，放 roadmap）
✗ "荣获国家医疗AI一等奖"（荣誉不是牵引数据）
✗ "完成三甲医院临床验证"（过程事件，不是量化结果）
✗ 4条都是增速类：月增速/季度增速/年增速/累计增速（维度严重重复）`;

  return { system, user: buildUserBlock(ctx) };
}

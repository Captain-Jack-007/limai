import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildMarketPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT市场规模页内容填写助手。

【幻灯片类型：market（市场规模）】
必填字段：
- metrics: TAM/SAM/SOM 三层市场，数组必须有 3 条，每条包含：
  • label: 市场层级名称（格式"TAM 全球XX市场"，含层级标识）
  • value: 数字字符串（如"520"）
  • unit: 单位（如"亿美元""亿元"，同一张幻灯片内必须统一）
- chart_values: 与 metrics 对应的饼图数据，3 条，每条包含：
  • label: 层级缩写（TAM / SAM / SOM）
  • value: 与 metrics 中对应的数字（数字类型，不是字符串）

严格约束：
1. TAM > SAM > SOM（量级递减：TAM 通常是 SAM 的 5-20 倍，SAM 是 SOM 的 5-10 倍）
2. metrics 和 chart_values 的数字必须完全对应，不能不一致
3. 同一张幻灯片内单位统一（全亿元或全亿美元，不混用，chart_values 中数字按同单位）
4. 数字必须从原文提取；原文无时，用行业研报数据并标注 (E)

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：全球医疗AI市场规模520亿美元，中国影像AI市场约68亿美元，公司目标基层医院细分约12亿美元。
输出：
{
  "index": 4,
  "slide_type": "market",
  "metrics": [
    {"label": "TAM 全球医疗AI市场", "value": "520", "unit": "亿美元"},
    {"label": "SAM 中国影像AI市场", "value": "68",  "unit": "亿美元"},
    {"label": "SOM 基层医院目标市场", "value": "12", "unit": "亿美元"}
  ],
  "chart_values": [
    {"label": "TAM", "value": 520},
    {"label": "SAM", "value": 68},
    {"label": "SOM", "value": 12}
  ]
}

【反例 — 不要这样做】
✗ TAM=100, SAM=80, SOM=60：三层市场差距太小，不符合漏斗逻辑（应有5-10倍递减）
✗ 单位混用：metrics 用"亿美元"但 chart_values 换算成亿元（单位必须完全统一）
✗ metrics 数字和 chart_values 数字不一致（两个字段必须完全对应）
✗ SOM > SAM（逻辑错误，可获取市场不能大于可服务市场）`;

  return { system, user: buildUserBlock(ctx) };
}

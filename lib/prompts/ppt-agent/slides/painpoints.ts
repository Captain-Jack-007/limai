import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildPainpointsPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT痛点页内容填写助手。

【幻灯片类型：painpoints（痛点）】
必填字段：
- cards: 痛点数组，必须恰好 3 条，每条包含：
  • icon: 单个 emoji（如 🏥 💊 ❌ ⏱️ 📊 🔥 💸 ⚠️）
  • title: 痛点名称（4-8字，精准命名）
  • body: 痛点描述（15-25字，说清"谁在什么场景下有什么具体痛苦"）
  • stat: 量化数字（必填，格式"数字+单位"，如"缺口400万人""误诊率35%""等待48h+"）

严格约束：
1. cards 数组必须有且仅有 3 条，不多不少
2. stat 必须是具体数字，不接受任何空泛描述（如"问题严重""影响很大"）
3. 三个痛点从不同维度覆盖问题（如：规模/效率/质量），避免重叠
4. stat 优先从原文提取；原文无量化数据时，用行业公开数据并标注 (E)

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：农村每1000人仅0.8名医生，基层医院影像误诊率高达35%，患者平均等待报告48小时。
输出：
{
  "index": 2,
  "slide_type": "painpoints",
  "cards": [
    {
      "icon": "🏥",
      "title": "医生严重短缺",
      "body": "农村每千人仅0.8名医生，三甲医院年门诊量严重超载，患者无法获得及时诊疗",
      "stat": "全国缺口 400 万人"
    },
    {
      "icon": "❌",
      "title": "误诊率居高不下",
      "body": "基层医院影像判读误诊率高达35%，漏诊导致病情延误，引发医患纠纷",
      "stat": "误诊率 35%"
    },
    {
      "icon": "⏱️",
      "title": "报告等待时间长",
      "body": "患者平均等待影像诊断报告超过48小时，急诊黄金救治窗口严重压缩",
      "stat": "平均等待 48h+"
    }
  ]
}

【反例 — 不要这样做】
✗ stat 写："市场痛点明显"、"影响很大"、"亟待解决"（必须是具体数字）
✗ stat 字段省略或为空（stat 是必填字段，每条 card 都要有）
✗ body 超过35字（保持简洁，一句话说清核心事实）
✗ 三个痛点描述同一问题的三个角度而非三个独立维度`;

  return { system, user: buildUserBlock(ctx) };
}

import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildDefaultPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT内容填写助手。

【通用幻灯片内容填写】
根据幻灯片类型和填写重点，从商业计划书中提取相关信息，生成完整的幻灯片数据。

可用字段（根据内容选择合适的字段）：
- title: 幻灯片标题（必填）
- body: 正文描述（2-4句话，合计40-80字）
- cards: 要点列表（每条含 title + body，2-5条）
- metrics: 数据指标（每条含 label/value/unit）
- notes: 演讲者备注

${OUTPUT_RULES}

${DATA_RULES}`;

  return { system, user: buildUserBlock(ctx) };
}

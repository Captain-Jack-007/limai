import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildSolutionPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT解决方案页内容填写助手。

【幻灯片类型：solution（解决方案）】
必填字段：
- body: 整体解决思路（2-3句话，40-80字，说清"用什么技术/产品解决了什么问题，达到什么量化效果"）
- cards: 核心功能/特性列表，3-4条，每条包含：
  • title: 功能名称（4-8字）
  • body: 功能说明（15-25字，突出差异化，最好包含量化效果）

要求：
1. body 开头明确核心技术或产品形态
2. cards 按重要性排序，最核心的放第一条
3. 每个 card body 尽量包含量化效果（如"准确率97.3%" "效率提升10倍"）

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：MedAI用自研多模态大模型，覆盖X光/CT/MRI三类影像，5分钟出报告，准确率97.3%，接入300名三甲专家。
输出：
{
  "index": 3,
  "slide_type": "solution",
  "body": "MedAI基于自研多模态大模型，为基层医院提供影像AI辅助诊断，将诊断时间从48小时压缩至5分钟，准确率达97.3%，让每位患者享受三甲医院水准的诊断服务。",
  "cards": [
    {"title": "多模态影像AI", "body": "X光/CT/MRI三模态融合分析，5分钟生成结构化报告，准确率97.3%"},
    {"title": "知识图谱辅助", "body": "整合5000万份病历数据，智能推荐同类案例供医生参考决策"},
    {"title": "远程专家会诊", "body": "接入全国300名三甲专家，疑难病例15分钟内获得专家会诊意见"}
  ]
}

【反例 — 不要这样做】
✗ body 只有一句且无量化数据："我们提供AI影像诊断服务"（太模糊）
✗ cards 少于3条（至少需要3个核心功能点）
✗ card body 无差异化描述："提供诊断报告"（应包含具体指标或对比效果）`;

  return { system, user: buildUserBlock(ctx) };
}

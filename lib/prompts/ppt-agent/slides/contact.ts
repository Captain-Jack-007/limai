import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildContactPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT联系方式页内容填写助手。

【幻灯片类型：contact（联系方式）】
必填字段：
- title: 项目/公司名称（与封面 title 保持一致，品牌一致性）
- contact_name: 主要联系人姓名（从原文提取真实姓名；原文无则留 ""）
- contact_email: 联系邮箱（从原文提取；原文无则留 ""）
- contact_website: 官网地址（从原文提取；原文无则留 ""）

选填字段：
- subtitle: 核心价值主张（与封面 subtitle 一致或精简版，≤25字）
- notes: 演讲者结束语建议（1-2句话，不显示在幻灯片上）

严格约束：
1. email 和 website 必须从原文提取，不得编造，不得使用示例地址（如 example.com、test.cn）
2. 原文无联系方式时，字段留空字符串 ""，不填任何占位值
3. title 与封面 title 保持一致（同一项目/品牌名）

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：MedAI公司，联系人：张伟（CEO），邮箱 zhangwei@medai.cn，官网 www.medai.cn。
输出：
{
  "index": 12,
  "slide_type": "contact",
  "title": "MedAI",
  "subtitle": "让每位患者享有三甲标准的AI影像诊断",
  "contact_name": "张伟",
  "contact_email": "zhangwei@medai.cn",
  "contact_website": "www.medai.cn",
  "notes": "结尾邀请投资人扫码或交换名片，主动约下周见面时间"
}

【反例 — 不要这样做】
✗ contact_email 写 "contact@example.com"（占位符，绝对禁止，留 "" 即可）
✗ contact_website 写 "www.company.com"（不能编造，无信息时留 ""）
✗ title 与封面不一致："封面是MedAI，联系页写MedAI智能医疗"（品牌名必须统一）`;

  return { system, user: buildUserBlock(ctx) };
}

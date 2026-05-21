import type { SlidePromptContext } from '../types';

export const OUTPUT_RULES = `【输出规则 — 严格遵守】
• 只输出纯 JSON 对象，不要 \`\`\`json 代码块包裹
• 必须包含 index 和 slide_type 字段
• JSON 格式合法，可直接 JSON.parse()，不含注释或尾随逗号`;

export const DATA_RULES = `【数据来源 — 严格遵守】
• 所有数字、人名、公司名必须从原文提取；原文无时，用行业参考值并在末尾加 (E) 标注
• 不得编造 email、网址、电话；原文无则留空字符串 ""
• 引用数字不改变量级（原文"3.2亿"不能写成"32000万"）
• 同一张幻灯片内数字单位统一（全用亿元或全用万元，不混用）`;

export function buildUserBlock(ctx: SlidePromptContext): string {
  return `项目：${ctx.projectName}
幻灯片序号：${ctx.index}，类型：${ctx.slideType}，标题：${ctx.title}
填写重点：${ctx.focus}

【商业计划书原文】
${ctx.fullText}`;
}

export const CHAPTER_CONFIG = [
  {
    group: 1,
    chapters: [
      { num: '01', title: '执行摘要', wordTarget: '3000-4000字', tables: '3-4张表格', focus: '行业背景、核心瓶颈分析表、技术方案总览表、核心指标表、市场定位表' },
      { num: '02', title: '公司与团队', wordTarget: '2000-3000字', tables: '1-2张表格', focus: '公司定位、核心团队能力矩阵表、发展阶段、核心资源与壁垒表' },
    ],
  },
  {
    group: 2,
    chapters: [
      { num: '03', title: '技术原理深度解析', wordTarget: '4000-5000字', tables: '4-5张表格', focus: '传统方案缺陷分析表、核心技术原理总览表、关键模块详细说明表、模块间耦合关系表、技术条件成熟度对比表' },
      { num: '04', title: '行业现状与市场分析', wordTarget: '3000-4000字', tables: '4-5张表格', focus: 'TAM/SAM/SOM数据表、竞争格局全景表、市场驱动因素表、分场景渗透率预期表' },
    ],
  },
  {
    group: 3,
    chapters: [
      { num: '05', title: '技术对比与竞争优势', wordTarget: '3000-4000字', tables: '4-5张表格', focus: '技术路线对比表、核心指标横向对比表、技术成熟度对比表、技术壁垒分层表、差异化优势表' },
      { num: '06', title: '应用场景深度剖析', wordTarget: '5000-6000字', tables: '8-10张表格', focus: '每个目标场景包含：痛点分析表、解决方案架构表、核心技术挑战表。最后加跨场景共性难点表' },
    ],
  },
  {
    group: 4,
    chapters: [
      { num: '07', title: '产业链分析与国产化机遇', wordTarget: '3000-4000字', tables: '3-4张表格', focus: '产业链全景分析表、国产化分阶段推进路径表、相关政策导向表' },
      { num: '08', title: '发展趋势与投资价值', wordTarget: '3000-4000字', tables: '3-4张表格', focus: '技术趋势分析表、财务预测表（如有数据）、投资价值评估维度表' },
    ],
  },
  {
    group: 5,
    chapters: [
      { num: '09', title: '风险评估', wordTarget: '2000-3000字', tables: '2-3张表格', focus: '风险矩阵表（技术/市场/政策/团队/财务）、风险应对措施表' },
      { num: '10', title: '结语与后续计划', wordTarget: '1500-2000字', tables: '1-2张表格', focus: '里程碑时间表、资金需求与用途表' },
    ],
  },
];

export function buildChapterSystemPrompt(
  chapterNum: string,
  chapterTitle: string,
  wordTarget: string,
  tables: string,
  focus: string,
): string {
  return `你是赛乔（Sci-Bridge Agent）的研报写作智能体，负责撰写第${chapterNum}章「${chapterTitle}」。

## 写作标准（参考华尔街日报深度报道风格）

1. 长度要求：${wordTarget}，不能少于下限
2. 表格要求：必须包含${tables}，每张表格用 Markdown 表格语法，表格前要有编号和标题（如"表格1：XXX分析"）
3. 结构：分 3-5 个小节，用 ### 三级标题
4. 每个数据论点必须有来源标注
5. 写作风格：专业深度、数据驱动、逻辑严密、不空泛
6. 重点关注：${focus}

## 来源标注规则（必须遵守）

对每一条事实性声明，在句末用脚注 [^cl_ch${chapterNum}_NNN] 标记，再在 CLAIMS_JSON 中填写对应条目。
这是唯一合法的引用方式——绝对禁止在正文中出现 [ev_xxx]、[来源：xxx] 或自编数字序号。

## 表格设计原则

- 每张表格至少 4 列，包含对比维度
- 竞品对比表要包含本项目和至少 2-3 个竞争对手
- 数据表中的数字必须标注来源
- 表格标题格式：「表格N：XXXXX」

## 可用参考资料

你会收到以下参考资料（在用户消息中提供）：
- 项目结构化信息（Intake Agent 提取）
- 网络搜索结果（Search Agent 收集）
请充分引用这些资料。

============================================================
【输出格式 - 严格遵守】

你的回复必须包含两段，用分隔符精确隔开：

===CHAPTER_BODY===
（这里写完整的章节 Markdown 正文。对每一条事实性声明、数字、市场规模、技术参数、企业名称、年份等，在该声明所在句子末尾用脚注 [^cl_ch${chapterNum}_NNN] 标记，NNN 为该章节内 claim 编号，从 001 开始。例：
"2024 年全球钙钛矿太阳能电池累计装机量达 5.2 GW [^cl_ch${chapterNum}_001]。"
非事实性的过渡句、观点表达、解释说明不需要标 claim。）

===CLAIMS_JSON===
[
  {
    "id": "cl_ch${chapterNum}_001",
    "text": "声明原文",
    "evidenceIds": [],
    "sourceType": "ai_inference"
  }
]
===END===

【绝对禁止 - 引用格式】

正文中**唯一允许**的引用语法是 [^cl_ch${chapterNum}_NNN] 脚注形式。例如：

  正确："2024 年装机量达 5.2 GW [^cl_ch${chapterNum}_001]。"
  正确："中国市场份额约 40% [^cl_ch${chapterNum}_002]。"

以下引用格式**严格禁止**在正文中出现：

  禁止："市场规模 80 亿元 [ev_001]"        ← 不要直接用 ev_ 内部 ID
  禁止："来源：ev_005"                      ← 不要写"来源："
  禁止："[来源：ev_005]"                    ← 不要写"[来源：xxx]"
  禁止："*数据来源：[ev_001][ev_002]*"      ← 表格下方的数据来源行也禁用 ev_ ID
  禁止："[ev_001][ev_002][ev_003]"          ← 任何 ev_ 字样都禁止
  禁止："数据来源：用户提供 [137]"          ← 不要自己编号

【表格下方的数据来源行】

如果你想在表格下方注明数据来源，使用 [^cl_ch${chapterNum}_NNN] 脚注形式：

  正确："*数据来源：综合整理自机构研报 [^cl_ch${chapterNum}_010]*"

或者用文字描述，不带任何方括号引用：

  正确："*数据来源：亿欧智库公开报告*"

【evidenceIds 与正文脚注的一致性】

- 每条 claim 的 id 必须与正文中的 [^cl_ch${chapterNum}_NNN] 一一对应
- evidenceIds 必须来自系统提供的 Evidence Pool（ev_001、ev_002 … 形式），严禁编造不存在的 ID
- 如果某条声明完全基于通识/推断，无 evidence 支撑：
  - evidenceIds 设为 []
  - sourceType 设为 "ai_inference"
  - 正文中**仍然保留** [^cl_ch${chapterNum}_NNN] 脚注（系统会自动渲染为"[推断]"标记）
- sourceType 取值范围：paper / patent / news / company / policy / ai_inference
- ===CLAIMS_JSON=== 部分必须是合法 JSON 数组，不要 markdown 代码块包裹
============================================================`;
}

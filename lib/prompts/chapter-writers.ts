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

每个事实性声明（数据、排名、市场规模、技术指标）后面必须标注来源：
- [来源：用户提供] — 来自用户输入或上传文件
- [来源：搜索结果，标题] — 来自网络搜索
- [来源：学术文献，论文标题/DOI] — 来自学术搜索
- [来源：AI 分析] — AI 基于训练知识推断
- [来源：估算] — 基于合理假设的推演
- [来源：待核实] — 需要进一步尽调确认

## 表格设计原则

- 每张表格至少 4 列，包含对比维度
- 竞品对比表要包含本项目和至少 2-3 个竞争对手
- 数据表中的数字必须标注来源
- 表格标题格式：「表格N：XXXXX」

## 可用参考资料

你会收到以下参考资料（在用户消息中提供）：
- 项目结构化信息（Intake Agent 提取）
- 网络搜索结果（Search Agent 收集）
请充分引用这些资料。`;
}

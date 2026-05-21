import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildRoadmapPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT发展路线图页内容填写助手。当前日期：2026年5月。

【幻灯片类型：roadmap（路线图）】
必填字段：
- milestones: 里程碑列表，4-6条，每条包含：
  • quarter: 时间节点（格式"YYYYQn"，如"2024Q1""2025Q4"，不加空格）
  • title: 里程碑事项（10-25字，说明完成了什么或计划完成什么，要具体可量化）
  • done: 布尔值（true=已完成，false=计划中）

【时序逻辑规则 — 严格遵守】
- 2026Q2 及更早：done=true（已完成）
- 2026Q3 及更晚：done=false（计划中）
- milestones 必须按 quarter 升序排列（从早到晚）

严格约束：
1. 4-6条里程碑（不少于4，不超过6）
2. 必须同时包含 done=true 和 done=false 的里程碑（体现历史 + 未来规划）
3. done 的时序判断基于当前日期 2026年5月：2026Q2 之前均为 true
4. title 要具体：包含可量化的成果（如"签约50家医院"），不接受模糊描述（如"完成产品研发"）
5. 时间跨度合理：里程碑覆盖 2-3年历史 + 1-2年未来规划

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：2023Q3产品MVP上线，2024Q1获NMPA认证，2024Q4签约50家医院，2025Q2完成Pre-A融资，计划2025Q4达200家，2026Q4启动A轮。
输出：
{
  "index": 10,
  "slide_type": "roadmap",
  "milestones": [
    {"quarter": "2023Q3", "title": "产品MVP上线，首批10家医院完成试点验证",     "done": true},
    {"quarter": "2024Q1", "title": "获得NMPA第三类医疗器械注册证",             "done": true},
    {"quarter": "2024Q4", "title": "签约50家医院，月经常性收入突破100万元",    "done": true},
    {"quarter": "2025Q2", "title": "完成Pre-A轮5000万元融资，团队扩至60人",   "done": true},
    {"quarter": "2025Q4", "title": "目标签约200家医院，进入县域医共体体系",    "done": false},
    {"quarter": "2026Q4", "title": "启动A轮融资，布局东南亚市场",             "done": false}
  ]
}

【反例 — 不要这样做】
✗ 2027Q1 的 milestone 写 done:true（未来事件不能标为已完成）
✗ title 写"完成产品研发"（太模糊，要说清研发了什么、达到什么量化目标）
✗ 少于4条（时间线太稀疏，投资人看不出发展轨迹）
✗ 全部 done:true（必须有计划中的未来里程碑，体现公司方向）
✗ quarter 格式写"2024 Q1"（不要空格，格式必须是"2024Q1"）`;

  return { system, user: buildUserBlock(ctx) };
}

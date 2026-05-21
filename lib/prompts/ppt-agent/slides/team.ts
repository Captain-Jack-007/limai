import type { SlidePromptContext, SlidePromptResult } from '../types';
import { OUTPUT_RULES, DATA_RULES, buildUserBlock } from './_shared';

export function buildTeamPrompt(ctx: SlidePromptContext): SlidePromptResult {
  const system = `你是路演PPT核心团队页内容填写助手。

【幻灯片类型：team（核心团队）】
必填字段：
- members: 核心成员列表，2-3人，每人包含：
  • name: 真实姓名（必须从原文提取；若原文无姓名，用"创始人"占位并在 bio 中说明）
  • role: 职位头衔（格式"职位 · 身份"，如"CEO · 创始人"，用"·"分隔多个头衔）
  • bio: 个人背景介绍（25-45字，必须包含：①前东家/学校背景 ②具体成就/职责，两项缺一不可）

严格约束：
1. name 从原文提取真实姓名，不得用"张某""联合创始人A"等模糊占位符
2. bio 不能只写职责，必须包含可验证的过去经历和量化成就
3. 成员数量 2-3人（超过3人时，选CEO/CTO/具有稀缺资源的核心成员）
4. bio 字数控制在45字以内，每句话要有实质信息量

bio 优先包含（按重要性）：
- 前东家 + 职位（如"前阿里健康技术总监"）
- 学历背景（如"清华大学计算机博士"）
- 量化成就（如"主导3款NMPA认证产品"）

${OUTPUT_RULES}

${DATA_RULES}

【Few-shot 示例】
输入摘要：CEO张伟，前阿里健康技术总监，清华计算机博士；CTO李晓燕，前飞利浦医疗算法负责人，主导3款NMPA认证AI产品；CMO王明，前协和医院放射科主任，从业20年。
输出：
{
  "index": 8,
  "slide_type": "team",
  "members": [
    {
      "name": "张伟",
      "role": "CEO · 创始人",
      "bio": "前阿里健康技术总监，清华大学计算机博士。10年医疗AI经验，曾主导国家重点医疗AI项目落地实施。"
    },
    {
      "name": "李晓燕",
      "role": "CTO · 联合创始人",
      "bio": "前飞利浦医疗影像算法负责人，主导研发3款获NMPA第三类医疗器械注册证的AI产品。"
    },
    {
      "name": "王明",
      "role": "CMO",
      "bio": "前协和医院放射科主任，从医20年，构建覆盖15省的三甲医院临床合作网络。"
    }
  ]
}

【反例 — 不要这样做】
✗ name 写"姓名""创始人A"（必须用原文真实姓名）
✗ bio 只写职责："负责公司技术研发方向"（必须有前东家背景和具体成就）
✗ bio 超过55字（要简洁有力，每句话都要有信息密度）
✗ 列出5名以上成员（最多3人，多余的省略，聚焦最核心的）`;

  return { system, user: buildUserBlock(ctx) };
}

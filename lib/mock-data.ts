import type {
  AnalysisStep,
  ChatMessage,
  Evaluation,
  Investor,
  PitchSlide,
  Project,
  RoadmapMilestone,
} from './types';

// ---------- Projects ----------

export const mockProjects: Project[] = [
  {
    id: 'PRJ-001',
    name: { en: 'Graphene Battery Tech', zh: '石墨烯电池技术' },
    field: { en: 'Energy Storage', zh: '储能' },
    stage: 'prototype',
    updatedAt: '2026-04-22T10:18:00Z',
    summary: {
      en: 'A graphene-based composite electrode increasing EV battery energy density by 38%.',
      zh: '基于石墨烯的复合电极，可将电动车电池能量密度提升 38%。',
    },
  },
  {
    id: 'PRJ-002',
    name: { en: 'CRISPR Crop Resilience', zh: 'CRISPR 抗逆作物' },
    field: { en: 'AgriTech / Biotech', zh: '农业科技 / 生物科技' },
    stage: 'lab',
    updatedAt: '2026-04-19T08:02:00Z',
    summary: {
      en: 'Gene-edited wheat strains tolerant to drought and saline soils, validated in greenhouse.',
      zh: '已在温室中验证、可耐干旱与盐碱土壤的基因编辑小麦品系。',
    },
  },
  {
    id: 'PRJ-003',
    name: { en: 'Quantum Imaging Sensor', zh: '量子成像传感器' },
    field: { en: 'Quantum / Photonics', zh: '量子 / 光子学' },
    stage: 'pilot',
    updatedAt: '2026-04-15T14:40:00Z',
    summary: {
      en: 'Single-photon avalanche diode array enabling sub-mm medical imaging at 1/10 dose.',
      zh: '单光子雪崩二极管阵列，以 1/10 剂量实现亚毫米医疗成像。',
    },
  },
];

export const activeProject: Project = mockProjects[0];

// ---------- Evaluation (for the active project) ----------

export const mockEvaluation: Evaluation = {
  overview: {
    field: { en: 'Energy Storage', zh: '储能' },
    innovation: {
      en: 'Graphene-based composite battery electrode',
      zh: '基于石墨烯的复合电池电极',
    },
    application: {
      en: 'Electric vehicles, grid storage, consumer electronics',
      zh: '电动车、电网储能、消费电子',
    },
  },
  scores: [
    {
      key: 'trl',
      label: { en: 'TRL Level', zh: 'TRL 等级' },
      value: 4,
      scale: 10,
      hint: { en: 'Lab-validated prototype', zh: '实验室验证原型' },
    },
    {
      key: 'market',
      label: { en: 'Market Potential', zh: '市场潜力' },
      value: 8,
      scale: 10,
    },
    {
      key: 'commercial',
      label: { en: 'Commercial Readiness', zh: '商业化就绪度' },
      value: 6,
      scale: 10,
    },
    {
      key: 'investment',
      label: { en: 'Investment Attractiveness', zh: '投资吸引力' },
      value: 7,
      scale: 10,
    },
  ],
  insights: [
    {
      en: 'High demand from EV makers seeking 30%+ energy density gains.',
      zh: '电动车厂商对 30% 以上能量密度提升需求强烈。',
    },
    {
      en: 'Material cost reduction is the primary path to mass-market viability.',
      zh: '降低材料成本是迈向大众市场的关键路径。',
    },
    {
      en: 'Strong differentiation vs. solid-state and incumbent lithium-ion roadmaps.',
      zh: '相较固态电池与传统锂电路线具备显著差异化。',
    },
  ],
  risks: [
    {
      en: 'Manufacturing complexity at gigafactory scale.',
      zh: '吉瓦级工厂量产的工艺复杂度高。',
    },
    {
      en: 'Patent landscape crowded around graphene synthesis methods.',
      zh: '石墨烯合成方法的专利布局拥挤。',
    },
    {
      en: 'Regulatory certification (UN 38.3, IEC 62619) timeline of 9–12 months.',
      zh: '法规认证（UN 38.3、IEC 62619）周期约 9–12 个月。',
    },
  ],
  nextSteps: [
    {
      en: 'Build a 100-cell pilot pack and run 1,000-cycle reliability test.',
      zh: '搭建 100 节电芯试制包并完成 1,000 循环可靠性测试。',
    },
    {
      en: 'Engage 2–3 EV OEMs for joint validation (Tier-1 supplier route).',
      zh: '联系 2–3 家整车厂联合验证（一级供应商路线）。',
    },
    {
      en: 'Apply for the MIIT new-materials grant (2026 round, deadline Aug).',
      zh: '申报工信部新材料专项（2026 年度，8 月截止）。',
    },
  ],
};

// ---------- Chat seed ----------

export const seedChat: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    content: {
      en: "Hi — I'm your Sci-Bridge agent. Describe your technology or upload a paper, and I'll evaluate it and draft a commercialization plan.",
      zh: '你好 —— 我是 Sci-Bridge 智能体。请描述你的技术或上传论文，我会进行评估并草拟商业化方案。',
    },
    createdAt: '2026-04-25T09:00:00Z',
  },
];

// ---------- Demo conversation used to "play back" a session ----------

export const demoUserMessage: ChatMessage = {
  id: 'demo-u1',
  role: 'user',
  content: {
    en: "I've developed a graphene-based composite electrode that increases lithium-ion battery energy density by ~38% in lab tests. Can you evaluate the commercialization potential?",
    zh: '我研发了一种石墨烯复合电极，在实验室测试中可将锂电池能量密度提升约 38%。能帮我评估商业化潜力吗？',
  },
  attachments: [
    {
      id: 'a1',
      name: 'graphene_battery_research.pdf',
      size: 2_410_000,
      kind: 'pdf',
    },
  ],
  createdAt: '2026-04-25T09:01:00Z',
};

export const demoAssistantReply: ChatMessage = {
  id: 'demo-a1',
  role: 'assistant',
  content: {
    en: "Great — I've parsed your paper. This sits at TRL 4 with strong market pull from EV and grid-storage segments. Energy density gain is competitive vs. CATL's 2025 roadmap, but cell-level cost and manufacturing yield are the blockers. I've populated the structured panel on the right with the full evaluation. Want me to run a Deep Analysis (patents + investor matching) next?",
    zh: '很好 —— 我已解析你的论文。该技术处于 TRL 4，电动车与电网储能市场拉动力强。能量密度提升相较宁德时代 2025 路线图具竞争力，但电芯级成本与量产良率是关键瓶颈。我已在右侧结构化面板填入完整评估。是否继续进行深度分析（专利 + 投资人匹配）？',
  },
  createdAt: '2026-04-25T09:01:08Z',
};

// ---------- Deep-analysis steps (animated playback) ----------

export const deepAnalysisSteps: AnalysisStep[] = [
  {
    key: 'parse',
    label: { en: 'Parsing research paper…', zh: '解析研究论文…' },
    durationMs: 900,
  },
  {
    key: 'patents',
    label: { en: 'Checking patent landscape…', zh: '检索专利布局…' },
    durationMs: 1100,
  },
  {
    key: 'market',
    label: {
      en: 'Scanning market signals & competitors…',
      zh: '扫描市场信号与竞品…',
    },
    durationMs: 1200,
  },
  {
    key: 'investors',
    label: {
      en: 'Matching with investor theses…',
      zh: '匹配投资人投资逻辑…',
    },
    durationMs: 1000,
  },
  {
    key: 'report',
    label: {
      en: 'Drafting commercialization report…',
      zh: '撰写商业化报告…',
    },
    durationMs: 900,
  },
];

// ---------- Investors ----------

export const mockInvestors: Investor[] = [
  {
    id: 'INV-001',
    name: 'Sequoia China',
    focus: { en: 'DeepTech, Energy, Mobility', zh: '深科技、能源、出行' },
    stage: { en: 'Seed – Series B', zh: '种子 – B 轮' },
    region: { en: 'China / Global', zh: '中国 / 全球' },
    ticket: { en: '$2M – $30M', zh: '200 万 – 3000 万美元' },
    matchScore: 92,
    thesis: {
      en: 'Backs platform-scale clean energy bets with credible founders and defensible IP.',
      zh: '押注具备规模化潜力、创始人可信、IP 可防御的清洁能源项目。',
    },
  },
  {
    id: 'INV-002',
    name: 'Hillhouse Capital',
    focus: { en: 'Industrial Tech, New Materials', zh: '工业科技、新材料' },
    stage: { en: 'Series A – Growth', zh: 'A 轮 – 成长期' },
    region: { en: 'Asia', zh: '亚洲' },
    ticket: { en: '$5M – $50M', zh: '500 万 – 5000 万美元' },
    matchScore: 87,
    thesis: {
      en: 'Long-horizon capital for capex-intensive new materials and battery supply chain.',
      zh: '为重资本投入的新材料与电池供应链提供长期资金。',
    },
  },
  {
    id: 'INV-003',
    name: 'CATL Ventures',
    focus: {
      en: 'Battery materials & cell innovation',
      zh: '电池材料与电芯创新',
    },
    stage: { en: 'Seed – Series A', zh: '种子 – A 轮' },
    region: { en: 'China', zh: '中国' },
    ticket: { en: '$1M – $15M', zh: '100 万 – 1500 万美元' },
    matchScore: 95,
    thesis: {
      en: 'Strategic CVC seeking next-gen anodes, electrolytes and gigafactory-ready chemistries.',
      zh: '战略 CVC，寻找下一代负极、电解液与可量产的化学体系。',
    },
  },
  {
    id: 'INV-004',
    name: 'SoftBank Vision Fund',
    focus: { en: 'AI + Frontier Tech', zh: 'AI + 前沿科技' },
    stage: { en: 'Series B+', zh: 'B 轮及以上' },
    region: { en: 'Global', zh: '全球' },
    ticket: { en: '$50M+', zh: '5000 万美元以上' },
    matchScore: 71,
    thesis: {
      en: 'Late-stage growth capital; fits once cell-level cost target is hit.',
      zh: '后期成长资本；电芯级成本达标后即可对接。',
    },
  },
  {
    id: 'INV-005',
    name: 'Breakthrough Energy Ventures',
    focus: { en: 'Climate tech, hard science', zh: '气候科技、硬科学' },
    stage: { en: 'Seed – Series B', zh: '种子 – B 轮' },
    region: { en: 'Global', zh: '全球' },
    ticket: { en: '$3M – $25M', zh: '300 万 – 2500 万美元' },
    matchScore: 84,
    thesis: {
      en: 'Patient capital for carbon-impact technologies with peer-reviewed science.',
      zh: '为具同行评议科学基础的减碳技术提供耐心资本。',
    },
  },
  {
    id: 'INV-006',
    name: 'Legend Capital',
    focus: { en: 'Smart Manufacturing, EV', zh: '智能制造、电动车' },
    stage: { en: 'Series A – B', zh: 'A 轮 – B 轮' },
    region: { en: 'China', zh: '中国' },
    ticket: { en: '$3M – $20M', zh: '300 万 – 2000 万美元' },
    matchScore: 78,
    thesis: {
      en: 'Active in EV powertrain components and Tier-1 supplier ecosystem.',
      zh: '活跃于电动车动力总成组件与一级供应商生态。',
    },
  },
];

// ---------- Pitch deck ----------

export const mockPitchDeck: PitchSlide[] = [
  {
    index: 1,
    title: { en: 'Problem', zh: '问题' },
    bullets: [
      {
        en: 'EV adoption is gated by battery range and cost.',
        zh: '电动车普及受限于续航与成本。',
      },
      {
        en: 'Incumbent Li-ion energy density is plateauing at ~280 Wh/kg.',
        zh: '现有锂电能量密度在约 280 Wh/kg 触顶。',
      },
      {
        en: 'OEMs need a 30%+ jump without sacrificing safety or cost.',
        zh: '整车厂需要在不牺牲安全与成本前提下实现 30% 以上提升。',
      },
    ],
  },
  {
    index: 2,
    title: { en: 'Solution', zh: '解决方案' },
    bullets: [
      {
        en: 'Graphene composite electrode with engineered porosity.',
        zh: '可工程化孔隙度的石墨烯复合电极。',
      },
      {
        en: '+38% energy density at lab cell level (validated).',
        zh: '实验室电芯能量密度提升 38%（已验证）。',
      },
      {
        en: 'Drop-in compatible with existing Li-ion cell formats.',
        zh: '可直接兼容现有锂电芯结构。',
      },
    ],
  },
  {
    index: 3,
    title: { en: 'Technology', zh: '技术' },
    bullets: [
      {
        en: 'Proprietary CVD-graphene + binder formulation (patent filed).',
        zh: '自有 CVD 石墨烯 + 粘结剂配方（已申请专利）。',
      },
      {
        en: '1,000-cycle retention >85% in coin-cell tests.',
        zh: '扣式电池 1,000 次循环保持率 >85%。',
      },
      {
        en: 'Roadmap to pouch and prismatic formats by Q2 2027.',
        zh: '2027 Q2 拓展至软包与方形电芯。',
      },
    ],
  },
  {
    index: 4,
    title: { en: 'Market', zh: '市场' },
    bullets: [
      {
        en: 'EV battery TAM: $132B in 2026, $310B by 2030.',
        zh: '电动车电池 TAM：2026 年 1320 亿美元，2030 年 3100 亿美元。',
      },
      {
        en: 'Initial wedge: high-end EV and grid storage ($28B SAM).',
        zh: '切入点：高端电动车与电网储能（SAM 280 亿美元）。',
      },
      {
        en: 'Beachhead customer pipeline: 3 Tier-1 OEMs in dialogue.',
        zh: '首批客户管线：与 3 家一级整车厂在谈。',
      },
    ],
  },
  {
    index: 5,
    title: { en: 'Business Model', zh: '商业模式' },
    bullets: [
      {
        en: 'Material licensing + electrode supply agreements.',
        zh: '材料授权 + 电极供应协议。',
      },
      {
        en: 'Per-kWh royalty (target 1.5–2.5%).',
        zh: '按 kWh 收取版税（目标 1.5–2.5%）。',
      },
      {
        en: 'Joint development deals with cell makers.',
        zh: '与电芯厂商联合开发。',
      },
    ],
  },
  {
    index: 6,
    title: { en: 'Team', zh: '团队' },
    bullets: [
      {
        en: 'Founders: ex-Tsinghua materials lab, 40+ peer-reviewed papers.',
        zh: '创始团队来自清华大学材料实验室，发表 40+ 同行评议论文。',
      },
      {
        en: 'CTO: 12 years at CATL on anode chemistry.',
        zh: 'CTO 在宁德时代负极化学方向有 12 年经验。',
      },
      {
        en: 'Advisory: former MIIT new-materials program lead.',
        zh: '顾问团队包括前工信部新材料专项负责人。',
      },
    ],
  },
  {
    index: 7,
    title: { en: 'Funding Ask', zh: '融资需求' },
    bullets: [
      { en: 'Raising $8M Series A.', zh: '本轮拟融资 800 万美元 A 轮。' },
      {
        en: 'Use of funds: pilot line ($4M), team ($2.5M), certification ($1.5M).',
        zh: '资金用途：试制线 400 万、团队 250 万、认证 150 万美元。',
      },
      {
        en: '24-month runway to first OEM design-win.',
        zh: '24 个月跑道，目标拿下首个整车厂设计中标。',
      },
    ],
  },
];

// ---------- Roadmap ----------

export const mockRoadmap: RoadmapMilestone[] = [
  {
    quarter: { en: 'Q2 2026', zh: '2026 Q2' },
    title: { en: 'Pilot cell line', zh: '试制电芯产线' },
    detail: {
      en: '100-cell pilot pack and 1,000-cycle reliability data.',
      zh: '100 节电芯试制包及 1,000 次循环可靠性数据。',
    },
  },
  {
    quarter: { en: 'Q3 2026', zh: '2026 Q3' },
    title: { en: 'OEM joint validation', zh: '整车厂联合验证' },
    detail: {
      en: 'Sign 2 JDAs with Tier-1 EV makers, begin A-sample testing.',
      zh: '与 2 家一级整车厂签订联合开发协议，启动 A 样测试。',
    },
  },
  {
    quarter: { en: 'Q4 2026', zh: '2026 Q4' },
    title: { en: 'Series A close', zh: 'A 轮关闭' },
    detail: {
      en: 'Close $8M round; expand materials team from 9 → 18.',
      zh: '完成 800 万美元融资；材料团队从 9 人扩至 18 人。',
    },
  },
  {
    quarter: { en: 'Q1 2027', zh: '2027 Q1' },
    title: { en: 'Pouch/prismatic format', zh: '软包 / 方形电芯' },
    detail: {
      en: 'Adapt formulation to commercial cell formats; safety certs.',
      zh: '配方适配商用电芯结构；完成安全认证。',
    },
  },
  {
    quarter: { en: 'Q3 2027', zh: '2027 Q3' },
    title: { en: 'Design-win', zh: '设计中标' },
    detail: {
      en: 'First OEM design-win; secure offtake LOI for 2 GWh/year.',
      zh: '首个整车厂设计中标；锁定 2 GWh/年承购意向书。',
    },
  },
];

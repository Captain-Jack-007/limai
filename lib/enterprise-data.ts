import type { Bi } from './i18n';
import type { DictKey } from './i18n';

// ---------- Enterprise (incubator / government park) ----------

export type PipelineStage =
  | 'submitted'
  | 'evaluation'
  | 'high_potential'
  | 'matching'
  | 'negotiation'
  | 'completed';

export const pipelineStages: PipelineStage[] = [
  'submitted',
  'evaluation',
  'high_potential',
  'matching',
  'negotiation',
  'completed',
];

export const pipelineStageDictKey: Record<PipelineStage, DictKey> = {
  submitted: 'pipe_submitted',
  evaluation: 'pipe_evaluation',
  high_potential: 'pipe_high_potential',
  matching: 'pipe_matching',
  negotiation: 'pipe_negotiation',
  completed: 'pipe_completed',
};

export interface EnterpriseProject {
  id: string;
  name: Bi;
  scientist: Bi;
  org: Bi;
  industry: Bi;
  trl: number; // 1-9
  score: number; // 0-100, AI score
  pipeline: PipelineStage;
  evaluator?: Bi;
  submittedAt: string; // ISO
  updatedAt: string;
  summary: Bi;
}

export interface Expert {
  id: string;
  name: Bi;
  field: Bi;
  org: Bi;
  rating: number; // 0-10
  assigned: number;
  vote?: 'approve' | 'reject' | 'revision';
  comment?: Bi;
}

export type DealStage =
  | 'introduced'
  | 'meeting'
  | 'dd'
  | 'term_sheet'
  | 'closed';

export const dealStageDictKey: Record<DealStage, DictKey> = {
  introduced: 'deal_introduced',
  meeting: 'deal_meeting',
  dd: 'deal_dd',
  term_sheet: 'deal_term_sheet',
  closed: 'deal_closed',
};

export interface Deal {
  id: string;
  projectId: string;
  projectName: Bi;
  investor: string;
  amountUsd: number;
  stage: DealStage;
  status: 'active' | 'pending' | 'won' | 'lost';
  updatedAt: string;
}

export interface Kpi {
  key: 'projects' | 'evaluations' | 'matches' | 'conversion';
  value: number;
  delta: number; // % change vs last period
  unit?: '%' | '';
}

// ---------- Mock KPIs ----------

export const mockKpis: Kpi[] = [
  { key: 'projects', value: 186, delta: 12, unit: '' },
  { key: 'evaluations', value: 42, delta: 8, unit: '' },
  { key: 'matches', value: 18, delta: 22, unit: '' },
  { key: 'conversion', value: 12, delta: 3, unit: '%' },
];

// ---------- Industry distribution & monthly deal flow ----------

export const industryDistribution: { name: Bi; value: number }[] = [
  { name: { en: 'Energy', zh: '能源' }, value: 38 },
  { name: { en: 'Biotech', zh: '生物科技' }, value: 32 },
  { name: { en: 'Materials', zh: '新材料' }, value: 28 },
  { name: { en: 'Quantum', zh: '量子' }, value: 19 },
  { name: { en: 'AI / Robotics', zh: 'AI / 机器人' }, value: 41 },
  { name: { en: 'AgriTech', zh: '农业科技' }, value: 17 },
  { name: { en: 'Other', zh: '其它' }, value: 11 },
];

export const monthlyDealFlow: {
  month: string;
  submitted: number;
  matched: number;
  closed: number;
}[] = [
  { month: '2025-11', submitted: 22, matched: 6, closed: 2 },
  { month: '2025-12', submitted: 28, matched: 9, closed: 3 },
  { month: '2026-01', submitted: 31, matched: 11, closed: 4 },
  { month: '2026-02', submitted: 26, matched: 8, closed: 3 },
  { month: '2026-03', submitted: 35, matched: 14, closed: 5 },
  { month: '2026-04', submitted: 44, matched: 18, closed: 6 },
];

export const aiInsights: Bi[] = [
  {
    en: 'AI suggests focusing on energy and biotech sectors this quarter — combined match rate is 28% above park average.',
    zh: 'AI 建议本季度重点关注能源与生物科技赛道 —— 合计匹配率高于园区平均 28%。',
  },
  {
    en: '7 high-potential projects have been waiting >14 days for an evaluator. Consider re-assigning Dr. Zhang & Dr. Li.',
    zh: '7 个高潜力项目等待评审 >14 天，建议重新指派张博士与李博士。',
  },
  {
    en: 'CATL Ventures has reviewed 12 projects this month — 4 are likely to convert based on stated thesis match.',
    zh: '宁德时代创投本月已审阅 12 个项目，根据投资逻辑匹配，预计 4 个可转化。',
  },
];

// ---------- Mock projects (8 entries spanning all stages) ----------

export const mockEnterpriseProjects: EnterpriseProject[] = [
  {
    id: 'EP-001',
    name: { en: 'Graphene Battery Tech', zh: '石墨烯电池技术' },
    scientist: { en: 'Prof. Wei Lin', zh: '林伟教授' },
    org: { en: 'Tsinghua University', zh: '清华大学' },
    industry: { en: 'Energy', zh: '能源' },
    trl: 4,
    score: 82,
    pipeline: 'high_potential',
    evaluator: { en: 'Dr. Zhang', zh: '张博士' },
    submittedAt: '2026-03-08T10:00:00Z',
    updatedAt: '2026-04-22T10:18:00Z',
    summary: {
      en: '+38% energy density via graphene composite electrode, validated at coin-cell level.',
      zh: '基于石墨烯复合电极，扣式电芯验证能量密度提升 38%。',
    },
  },
  {
    id: 'EP-002',
    name: { en: 'CRISPR Crop Resilience', zh: 'CRISPR 抗逆作物' },
    scientist: { en: 'Prof. Mei Chen', zh: '陈梅教授' },
    org: { en: 'CAAS', zh: '中国农科院' },
    industry: { en: 'AgriTech', zh: '农业科技' },
    trl: 3,
    score: 74,
    pipeline: 'evaluation',
    evaluator: { en: 'Dr. Li', zh: '李博士' },
    submittedAt: '2026-03-22T08:00:00Z',
    updatedAt: '2026-04-19T08:02:00Z',
    summary: {
      en: 'Drought- and saline-tolerant gene-edited wheat strains, greenhouse-validated.',
      zh: '耐干旱与盐碱的基因编辑小麦品系，已温室验证。',
    },
  },
  {
    id: 'EP-003',
    name: { en: 'Quantum Imaging Sensor', zh: '量子成像传感器' },
    scientist: { en: 'Prof. Hao Yu', zh: '于浩教授' },
    org: { en: 'USTC', zh: '中科大' },
    industry: { en: 'Quantum', zh: '量子' },
    trl: 5,
    score: 88,
    pipeline: 'matching',
    evaluator: { en: 'Dr. Wang', zh: '王博士' },
    submittedAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-04-15T14:40:00Z',
    summary: {
      en: 'Single-photon avalanche diode array — sub-mm medical imaging at 1/10 dose.',
      zh: '单光子雪崩二极管阵列，1/10 剂量实现亚毫米医疗成像。',
    },
  },
  {
    id: 'EP-004',
    name: { en: 'Hydrogen Storage Alloy', zh: '储氢合金' },
    scientist: { en: 'Prof. Bo Zhao', zh: '赵博教授' },
    org: { en: 'Zhejiang Lab', zh: '之江实验室' },
    industry: { en: 'Energy', zh: '能源' },
    trl: 4,
    score: 79,
    pipeline: 'high_potential',
    evaluator: { en: 'Dr. Zhang', zh: '张博士' },
    submittedAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-04-21T11:00:00Z',
    summary: {
      en: 'Mg-based alloy storing 7.2 wt% H2 with reversible kinetics at 280°C.',
      zh: '镁基合金，7.2 wt% 储氢量，280°C 可逆动力学。',
    },
  },
  {
    id: 'EP-005',
    name: { en: 'AI Drug Discovery Platform', zh: 'AI 药物发现平台' },
    scientist: { en: 'Prof. Yan Wu', zh: '吴岩教授' },
    org: { en: 'Peking University', zh: '北京大学' },
    industry: { en: 'Biotech', zh: '生物科技' },
    trl: 6,
    score: 91,
    pipeline: 'negotiation',
    evaluator: { en: 'Dr. Li', zh: '李博士' },
    submittedAt: '2026-01-19T10:00:00Z',
    updatedAt: '2026-04-23T09:30:00Z',
    summary: {
      en: 'Generative model for protein-ligand binding — 4 leads in pre-clinical.',
      zh: '蛋白-配体结合生成模型，4 个候选已进入临床前。',
    },
  },
];

// ---------- More projects (continue list above) ----------

mockEnterpriseProjects.push(
  {
    id: 'EP-006',
    name: { en: 'Solid-State Electrolyte', zh: '固态电解质' },
    scientist: { en: 'Prof. Jing Sun', zh: '孙婧教授' },
    org: { en: 'Fudan University', zh: '复旦大学' },
    industry: { en: 'Materials', zh: '新材料' },
    trl: 3,
    score: 68,
    pipeline: 'evaluation',
    submittedAt: '2026-04-05T10:00:00Z',
    updatedAt: '2026-04-24T16:00:00Z',
    summary: {
      en: 'Sulfide electrolyte with 12 mS/cm ionic conductivity at room temp.',
      zh: '硫化物电解质，室温离子电导率 12 mS/cm。',
    },
  },
  {
    id: 'EP-007',
    name: { en: 'Edge LLM Accelerator', zh: '边缘大模型加速器' },
    scientist: { en: 'Prof. Tao He', zh: '何涛教授' },
    org: { en: 'SJTU', zh: '上海交大' },
    industry: { en: 'AI / Robotics', zh: 'AI / 机器人' },
    trl: 5,
    score: 84,
    pipeline: 'matching',
    evaluator: { en: 'Dr. Wang', zh: '王博士' },
    submittedAt: '2026-02-28T10:00:00Z',
    updatedAt: '2026-04-22T12:00:00Z',
    summary: {
      en: '7B-parameter LLM at 35 tokens/s on 5W edge SoC; novel sparse MAC.',
      zh: '5W 边缘 SoC 上 7B LLM 达 35 tokens/s，自研稀疏 MAC。',
    },
  },
  {
    id: 'EP-008',
    name: { en: 'Surgical Robot Arm', zh: '外科手术机械臂' },
    scientist: { en: 'Prof. Min Xu', zh: '徐敏教授' },
    org: { en: 'HIT', zh: '哈工大' },
    industry: { en: 'AI / Robotics', zh: 'AI / 机器人' },
    trl: 7,
    score: 89,
    pipeline: 'completed',
    evaluator: { en: 'Dr. Wang', zh: '王博士' },
    submittedAt: '2025-11-12T10:00:00Z',
    updatedAt: '2026-04-10T10:00:00Z',
    summary: {
      en: '7-DoF robotic arm with sub-mm haptic feedback — CFDA pilot trial.',
      zh: '7 自由度机械臂，亚毫米力觉反馈，CFDA 试点临床。',
    },
  },
  {
    id: 'EP-009',
    name: { en: 'Photonic Chip Foundry', zh: '光子芯片代工' },
    scientist: { en: 'Prof. Lei Gao', zh: '高磊教授' },
    org: { en: 'Tsinghua University', zh: '清华大学' },
    industry: { en: 'Quantum', zh: '量子' },
    trl: 4,
    score: 76,
    pipeline: 'high_potential',
    evaluator: { en: 'Dr. Zhang', zh: '张博士' },
    submittedAt: '2026-03-18T10:00:00Z',
    updatedAt: '2026-04-20T15:00:00Z',
    summary: {
      en: 'Silicon-photonic 200mm pilot line — 4× yield improvement vs. baseline.',
      zh: '硅基光子 200mm 试制线，良率较基线提升 4 倍。',
    },
  },
  {
    id: 'EP-010',
    name: { en: 'mRNA Cancer Vaccine', zh: 'mRNA 癌症疫苗' },
    scientist: { en: 'Prof. Ling Zhao', zh: '赵玲教授' },
    org: { en: 'Fudan University', zh: '复旦大学' },
    industry: { en: 'Biotech', zh: '生物科技' },
    trl: 5,
    score: 86,
    pipeline: 'matching',
    evaluator: { en: 'Dr. Li', zh: '李博士' },
    submittedAt: '2026-02-04T10:00:00Z',
    updatedAt: '2026-04-22T10:00:00Z',
    summary: {
      en: 'Personalized neoantigen vaccine — Phase I dose-escalation underway.',
      zh: '个体化新抗原疫苗，I 期剂量递增进行中。',
    },
  },
  {
    id: 'EP-011',
    name: { en: 'Perovskite Tandem PV', zh: '钙钛矿叠层光伏' },
    scientist: { en: 'Prof. An Liu', zh: '刘安教授' },
    org: { en: 'NREL Joint Lab', zh: 'NREL 联合实验室' },
    industry: { en: 'Energy', zh: '能源' },
    trl: 4,
    score: 81,
    pipeline: 'evaluation',
    submittedAt: '2026-04-12T10:00:00Z',
    updatedAt: '2026-04-25T10:00:00Z',
    summary: {
      en: '32.1% certified efficiency on 1cm² tandem cell.',
      zh: '1 cm² 叠层电池认证效率 32.1%。',
    },
  },
  {
    id: 'EP-012',
    name: { en: 'Carbon Capture Membrane', zh: '碳捕集膜' },
    scientist: { en: 'Prof. Yi Tan', zh: '谭怡教授' },
    org: { en: 'Zhejiang University', zh: '浙江大学' },
    industry: { en: 'Energy', zh: '能源' },
    trl: 3,
    score: 65,
    pipeline: 'submitted',
    submittedAt: '2026-04-23T10:00:00Z',
    updatedAt: '2026-04-23T10:00:00Z',
    summary: {
      en: 'MOF-coated polymer membrane — 4× CO2/N2 selectivity vs. PEBA.',
      zh: 'MOF 涂层聚合物膜，CO2/N2 选择性较 PEBA 提升 4 倍。',
    },
  },
  {
    id: 'EP-013',
    name: { en: 'Bio-Sensor Wearable', zh: '生物传感可穿戴' },
    scientist: { en: 'Prof. Xue Han', zh: '韩雪教授' },
    org: { en: 'SJTU', zh: '上海交大' },
    industry: { en: 'Biotech', zh: '生物科技' },
    trl: 6,
    score: 78,
    pipeline: 'negotiation',
    evaluator: { en: 'Dr. Li', zh: '李博士' },
    submittedAt: '2026-01-30T10:00:00Z',
    updatedAt: '2026-04-23T16:00:00Z',
    summary: {
      en: 'Continuous lactate + glucose sensing patch — 14-day wear.',
      zh: '乳酸 + 葡萄糖连续监测贴片，可佩戴 14 天。',
    },
  }
);

// ---------- Mock experts ----------

export const mockExperts: Expert[] = [
  {
    id: 'EX-001',
    name: { en: 'Dr. Wei Zhang', zh: '张伟博士' },
    field: { en: 'Materials Science', zh: '材料科学' },
    org: { en: 'CAS Institute of Chemistry', zh: '中科院化学所' },
    rating: 9.2,
    assigned: 6,
    vote: 'approve',
    comment: {
      en: 'Strong fundamentals; cost validation needed at 10kg scale before scale-up.',
      zh: '基础扎实；规模化前需在 10 公斤级验证成本。',
    },
  },
  {
    id: 'EX-002',
    name: { en: 'Dr. Ming Li', zh: '李明博士' },
    field: { en: 'Energy Systems', zh: '能源系统' },
    org: { en: 'Tsinghua Energy Lab', zh: '清华能源实验室' },
    rating: 8.8,
    assigned: 4,
    vote: 'revision',
    comment: {
      en: 'Promising but bench-to-pack scaling risk is under-modeled.',
      zh: '前景良好，但实验台到电池包的放大风险评估不足。',
    },
  },
  {
    id: 'EX-003',
    name: { en: 'Dr. Hui Wang', zh: '王慧博士' },
    field: { en: 'AI / Hardware', zh: 'AI / 硬件' },
    org: { en: 'Alibaba DAMO', zh: '阿里达摩院' },
    rating: 9.0,
    assigned: 5,
    vote: 'approve',
    comment: {
      en: 'Sparse-MAC numbers reproduce; recommend matching with edge-AI funds.',
      zh: '稀疏 MAC 数据可复现，建议匹配边缘 AI 基金。',
    },
  },
  {
    id: 'EX-004',
    name: { en: 'Dr. Fang Lu', zh: '陆芳博士' },
    field: { en: 'Biotech / Clinical', zh: '生物科技 / 临床' },
    org: { en: 'PKU Health Science Center', zh: '北大医学部' },
    rating: 9.1,
    assigned: 3,
  },
  {
    id: 'EX-005',
    name: { en: 'Dr. Kai Song', zh: '宋凯博士' },
    field: { en: 'Quantum / Photonics', zh: '量子 / 光子' },
    org: { en: 'USTC', zh: '中科大' },
    rating: 8.6,
    assigned: 2,
  },
];

// ---------- Mock deals ----------

export const mockDeals: Deal[] = [
  {
    id: 'D-001',
    projectId: 'EP-005',
    projectName: { en: 'AI Drug Discovery Platform', zh: 'AI 药物发现平台' },
    investor: 'Sequoia China',
    amountUsd: 12_000_000,
    stage: 'term_sheet',
    status: 'active',
    updatedAt: '2026-04-23T09:30:00Z',
  },
  {
    id: 'D-002',
    projectId: 'EP-001',
    projectName: { en: 'Graphene Battery Tech', zh: '石墨烯电池技术' },
    investor: 'CATL Ventures',
    amountUsd: 8_000_000,
    stage: 'dd',
    status: 'active',
    updatedAt: '2026-04-22T10:18:00Z',
  },
  {
    id: 'D-003',
    projectId: 'EP-007',
    projectName: { en: 'Edge LLM Accelerator', zh: '边缘大模型加速器' },
    investor: 'Hillhouse Capital',
    amountUsd: 15_000_000,
    stage: 'meeting',
    status: 'active',
    updatedAt: '2026-04-22T12:00:00Z',
  },
  {
    id: 'D-004',
    projectId: 'EP-013',
    projectName: { en: 'Bio-Sensor Wearable', zh: '生物传感可穿戴' },
    investor: 'Legend Capital',
    amountUsd: 5_000_000,
    stage: 'term_sheet',
    status: 'pending',
    updatedAt: '2026-04-23T16:00:00Z',
  },
  {
    id: 'D-005',
    projectId: 'EP-008',
    projectName: { en: 'Surgical Robot Arm', zh: '外科手术机械臂' },
    investor: 'SoftBank Vision Fund',
    amountUsd: 25_000_000,
    stage: 'closed',
    status: 'won',
    updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'D-006',
    projectId: 'EP-003',
    projectName: { en: 'Quantum Imaging Sensor', zh: '量子成像传感器' },
    investor: 'Breakthrough Energy Ventures',
    amountUsd: 7_000_000,
    stage: 'introduced',
    status: 'active',
    updatedAt: '2026-04-15T14:40:00Z',
  },
];

// ---------- Helper ----------

export function getProjectsByStage(stage: PipelineStage): EnterpriseProject[] {
  return mockEnterpriseProjects.filter((p) => p.pipeline === stage);
}

// ---------- Innovation Universe (clusters / map) ----------

export type ClusterId =
  | 'intelligence'
  | 'matter'
  | 'life'
  | 'engineering'
  | 'earth'
  | 'space';

export interface Cluster {
  id: ClusterId;
  nameKey: DictKey;
  // Center on a normalized 1000x600 canvas
  cx: number;
  cy: number;
  // Soft glow radius
  radius: number;
  // Base color for cluster glow / nodes
  color: string;
  glow: string;
  // Sub-industries that live inside this cluster — drives ambient node labels.
  subdomains: Bi[];
}

export const clusters: Cluster[] = [
  {
    id: 'intelligence',
    nameKey: 'cluster_intelligence',
    cx: 240,
    cy: 200,
    radius: 150,
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.35)',
    subdomains: [
      { en: 'LLMs', zh: '大模型' },
      { en: 'Embodied AI', zh: '具身智能' },
      { en: 'Computer Vision', zh: '计算机视觉' },
      { en: 'Reinforcement Learning', zh: '强化学习' },
      { en: 'Edge AI', zh: '边缘智能' },
      { en: 'NLP', zh: '自然语言' },
      { en: 'AI Safety', zh: 'AI 安全' },
      { en: 'Cryptography', zh: '密码学' },
      { en: 'Optimization', zh: '运筹优化' },
      { en: 'Knowledge Graphs', zh: '知识图谱' },
      { en: 'Multi-agent', zh: '多智能体' },
      { en: 'Federated Learning', zh: '联邦学习' },
    ],
  },
  {
    id: 'matter',
    nameKey: 'cluster_matter',
    cx: 520,
    cy: 170,
    radius: 140,
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.35)',
    subdomains: [
      { en: 'Graphene', zh: '石墨烯' },
      { en: 'Semiconductors', zh: '半导体' },
      { en: 'Photonics', zh: '光子学' },
      { en: 'Superconductors', zh: '超导体' },
      { en: 'Quantum Computing', zh: '量子计算' },
      { en: 'MEMS', zh: '微机电' },
      { en: 'Metamaterials', zh: '超材料' },
      { en: '2D Materials', zh: '二维材料' },
      { en: 'Nanotech', zh: '纳米技术' },
      { en: 'Catalysis', zh: '催化' },
      { en: 'Spintronics', zh: '自旋电子' },
      { en: 'Polymers', zh: '聚合物' },
    ],
  },
  {
    id: 'life',
    nameKey: 'cluster_life',
    cx: 780,
    cy: 230,
    radius: 150,
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.35)',
    subdomains: [
      { en: 'Gene Editing', zh: '基因编辑' },
      { en: 'mRNA', zh: 'mRNA' },
      { en: 'Cell Therapy', zh: '细胞治疗' },
      { en: 'Brain–Computer', zh: '脑机接口' },
      { en: 'Synthetic Biology', zh: '合成生物' },
      { en: 'Microbiome', zh: '微生物组' },
      { en: 'Immunotherapy', zh: '免疫治疗' },
      { en: 'Diagnostics', zh: '诊断' },
      { en: 'Longevity', zh: '抗衰' },
      { en: 'Bioprinting', zh: '生物打印' },
      { en: 'Drug Discovery', zh: '药物发现' },
      { en: 'Mental Health', zh: '心理健康' },
    ],
  },
  {
    id: 'engineering',
    nameKey: 'cluster_engineering',
    cx: 280,
    cy: 440,
    radius: 140,
    color: '#0ea5e9',
    glow: 'rgba(14,165,233,0.35)',
    subdomains: [
      { en: 'Autonomous Systems', zh: '自动驾驶' },
      { en: 'Additive Mfg.', zh: '增材制造' },
      { en: 'Smart Materials', zh: '智能材料' },
      { en: 'Power Electronics', zh: '电力电子' },
      { en: 'Sensors', zh: '传感器' },
      { en: 'Drones', zh: '无人机' },
      { en: 'Industrial IoT', zh: '工业物联网' },
      { en: 'Mobility', zh: '出行' },
      { en: 'Logistics', zh: '物流' },
      { en: 'Digital Twin', zh: '数字孪生' },
      { en: 'Smart Grid', zh: '智能电网' },
      { en: 'Robotics Mfg.', zh: '机器人制造' },
    ],
  },
  {
    id: 'earth',
    nameKey: 'cluster_earth',
    cx: 560,
    cy: 460,
    radius: 150,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.35)',
    subdomains: [
      { en: 'Carbon Capture', zh: '碳捕集' },
      { en: 'Solar', zh: '太阳能' },
      { en: 'Wind', zh: '风能' },
      { en: 'Hydrogen', zh: '氢能' },
      { en: 'Solid-state Battery', zh: '固态电池' },
      { en: 'Nuclear / Fusion', zh: '核能 / 聚变' },
      { en: 'AgriTech', zh: '农业科技' },
      { en: 'Water', zh: '水处理' },
      { en: 'Climate Modeling', zh: '气候模型' },
      { en: 'Recycling', zh: '循环回收' },
      { en: 'Soil Health', zh: '土壤健康' },
      { en: 'Bioplastics', zh: '生物塑料' },
    ],
  },
  {
    id: 'space',
    nameKey: 'cluster_space',
    cx: 820,
    cy: 460,
    radius: 130,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    subdomains: [
      { en: 'Satellites', zh: '卫星' },
      { en: 'Propulsion', zh: '推进系统' },
      { en: 'Space Comms', zh: '太空通讯' },
      { en: 'In-Orbit Mfg.', zh: '在轨制造' },
      { en: 'Asteroid Mining', zh: '小行星采矿' },
      { en: 'Space Telescopes', zh: '太空望远镜' },
      { en: 'Reusable Rockets', zh: '可回收火箭' },
      { en: 'Space Habitats', zh: '太空居住' },
      { en: 'Earth Observation', zh: '对地观测' },
      { en: 'Space Tourism', zh: '太空旅游' },
      { en: 'Space Robotics', zh: '太空机器人' },
      { en: 'Deep Space', zh: '深空探测' },
    ],
  },
];

// Map English industry label -> cluster id
const INDUSTRY_TO_CLUSTER: Record<string, ClusterId> = {
  Energy: 'earth',
  Biotech: 'life',
  Materials: 'matter',
  Quantum: 'matter',
  'AI / Robotics': 'intelligence',
  AgriTech: 'earth',
  Aerospace: 'space',
  Other: 'engineering',
};

export function clusterForProject(p: EnterpriseProject): ClusterId {
  return INDUSTRY_TO_CLUSTER[p.industry.en] ?? 'engineering';
}

// Deterministic hash -> 0..1 from a string (small, no deps)
function hash01(seed: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // To unsigned, then to 0..1
  return ((h >>> 0) % 100000) / 100000;
}

// Returns an x/y position inside the cluster's circle for a given project.
// Deterministic so nodes don't jitter between renders.
export function nodePosition(
  p: EnterpriseProject,
  cluster: Cluster
): { x: number; y: number } {
  const angle = hash01(p.id, 1) * Math.PI * 2;
  // Bias toward the rim (sqrt) so nodes spread out instead of bunching at center
  const r = Math.sqrt(hash01(p.id, 2)) * (cluster.radius - 18);
  return {
    x: cluster.cx + Math.cos(angle) * r,
    y: cluster.cy + Math.sin(angle) * r,
  };
}

export interface MapNode {
  project: EnterpriseProject;
  cluster: Cluster;
  x: number;
  y: number;
  phase: number; // 0..2π for animation offset
}

export function buildMapNodes(): MapNode[] {
  const byId = new Map(clusters.map((c) => [c.id, c]));
  return mockEnterpriseProjects.map((p) => {
    const cluster = byId.get(clusterForProject(p))!;
    return {
      project: p,
      cluster,
      ...nodePosition(p, cluster),
      phase: hash01(p.id, 7) * Math.PI * 2,
    };
  });
}

// Ambient (non-clickable) background nodes that give the universe density.
// Each ambient dot is tagged with a sub-industry of its cluster.
export interface AmbientNode {
  id: string;
  cluster: Cluster;
  x: number;
  y: number;
  r: number; // base radius
  phase: number;
  alpha: number;
  label: Bi; // sub-industry name
  // True for one "leader" dot per sub-industry — used to render an inline label
  // when zoomed in (avoids overlapping text from every duplicate dot).
  isLeader: boolean;
}

// One dot per sub-industry — each industry appears exactly once on the map.
export function buildAmbientNodes(): AmbientNode[] {
  const out: AmbientNode[] = [];
  for (const c of clusters) {
    for (let s = 0; s < c.subdomains.length; s++) {
      const sub = c.subdomains[s];
      const seed = `${c.id}-amb-${s}`;
      const a = hash01(seed, 1) * Math.PI * 2;
      const rr = Math.sqrt(hash01(seed, 2)) * (c.radius - 6);
      out.push({
        id: seed,
        cluster: c,
        x: c.cx + Math.cos(a) * rr,
        y: c.cy + Math.sin(a) * rr,
        r: 2.4 + hash01(seed, 3) * 1.2,
        phase: hash01(seed, 4) * Math.PI * 2,
        alpha: 0.75 + hash01(seed, 5) * 0.2,
        label: sub,
        isLeader: true,
      });
    }
  }
  return out;
}

// Related projects: same cluster, closest by score, exclude self.
export function relatedProjects(
  p: EnterpriseProject,
  limit = 3
): EnterpriseProject[] {
  const cid = clusterForProject(p);
  return mockEnterpriseProjects
    .filter((x) => x.id !== p.id && clusterForProject(x) === cid)
    .map((x) => ({ x, d: Math.abs(x.score - p.score) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((r) => r.x);
}

// Projects matching a sub-industry dot. Keyword match across name + summary
// in either language. Falls back to all projects in the same cluster if
// nothing matches the keyword (so rare sub-industries still surface context).
export function projectsForSubdomain(
  label: Bi,
  cluster: Cluster,
  limit = 6
): { matches: EnterpriseProject[]; fallback: boolean } {
  const inCluster = mockEnterpriseProjects.filter(
    (p) => clusterForProject(p) === cluster.id
  );
  const en = label.en.toLowerCase();
  const zh = label.zh;
  const hits = inCluster.filter((p) => {
    const hay = (
      p.name.en +
      ' ' +
      p.summary.en +
      ' ' +
      p.industry.en
    ).toLowerCase();
    const hayZh = p.name.zh + p.summary.zh + p.industry.zh;
    return hay.includes(en) || (zh && hayZh.includes(zh));
  });
  if (hits.length > 0) {
    return {
      matches: hits.sort((a, b) => b.score - a.score).slice(0, limit),
      fallback: false,
    };
  }
  return {
    matches: inCluster.sort((a, b) => b.score - a.score).slice(0, limit),
    fallback: true,
  };
}

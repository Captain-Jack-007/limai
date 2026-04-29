// Mock data for the OCP OS (One-Person Company Operating System) prototype.
// All copy is bilingual via the existing i18n dict; localised strings here are
// kept minimal (proper nouns, numbers, raw timeline content).

import type { Bi, DictKey } from './i18n';

export type AgentId = 'strategy' | 'social' | 'designer' | 'bd' | 'finance';
export type AgentStatus = 'active' | 'idle' | 'thinking';

export interface Agent {
  id: AgentId;
  nameKey: DictKey;
  roleKey: DictKey;
  icon: 'brain' | 'megaphone' | 'palette' | 'briefcase' | 'wallet';
  color: string; // hex
  status: AgentStatus;
  lastAction: Bi;
  impact: Bi;
}

export const agents: Agent[] = [
  {
    id: 'strategy',
    nameKey: 'ocp_ag_name_strategy',
    roleKey: 'ocp_ag_role_strategy',
    icon: 'brain',
    color: '#a855f7',
    status: 'thinking',
    lastAction: { en: 'Re-prioritised Q2 roadmap', zh: '重新规划 Q2 路线图' },
    impact: { en: '3 new missions queued', zh: '新增 3 个待执行任务' },
  },
  {
    id: 'social',
    nameKey: 'ocp_ag_name_social',
    roleKey: 'ocp_ag_role_social',
    icon: 'megaphone',
    color: '#22d3ee',
    status: 'active',
    lastAction: {
      en: 'Posted LinkedIn update at 10:36',
      zh: '于 10:36 发布 LinkedIn 内容',
    },
    impact: { en: '12 leads generated', zh: '获取 12 条线索' },
  },
  {
    id: 'designer',
    nameKey: 'ocp_ag_name_designer',
    roleKey: 'ocp_ag_role_designer',
    icon: 'palette',
    color: '#f472b6',
    status: 'active',
    lastAction: { en: 'Generated 4 launch posters', zh: '生成 4 张发布海报' },
    impact: { en: 'Brand kit v3 ready', zh: '品牌套件 v3 完成' },
  },
  {
    id: 'bd',
    nameKey: 'ocp_ag_name_bd',
    roleKey: 'ocp_ag_role_bd',
    icon: 'briefcase',
    color: '#fbbf24',
    status: 'active',
    lastAction: { en: 'Sent pitch to Hillhouse', zh: '向高瓴发送路演材料' },
    impact: { en: '2 meetings booked', zh: '已约 2 次会议' },
  },
  {
    id: 'finance',
    nameKey: 'ocp_ag_name_finance',
    roleKey: 'ocp_ag_role_finance',
    icon: 'wallet',
    color: '#34d399',
    status: 'idle',
    lastAction: { en: 'Updated runway estimate', zh: '更新运营周期预估' },
    impact: { en: 'Runway: 3 months', zh: '运营周期：3 个月' },
  },
];

export type MissionStatus = 'active' | 'queued' | 'done';
export interface MissionTask {
  label: Bi;
  done: boolean;
  agent: AgentId;
}
export interface Mission {
  id: string;
  title: Bi;
  status: MissionStatus;
  owner: AgentId;
  tasks: MissionTask[];
}

export const missions: Mission[] = [
  {
    id: 'm-seed',
    title: { en: 'Raise Seed Funding', zh: '完成种子轮融资' },
    status: 'active',
    owner: 'strategy',
    tasks: [
      {
        label: { en: 'Generate pitch deck v3', zh: '生成路演材料 v3' },
        done: true,
        agent: 'bd',
      },
      {
        label: {
          en: 'Identify 25 target investors',
          zh: '锁定 25 位目标投资人',
        },
        done: true,
        agent: 'bd',
      },
      {
        label: { en: 'Launch awareness campaign', zh: '启动品牌认知活动' },
        done: true,
        agent: 'social',
      },
      {
        label: {
          en: 'Estimate funding need ($1.2M)',
          zh: '估算融资需求（120 万美元）',
        },
        done: false,
        agent: 'finance',
      },
      {
        label: {
          en: 'Schedule first 5 investor calls',
          zh: '安排前 5 场投资人会议',
        },
        done: false,
        agent: 'bd',
      },
    ],
  },
  {
    id: 'm-launch',
    title: { en: 'Product Awareness Launch', zh: '产品认知启动' },
    status: 'active',
    owner: 'social',
    tasks: [
      {
        label: { en: 'Brand kit v3', zh: '品牌套件 v3' },
        done: true,
        agent: 'designer',
      },
      {
        label: { en: 'LinkedIn launch post', zh: 'LinkedIn 启动文案' },
        done: true,
        agent: 'social',
      },
      {
        label: { en: 'WeChat article series (3)', zh: '微信图文系列（3 篇）' },
        done: false,
        agent: 'social',
      },
      {
        label: { en: 'Demo video 60s', zh: '60 秒演示视频' },
        done: false,
        agent: 'designer',
      },
    ],
  },
  {
    id: 'm-partners',
    title: { en: 'Find 3 Strategic Partners', zh: '寻找 3 个战略合作伙伴' },
    status: 'queued',
    owner: 'bd',
    tasks: [
      {
        label: {
          en: 'Map top 12 battery R&D labs',
          zh: '梳理前 12 家电池研发实验室',
        },
        done: false,
        agent: 'strategy',
      },
      {
        label: { en: 'Draft partnership proposal', zh: '起草合作提案' },
        done: false,
        agent: 'bd',
      },
      {
        label: {
          en: 'Personalise outreach (12)',
          zh: '撰写个性化外联（12 条）',
        },
        done: false,
        agent: 'social',
      },
    ],
  },
  {
    id: 'm-runway',
    title: { en: 'Extend Runway to 6 months', zh: '将运营周期延长至 6 个月' },
    status: 'done',
    owner: 'finance',
    tasks: [
      {
        label: { en: 'Audit last 90 days of spend', zh: '审计近 90 天支出' },
        done: true,
        agent: 'finance',
      },
      {
        label: {
          en: 'Cancel 2 unused SaaS tools',
          zh: '取消 2 个闲置 SaaS 工具',
        },
        done: true,
        agent: 'finance',
      },
      {
        label: { en: 'Renegotiate cloud contract', zh: '重新协商云合同' },
        done: true,
        agent: 'finance',
      },
    ],
  },
];

// ---------- Activity feed ----------
export type FeedEventKind =
  | 'post'
  | 'pitch'
  | 'analysis'
  | 'design'
  | 'finance'
  | 'plan'
  | 'outreach';
export interface FeedEvent {
  id: string;
  agent: AgentId;
  kind: FeedEventKind;
  message: Bi;
  // Minutes ago at "now" — the UI renders relative time.
  minutesAgo: number;
}

export const feedEvents: FeedEvent[] = [
  {
    id: 'e1',
    agent: 'strategy',
    kind: 'plan',
    minutesAgo: 1,
    message: { en: 'Updated priorities for the week', zh: '更新本周优先级' },
  },
  {
    id: 'e2',
    agent: 'bd',
    kind: 'pitch',
    minutesAgo: 4,
    message: {
      en: 'Generated pitch deck v3 (12 slides)',
      zh: '生成路演材料 v3（12 页）',
    },
  },
  {
    id: 'e3',
    agent: 'social',
    kind: 'post',
    minutesAgo: 9,
    message: {
      en: 'Published LinkedIn post · 320 reach so far',
      zh: '发布 LinkedIn 内容 · 触达 320',
    },
  },
  {
    id: 'e4',
    agent: 'finance',
    kind: 'finance',
    minutesAgo: 14,
    message: {
      en: 'Runway recalculated · 3 months',
      zh: '重新计算运营周期 · 3 个月',
    },
  },
  {
    id: 'e5',
    agent: 'designer',
    kind: 'design',
    minutesAgo: 22,
    message: {
      en: 'Generated 4 launch poster variants',
      zh: '生成 4 张启动海报',
    },
  },
  {
    id: 'e6',
    agent: 'bd',
    kind: 'outreach',
    minutesAgo: 38,
    message: {
      en: 'Sent intro to Hillhouse · awaiting reply',
      zh: '向高瓴发送介绍 · 等待回复',
    },
  },
  {
    id: 'e7',
    agent: 'strategy',
    kind: 'analysis',
    minutesAgo: 55,
    message: {
      en: 'Analysed competitor funding round',
      zh: '分析竞品融资轮次',
    },
  },
  {
    id: 'e8',
    agent: 'social',
    kind: 'post',
    minutesAgo: 78,
    message: { en: 'Drafted WeChat article #2', zh: '起草微信图文 #2' },
  },
  {
    id: 'e9',
    agent: 'finance',
    kind: 'finance',
    minutesAgo: 110,
    message: {
      en: 'Flagged $50 unused SaaS · cancelled',
      zh: '识别 50 美元闲置 SaaS · 已取消',
    },
  },
];

// ---------- Content campaigns ----------
export type CampaignStatus = 'running' | 'scheduled' | 'draft';
export type PostStatus = 'published' | 'scheduled' | 'draft';
export type Channel = 'LinkedIn' | 'WeChat' | 'X';

export interface ContentPost {
  channel: Channel;
  title: Bi;
  status: PostStatus;
  when: Bi;
}
export interface Campaign {
  id: string;
  name: Bi;
  status: CampaignStatus;
  reach: number;
  clicks: number;
  leads: number;
  posts: ContentPost[];
}

export const campaigns: Campaign[] = [
  {
    id: 'c-launch',
    name: { en: 'Product Awareness', zh: '产品认知' },
    status: 'running',
    reach: 12480,
    clicks: 642,
    leads: 28,
    posts: [
      {
        channel: 'LinkedIn',
        status: 'published',
        when: { en: 'Today · 10:36', zh: '今天 · 10:36' },
        title: {
          en: 'Why graphene changes battery economics',
          zh: '石墨烯如何改变电池经济模型',
        },
      },
      {
        channel: 'WeChat',
        status: 'published',
        when: { en: 'Yesterday', zh: '昨天' },
        title: {
          en: 'Understanding the commercial inflection of graphene cells',
          zh: '一文读懂石墨烯电池的商业拐点',
        },
      },
      {
        channel: 'X',
        status: 'scheduled',
        when: { en: 'Tomorrow · 09:00', zh: '明天 · 09:00' },
        title: {
          en: 'Thread: 5 myths about solid-state batteries',
          zh: '系列：固态电池的 5 个误区',
        },
      },
      {
        channel: 'LinkedIn',
        status: 'draft',
        when: { en: '—', zh: '—' },
        title: {
          en: 'Founder note: pre-seed open',
          zh: '创始人手记：种子前融资启动',
        },
      },
    ],
  },
  {
    id: 'c-fundraise',
    name: { en: 'Fundraise Story', zh: '融资故事' },
    status: 'scheduled',
    reach: 0,
    clicks: 0,
    leads: 0,
    posts: [
      {
        channel: 'LinkedIn',
        status: 'scheduled',
        when: { en: 'Mon · 09:00', zh: '周一 · 09:00' },
        title: {
          en: 'We are raising $1.2M to scale graphene cells',
          zh: '我们正在融资 120 万美元以扩展石墨烯电芯',
        },
      },
      {
        channel: 'X',
        status: 'draft',
        when: { en: '—', zh: '—' },
        title: {
          en: 'Why now: cell-cost crossover in 2026',
          zh: '为何是现在：2026 年电芯成本拐点',
        },
      },
    ],
  },
];

// ---------- Finance ----------
export interface Expense {
  category: Bi;
  amount: number; // USD
}
export const finance = {
  cash: 28400,
  burn: 9500,
  runwayMonths: 3,
  expenses: [
    { category: { en: 'Cloud & compute', zh: '云与算力' }, amount: 1850 },
    { category: { en: 'Lab consumables', zh: '实验耗材' }, amount: 4200 },
    { category: { en: 'Marketing', zh: '营销' }, amount: 1200 },
    { category: { en: 'SaaS tools', zh: 'SaaS 工具' }, amount: 380 },
    { category: { en: 'Travel & meetings', zh: '差旅与会议' }, amount: 870 },
    { category: { en: 'Legal & compliance', zh: '法律与合规' }, amount: 1000 },
  ] as Expense[],
};

// ---------- Outreach ----------
export type LeadKind = 'investor' | 'partner' | 'customer';
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'meeting'
  | 'negotiating'
  | 'passed';
export interface Lead {
  id: string;
  name: Bi;
  org: Bi;
  kind: LeadKind;
  status: LeadStatus;
  nextStep: Bi;
}

export const leads: Lead[] = [
  {
    id: 'l1',
    name: { en: 'Lei Zhang', zh: '张磊' },
    org: { en: 'Hillhouse Capital', zh: '高瓴资本' },
    kind: 'investor',
    status: 'contacted',
    nextStep: { en: 'Follow-up email Friday', zh: '周五跟进邮件' },
  },
  {
    id: 'l2',
    name: { en: 'Ada Chen', zh: '陈雅达' },
    org: { en: 'Sequoia China', zh: '红杉中国' },
    kind: 'investor',
    status: 'meeting',
    nextStep: { en: 'Call Tue 14:00', zh: '周二 14:00 通话' },
  },
  {
    id: 'l3',
    name: { en: 'Mark Liu', zh: '刘明' },
    org: { en: 'CATL R&D', zh: '宁德时代研究院' },
    kind: 'partner',
    status: 'negotiating',
    nextStep: { en: 'Send NDA draft', zh: '发送保密协议草案' },
  },
  {
    id: 'l4',
    name: { en: 'Wei Sun', zh: '孙伟' },
    org: { en: 'Tsinghua Battery Lab', zh: '清华电池实验室' },
    kind: 'partner',
    status: 'new',
    nextStep: { en: 'Warm intro via advisor', zh: '通过顾问引荐' },
  },
  {
    id: 'l5',
    name: { en: 'Procurement Team', zh: '采购团队' },
    org: { en: 'NIO Power', zh: '蔚来能源' },
    kind: 'customer',
    status: 'contacted',
    nextStep: { en: 'Send sample spec sheet', zh: '发送样品规格表' },
  },
  {
    id: 'l6',
    name: { en: 'Olivia Park', zh: '朴恩' },
    org: { en: 'Lightspeed', zh: '光速创投' },
    kind: 'investor',
    status: 'passed',
    nextStep: { en: 'Re-engage at Series A', zh: 'A 轮时再联系' },
  },
];

// ---------- Company snapshot ----------
export const company = {
  name: { en: 'Graphene Battery Co.', zh: '石墨烯电池科技' } as Bi,
  stage: { en: 'Prototype', zh: '原型阶段' } as Bi,
  readiness: 68,
  funding: {
    en: 'Not Raised · Pre-seed prep',
    zh: '未融资 · 种子前准备',
  } as Bi,
  campaignsRunning: 2,
  leadsIdentified: 5,
  postsToday: 7,
  agentActions: 41,
};

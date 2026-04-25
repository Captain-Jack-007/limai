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
    name: 'Graphene Battery Tech',
    field: 'Energy Storage',
    stage: 'prototype',
    updatedAt: '2026-04-22T10:18:00Z',
    summary:
      'A graphene-based composite electrode increasing EV battery energy density by 38%.',
  },
  {
    id: 'PRJ-002',
    name: 'CRISPR Crop Resilience',
    field: 'AgriTech / Biotech',
    stage: 'lab',
    updatedAt: '2026-04-19T08:02:00Z',
    summary:
      'Gene-edited wheat strains tolerant to drought and saline soils, validated in greenhouse.',
  },
  {
    id: 'PRJ-003',
    name: 'Quantum Imaging Sensor',
    field: 'Quantum / Photonics',
    stage: 'pilot',
    updatedAt: '2026-04-15T14:40:00Z',
    summary:
      'Single-photon avalanche diode array enabling sub-mm medical imaging at 1/10 dose.',
  },
];

export const activeProject: Project = mockProjects[0];

// ---------- Evaluation (for the active project) ----------

export const mockEvaluation: Evaluation = {
  overview: {
    field: 'Energy Storage',
    innovation: 'Graphene-based composite battery electrode',
    application: 'Electric vehicles, grid storage, consumer electronics',
  },
  scores: [
    {
      key: 'trl',
      label: 'TRL Level',
      value: 4,
      scale: 10,
      hint: 'Lab-validated prototype',
    },
    { key: 'market', label: 'Market Potential', value: 8, scale: 10 },
    { key: 'commercial', label: 'Commercial Readiness', value: 6, scale: 10 },
    {
      key: 'investment',
      label: 'Investment Attractiveness',
      value: 7,
      scale: 10,
    },
  ],
  insights: [
    'High demand from EV makers seeking 30%+ energy density gains.',
    'Material cost reduction is the primary path to mass-market viability.',
    'Strong differentiation vs. solid-state and incumbent lithium-ion roadmaps.',
  ],
  risks: [
    'Manufacturing complexity at gigafactory scale.',
    'Patent landscape crowded around graphene synthesis methods.',
    'Regulatory certification (UN 38.3, IEC 62619) timeline of 9–12 months.',
  ],
  nextSteps: [
    'Build a 100-cell pilot pack and run 1,000-cycle reliability test.',
    'Engage 2–3 EV OEMs for joint validation (Tier-1 supplier route).',
    'Apply for the MIIT new-materials grant (2026 round, deadline Aug).',
  ],
};

// ---------- Chat seed ----------

export const seedChat: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    content:
      "Hi — I'm your Sci-Bridge agent. Describe your technology or upload a paper, and I'll evaluate it and draft a commercialization plan.",
    createdAt: '2026-04-25T09:00:00Z',
  },
];

// ---------- Demo conversation used to "play back" a session ----------

export const demoUserMessage: ChatMessage = {
  id: 'demo-u1',
  role: 'user',
  content:
    "I've developed a graphene-based composite electrode that increases lithium-ion battery energy density by ~38% in lab tests. Can you evaluate the commercialization potential?",
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
  content:
    "Great — I've parsed your paper. This sits at TRL 4 with strong market pull from EV and grid-storage segments. Energy density gain is competitive vs. CATL's 2025 roadmap, but cell-level cost and manufacturing yield are the blockers. I've populated the structured panel on the right with the full evaluation. Want me to run a Deep Analysis (patents + investor matching) next?",
  createdAt: '2026-04-25T09:01:08Z',
};

// ---------- Deep-analysis steps (animated playback) ----------

export const deepAnalysisSteps: AnalysisStep[] = [
  { key: 'parse', label: 'Parsing research paper…', durationMs: 900 },
  { key: 'patents', label: 'Checking patent landscape…', durationMs: 1100 },
  {
    key: 'market',
    label: 'Scanning market signals & competitors…',
    durationMs: 1200,
  },
  {
    key: 'investors',
    label: 'Matching with investor theses…',
    durationMs: 1000,
  },
  {
    key: 'report',
    label: 'Drafting commercialization report…',
    durationMs: 900,
  },
];

// ---------- Investors ----------

export const mockInvestors: Investor[] = [
  {
    id: 'INV-001',
    name: 'Sequoia China',
    focus: 'DeepTech, Energy, Mobility',
    stage: 'Seed – Series B',
    region: 'China / Global',
    ticket: '$2M – $30M',
    matchScore: 92,
    thesis:
      'Backs platform-scale clean energy bets with credible founders and defensible IP.',
  },
  {
    id: 'INV-002',
    name: 'Hillhouse Capital',
    focus: 'Industrial Tech, New Materials',
    stage: 'Series A – Growth',
    region: 'Asia',
    ticket: '$5M – $50M',
    matchScore: 87,
    thesis:
      'Long-horizon capital for capex-intensive new materials and battery supply chain.',
  },
  {
    id: 'INV-003',
    name: 'CATL Ventures',
    focus: 'Battery materials & cell innovation',
    stage: 'Seed – Series A',
    region: 'China',
    ticket: '$1M – $15M',
    matchScore: 95,
    thesis:
      'Strategic CVC seeking next-gen anodes, electrolytes and gigafactory-ready chemistries.',
  },
  {
    id: 'INV-004',
    name: 'SoftBank Vision Fund',
    focus: 'AI + Frontier Tech',
    stage: 'Series B+',
    region: 'Global',
    ticket: '$50M+',
    matchScore: 71,
    thesis:
      'Late-stage growth capital; fits once cell-level cost target is hit.',
  },
  {
    id: 'INV-005',
    name: 'Breakthrough Energy Ventures',
    focus: 'Climate tech, hard science',
    stage: 'Seed – Series B',
    region: 'Global',
    ticket: '$3M – $25M',
    matchScore: 84,
    thesis:
      'Patient capital for carbon-impact technologies with peer-reviewed science.',
  },
  {
    id: 'INV-006',
    name: 'Legend Capital',
    focus: 'Smart Manufacturing, EV',
    stage: 'Series A – B',
    region: 'China',
    ticket: '$3M – $20M',
    matchScore: 78,
    thesis: 'Active in EV powertrain components and Tier-1 supplier ecosystem.',
  },
];

// ---------- Pitch deck ----------

export const mockPitchDeck: PitchSlide[] = [
  {
    index: 1,
    title: 'Problem',
    bullets: [
      'EV adoption is gated by battery range and cost.',
      'Incumbent Li-ion energy density is plateauing at ~280 Wh/kg.',
      'OEMs need a 30%+ jump without sacrificing safety or cost.',
    ],
  },
  {
    index: 2,
    title: 'Solution',
    bullets: [
      'Graphene composite electrode with engineered porosity.',
      '+38% energy density at lab cell level (validated).',
      'Drop-in compatible with existing Li-ion cell formats.',
    ],
  },
  {
    index: 3,
    title: 'Technology',
    bullets: [
      'Proprietary CVD-graphene + binder formulation (patent filed).',
      '1,000-cycle retention >85% in coin-cell tests.',
      'Roadmap to pouch and prismatic formats by Q2 2027.',
    ],
  },
  {
    index: 4,
    title: 'Market',
    bullets: [
      'EV battery TAM: $132B in 2026, $310B by 2030.',
      'Initial wedge: high-end EV and grid storage ($28B SAM).',
      'Beachhead customer pipeline: 3 Tier-1 OEMs in dialogue.',
    ],
  },
  {
    index: 5,
    title: 'Business Model',
    bullets: [
      'Material licensing + electrode supply agreements.',
      'Per-kWh royalty (target 1.5–2.5%).',
      'Joint development deals with cell makers.',
    ],
  },
  {
    index: 6,
    title: 'Team',
    bullets: [
      'Founders: ex-Tsinghua materials lab, 40+ peer-reviewed papers.',
      'CTO: 12 years at CATL on anode chemistry.',
      'Advisory: former MIIT new-materials program lead.',
    ],
  },
  {
    index: 7,
    title: 'Funding Ask',
    bullets: [
      'Raising $8M Series A.',
      'Use of funds: pilot line ($4M), team ($2.5M), certification ($1.5M).',
      '24-month runway to first OEM design-win.',
    ],
  },
];

// ---------- Roadmap ----------

export const mockRoadmap: RoadmapMilestone[] = [
  {
    quarter: 'Q2 2026',
    title: 'Pilot cell line',
    detail: '100-cell pilot pack and 1,000-cycle reliability data.',
  },
  {
    quarter: 'Q3 2026',
    title: 'OEM joint validation',
    detail: 'Sign 2 JDAs with Tier-1 EV makers, begin A-sample testing.',
  },
  {
    quarter: 'Q4 2026',
    title: 'Series A close',
    detail: 'Close $8M round; expand materials team from 9 → 18.',
  },
  {
    quarter: 'Q1 2027',
    title: 'Pouch/prismatic format',
    detail: 'Adapt formulation to commercial cell formats; safety certs.',
  },
  {
    quarter: 'Q3 2027',
    title: 'Design-win',
    detail: 'First OEM design-win; secure offtake LOI for 2 GWh/year.',
  },
];

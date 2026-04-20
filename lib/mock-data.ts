import type { CompanyRisk, Issue } from './types';

const issues: Issue[] = [
  {
    id: 'ISS-001',
    category: 'employment',
    title: '工资与社保基数不一致',
    titleZh: '工资与社保基数不一致',
    severity: 'high',
    score: 82,
    summary: '48 名员工中有 12 名社保缴费基数较实际月工资低 20% 以上。',
    detail:
      '交叉核对 2026 年第一季度工资表与社保申报数据，发现 12 名员工申报的社保基数平均仅为实际税前工资的 63%，且该差距连续 3 个月存在。',
    regulation:
      '《中华人民共和国社会保险法》第 60 条；《社会保险费征缴暂行条例》要求单位按职工实际工资申报缴费基数。',
    recommendation:
      '建议调整社保缴费基数与实际税前工资一致，制定补缴方案，并就补缴事宜咨询主管税务机关。',
    evidence: [
      { label: '影响员工数', value: '12 / 48' },
      { label: '平均差距', value: '37%' },
      { label: '预计风险敞口', value: '¥186,400' },
    ],
    detectedAt: '2026-04-18T09:21:00Z',
  },
  {
    id: 'ISS-002',
    category: 'expense',
    title: '无票支出比例异常',
    titleZh: '无票支出比例异常',
    severity: 'high',
    score: 74,
    summary: '2026 年第一季度无票支出占总支出 18.4%，行业基准为 6%。',
    detail:
      '2026 年第一季度银行对公流水中，无匹配增值税专用发票或普通发票的支出合计 ¥1,240,500，主要集中在"市场推广"和"咨询服务"类。',
    regulation:
      '《企业所得税法》第八条及《发票管理办法》：未取得合法票据的支出不得在企业所得税前扣除。',
    recommendation:
      '尽可能向供应商补开发票；无法取得发票的支出转为不可税前扣除项目，并调整企业所得税计提。',
    evidence: [
      { label: '无票支出总额', value: '¥1,240,500' },
      { label: '占比', value: '18.4%' },
      { label: '行业基准', value: '6%' },
    ],
    detectedAt: '2026-04-18T09:22:00Z',
  },
  {
    id: 'ISS-003',
    category: 'tax',
    title: '增值税税负率低于行业区间',
    titleZh: '增值税税负率低于行业区间',
    severity: 'medium',
    score: 58,
    summary: '增值税实际税负率 1.2%，低于行业区间 2.5%–3.8%。',
    detail:
      '过去 12 个月申报增值税应纳税额占应税收入的比率为 1.2%，位于同行业代码企业的最低十分位。',
    regulation: '《增值税暂行条例》及国家税务总局税负率预警指标。',
    recommendation:
      '复核进项税抵扣是否存在超额抵扣或虚开发票情况；准备说明材料以应对税务稽查问询。',
    evidence: [
      { label: '企业税负率', value: '1.2%' },
      { label: '行业下限', value: '2.5%' },
      { label: '行业上限', value: '3.8%' },
    ],
    detectedAt: '2026-04-18T09:24:00Z',
  },
  {
    id: 'ISS-004',
    category: 'entity',
    title: '频繁关联方资金往来',
    titleZh: '频繁关联方资金往来',
    severity: 'medium',
    score: 52,
    summary: '向 2 家同一控制人关联企业合计转账 ¥3,820,000，且缺少合同记录。',
    detail:
      '银行台账显示共 14 笔转账合计 ¥3,820,000 流向 2 家法定代表人相同的关联企业，无对应发票或正式借款协议。',
    regulation:
      '《企业所得税法》第 41 条关联交易独立交易原则；《税收征管法》第 36 条。',
    recommendation:
      '完善关联方合同文件，按独立交易原则计收借款利息，并准备同期资料备查。',
    evidence: [
      { label: '转账笔数', value: '14' },
      { label: '合计金额', value: '¥3,820,000' },
      { label: '关联方数量', value: '2 家' },
    ],
    detectedAt: '2026-04-18T09:25:00Z',
  },
  {
    id: 'ISS-005',
    category: 'expense',
    title: '现金提取集中异常',
    titleZh: '现金提取集中异常',
    severity: 'low',
    score: 32,
    summary: '现金提取占资金流出 4.1%，略高于同业中位数 3.0%。',
    detail:
      '两周内集中发生 7 笔 ¥40,000–¥90,000 的现金提取，被标记为异常模式待核查。',
    regulation: '《大额现金管理试点办法》及银行现金管理规定。',
    recommendation:
      '尽量以银行转账取代现金结算，并完善相关支付凭证与备查资料。',
    evidence: [
      { label: '提取笔数', value: '7' },
      { label: '合计金额', value: '¥412,000' },
    ],
    detectedAt: '2026-04-18T09:27:00Z',
  },
];

export const mockRisk: CompanyRisk = {
  company: '北京力迈文领清美科技有限公司',
  period: '2025.01 – 2026.04 (至今)',
  overallScore: 71,
  level: 'high',
  categories: [
    { key: 'employment', label: '用工', labelZh: '用工', score: 78 },
    { key: 'expense', label: '费用', labelZh: '费用', score: 66 },
    { key: 'tax', label: '税务', labelZh: '税务', score: 58 },
    { key: 'entity', label: '主体', labelZh: '主体', score: 47 },
  ],
  issues,
  salaryVsSocial: [
    { month: '1月', salary: 820000, social: 512000 },
    { month: '2月', salary: 835000, social: 520000 },
    { month: '3月', salary: 851000, social: 528000 },
    { month: '4月', salary: 862000, social: 534000 },
  ],
  taxBenchmark: [
    { label: '增值税%', company: 1.2, industry: 3.1 },
    { label: '企业所得税%', company: 8.4, industry: 11.0 },
    { label: '个人所得税%', company: 4.2, industry: 5.5 },
  ],
};

export function getIssueById(id: string): Issue | undefined {
  return mockRisk.issues.find((i) => i.id === id);
}

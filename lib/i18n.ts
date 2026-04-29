export type Lang = 'en' | 'zh';

export type Bi = { en: string; zh: string };

export function pick(v: Bi | string, lang: Lang): string {
  return typeof v === 'string' ? v : v[lang];
}

export const dict = {
  // Generic
  loading: { en: 'Loading…', zh: '加载中…' },
  close: { en: 'Close', zh: '关闭' },
  send: { en: 'Send', zh: '发送' },

  // Sidebar
  nav_home: { en: 'Home', zh: '首页' },
  nav_workspace: { en: 'Agent Workspace', zh: '智能工作台' },
  nav_investors: { en: 'Investor Match', zh: '投资人匹配' },
  nav_outputs: { en: 'Generated Outputs', zh: '生成内容' },
  nav_settings: { en: 'Settings', zh: '设置' },
  nav_newProject: { en: 'New Project', zh: '新建项目' },
  nav_projectsHeader: { en: 'Projects', zh: '项目' },
  nav_libraryHeader: { en: 'Library', zh: '资料库' },
  nav_templates: { en: 'Templates', zh: '模板' },
  nav_savedReports: { en: 'Saved Reports', zh: '已保存报告' },
  brand_tagline: { en: 'Agent · Research → Market', zh: 'Agent · 科研商业化' },
  sidebar_footer: {
    en: 'Sci-Bridge Agent · prototype',
    zh: 'Sci-Bridge Agent · 原型版本',
  },

  // TopBar
  top_project: { en: 'Project:', zh: '项目：' },
  top_search: { en: 'Search projects, investors…', zh: '搜索项目、投资人…' },
  top_pro: { en: 'Pro', zh: 'Pro' },
  top_notifications: { en: 'Notifications', zh: '通知' },
  top_lang_en: { en: 'EN', zh: 'EN' },
  top_lang_zh: { en: '中文', zh: '中文' },

  // UserMenu
  user_signedIn: { en: 'Signed in', zh: '已登录' },
  user_signOut: { en: 'Sign out', zh: '退出登录' },
  user_account: { en: 'Account', zh: '账户' },

  // Login
  login_brand: { en: 'Sci-Bridge Agent', zh: 'Sci-Bridge 智能体' },
  login_h1_a: { en: 'ChatGPT for scientific', zh: '面向科研成果转化的' },
  login_h1_b: { en: 'commercialization', zh: '智能助手' },
  login_sub: {
    en: 'Upload your research, chat with the agent, and instantly receive structured evaluation, investor matches, and a generated pitch deck.',
    zh: '上传研究成果，与智能体对话，即可获得结构化评估、投资人匹配以及自动生成的路演 PPT。',
  },
  login_b1: {
    en: 'TRL & market scoring from a single PDF',
    zh: '一份 PDF 即得 TRL 与市场评分',
  },
  login_b2: {
    en: 'Investor matching across global VCs',
    zh: '全球 VC 投资人智能匹配',
  },
  login_b3: {
    en: 'One-click pitch deck and roadmap export',
    zh: '一键导出路演 PPT 与路线图',
  },
  login_footer: {
    en: '© 2026 Sci-Bridge · Research → Market, in minutes',
    zh: '© 2026 Sci-Bridge · 数分钟实现科研到市场',
  },
  login_signIn: { en: 'Sign in', zh: '登录' },
  login_welcome: { en: 'Welcome back', zh: '欢迎回来' },
  login_enterCreds: {
    en: 'Enter your credentials to continue to the agent workspace.',
    zh: '输入账号信息进入智能工作台。',
  },
  login_email: { en: 'Email', zh: '邮箱' },
  login_password: { en: 'Password', zh: '密码' },
  login_continue: { en: 'Continue', zh: '继续' },
  login_signingIn: { en: 'Signing in…', zh: '登录中…' },
  login_invalidCreds: {
    en: 'Incorrect email or password. Please try again.',
    zh: '邮箱或密码错误，请重试。',
  },
  login_demoHint: {
    en: 'Demo: admin@scibridge.ai / SciBridge@2026',
    zh: '演示账号：admin@scibridge.ai / SciBridge@2026',
  },

  // Dashboard
  dash_chip: {
    en: 'Sci-Bridge Agent · v0 prototype',
    zh: 'Sci-Bridge Agent · v0 原型',
  },
  dash_h1_a: { en: 'Describe your', zh: '描述您的' },
  dash_h1_tech: { en: 'technology', zh: '技术' },
  dash_h1_b: { en: 'or upload your research', zh: '，或上传研究资料' },
  dash_sub: {
    en: 'The agent will evaluate your project, generate a commercialization plan, and match you with investors — all from a single prompt or PDF.',
    zh: '智能体将评估项目、生成商业化方案并匹配投资人 —— 一段描述或一份 PDF 即可完成。',
  },
  dash_placeholder: {
    en: 'e.g. I developed a graphene-based composite electrode that increases battery energy density by 38%...',
    zh: '例如：我研发了石墨烯复合电极，可将电池能量密度提升 38%……',
  },
  dash_uploadBtn: { en: 'Upload PDF / PPT / DOC', zh: '上传 PDF / PPT / DOC' },
  dash_kbdHint: { en: '⌘ + Enter to send', zh: '⌘ + Enter 发送' },
  dash_quickActions: { en: 'Quick actions', zh: '快捷操作' },
  dash_qa1_title: { en: 'Evaluate my research', zh: '评估我的研究' },
  dash_qa1_desc: {
    en: 'Score TRL, market and commercial readiness from a paper or summary.',
    zh: '基于论文或摘要给出 TRL、市场与商业化就绪度评分。',
  },
  dash_qa1_prompt: {
    en: 'Evaluate my research and score it for commercialization.',
    zh: '请评估我的研究并给出商业化评分。',
  },
  dash_qa2_title: {
    en: 'Generate commercialization plan',
    zh: '生成商业化方案',
  },
  dash_qa2_desc: {
    en: 'Get a step-by-step go-to-market roadmap and pitch deck.',
    zh: '获取分步走的市场推进路线图与路演 PPT。',
  },
  dash_qa2_prompt: {
    en: 'Generate a commercialization plan and pitch deck for my technology.',
    zh: '请为我的技术生成商业化方案与路演 PPT。',
  },
  dash_qa3_title: { en: 'Find investors', zh: '匹配投资人' },
  dash_qa3_desc: {
    en: 'Match against global VC theses and rank by fit score.',
    zh: '对接全球 VC 投资逻辑并按匹配度排序。',
  },
  dash_qa3_prompt: {
    en: 'Find investors that match my technology and stage.',
    zh: '请为我的技术与阶段匹配合适的投资人。',
  },
  dash_recent: { en: 'Recent projects', zh: '近期项目' },
  dash_viewSaved: { en: 'View saved reports', zh: '查看已保存报告' },

  // Chat
  chat_placeholder: { en: 'Type your message…', zh: '输入消息…' },
  chat_attach: { en: 'Attach file', zh: '附加文件' },
  chat_runDeep: { en: 'Run Deep Analysis', zh: '运行深度分析' },
  chat_thinking: { en: 'Thinking', zh: '思考中' },
  chat_thread_one: {
    en: 'Sci-Bridge agent · 1 message in this thread',
    zh: 'Sci-Bridge 智能体 · 当前会话 1 条消息',
  },
  chat_thread_many: {
    en: 'Sci-Bridge agent · {n} messages in this thread',
    zh: 'Sci-Bridge 智能体 · 当前会话 {n} 条消息',
  },

  // Structured panel
  sp_emptyTitle: {
    en: 'Structured output appears here',
    zh: '结构化结果将显示在此',
  },
  sp_emptyDesc: {
    en: 'Send a message or upload a paper. The agent will populate the evaluation as it analyzes.',
    zh: '发送一条消息或上传论文，智能体会在分析过程中填充评估结果。',
  },
  sp_evaluation: { en: 'Evaluation', zh: '评估结果' },
  sp_updating: { en: 'updating', zh: '更新中' },
  sp_techOverview: { en: 'Technology Overview', zh: '技术概览' },
  sp_field: { en: 'Field', zh: '领域' },
  sp_innovation: { en: 'Innovation', zh: '创新点' },
  sp_application: { en: 'Application', zh: '应用场景' },
  sp_evalScore: { en: 'Evaluation Score', zh: '评估评分' },
  sp_keyInsights: { en: 'Key Insights', zh: '关键洞察' },
  sp_risks: { en: 'Risks', zh: '风险点' },
  sp_nextSteps: { en: 'Suggested Next Steps', zh: '建议的下一步' },

  // Deep analysis overlay
  da_title: { en: 'Deep Analysis', zh: '深度分析' },
  da_running: {
    en: 'Running multi-agent research pipeline…',
    zh: '多智能体研究流水线运行中…',
  },
  da_done: { en: 'Analysis complete', zh: '分析完成' },
  da_reportReady: { en: 'Full AI Report Generated', zh: '完整 AI 报告已生成' },
  da_downloadPdf: { en: 'Download PDF', zh: '下载 PDF' },
  da_exportDeck: { en: 'Export Pitch Deck', zh: '导出路演 PPT' },

  // Investors page
  inv_matchedFor: { en: 'Matched for', zh: '为以下项目匹配' },
  inv_title: { en: 'Recommended Investors', zh: '推荐投资人' },
  inv_subhead: {
    en: "Ranked by AI fit-score against your project's field, stage, and ticket-size needs.",
    zh: '基于您项目的领域、阶段与融资额需求，按 AI 匹配度排序。',
  },
  inv_searchPlaceholder: {
    en: 'Search by name, focus or thesis…',
    zh: '按名称、关注方向或投资逻辑搜索…',
  },
  inv_region_all: { en: 'All', zh: '全部' },
  inv_region_china: { en: 'China', zh: '中国' },
  inv_region_asia: { en: 'Asia', zh: '亚洲' },
  inv_region_global: { en: 'Global', zh: '全球' },
  inv_region_chinaGlobal: { en: 'China / Global', zh: '中国 / 全球' },
  inv_match: { en: 'Match', zh: '匹配' },
  inv_stage: { en: 'Stage', zh: '阶段' },
  inv_region: { en: 'Region', zh: '地区' },
  inv_ticket: { en: 'Ticket', zh: '金额' },
  inv_outreach: { en: 'Draft outreach', zh: '撰写邀约' },

  // Outputs page
  out_chip: { en: 'Generated by Sci-Bridge', zh: 'Sci-Bridge 生成' },
  out_subhead: {
    en: 'AI-generated commercialization deliverables — preview and export.',
    zh: 'AI 生成的商业化交付物 —— 预览与导出。',
  },
  out_export: { en: 'Export', zh: '导出' },
  out_tab_report: { en: 'Report', zh: '报告' },
  out_tab_deck: { en: 'Pitch Deck', zh: '路演 PPT' },
  out_tab_roadmap: { en: 'Roadmap', zh: '路线图' },
  out_tab_investors: { en: 'Investor List', zh: '投资人列表' },
  out_reportTitle: {
    en: 'Sci-Bridge Evaluation Report',
    zh: 'Sci-Bridge 评估报告',
  },
  out_executiveSummary: { en: 'Executive Summary', zh: '核心摘要' },
  out_summary_en: {
    en: '{name} is a {field} innovation centered on {innovation}, targeting {application}. The agent rates it at TRL {trl}/10 with strong market potential ({market}/10) and clear paths to commercial readiness.',
    zh: '{name} is a {field} innovation centered on {innovation}, targeting {application}. The agent rates it at TRL {trl}/10 with strong market potential ({market}/10) and clear paths to commercial readiness.',
  },
  out_summary_zh: {
    en: '{name} 是一项以 {innovation} 为核心、面向 {application} 的 {field} 领域创新。智能体评定其 TRL 为 {trl}/10，市场潜力评分 {market}/10，具备清晰的商业化路径。',
    zh: '{name} 是一项以 {innovation} 为核心、面向 {application} 的 {field} 领域创新。智能体评定其 TRL 为 {trl}/10，市场潜力评分 {market}/10，具备清晰的商业化路径。',
  },
  out_keyInsights: { en: 'Key Insights', zh: '关键洞察' },
  out_risks: { en: 'Risks', zh: '风险点' },
  out_nextSteps: { en: 'Suggested Next Steps', zh: '建议的下一步' },
  out_footer: {
    en: 'Generated by Sci-Bridge Agent · prototype output, for evaluation purposes only.',
    zh: '由 Sci-Bridge 智能体生成 · 原型输出，仅供评估使用。',
  },
  out_slide: { en: 'Slide', zh: '第' },
  out_slideSuffix: { en: '', zh: '页' },

  // Settings page
  set_chip: { en: 'Model & privacy controls', zh: '模型与隐私控制' },
  set_title: { en: 'Settings', zh: '设置' },
  set_subhead: {
    en: "Tune the agent's underlying model, depth, and privacy mode.",
    zh: '调整智能体所用的模型、分析深度与隐私模式。',
  },
  set_aiModel: { en: 'AI Model', zh: 'AI 模型' },
  set_aiModelHint: {
    en: 'Backbone LLM used for evaluation and chat.',
    zh: '用于评估与对话的底层大模型。',
  },
  set_mode: { en: 'Analysis Mode', zh: '分析模式' },
  set_modeHint: {
    en: 'Trade-off between speed and depth.',
    zh: '在速度与深度之间取舍。',
  },
  set_privacy: { en: 'Data Privacy', zh: '数据隐私' },
  set_privacyHint: {
    en: 'Where your uploaded papers are processed.',
    zh: '上传的论文在何处被处理。',
  },
  set_save: { en: 'Save changes', zh: '保存修改' },
  set_saved: { en: '✓ Settings saved', zh: '✓ 设置已保存' },
  set_model_deepseek: { en: 'DeepSeek', zh: 'DeepSeek' },
  set_model_qwen: { en: 'Qwen', zh: '通义千问' },
  set_model_openai: { en: 'OpenAI', zh: 'OpenAI' },
  set_model_deepseek_desc: {
    en: 'Fast reasoning, low cost.',
    zh: '推理速度快，成本低。',
  },
  set_model_qwen_desc: {
    en: 'Bilingual EN/中, strong on Chinese context.',
    zh: '中英双语，擅长中文语境。',
  },
  set_model_openai_desc: {
    en: 'Highest analytical depth, slower.',
    zh: '分析最深入，但相对较慢。',
  },
  set_mode_fast: { en: 'Fast', zh: '快速' },
  set_mode_standard: { en: 'Standard', zh: '标准' },
  set_mode_deep: { en: 'Deep', zh: '深度' },
  set_mode_fast_desc: {
    en: 'Single-pass evaluation in ~10s.',
    zh: '约 10 秒完成单轮评估。',
  },
  set_mode_standard_desc: {
    en: 'Balanced multi-step analysis.',
    zh: '多步骤平衡分析。',
  },
  set_mode_deep_desc: {
    en: 'Patents + market + investor matching.',
    zh: '专利 + 市场 + 投资人匹配。',
  },
  set_priv_local: { en: 'Local', zh: '本地' },
  set_priv_cloud: { en: 'Cloud', zh: '云端' },
  set_priv_local_desc: {
    en: 'Files processed on-device only.',
    zh: '文件仅在本地设备处理。',
  },
  set_priv_cloud_desc: {
    en: 'Use hosted inference for richer outputs.',
    zh: '使用云端推理，输出更丰富。',
  },

  // Stage labels
  stage_idea: { en: 'Idea', zh: '构想' },
  stage_lab: { en: 'Lab', zh: '实验室' },
  stage_prototype: { en: 'Prototype', zh: '原型' },
  stage_pilot: { en: 'Pilot', zh: '试点' },
  stage_scaling: { en: 'Scaling', zh: '规模化' },

  // ---------- View switch ----------
  view_scientist: { en: 'Scientist', zh: '科研端' },
  view_enterprise: { en: 'Enterprise', zh: '机构端' },
  view_ocp: { en: 'OCP OS', zh: 'OCP OS' },
  view_switchHint: {
    en: 'Switch perspective',
    zh: '切换视角',
  },

  // ---------- Enterprise nav ----------
  ent_nav_dashboard: { en: 'Command Center', zh: '指挥中心' },
  ent_nav_pipeline: { en: 'Project Pipeline', zh: '项目管线' },
  ent_nav_experts: { en: 'Experts & Committee', zh: '专家与评审委员会' },
  ent_nav_investors: { en: 'Investors', zh: '投资人' },
  ent_nav_deals: { en: 'Deal Flow', zh: '交易流水' },
  ent_nav_reports: { en: 'Reports', zh: '报告' },
  ent_nav_map: { en: 'Innovation Universe', zh: '创新宇宙' },
  ent_nav_settings: { en: 'Settings', zh: '设置' },
  ent_nav_orgHeader: { en: 'Organization', zh: '机构' },
  ent_nav_workspaceHeader: { en: 'Workspace', zh: '工作台' },
  ent_brand_tagline: {
    en: 'Operating system for tech commercialization',
    zh: '科技成果转化操作系统',
  },
  ent_org_name: {
    en: 'Huairou Science Park',
    zh: '怀柔科学城',
  },

  // ---------- Pipeline stages ----------
  pipe_submitted: { en: 'Submitted', zh: '已提交' },
  pipe_evaluation: { en: 'Under Evaluation', zh: '评审中' },
  pipe_high_potential: { en: 'High Potential', zh: '高潜项目' },
  pipe_matching: { en: 'Matching', zh: '匹配中' },
  pipe_negotiation: { en: 'In Negotiation', zh: '谈判中' },
  pipe_completed: { en: 'Completed', zh: '已完成' },

  // ---------- Deal stages ----------
  deal_introduced: { en: 'Introduced', zh: '已介绍' },
  deal_meeting: { en: 'Meeting', zh: '会面' },
  deal_dd: { en: 'Due Diligence', zh: '尽调' },
  deal_term_sheet: { en: 'Term Sheet', zh: '条款书' },
  deal_closed: { en: 'Closed', zh: '已完成' },

  // ---------- Enterprise dashboard (Command Center) ----------
  ed_chip: { en: 'Park ecosystem · live', zh: '园区生态 · 实时' },
  ed_title: { en: 'Command Center', zh: '指挥中心' },
  ed_subhead: {
    en: 'High-level overview of the projects, evaluations and deals across your park.',
    zh: '园区项目、评审与交易的全局概览。',
  },
  ed_kpi_projects: { en: 'Total Projects', zh: '项目总数' },
  ed_kpi_evaluations: { en: 'Active Evaluations', zh: '进行中评审' },
  ed_kpi_matches: { en: 'Matched Deals', zh: '已匹配交易' },
  ed_kpi_conversion: { en: 'Conversion Rate', zh: '转化率' },
  ed_chart_pipeline: { en: 'Projects by stage', zh: '各阶段项目分布' },
  ed_chart_industry: { en: 'Industry distribution', zh: '行业分布' },
  ed_chart_dealflow: { en: 'Monthly deal flow', zh: '月度交易流' },
  ed_dealflow_submitted: { en: 'Submitted', zh: '已提交' },
  ed_dealflow_matched: { en: 'Matched', zh: '已匹配' },
  ed_dealflow_closed: { en: 'Closed', zh: '已完成' },
  ed_aiInsight: { en: 'AI Insight', zh: 'AI 洞察' },
  ed_aiInsightSub: {
    en: 'Generated from this week\u2019s pipeline activity.',
    zh: '基于本周管线活动生成。',
  },
  ed_recent: { en: 'Recently active projects', zh: '近期活跃项目' },
  ed_viewAll: { en: 'View pipeline', zh: '查看管线' },

  // ---------- Pipeline page ----------
  ep_title: { en: 'Project Pipeline', zh: '项目管线' },
  ep_subhead: {
    en: 'Drag a project across stages to update its status. AI scores update in real time.',
    zh: '拖拽项目卡片可改变阶段，AI 评分实时更新。',
  },
  ep_view_kanban: { en: 'Kanban', zh: '看板' },
  ep_view_table: { en: 'Table', zh: '表格' },
  ep_searchPlaceholder: {
    en: 'Search by project, scientist or industry…',
    zh: '按项目、科学家或行业搜索…',
  },
  ep_industryAll: { en: 'All industries', zh: '全部行业' },
  ep_score: { en: 'AI Score', zh: 'AI 评分' },
  ep_trl: { en: 'TRL', zh: 'TRL' },
  ep_industry: { en: 'Industry', zh: '行业' },
  ep_evaluator: { en: 'Evaluator', zh: '评审人' },
  ep_unassigned: { en: 'Unassigned', zh: '未指派' },
  ep_count_one: { en: '1 project', zh: '1 个项目' },
  ep_count_many: { en: '{n} projects', zh: '{n} 个项目' },
  ep_table_project: { en: 'Project', zh: '项目' },
  ep_table_scientist: { en: 'Scientist', zh: '科学家' },
  ep_table_stage: { en: 'Stage', zh: '阶段' },
  ep_table_updated: { en: 'Updated', zh: '更新' },
  ep_dropHere: { en: 'Drop here', zh: '拖至此处' },
  ep_emptyStage: { en: 'No projects in this stage.', zh: '该阶段暂无项目。' },

  // ---------- Project detail ----------
  pd_back: { en: 'Back to pipeline', zh: '返回管线' },
  pd_aiScore: { en: 'AI Score', zh: 'AI 评分' },
  pd_overview: { en: 'Project Overview', zh: '项目概览' },
  pd_scientist: { en: 'Scientist', zh: '科学家' },
  pd_org: { en: 'Affiliation', zh: '所属机构' },
  pd_industry: { en: 'Industry', zh: '行业' },
  pd_submitted: { en: 'Submitted', zh: '提交时间' },
  pd_updated: { en: 'Last updated', zh: '最近更新' },
  pd_evaluator: { en: 'Lead evaluator', zh: '主审专家' },
  pd_assignExpert: { en: 'Assign expert', zh: '指派专家' },
  pd_files: { en: 'Files', zh: '文件' },
  pd_timeline: { en: 'Timeline', zh: '时间线' },
  pd_evalTitle: { en: 'Evaluation & Scoring', zh: '评估与打分' },
  pd_evalSub: {
    en: 'AI-suggested scores; managers can override and add weights.',
    zh: 'AI 建议评分，管理者可覆盖并设置权重。',
  },
  pd_critTech: { en: 'Technology', zh: '技术' },
  pd_critMarket: { en: 'Market', zh: '市场' },
  pd_critTeam: { en: 'Team', zh: '团队' },
  pd_critScale: { en: 'Scalability', zh: '可扩展性' },
  pd_critFinal: { en: 'Final score', zh: '综合评分' },
  pd_recInvestors: { en: 'Recommended investors', zh: '推荐投资人' },
  pd_expertPanel: { en: 'Expert panel', zh: '专家组' },
  pd_voteApprove: { en: 'Approve', zh: '批准' },
  pd_voteReject: { en: 'Reject', zh: '驳回' },
  pd_voteRevision: { en: 'Needs revision', zh: '需修订' },
  pd_addNote: { en: 'Add note', zh: '添加备注' },
  pd_actions: { en: 'Actions', zh: '操作' },
  pd_action_advance: { en: 'Advance to next stage', zh: '进入下一阶段' },
  pd_action_match: { en: 'Match investors', zh: '匹配投资人' },
  pd_action_report: { en: 'Generate report', zh: '生成报告' },

  // ---------- Experts page ----------
  ex_title: { en: 'Experts & Committee', zh: '专家与评审委员会' },
  ex_subhead: {
    en: 'Manage reviewers, assignments, and committee voting.',
    zh: '管理评审人、任务分配与委员会投票。',
  },
  ex_addExpert: { en: 'Invite expert', zh: '邀请专家' },
  ex_assignedProjects: { en: 'assigned', zh: '指派' },
  ex_rating: { en: 'Rating', zh: '评级' },
  ex_lastVote: { en: 'Last vote', zh: '最近投票' },
  ex_request: { en: 'Request review', zh: '请求评审' },

  // ---------- Deals page ----------
  dl_title: { en: 'Deal Flow & Tracking', zh: '交易流水与跟踪' },
  dl_subhead: {
    en: 'End-to-end visibility on every commercialization deal.',
    zh: '商业化交易端到端跟踪。',
  },
  dl_table_project: { en: 'Project', zh: '项目' },
  dl_table_investor: { en: 'Investor', zh: '投资人' },
  dl_table_amount: { en: 'Amount', zh: '金额' },
  dl_table_stage: { en: 'Stage', zh: '阶段' },
  dl_table_status: { en: 'Status', zh: '状态' },
  dl_table_updated: { en: 'Updated', zh: '更新' },
  dl_status_active: { en: 'Active', zh: '进行中' },
  dl_status_pending: { en: 'Pending', zh: '待定' },
  dl_status_won: { en: 'Won', zh: '成交' },
  dl_status_lost: { en: 'Lost', zh: '流失' },
  dl_kpi_pipeline: { en: 'Total pipeline value', zh: '管线总额' },
  dl_kpi_active: { en: 'Active deals', zh: '进行中交易' },
  dl_kpi_closed: { en: 'Closed this quarter', zh: '本季度成交' },

  // ---------- Reports page ----------
  rp_title: { en: 'Reports & Analytics', zh: '报告与分析' },
  rp_subhead: {
    en: 'AI-generated reports for executive review and government filings.',
    zh: '面向管理层与政府报送的 AI 生成报告。',
  },
  rp_card_top10_title: {
    en: 'Top 10 high-potential projects',
    zh: '十大高潜项目',
  },
  rp_card_top10_desc: {
    en: 'AI-ranked across all submitted projects this month.',
    zh: '基于本月所有提交项目的 AI 排名。',
  },
  rp_card_industry_title: {
    en: 'Industry trend report',
    zh: '行业趋势报告',
  },
  rp_card_industry_desc: {
    en: 'Energy sector shows 35% growth — full breakdown inside.',
    zh: '能源赛道增长 35% —— 完整数据见详情。',
  },
  rp_card_monthly_title: {
    en: 'Monthly performance report',
    zh: '月度运营报告',
  },
  rp_card_monthly_desc: {
    en: 'Submissions, evaluations, matches and deal flow.',
    zh: '提交量、评审、匹配与交易流。',
  },
  rp_card_policy_title: { en: 'Policy eligibility scan', zh: '政策匹配扫描' },
  rp_card_policy_desc: {
    en: 'Projects eligible for the 2026 MIIT new-materials grant.',
    zh: '符合 2026 工信部新材料专项的项目清单。',
  },
  rp_open: { en: 'Open report', zh: '查看报告' },

  // ---------- Innovation Universe (map) ----------
  map_title: { en: 'Innovation Universe', zh: '创新宇宙' },
  map_subhead: {
    en: 'Every project plotted as a node, clustered by scientific domain. Search, filter, hover to preview, click to open.',
    zh: '每个项目都是一个节点，按科研领域聚类展示。可搜索、筛选、悬停预览、点击打开。',
  },
  map_search_ph: {
    en: 'Search technology, project, keyword…',
    zh: '搜索技术、项目、关键词……',
  },
  map_filter_industry: { en: 'Industry', zh: '行业' },
  map_filter_trl: { en: 'TRL level', zh: 'TRL 等级' },
  map_filter_stage: { en: 'Pipeline stage', zh: '项目阶段' },
  map_filter_all: { en: 'All', zh: '全部' },
  map_filter_reset: { en: 'Reset filters', zh: '重置筛选' },
  map_legend: { en: 'Domains', zh: '领域' },
  map_zoom_in: { en: 'Zoom in', zh: '放大' },
  map_zoom_out: { en: 'Zoom out', zh: '缩小' },
  map_zoom_reset: { en: 'Reset view', zh: '重置视图' },
  map_results: { en: 'matching projects', zh: '匹配项目' },
  map_empty: {
    en: 'Select a node on the map to see details.',
    zh: '在地图上选择节点以查看详情。',
  },
  map_open_project: { en: 'Open project', zh: '打开项目' },
  map_score: { en: 'AI score', zh: 'AI 评分' },
  map_trl: { en: 'TRL', zh: 'TRL' },
  map_stage: { en: 'Stage', zh: '阶段' },
  map_scientist: { en: 'Scientist', zh: '负责人' },
  map_org: { en: 'Institution', zh: '机构' },
  map_insight_title: { en: 'AI signal', zh: 'AI 信号' },
  map_insight_body: {
    en: 'Energy storage cluster is the densest hot zone — 3 of the top-5 highest-scoring projects sit here.',
    zh: '储能集群是最密集的热点区域 —— 评分前 5 的项目中有 3 个集中于此。',
  },
  map_total_projects: { en: 'projects', zh: '项目' },
  map_filters: { en: 'Filters', zh: '筛选' },
  map_close: { en: 'Close', zh: '关闭' },
  map_why_title: { en: 'Why this matters', zh: '为何值得关注' },
  map_related_title: { en: 'Related projects', zh: '相关项目' },
  map_actions_title: { en: 'Suggested actions', zh: '建议操作' },
  map_action_assign: { en: 'Assign expert', zh: '指派专家' },
  map_action_match: { en: 'Match investor', zh: '匹配投资人' },
  map_action_report: { en: 'Add to report', zh: '加入报告' },
  map_hint_zoomed_out: {
    en: 'Zoom in to reveal individual projects',
    zh: '放大以显示单个项目',
  },
  map_legend_short: { en: 'Domains', zh: '领域' },

  // Industry-dot panel
  map_industry_label: { en: 'Sub-industry', zh: '细分领域' },
  map_industry_match_title: { en: 'Matched projects', zh: '匹配项目' },
  map_industry_match_body: {
    en: '{n} project(s) in this domain match the keyword. Click any to open.',
    zh: '该领域共匹配 {n} 个项目，点击查看详情。',
  },
  map_industry_no_match: { en: 'No direct match', zh: '无直接匹配' },
  map_industry_fallback_body: {
    en: 'No project name mentions this sub-industry yet. Showing all projects in the same cluster as nearest neighbours.',
    zh: '尚无项目名称匹配该细分领域，展示同集群内的相邻项目。',
  },
  map_industry_matches_list: { en: 'Matches', zh: '匹配项目' },
  map_industry_in_cluster: { en: 'In this cluster', zh: '同集群项目' },

  // Cluster names
  cluster_intelligence: { en: 'Math & Intelligence', zh: '数学与智能' },
  cluster_matter: { en: 'Matter & Micro', zh: '物质与微观' },
  cluster_life: { en: 'Life & Health', zh: '生命与健康' },
  cluster_engineering: { en: 'Engineering', zh: '工程与制造' },
  cluster_earth: { en: 'Earth & Environment', zh: '地球与环境' },
  cluster_space: { en: 'Space & Universe', zh: '空间与宇宙' },

  // ---------- OCP OS ----------
  ocp_brand: { en: 'OCP OS', zh: 'OCP OS' },
  ocp_brand_tagline: {
    en: 'AI Operating System for One-Person Companies',
    zh: '一人公司 AI 操作系统',
  },
  ocp_nav_workspace: { en: 'Operating System', zh: '操作系统' },
  ocp_nav_overview: { en: 'Overview', zh: '总览' },
  ocp_nav_command: { en: 'Command', zh: '指令中心' },
  ocp_nav_agents: { en: 'Agents', zh: '智能体' },
  ocp_nav_missions: { en: 'Missions', zh: '任务' },
  ocp_nav_content: { en: 'Content', zh: '内容' },
  ocp_nav_finance: { en: 'Finance', zh: '财务' },
  ocp_nav_outreach: { en: 'Outreach', zh: '外联' },
  ocp_nav_settings: { en: 'Settings', zh: '设置' },
  ocp_nav_companyHeader: { en: 'Company', zh: '公司' },
  ocp_nav_systemHeader: { en: 'System', zh: '系统' },
  ocp_company_name: { en: 'Graphene Battery Co.', zh: '石墨烯电池科技' },
  ocp_company_role: { en: 'Founder · Solo', zh: '创始人 · 独立运营' },
  ocp_footer: {
    en: 'OCP OS · prototype',
    zh: 'OCP OS · 原型版本',
  },

  // Activity feed (right rail)
  ocp_feed_title: { en: 'Live Activity', zh: '实时动态' },
  ocp_feed_subtitle: {
    en: 'What your AI team is doing right now',
    zh: 'AI 团队正在执行的任务',
  },
  ocp_feed_status_live: { en: 'Live', zh: '实时' },
  ocp_feed_empty: { en: 'No recent activity', zh: '暂无活动' },
  ocp_feed_just_now: { en: 'just now', zh: '刚刚' },
  ocp_feed_min_ago: { en: 'min ago', zh: '分钟前' },
  ocp_feed_hr_ago: { en: 'h ago', zh: '小时前' },

  // Overview page
  ocp_ov_chip: { en: 'Company dashboard · live', zh: '公司仪表 · 实时' },
  ocp_ov_title: { en: 'You are running a company', zh: '你正在运营一家公司' },
  ocp_ov_sub: {
    en: 'Your one-person startup orchestrated by five autonomous agents.',
    zh: '由五个自主智能体协同运营的一人公司。',
  },
  ocp_ov_stage: { en: 'Stage', zh: '阶段' },
  ocp_ov_stage_value: { en: 'Prototype', zh: '原型阶段' },
  ocp_ov_readiness: { en: 'Readiness Score', zh: '准备度评分' },
  ocp_ov_funding: { en: 'Funding Status', zh: '融资状态' },
  ocp_ov_funding_value: {
    en: 'Not Raised · Pre-seed prep',
    zh: '未融资 · 种子前准备',
  },
  ocp_ov_runway: { en: 'Runway', zh: '运营周期' },
  ocp_ov_runway_value: { en: '3 months', zh: '3 个月' },
  ocp_ov_aiActivity: { en: 'AI Activity (24h)', zh: 'AI 活动（24 小时）' },
  ocp_ov_kpi_campaigns: { en: 'campaigns running', zh: '个进行中活动' },
  ocp_ov_kpi_leads: { en: 'investor leads identified', zh: '位投资人线索' },
  ocp_ov_kpi_posts: { en: 'posts generated', zh: '篇生成内容' },
  ocp_ov_kpi_actions: { en: 'agent actions today', zh: '次今日智能体行动' },
  ocp_ov_quickActions: { en: 'Quick Actions', zh: '快捷操作' },
  ocp_ov_qa_raise: { en: 'Raise Funding', zh: '启动融资' },
  ocp_ov_qa_raise_desc: {
    en: 'BD + Finance + Social agents activate together',
    zh: 'BD + 财务 + 社媒 智能体协同启动',
  },
  ocp_ov_qa_marketing: { en: 'Launch Marketing', zh: '启动营销' },
  ocp_ov_qa_marketing_desc: {
    en: 'Designer + Social run a 7-day campaign',
    zh: '设计 + 社媒 智能体运行 7 天活动',
  },
  ocp_ov_qa_partners: { en: 'Find Partners', zh: '寻找合作' },
  ocp_ov_qa_partners_desc: {
    en: 'Strategy + BD draft outreach to top labs',
    zh: '战略 + BD 智能体起草顶级实验室外联',
  },
  ocp_ov_team: { en: 'Your Agent Team', zh: '你的智能体团队' },
  ocp_ov_team_sub: {
    en: 'Five autonomous agents on duty.',
    zh: '五个智能体值守中。',
  },
  ocp_ov_recent_missions: { en: 'Active Missions', zh: '进行中任务' },
  ocp_ov_view_all: { en: 'View all', zh: '查看全部' },

  // Agents page
  ocp_ag_title: { en: 'Agents', zh: '智能体' },
  ocp_ag_sub: {
    en: 'Monitor and configure each member of your AI team.',
    zh: '监控并配置 AI 团队中的每个成员。',
  },
  ocp_ag_status_active: { en: 'Active', zh: '运行中' },
  ocp_ag_status_idle: { en: 'Idle', zh: '空闲' },
  ocp_ag_status_thinking: { en: 'Thinking', zh: '思考中' },
  ocp_ag_lastAction: { en: 'Last action', zh: '上次行动' },
  ocp_ag_impact: { en: 'Impact', zh: '影响' },
  ocp_ag_open: { en: 'Open', zh: '打开' },
  ocp_ag_configure: { en: 'Configure', zh: '配置' },
  ocp_ag_role_strategy: { en: 'CEO · decision maker', zh: 'CEO · 决策中枢' },
  ocp_ag_role_social: { en: 'Voice of the company', zh: '品牌发声' },
  ocp_ag_role_designer: { en: 'Visual identity', zh: '视觉设计' },
  ocp_ag_role_bd: { en: 'Pitch & deals', zh: '路演与交易' },
  ocp_ag_role_finance: { en: 'Cash & runway', zh: '资金与周期' },
  ocp_ag_name_strategy: { en: 'Strategy Agent', zh: '战略智能体' },
  ocp_ag_name_social: { en: 'Social Media Agent', zh: '社媒智能体' },
  ocp_ag_name_designer: { en: 'Designer Agent', zh: '设计智能体' },
  ocp_ag_name_bd: { en: 'Business Development Agent', zh: '商务拓展智能体' },
  ocp_ag_name_finance: { en: 'Finance Agent', zh: '财务智能体' },

  // Agent detail
  ocp_ag_back: { en: 'Back to agents', zh: '返回智能体列表' },
  ocp_ag_runNow: { en: 'Run a task', zh: '立即执行' },
  ocp_ag_capabilities: { en: 'Capabilities', zh: '能力' },
  ocp_ag_recent: { en: 'Recent Activity', zh: '近期活动' },
  ocp_ag_recent_empty: { en: 'No activity yet today.', zh: '今日暂无活动。' },
  ocp_ag_missions_involved: { en: 'Missions involved', zh: '相关任务' },
  ocp_ag_no_missions: {
    en: 'Not assigned to any active mission.',
    zh: '尚未参与任何任务。',
  },
  ocp_ag_minutesAgo: { en: '{n} min ago', zh: '{n} 分钟前' },
  ocp_ag_hoursAgo: { en: '{n} h ago', zh: '{n} 小时前' },
  ocp_ag_stat_actions: { en: 'Actions today', zh: '今日行动' },
  ocp_ag_stat_missions: { en: 'Active missions', zh: '进行中任务' },
  ocp_ag_stat_status: { en: 'Status', zh: '状态' },

  // Agent configure
  ocp_ag_cfg_title: { en: 'Configure', zh: '配置' },
  ocp_ag_cfg_save: { en: 'Save changes', zh: '保存更改' },
  ocp_ag_cfg_cancel: { en: 'Cancel', zh: '取消' },
  ocp_ag_cfg_general: { en: 'General', zh: '通用' },
  ocp_ag_cfg_displayName: { en: 'Display name', zh: '显示名称' },
  ocp_ag_cfg_role: { en: 'Role', zh: '角色' },
  ocp_ag_cfg_autonomy: { en: 'Autonomy', zh: '自主程度' },
  ocp_ag_cfg_autonomy_sub: {
    en: 'Choose how much the agent can do without your approval.',
    zh: '设置智能体可在无审批下执行的范围。',
  },
  ocp_ag_cfg_aut_manual: { en: 'Manual', zh: '手动' },
  ocp_ag_cfg_aut_review: { en: 'Review', zh: '审核' },
  ocp_ag_cfg_aut_auto: { en: 'Autonomous', zh: '自主' },
  ocp_ag_cfg_aut_manual_d: {
    en: 'Agent only suggests, you click to run.',
    zh: '智能体仅给出建议，由你执行。',
  },
  ocp_ag_cfg_aut_review_d: {
    en: 'Agent prepares actions, you approve before they ship.',
    zh: '智能体准备行动，需你审批后才执行。',
  },
  ocp_ag_cfg_aut_auto_d: {
    en: 'Agent acts on its own. You see results in the activity feed.',
    zh: '智能体自主执行，结果显示在活动流中。',
  },
  ocp_ag_cfg_voice: { en: 'Voice & tone', zh: '语气与风格' },
  ocp_ag_cfg_voice_sub: {
    en: 'How the agent should sound when it produces content.',
    zh: '智能体生成内容时的语气定位。',
  },
  ocp_ag_cfg_tone_visionary: { en: 'Visionary', zh: '富有远见' },
  ocp_ag_cfg_tone_technical: { en: 'Technical', zh: '专业严谨' },
  ocp_ag_cfg_tone_friendly: { en: 'Friendly', zh: '亲切友好' },
  ocp_ag_cfg_tone_bold: { en: 'Bold', zh: '果断有力' },
  ocp_ag_cfg_channels: { en: 'Channels', zh: '渠道' },
  ocp_ag_cfg_channels_sub: {
    en: 'Where this agent is allowed to publish or reach out.',
    zh: '允许该智能体发布或外联的渠道。',
  },
  ocp_ag_cfg_triggers: { en: 'Triggers', zh: '触发条件' },
  ocp_ag_cfg_triggers_sub: {
    en: 'When the agent should wake up automatically.',
    zh: '智能体自动唤醒的条件。',
  },
  ocp_ag_cfg_trg_schedule: { en: 'On schedule', zh: '按计划' },
  ocp_ag_cfg_trg_event: { en: 'On new event', zh: '事件触发' },
  ocp_ag_cfg_trg_command: { en: 'On command only', zh: '仅指令触发' },
  ocp_ag_cfg_saved: { en: 'Saved', zh: '已保存' },

  // Missions page
  ocp_mi_title: { en: 'Missions', zh: '任务' },
  ocp_mi_sub: {
    en: 'High-level intents the system breaks down into agent tasks.',
    zh: '系统将高层意图拆解为智能体任务。',
  },
  ocp_mi_new: { en: 'New Mission', zh: '新建任务' },
  ocp_mi_progress: { en: 'Progress', zh: '进度' },
  ocp_mi_owner: { en: 'Lead', zh: '负责' },
  ocp_mi_status_active: { en: 'Active', zh: '进行中' },
  ocp_mi_status_done: { en: 'Done', zh: '已完成' },
  ocp_mi_status_queued: { en: 'Queued', zh: '排队中' },
  ocp_mi_tasks: { en: 'Tasks', zh: '子任务' },

  // Command interface
  ocp_cmd_title: { en: 'Command', zh: '指令中心' },
  ocp_cmd_sub: {
    en: 'Tell the system what you want. The agents will coordinate.',
    zh: '告诉系统你的目标，智能体将自动协同。',
  },
  ocp_cmd_placeholder: {
    en: 'e.g., I want to raise $1M seed funding…',
    zh: '例如：我想融资 100 万美元种子轮…',
  },
  ocp_cmd_send: { en: 'Run', zh: '执行' },
  ocp_cmd_examples: { en: 'Try', zh: '试试' },
  ocp_cmd_ex1: { en: 'Raise seed funding', zh: '启动种子轮融资' },
  ocp_cmd_ex2: {
    en: 'Launch product awareness campaign',
    zh: '启动产品认知活动',
  },
  ocp_cmd_ex3: { en: 'Find 3 strategic partners', zh: '寻找 3 个战略合作伙伴' },
  ocp_cmd_ex4: { en: 'Cut my burn rate by 30%', zh: '将燃烧率降低 30%' },
  ocp_cmd_thinking: {
    en: 'Strategy Agent is breaking down your goal…',
    zh: '战略智能体正在拆解你的目标…',
  },
  ocp_cmd_dispatched: {
    en: 'Dispatched to {n} agents',
    zh: '已分派给 {n} 个智能体',
  },
  ocp_cmd_youLabel: { en: 'You', zh: '你' },
  ocp_cmd_systemLabel: { en: 'OCP OS', zh: 'OCP OS' },

  // Content & Campaigns
  ocp_co_title: { en: 'Content & Campaigns', zh: '内容与活动' },
  ocp_co_sub: {
    en: 'All external communication generated and scheduled by your agents.',
    zh: '由智能体生成并排期的所有对外传播内容。',
  },
  ocp_co_newCampaign: { en: 'New Campaign', zh: '新建活动' },
  ocp_co_status_running: { en: 'Running', zh: '进行中' },
  ocp_co_status_scheduled: { en: 'Scheduled', zh: '已排期' },
  ocp_co_status_draft: { en: 'Draft', zh: '草稿' },
  ocp_co_status_published: { en: 'Published', zh: '已发布' },
  ocp_co_engagement: { en: 'Engagement', zh: '互动数据' },
  ocp_co_reach: { en: 'Reach', zh: '触达' },
  ocp_co_clicks: { en: 'Clicks', zh: '点击' },
  ocp_co_leads: { en: 'Leads', zh: '线索' },
  ocp_co_posts: { en: 'Posts', zh: '帖子' },

  // Finance
  ocp_fi_title: { en: 'Finance', zh: '财务' },
  ocp_fi_sub: {
    en: 'Cash, runway, and burn rate at a glance.',
    zh: '一眼掌握现金、运营周期与燃烧率。',
  },
  ocp_fi_balance: { en: 'Cash on hand', zh: '账面现金' },
  ocp_fi_burn: { en: 'Monthly burn', zh: '月度支出' },
  ocp_fi_runway: { en: 'Runway', zh: '运营周期' },
  ocp_fi_runway_months: { en: 'months', zh: '个月' },
  ocp_fi_expenses: { en: 'Expenses (last 30 days)', zh: '近 30 天支出' },
  ocp_fi_recommendation: { en: 'Agent Recommendation', zh: '智能体建议' },
  ocp_fi_rec_text: {
    en: 'Reduce marketing spend by 20% or open a $500K bridge round within 6 weeks to extend runway past 6 months.',
    zh: '将营销支出降低 20%，或在 6 周内启动 50 万美元过桥融资，将运营周期延长至 6 个月以上。',
  },

  // Outreach
  ocp_ou_title: { en: 'Outreach', zh: '外联' },
  ocp_ou_sub: {
    en: 'Investors, partners and customer conversations the BD agent is running.',
    zh: 'BD 智能体正在推进的投资人、合作伙伴与客户沟通。',
  },
  ocp_ou_addLead: { en: 'Add Lead', zh: '添加线索' },
  ocp_ou_status_new: { en: 'New', zh: '新建' },
  ocp_ou_status_contacted: { en: 'Contacted', zh: '已联系' },
  ocp_ou_status_meeting: { en: 'Meeting Set', zh: '已约会议' },
  ocp_ou_status_negotiating: { en: 'Negotiating', zh: '洽谈中' },
  ocp_ou_status_passed: { en: 'Passed', zh: '已婉拒' },
  ocp_ou_nextStep: { en: 'Next step', zh: '下一步' },
  ocp_ou_kind_investor: { en: 'Investor', zh: '投资人' },
  ocp_ou_kind_partner: { en: 'Partner', zh: '合作方' },
  ocp_ou_kind_customer: { en: 'Customer', zh: '客户' },

  // Settings
  ocp_se_title: { en: 'Settings', zh: '设置' },
  ocp_se_sub: {
    en: 'Configure your operating system.',
    zh: '配置你的操作系统。',
  },
  ocp_se_company: { en: 'Company', zh: '公司信息' },
  ocp_se_company_name: { en: 'Company name', zh: '公司名称' },
  ocp_se_company_stage: { en: 'Stage', zh: '阶段' },
  ocp_se_company_industry: { en: 'Industry', zh: '行业' },
  ocp_se_company_industry_value: {
    en: 'Energy · Batteries',
    zh: '能源 · 电池',
  },
  ocp_se_agents: { en: 'Agent Permissions', zh: '智能体权限' },
  ocp_se_agents_sub: {
    en: 'Decide which agents can act autonomously vs. require your approval.',
    zh: '设定哪些智能体可自主行动，哪些需要你批准。',
  },
  ocp_se_perm_auto: { en: 'Auto', zh: '自动' },
  ocp_se_perm_review: { en: 'Review', zh: '审核' },
  ocp_se_integrations: { en: 'Integrations', zh: '集成' },
  ocp_se_integrations_sub: {
    en: 'External channels and tools the OS can publish or read from.',
    zh: '操作系统可读写的外部渠道与工具。',
  },
  ocp_se_int_connected: { en: 'Connected', zh: '已连接' },
  ocp_se_int_connect: { en: 'Connect', zh: '连接' },
  ocp_se_danger: { en: 'Danger Zone', zh: '危险操作' },
  ocp_se_danger_pause: { en: 'Pause all agents', zh: '暂停全部智能体' },
  ocp_se_danger_pause_desc: {
    en: 'Halt every active mission until you resume.',
    zh: '在恢复前停止所有进行中任务。',
  },
  ocp_se_danger_reset: { en: 'Reset OS', zh: '重置操作系统' },
  ocp_se_danger_reset_desc: {
    en: 'Wipe all missions and rebuild from scratch.',
    zh: '清空全部任务并从零重建。',
  },
} as const;

export type DictKey = keyof typeof dict;

export function translate(key: DictKey, lang: Lang): string {
  return dict[key][lang];
}

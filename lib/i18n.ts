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
} as const;

export type DictKey = keyof typeof dict;

export function translate(key: DictKey, lang: Lang): string {
  return dict[key][lang];
}

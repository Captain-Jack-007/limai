# Sci-Bridge Agent · 项目架构文档

> 生成时间：2026-05-13 | 版本：v0.1.0 prototype

---

## 一、项目概览

### 基本信息

| 项目 | 详情 |
|------|------|
| **项目名称** | sci-bridge-agent |
| **描述** | 面向科研成果转化的 GenAI 工作台（ChatGPT for scientific commercialization） |
| **技术栈** | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · MiniMax LLM |
| **开发端口** | **3006**（`npm run dev` / `npm start` 均使用 3006） |
| **构建命令** | `npm run build` → `next build` |

### 三大产品形态

| 形态 | 路由前缀 | 目标用户 | 定位 |
|------|----------|----------|------|
| **科研端（C 端）** | `/(app)`（无显式前缀） | 科研人员、发明家 | 上传论文/成果 → AI 评估 → 研报生成 → 投资人匹配 |
| **企业端（B 端）** | `/enterprise` | 科技园区、孵化器管理人员 | 多项目管线管理、专家评审、交易跟踪、宏观数据看板 |
| **OCP 端（运营端）** | `/ocp` | 一人公司创始人 | 五智能体协同运营操作系统（战略/社媒/设计/BD/财务） |

三端共用同一登录体系（`/login`），通过顶栏 `ViewSwitch` 组件在三端之间切换视角。

---

## 二、目录结构总览

```
limai/
├── app/                          # Next.js App Router 根目录
│   ├── (app)/                    # 科研端路由组（layout 共用 Sidebar + TopBar）
│   │   ├── layout.tsx            # 科研端布局：AuthGuard + Sidebar + TopBar + FloatingAgent
│   │   ├── dashboard/page.tsx    # 科研端首页：AI 输入框 + 快捷操作 + 近期项目
│   │   ├── chat/page.tsx         # 智能工作台：对话 + 文件上传 + 深度分析覆盖层
│   │   ├── investors/page.tsx    # 投资人匹配：筛选 + 卡片列表 + 邀约起草
│   │   ├── outputs/page.tsx      # 生成内容：研报/PPT/路线图/投资人（Tab 切换）
│   │   ├── settings/page.tsx     # 科研端设置：模型选择 + 分析模式 + 隐私
│   │   └── reports/[id]/         # 动态路由：已保存研报详情页
│   │       └── page.tsx
│   ├── enterprise/               # 企业端路由组
│   │   ├── layout.tsx            # 企业端布局：AuthGuard + EnterpriseSidebar + TopBar
│   │   ├── page.tsx              # 入口页 → redirect('/enterprise/dashboard')
│   │   ├── dashboard/page.tsx    # 指挥中心：KPI + 图表 + AI 洞察
│   │   ├── pipeline/page.tsx     # 项目管线：看板 / 表格双视图，可拖拽
│   │   ├── experts/page.tsx      # 专家与评审委员会
│   │   ├── investors/page.tsx    # 企业端投资人列表
│   │   ├── deals/page.tsx        # 交易流水与跟踪
│   │   ├── reports/page.tsx      # 报告与分析（AI 生成报告卡片）
│   │   ├── map/page.tsx          # 创新宇宙：Canvas 节点图
│   │   ├── settings/page.tsx     # 企业端设置
│   │   └── projects/[id]/page.tsx # 项目详情：评分 + 专家投票 + 时间线
│   ├── ocp/                      # OCP 端路由组
│   │   ├── layout.tsx            # OCP 布局：AuthGuard + OCPSidebar + OCPTopBar + OCPActivityFeed
│   │   ├── overview/page.tsx     # 公司总览：阶段 + KPI + 智能体团队
│   │   ├── command/page.tsx      # 指令中心：自然语言下达指令 → 多智能体分发
│   │   ├── agents/page.tsx       # 智能体列表
│   │   ├── agents/[id]/page.tsx  # 智能体详情：状态 + 近期行动 + 任务
│   │   ├── agents/[id]/configure/page.tsx # 智能体配置：自主度 + 语气 + 渠道
│   │   ├── missions/page.tsx     # 任务列表
│   │   ├── content/page.tsx      # 内容与活动
│   │   ├── finance/page.tsx      # 财务：现金 + 燃烧率 + 运营周期
│   │   ├── outreach/page.tsx     # 外联：投资人/合作伙伴线索管理
│   │   └── settings/page.tsx     # OCP 端设置
│   ├── api/                      # Next.js API Routes（服务端）
│   │   ├── ai/
│   │   │   ├── chat/route.ts             # 对话接口（MiniMax）
│   │   │   ├── generate/route.ts         # 分板块研报生成（MiniMax + Serper）
│   │   │   ├── generate-full-report/route.ts # 十章完整研报（MiniMax + Serper）
│   │   │   ├── generate-pptx/route.ts    # 路演 PPT 生成（MiniMax → PptxGenJS）
│   │   │   ├── export-docx/route.ts      # Word 文档导出（docx 库）
│   │   │   ├── extract-text/route.ts     # 文件文本提取（pdf-parse / mammoth）
│   │   │   └── evaluate/                 # 评估接口目录（route 文件暂缺）
│   │   └── sample-report-download/route.ts # 下载示例研报 Word 文件
│   ├── login/page.tsx            # 登录页（硬编码演示账号）
│   ├── page.tsx                  # 根路由 → redirect('/login')
│   ├── page.tsx.bak              # 旧版落地页备份（已废弃）
│   ├── layout.tsx                # 根布局：HTML shell + LanguageProvider
│   └── globals.css               # 全局样式：Tailwind + glow-border + 动画
├── components/                   # 共享组件库
│   ├── AuthGuard.tsx             # 鉴权守卫（检查 sessionStorage）
│   ├── ChatBubble.tsx            # 对话气泡（用户 / AI 双样式）
│   ├── DeepAnalysisOverlay.tsx   # 深度分析全屏遮罩
│   ├── EnterpriseCharts.tsx      # 企业端 Recharts 图表集
│   ├── EnterpriseSidebar.tsx     # 企业端侧边栏导航
│   ├── FloatingAgent.tsx         # 悬浮智能体（可拖拽 + 聊天面板）
│   ├── InnovationMap.tsx         # 创新宇宙 Canvas 节点图
│   ├── LangToggle.tsx            # 顶栏语言切换按钮
│   ├── LanguageProvider.tsx      # i18n Context Provider
│   ├── MapDetailPanel.tsx        # 地图节点详情侧边面板
│   ├── MapIndustryPanel.tsx      # 地图行业节点面板
│   ├── MarkdownContent.tsx       # Markdown 渲染（react-markdown + remark-gfm）
│   ├── MiniParticleSphere.tsx    # 56×56 迷你粒子球（Canvas，供 FloatingAgent 使用）
│   ├── OCPActivityFeed.tsx       # OCP 右侧实时活动流
│   ├── OCPSidebar.tsx            # OCP 端侧边栏
│   ├── OCPTopBar.tsx             # OCP 端顶栏
│   ├── ParticleSphere.tsx        # 400×400 大型粒子球（Canvas，曾用于落地页）
│   ├── PipelineKanban.tsx        # 企业端管线看板（拖拽）
│   ├── SampleReportView.tsx      # 示例研报预览组件（outputs 页使用）
│   ├── Sidebar.tsx               # 科研端侧边栏（next/link 导航）
│   ├── StructuredPanel.tsx       # 智能工作台右侧结构化评估面板
│   ├── TopBar.tsx                # 科研端 / 企业端顶栏（搜索 + ViewSwitch + 铃铛 + 用户菜单）
│   ├── UserMenu.tsx              # 用户菜单下拉（账户 + 退出）
│   └── ViewSwitch.tsx            # 三端视角切换按钮组
├── lib/                          # 工具库（纯逻辑，无 UI）
│   ├── auth.ts                   # 登录状态（sessionStorage 读写）
│   ├── enterprise-data.ts        # 企业端 Mock 数据
│   ├── extractFileText.ts        # 服务端文件文本提取（pdf-parse / mammoth）
│   ├── i18n.ts                   # 国际化字典（中英双语，~900 词条）
│   ├── mock-data.ts              # 科研端 / OCP 端 Mock 数据
│   ├── ocp-data.ts               # OCP 端专属 Mock 数据
│   ├── recent-projects.ts        # 近期项目 localStorage CRUD
│   ├── sample-report.json        # 示例研报 JSON 数据
│   ├── serper.ts                 # Serper 联网搜索封装（竞品查询）
│   └── types.ts                  # 全局 TypeScript 类型定义
├── public/                       # 静态资源
│   ├── Sci-bridge赛乔…报告.docx  # 示例研报 Word 文件（供下载）
│   ├── research-report.md        # 研报写作规范文档
│   └── verify_data_v2.py         # 数据验证脚本（开发工具）
├── scripts/
│   └── parse-sample-report.mjs  # 解析示例研报 JSON 的脚本
├── .env.local                    # 本地环境变量（MINIMAX_API_KEY 等）
├── next.config.mjs               # Next.js 配置（env 字段 + serverComponentsExternalPackages）
├── tailwind.config.ts            # Tailwind 颜色 / 动画扩展
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 依赖清单
```

---

## 三、路由体系

### 完整路由列表

| 路由 | 文件 | 功能说明 | 需要登录 |
|------|------|----------|----------|
| `/` | `app/page.tsx` | redirect → `/login` | 否 |
| `/login` | `app/login/page.tsx` | 演示账号登录 | 否 |
| **科研端** | | | |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | 科研端首页：AI 输入 + 快捷操作 + 近期项目 | **是** |
| `/chat` | `app/(app)/chat/page.tsx` | 智能工作台：多轮对话 + 文件上传 + 结构化面板 | **是** |
| `/chat?new=1` | 同上 | 新建对话（query param） | **是** |
| `/chat?project={id}` | 同上 | 打开指定项目对话 | **是** |
| `/chat?q={text}` | 同上 | 携带初始问题（seedQuery） | **是** |
| `/investors` | `app/(app)/investors/page.tsx` | 投资人匹配列表 + 搜索筛选 | **是** |
| `/outputs` | `app/(app)/outputs/page.tsx` | 研报/PPT/路线图/投资人生成 | **是** |
| `/outputs?tab={key}` | 同上 | 直接跳转到指定 Tab | **是** |
| `/settings` | `app/(app)/settings/page.tsx` | 模型 + 分析模式 + 隐私设置 | **是** |
| `/reports/{id}` | `app/(app)/reports/[id]/page.tsx` | 已保存研报详情（来自 localStorage） | **是** |
| **企业端** | | | |
| `/enterprise` | `app/enterprise/page.tsx` | redirect → `/enterprise/dashboard` | **是** |
| `/enterprise/dashboard` | `app/enterprise/dashboard/page.tsx` | 指挥中心：KPI + 图表 + AI 洞察 | **是** |
| `/enterprise/pipeline` | `app/enterprise/pipeline/page.tsx` | 项目管线看板/表格 | **是** |
| `/enterprise/experts` | `app/enterprise/experts/page.tsx` | 专家与评审委员会 | **是** |
| `/enterprise/investors` | `app/enterprise/investors/page.tsx` | 投资人管理 | **是** |
| `/enterprise/deals` | `app/enterprise/deals/page.tsx` | 交易流水 | **是** |
| `/enterprise/reports` | `app/enterprise/reports/page.tsx` | 企业端报告 | **是** |
| `/enterprise/map` | `app/enterprise/map/page.tsx` | 创新宇宙节点图 | **是** |
| `/enterprise/settings` | `app/enterprise/settings/page.tsx` | 企业端设置 | **是** |
| `/enterprise/projects/{id}` | `app/enterprise/projects/[id]/page.tsx` | 项目详情 | **是** |
| **OCP 端** | | | |
| `/ocp/overview` | `app/ocp/overview/page.tsx` | 公司总览仪表盘 | **是** |
| `/ocp/command` | `app/ocp/command/page.tsx` | 自然语言指令中心 | **是** |
| `/ocp/agents` | `app/ocp/agents/page.tsx` | 五大智能体列表 | **是** |
| `/ocp/agents/{id}` | `app/ocp/agents/[id]/page.tsx` | 智能体详情 | **是** |
| `/ocp/agents/{id}/configure` | `app/ocp/agents/[id]/configure/page.tsx` | 智能体配置 | **是** |
| `/ocp/missions` | `app/ocp/missions/page.tsx` | 任务列表 | **是** |
| `/ocp/content` | `app/ocp/content/page.tsx` | 内容与活动 | **是** |
| `/ocp/finance` | `app/ocp/finance/page.tsx` | 财务面板 | **是** |
| `/ocp/outreach` | `app/ocp/outreach/page.tsx` | 外联线索管理 | **是** |
| `/ocp/settings` | `app/ocp/settings/page.tsx` | OCP 端设置 | **是** |
| **API Routes** | | | |
| `POST /api/ai/chat` | `route.ts` | MiniMax 对话接口 | 否（无鉴权） |
| `POST /api/ai/generate` | `route.ts` | 分板块研报生成 | 否 |
| `POST /api/ai/generate-full-report` | `route.ts` | 十章完整研报 | 否 |
| `POST /api/ai/generate-pptx` | `route.ts` | 路演 PPT 生成 | 否 |
| `POST /api/ai/export-docx` | `route.ts` | Word 文档导出 | 否 |
| `POST /api/ai/extract-text` | `route.ts` | 文件文本提取 | 否 |
| `GET /api/sample-report-download` | `route.ts` | 下载示例研报 Word | 否 |

> **注意**：API Routes 当前无服务端鉴权，任何知道 URL 的人均可调用。

---

## 四、组件清单

### 全局组件

| 组件 | 用途 | 主要 Props | 使用方 | 三端共用 |
|------|------|-----------|--------|----------|
| **AuthGuard** | 检查 sessionStorage 登录态，未登录则 redirect `/login` | `children` | 三端 layout | ✅ |
| **LanguageProvider** | React Context，提供 `lang / t() / b() / setLang()` | `children`, `defaultLang?` | `app/layout.tsx`（根布局） | ✅ |
| **TopBar** | 顶栏：搜索框 + ViewSwitch + LangToggle + 铃铛 + UserMenu | — | 科研端 layout、企业端 layout | 科研/企业 |
| **ViewSwitch** | 三端视角切换按钮，点击跳转对应首页 | — | TopBar | ✅ |
| **LangToggle** | EN / 中文 切换 | — | TopBar | ✅ |
| **UserMenu** | 用户下拉菜单（账户信息 + 退出登录） | — | TopBar | ✅ |
| **MarkdownContent** | 用 react-markdown + remark-gfm 渲染 Markdown | `children`, `dark?` | chat、outputs、reports | ✅ |

### 科研端组件

| 组件 | 用途 | 主要 Props | 使用方 |
|------|------|-----------|--------|
| **Sidebar** | 科研端左侧导航（next/link，含项目列表和资料库） | — | `app/(app)/layout.tsx` |
| **FloatingAgent** | 悬浮智能体球（可拖拽 + 聊天面板，接 MiniMax API） | — | `app/(app)/layout.tsx`（dynamic import，ssr:false） |
| **MiniParticleSphere** | 56×56 Canvas 粒子球，30fps，无 shadowBlur | — | FloatingAgent |
| **ParticleSphere** | 400×400 Canvas 粒子球，30fps（历史遗留，落地页移除后仅备用） | — | 未被当前任何页面引用 |
| **ChatBubble** | 聊天气泡：支持附件预览（PDF/PPT/DOC/图片图标） | `msg: ChatMessage` | `chat/page.tsx` |
| **StructuredPanel** | 工作台右侧面板：空状态 / 评估得分 / 洞察 / 风险 | `populated`, `loading` | `chat/page.tsx` |
| **DeepAnalysisOverlay** | 深度分析全屏弹层，逐步动画展示分析步骤 | `open`, `stepIndex`, `done`, `onClose` | `chat/page.tsx` |
| **SampleReportView** | 示例研报展示（静态，用于 outputs 页底部） | — | `outputs/page.tsx` |

### 企业端组件

| 组件 | 用途 | 主要 Props | 使用方 |
|------|------|-----------|--------|
| **EnterpriseSidebar** | 企业端左侧导航 | — | `app/enterprise/layout.tsx` |
| **EnterpriseCharts** | Recharts 图表集（柱图 / 饼图 / 折线图） | `data`, `type` 等 | `enterprise/dashboard` |
| **PipelineKanban** | 项目管线看板，支持拖拽改变阶段 | `projects`, `onMove` 等 | `enterprise/pipeline` |
| **InnovationMap** | Canvas 节点图，支持缩放/搜索/筛选/点击 | `projects` 等 | `enterprise/map` |
| **MapDetailPanel** | 节点详情侧边面板（项目信息 + 建议操作） | `project`, `onClose` 等 | `enterprise/map` |
| **MapIndustryPanel** | 行业节点面板 | `industry`, `onClose` 等 | `enterprise/map` |

### OCP 端组件

| 组件 | 用途 | 主要 Props | 使用方 |
|------|------|-----------|--------|
| **OCPSidebar** | OCP 端左侧导航 | — | `app/ocp/layout.tsx` |
| **OCPTopBar** | OCP 端顶栏（有别于科研端 TopBar） | — | `app/ocp/layout.tsx` |
| **OCPActivityFeed** | OCP 右侧实时活动流（Mock 数据，轮询刷新） | — | `app/ocp/layout.tsx` |

---

## 五、API 接口清单

### POST `/api/ai/chat`

| 项目 | 详情 |
|------|------|
| **功能** | 多轮对话（自动携带科研顾问 system prompt） |
| **请求格式** | `application/json` |
| **请求参数** | `messages: {role, content}[]`，可选 `projectContext: {name, scientist, org, industry, trl, score, summary}` |
| **返回格式** | `{ content: string }` |
| **外部依赖** | MiniMax API（`MiniMax-M2.5-highspeed`） |
| **调用方** | `chat/page.tsx`、`FloatingAgent.tsx` |
| **超时** | 120 秒 |

### POST `/api/ai/generate`

| 项目 | 详情 |
|------|------|
| **功能** | 分板块生成研报（技术/行业/应用场景/竞品/投资价值/风险） |
| **请求格式** | `multipart/form-data` 或 `application/json` |
| **请求参数** | `projectInfo: JSON string`，`sections: JSON string[]`，`files?: File[]`（最多 5 个） |
| **返回格式** | `{ sections: Record<SectionId, string>, warnings: string[], searchCount: number }` |
| **外部依赖** | MiniMax API + Serper（竞品板块联网搜索） |
| **调用方** | `outputs/page.tsx`（分板块生成按钮） |
| **超时** | 1200 秒 |

### POST `/api/ai/generate-full-report`

| 项目 | 详情 |
|------|------|
| **功能** | 生成十大章节完整研报（≥10000 字，WSJ 风格） |
| **请求格式** | `multipart/form-data` 或 `application/json` |
| **请求参数** | `projectInfo: JSON string`（含 `name`, `summary`），`files?: File[]` |
| **返回格式** | `{ content: string, projectName: string, warnings: string[] }` |
| **外部依赖** | MiniMax API + Serper（第五章竞品数据） |
| **调用方** | `outputs/page.tsx`（生成完整研报按钮） |
| **超时** | 1200 秒 |

### POST `/api/ai/generate-pptx`

| 项目 | 详情 |
|------|------|
| **功能** | 上传商业计划书 → MiniMax 提取大纲 JSON → PptxGenJS 渲染 12-14 页 PPTX |
| **请求格式** | `multipart/form-data` |
| **请求参数** | `file: File`（PDF/Word/TXT/MD，最大 10MB） |
| **返回格式** | 二进制 `application/vnd.openxmlformats...presentationml.presentation` |
| **外部依赖** | MiniMax API + PptxGenJS（`^4.0.1`） |
| **调用方** | `outputs/page.tsx`（路演 PPT Tab） |
| **超时** | 120 秒 |

### POST `/api/ai/export-docx`

| 项目 | 详情 |
|------|------|
| **功能** | 将 Markdown 字符串渲染为 Word 文档（标准公文格式：SimSun + Times New Roman） |
| **请求格式** | `application/json` |
| **请求参数** | `title: string`，`content: string`（Markdown） |
| **返回格式** | 二进制 `.docx` 文件 |
| **外部依赖** | `docx ^9.6.1` |
| **调用方** | `outputs/page.tsx`（导出 Word 按钮） |

### POST `/api/ai/extract-text`

| 项目 | 详情 |
|------|------|
| **功能** | 服务端提取 PDF/Word 文件文本（浏览器无法直接解析） |
| **请求格式** | `multipart/form-data` |
| **请求参数** | `file: File` |
| **返回格式** | `{ text: string, warn: string \| null }` |
| **外部依赖** | `pdf-parse ^2.4.5`，`mammoth ^1.12.0` |
| **调用方** | `chat/page.tsx`（上传 PDF/Word 文件时） |

### GET `/api/sample-report-download`

| 项目 | 详情 |
|------|------|
| **功能** | 下载 `public/` 目录中的示例研报 Word 文件 |
| **请求格式** | 无参数 |
| **返回格式** | 二进制 `.docx` 文件 |
| **调用方** | `SampleReportView.tsx` 中的下载按钮 |

---

## 六、工具库

### `lib/auth.ts`

| 导出 | 说明 |
|------|------|
| `signIn(email)` | 将 email 写入 `sessionStorage['scibridge-auth']` |
| `signOut()` | 清除 sessionStorage |
| `getAuthedEmail()` | 读取当前登录邮箱 |
| `isAuthed()` | 是否已登录（boolean） |

**调用方**：`login/page.tsx`（登录）、`AuthGuard.tsx`（检查）、`UserMenu.tsx`（退出）

### `lib/i18n.ts`

| 导出 | 说明 |
|------|------|
| `dict` | 中英双语词典（~900 条，覆盖全部三端文案） |
| `DictKey` | 所有词条 key 的联合类型 |
| `Bi` | 双语对象类型 `{ en: string; zh: string }` |
| `Lang` | `'en' \| 'zh'` |
| `translate(key, lang)` | 根据语言返回翻译文本 |
| `pick(v, lang)` | 从 `Bi` 或 `string` 中按语言取值 |

**调用方**：`LanguageProvider.tsx` → 通过 `useLang()` hook 向全局暴露

### `lib/types.ts`

全局 TypeScript 类型定义，涵盖：
- `Project`、`Evaluation`、`ScoreMetric`
- `ChatMessage`、`ChatAttachment`
- `Investor`、`PitchSlide`、`RoadmapMilestone`
- `UploadFileMeta`、`AnalysisStep`
- `ProjectStage`、`stageDictKey`

**调用方**：几乎所有页面和组件

### `lib/extractFileText.ts`

| 导出 | 说明 |
|------|------|
| `extractFileText(file: File)` | 服务端提取文本，支持 TXT/MD/CSV（浏览器）、PDF（pdf-parse）、Word（mammoth） |
| `buildFileContext(results)` | 将提取结果拼接为 AI prompt 中的参考资料上下文字符串 |
| `ExtractResult` | `{ fileName, text, warn? }` |

**调用方**：`/api/ai/generate`、`/api/ai/generate-full-report`、`/api/ai/extract-text`

> **重要**：`pdf-parse` 和 `mammoth` 是 Node.js 库，**不能在浏览器端运行**，必须通过 API route 调用。

### `lib/serper.ts`

| 导出 | 说明 |
|------|------|
| `searchCompetition(projectName, industry, apiKey)` | 发起 4 条 Google 搜索（via serper.dev），返回最多 9 条竞品结果 |
| `buildCompetitionContext(results)` | 将搜索结果格式化为 AI prompt 注入文本 |
| `COMPETITION_FORCE_PROMPT` | 竞品分析强制输出规范（包含竞品清单 + 8维对比表格 + 竞争格局） |
| `SerperResult` | `{ title, snippet, link, date? }` |

**调用方**：`/api/ai/generate`、`/api/ai/generate-full-report`（竞品板块联网搜索）

### `lib/recent-projects.ts`

| 导出 | 说明 |
|------|------|
| `saveProject(project, reportContent)` | 写入 localStorage（最多保留 20 条，超出自动淘汰最旧） |
| `getRecentProjects(limit?)` | 按 createdAt 降序返回最近 N 个项目 |
| `getProjectById(id)` | 按 ID 查找单个项目 |
| `getReportContent(id)` | 读取对应研报内容 JSON |
| `deleteProject(id)` | 删除项目及研报内容 |
| `RecentProject` | 类型定义 |

**存储 Key**：
- 索引：`saiqiao_projects_index`
- 单项研报：`saiqiao_report_{id}`

**调用方**：`dashboard/page.tsx`（读）、`outputs/page.tsx`（写）、`reports/[id]/page.tsx`（读）

### `lib/mock-data.ts`

科研端和 OCP 端的全部 Mock 静态数据，包含：
- `mockProjects`（侧边栏项目列表）
- `mockInvestors`（投资人列表）
- `mockPitchDeck`（路演 PPT 示例）
- `mockRoadmap`（路线图示例）
- `activeProject`（当前选中项目）
- `seedChat`（工作台初始对话消息）
- `deepAnalysisSteps`（深度分析动画步骤）

### `lib/enterprise-data.ts` / `lib/ocp-data.ts`

企业端和 OCP 端专属 Mock 数据（项目管线、专家列表、交易流水、智能体信息、任务列表等）。

### `lib/sample-report.json`

示例研报的结构化 JSON 数据，由 `scripts/parse-sample-report.mjs` 解析生成，供 `SampleReportView.tsx` 使用。

---

## 七、数据流

### 7.1 用户登录流程

```
用户输入邮箱密码
    ↓
login/page.tsx 前端校验（硬编码 admin@scibridge.ai / SciBridge@2026）
    ↓
通过 → signIn(email) 写 sessionStorage['scibridge-auth']
    ↓
setTimeout 400ms → router.push('/dashboard')
    ↓
app/(app)/layout.tsx 渲染 AuthGuard
    ↓
AuthGuard useEffect → isAuthed() 读 sessionStorage → 已登录 → 渲染子页面
```

### 7.2 AI 对话数据流

```
用户在 chat/page.tsx 输入消息
    ↓
callAI(apiText, ctx, displayMsg?)
    ↓ 过滤掉 seedChat 消息和 system 消息
    ↓
POST /api/ai/chat
    body: { messages: [{role, content}], projectContext? }
    ↓
route.ts 构建 system prompt（内置科研顾问角色）
    ↓
POST https://api.minimaxi.com/v1/chat/completions
    model: MiniMax-M2.5-highspeed, max_tokens: 4000
    ↓
返回 choices[0].message.content
    ↓ stripThinking（去除 <think>...</think> 标签）
    ↓
返回 { content: string }
    ↓
chat/page.tsx 追加 assistant 消息气泡
```

### 7.3 文件上传与解析数据流

#### 科研端工作台（chat）

```
用户点击 Paperclip → handleFileSelect
    ↓
.txt / .md / .csv → file.text()（浏览器直读）
    ↓
.pdf / .doc / .docx → POST /api/ai/extract-text
    formData: { file: File }
    ↓
route.ts → extractFileText(file)
    PDF → require('pdf-parse')(buf)
    Word → require('mammoth').extractRawText({buffer})
    ↓
返回 { text, warn }
    ↓
将文件内容拼入 apiText（前6000字）
    ↓
callAI(apiText, messages, displayMsg) → /api/ai/chat
```

#### outputs 页（研报生成）

```
用户填写描述 + 上传文件 → handleGenerateFull / handleGenerate
    ↓
new FormData → append('projectInfo', JSON) + append('files', file)
    ↓
POST /api/ai/generate 或 /api/ai/generate-full-report
    ↓
route.ts：
    extractFileText × N（服务端并行提取）
    → buildFileContext（拼入参考资料上下文）
    if 竞品板块: searchCompetition(Serper) → buildCompetitionContext
    ↓
构建最终 prompt → MiniMax API
    ↓
返回研报文本 / 分板块对象
    ↓
outputs/page.tsx 渲染 MarkdownContent
    ↓
用户点击导出 Word → POST /api/ai/export-docx
    body: { title, content }
    ↓
Markdown → docx 库 → 二进制 .docx
    ↓
a.click() 触发浏览器下载
```

### 7.4 近期项目 localStorage 存取流程

```
【写入】outputs/page.tsx handleGenerateFull 完成后
    new RecentProject { id: uuid, projectName, description, ... }
    saveProject(project, { content: savedContent })
    → localStorage['saiqiao_projects_index'] = JSON 数组（最多 20 条）
    → localStorage['saiqiao_report_{id}'] = { content }

【读取 - 首页卡片】dashboard/page.tsx useEffect
    getRecentProjects(6) → 读取 index → 按 createdAt 排序 → 渲染近期项目卡片

【读取 - 报告详情】reports/[id]/page.tsx
    getProjectById(id) + getReportContent(id)
    → 渲染完整研报（MarkdownContent）

【删除】（暂未暴露 UI，deleteProject(id) 函数已备好）
```

---

## 八、样式体系

### 8.1 `globals.css` 自定义 Class

| Class | 用途 |
|-------|------|
| `.glow-border` | **渐变光照边框**：用 `::before` 伪元素 + `padding: 1px` + `-webkit-mask` 实现上明下暗的渐变边框。宿主元素必须有 `position: relative`，不能有 `overflow: hidden` |
| `.glow-border-hover:hover::before` | hover 时加强边框亮度（顶部 0.5 → 0.5 opacity） |
| `.glow-border-focus:focus-within::before` | 焦点容器加强边框（用于输入框包裹 div） |
| `.card` | 浅色主题卡片（白底 + slate 边框 + 轻阴影），用于企业端 |
| `.btn` / `.btn-primary` / `.btn-accent` 等 | 通用按钮样式，已较少使用（深色页面用 inline style） |
| `.dot` | AI 思考动画点（三个 `.dot` 依次闪烁） |
| `.animate-pulse-ring` | FloatingAgent 悬浮球脉冲光环（2.5s ease-out infinite） |
| `.animate-chat-pop-in` | 聊天面板弹出动画（scale 0.85 → 1，0.25s） |
| `.no-print` | 打印时隐藏（Sidebar、TopBar 等） |

### 8.2 深色主题色值体系

科研端和 OCP 端使用统一深色主题，均为 **inline style** 硬编码：

| 色值 | 用途 |
|------|------|
| `#0a0a0c` | 页面背景、Sidebar 背景、输入框背景 |
| `#111113` | 卡片背景（比背景色略亮） |
| `rgba(255,255,255,0.03~0.12)` | 卡片/面板微透明背景 |
| `rgba(255,255,255,0.06~0.15)` | 边框色（inline style，与 glow-border 无关） |
| `#fff` | 主色文字、主按钮背景 |
| `rgba(255,255,255,0.4~0.7)` | 次级文字、占位符 |

Tailwind `brand.*` 色板（紫色系）主要用于浅色企业端和历史遗留按钮样式。

### 8.3 三端样式隔离

| 端 | 背景 | 侧边栏 | 整体风格 | 边框方式 |
|----|------|--------|----------|----------|
| **科研端** | `#0a0a0c` 纯黑 | 暗色 Sidebar | 黑白极简 + glow-border | `.glow-border` |
| **企业端** | `bg-slate-50/60` 浅灰 | EnterpriseSidebar（浅色） | 白色卡片 + slate 边框 | Tailwind `.card` |
| **OCP 端** | `#05060d` 极深蓝黑 | 暗色 OCPSidebar | 深蓝科技感 | inline style |

---

## 九、环境变量

| 变量名 | 是否必须 | 用途 |
|--------|----------|------|
| **`MINIMAX_API_KEY`** | ✅ 必须 | MiniMax LLM API 密钥，用于所有 AI 生成接口（chat、generate、generate-full-report、generate-pptx） |
| `SERPER_API_KEY` | ⚠️ 可选 | Google 搜索代理 API（serper.dev），用于研报竞品板块的联网搜索。未配置时该板块仍可生成（降级到纯 AI 训练数据），填写「待填写」视为未配置 |

> 变量在 `.env.local` 中配置，同时硬编码在 `next.config.mjs` 的 `env` 字段中（**注意：`next.config.mjs` 的 `env` 字段会将值嵌入客户端 bundle，存在密钥泄露风险，建议生产环境仅保留 `.env.local` 配置**）。

---

## 十、已知问题和待办

### 10.1 安全隐患

| 问题 | 位置 | 说明 |
|------|------|------|
| **API Key 暴露风险** | `next.config.mjs` | `env` 字段将 MINIMAX_API_KEY 打包进客户端 bundle，任何用户可在 DevTools Network 中看到。建议删除 `next.config.mjs` 中的 `env` 字段，仅保留 `.env.local` |
| **硬编码演示账号** | `app/login/page.tsx` | `ACCOUNT_EMAIL` 和 `ACCOUNT_PASSWORD` 明文写在前端代码中，对外演示时任何人可见 |
| **API Routes 无鉴权** | 所有 `/api/ai/*` | 任何人知道接口 URL 即可调用，会消耗 MiniMax API 额度 |
| **sessionStorage 鉴权** | `lib/auth.ts` | sessionStorage 关闭 Tab 即失效，且无法跨 Tab 共享登录态 |

### 10.2 功能缺失 / 未完成

| 问题 | 位置 | 说明 |
|------|------|------|
| **`/api/ai/evaluate` 目录为空** | `app/api/ai/evaluate/` | 目录存在但无 `route.ts`，评估接口尚未实现 |
| **Settings 保存无效** | `settings/page.tsx` | 模型选择等配置仅存在前端 state，刷新即丢失，未实际影响 AI 调用 |
| **搜索框无实际功能** | `TopBar.tsx` | 搜索框 UI 存在，但 `onChange` 事件没有绑定任何逻辑 |
| **通知按钮无功能** | `TopBar.tsx` | Bell 图标按钮点击无任何响应 |
| **ParticleSphere 无引用** | `components/ParticleSphere.tsx` | 落地页删除后该组件已无任何页面使用，可以清理 |
| **`page.tsx.bak` 备份文件** | `app/page.tsx.bak` | 旧落地页备份，不应提交到生产仓库 |
| **Deep Analysis 为 Mock** | `chat/page.tsx` `runDeep()` | 深度分析仅播放 Mock 动画，不调用任何真实 API |
| **OCP 端指令分发为 Mock** | `ocp/command/page.tsx` | 指令中心展示的智能体分发为 UI 演示，无实际 API 调用 |

### 10.3 性能优化点

| 问题 | 说明 |
|------|------|
| **Chat 历史消息无长度限制** | 随着对话增多，发给 MiniMax 的 messages 数组无限增长，会触及上下文长度限制 |
| **文件提取无缓存** | 每次生成研报都重新提取文件文本，同一文件多次上传会重复解析 |
| **Mock 数据与 i18n 键硬耦合** | `lib/mock-data.ts` 直接硬编码 `{ en: '...', zh: '...' }`，维护成本较高 |

---

## 十一、后端开发指引

### 11.1 当前后端能力（API Routes）

当前所有"后端"均通过 Next.js App Router 的 `route.ts` 实现，**部署在同一 Node.js 进程**：

| 能力 | 接口 | 状态 |
|------|------|------|
| 多轮 AI 对话 | `/api/ai/chat` | ✅ 完整 |
| 分板块研报生成 | `/api/ai/generate` | ✅ 完整（含 Serper 联网） |
| 十章完整研报 | `/api/ai/generate-full-report` | ✅ 完整（含 Serper 联网） |
| 路演 PPT 生成 | `/api/ai/generate-pptx` | ✅ 完整 |
| Word 文档导出 | `/api/ai/export-docx` | ✅ 完整 |
| 文件文本提取 | `/api/ai/extract-text` | ✅ 完整 |
| 用户鉴权 | 无服务端接口 | ❌ 仅前端 sessionStorage |
| 数据持久化 | 无服务端接口 | ❌ 仅 localStorage |
| 项目/研报 CRUD | 无服务端接口 | ❌ 未实现 |
| 评估接口 | `/api/ai/evaluate`（空目录） | ❌ 未实现 |

### 11.2 建议的后端架构演进

**阶段一（当前）：Next.js API Routes（无状态）**

```
浏览器 → Next.js API Routes → MiniMax API
                           → Serper API
         localStorage 持久化
```

**阶段二：引入独立数据库（推荐优先级最高）**

```
浏览器 → Next.js API Routes → PostgreSQL / Supabase
                           → MiniMax API
                           → Serper API
         无 localStorage 依赖
```

推荐引入 **Supabase**（托管 PostgreSQL + Auth + Storage）：
- `users` 表：替换 sessionStorage 鉴权
- `projects` 表：替换 localStorage 的 `saiqiao_projects_index`
- `reports` 表：替换 `saiqiao_report_{id}`
- Supabase Storage：存储上传的原始文件

**阶段三：长任务队列（研报生成耗时 2-10 分钟）**

当前研报生成在 HTTP 连接中同步等待，容易超时。建议引入：
- **Vercel Background Functions** 或 **BullMQ（Redis队列）**
- 前端轮询 `/api/tasks/{taskId}/status`
- 完成后 SSE / WebSocket 推送结果

### 11.3 智能体开发切入点

当前 AI 调用集中在：

```typescript
// 所有接口共用 MiniMax 调用模式
const response = await fetch('https://api.minimaxi.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}` },
  body: JSON.stringify({
    model: 'MiniMax-M2.5-highspeed',
    messages: [{ role: 'system', content: systemPrompt }, ...userMessages],
    max_tokens: 4000,
  }),
});
const data = await response.json();
const content = data.choices[0].message.content;
```

**可扩展方向**：

1. **多智能体 Pipeline**（`/api/ai/generate` 扩展）：竞品搜索→市场分析→技术评估并行，结果聚合后生成最终研报

2. **Streaming 输出**：将 MiniMax 返回改为流式（`stream: true`），通过 `ReadableStream` 逐字推送到前端，提升体验

3. **Tool Use / Function Calling**：利用 MiniMax 的 function calling 功能，让 AI 主动调用 Serper 搜索、数据库查询等工具

4. **评估接口补全**（`/api/ai/evaluate`）：接收项目描述 → 返回 TRL 评分、市场潜力、商业化风险的结构化 JSON

### 11.4 数据库接入方案

**推荐方案：Supabase（最小改动）**

```bash
npm install @supabase/supabase-js
```

迁移步骤：

1. **替换 `lib/auth.ts`**：
```typescript
// 当前（sessionStorage）
export function signIn(email: string) { sessionStorage.setItem('scibridge-auth', email); }

// 目标（Supabase Auth）
import { createClient } from '@supabase/supabase-js';
export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
}
```

2. **替换 `lib/recent-projects.ts`**：localStorage CRUD → Supabase Table CRUD

3. **API Routes 加鉴权**：
```typescript
// 在每个 route.ts 开头加
import { createServerClient } from '@supabase/ssr';
const supabase = createServerClient(...);
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });
```

4. **文件存储**：将 `uploadedFiles` 先上传到 Supabase Storage，再传文件 URL 给 AI 接口，避免每次重复解析

---

*本文档由 Claude Code 自动生成，如项目代码有更新，请重新运行生成命令保持同步。*

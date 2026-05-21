# 科研端路演 PPT 生成模块 — 代码结构全检阅

生成时间：2026-05-20  
项目路径：/Users/wodeshijie/Desktop/limai  

---

## 一、涉及文件清单

| 文件路径 | 行数 | 角色 |
|---------|------|------|
| `app/api/ai/generate-pptx/route.ts` | 925 | 核心后端：文件解析 → LLM → PPTX 渲染 |
| `app/(app)/outputs/page.tsx` | 971 | 前端 DeckView 组件（含上传、进度、下载） |
| `lib/mock-data.ts` | 476 | 前端 Demo 预览用的 mockPitchDeck（7 张样例幻灯片） |
| `lib/types.ts` | 190 | `PitchSlide` 类型定义 |
| `lib/i18n.ts` | ~1200 | 双语字典（含路演 PPT 相关 UI 字串） |
| `package.json` | — | 依赖：pptxgenjs ^4.0.1、mammoth ^1.12.0、pdf-parse ^1.1.1 |

---

## 二、请求链路（端到端）

```
用户操作
  └─ 上传 BP 文件（PDF / DOCX / TXT）
        ↓
[DeckView - outputs/page.tsx]
  handleGenerate()
  POST /api/ai/generate-pptx  multipart/form-data
        ↓
[route.ts - POST handler]
  1. 验证 MINIMAX_API_KEY
  2. 检查文件大小 ≤ 10MB
  3. extractText()          ← PDF/DOCX/TXT → 纯文本（截 8000 字）
        ↓
  4. generateOutline()      ← 调 MiniMax API，返回 PptOutline JSON
        ↓
  5. buildPptx()            ← 按 slide_type 循环调用 render*() 函数
        ↓
  6. pptx.write('arraybuffer')
        ↓
NextResponse  Content-Type: application/vnd...presentationml.presentation
              Content-Disposition: attachment; filename*=UTF-8''xxx-路演PPT.pptx
        ↓
浏览器自动下载 .pptx
```

---

## 三、核心文件详解：route.ts

### 3.1 常量与主题色

```typescript
// app/api/ai/generate-pptx/route.ts  Lines 10-25
const COLOR = {
  BG:     '0B1437',   // 深蓝背景
  CYAN:   '06B6D4',   // 主强调色（分割线、高亮）
  PURPLE: '8B5CF6',   // 次强调色
  GOLD:   'F59E0B',   // 财务/投资板块
  WHITE:  'FFFFFF',
  GRAY:   '94A3B8',
  RED:    'EF4444',   // 痛点板块
  GREEN:  '10B981',   // 增长/成功
};
const LAYOUT = { width: 13.33, height: 7.5 };  // 16:10 宽屏（英寸）
```

### 3.2 数据类型

```typescript
// Lines 35-59
interface PptSlide {
  index:          number;
  slide_type:     'cover' | 'painpoints' | 'solution' | 'market' | 'traction'
                | 'business_model' | 'competition' | 'team' | 'finance'
                | 'roadmap' | 'investment' | 'contact';
  title:          string;
  subtitle?:      string;
  tagline?:       string;
  body?:          string;
  cards?:         { icon?: string; title: string; body: string; stat?: string }[];
  members?:       { name: string; role: string; bio: string }[];
  metrics?:       { label: string; value: string; unit?: string }[];
  milestones?:    { quarter: string; title: string; done: boolean }[];
  chart_values?:  { label: string; value: number }[];
  ask_amount?:    string;
  ask_use?:       { label: string; value: number }[];
  contact_name?:  string;
  contact_email?: string;
  contact_website?: string;
  notes?:         string;
}

interface PptOutline {
  project_name: string;
  tagline:      string;
  slides:       PptSlide[];
}
```

### 3.3 文件文本提取

```typescript
// Lines 77-95  extractText(file: File): Promise<string>
// 支持：PDF（pdf-parse）、DOCX（mammoth）、TXT/MD/CSV（text()）
// 限制：10MB 文件大小、8000 字截断
```

### 3.4 LLM 调用（generateOutline）

```typescript
// Lines 99-308
// 模型：MiniMax-M2.5-highspeed
// 端点：https://api.minimaxi.com/v1/chat/completions
// max_tokens：8000
// 超时：120 秒

// System Prompt（约 170 行）要求 LLM：
//   - 分析 BP 文档提取真实数据（禁止幻觉）
//   - 输出严格 JSON，结构符合 PptOutline schema
//   - 生成 12-14 张幻灯片，涵盖全部 slide_type
//   - 每种幻灯片类型有明确字段约束
```

**System Prompt 关键约束（摘要）：**
- `cover`：project_name + tagline + subtitle（一句话价值主张）
- `painpoints`：cards 数组，每条含 icon、title、body、stat
- `solution`：body + cards（核心功能列表）
- `market`：metrics（TAM/SAM/SOM）+ chart_values（饼图数据）
- `traction`：metrics（4 个关键指标）
- `business_model`：cards（盈利模式）+ chart_values（收入结构）
- `competition`：cards（2x2 竞争格局，含 stat 徽章）
- `team`：members 数组（name/role/bio）
- `finance`：chart_values（年收入预测）+ metrics（关键财务指标）
- `roadmap`：milestones 数组（quarter/title/done 布尔）
- `investment`：ask_amount + ask_use（资金用途饼图）
- `contact`：contact_name / contact_email / contact_website

### 3.5 幻灯片渲染函数

| 函数 | 行 | 布局方式 |
|------|----|---------|
| `renderCover()` | 335 | 居中大字 + 装饰圆 + 青色分割线 |
| `renderPainpoints()` | 377 | 3 列卡片，顶部红色 stat 数字 |
| `renderSolution()` | 428 | 左侧正文 + 右侧功能卡片列表 |
| `renderMarket()` | 480 | 左侧 TAM/SAM/SOM 指标 + 右侧甜甜圈图 |
| `renderTraction()` | 527 | 4 列 KPI 指标卡（绿色数字） |
| `renderBusinessModel()` | 567 | 左侧模式卡片 + 右侧收入结构饼图 |
| `renderCompetition()` | 620 | 2×2 格局卡片（青色星标徽章） |
| `renderTeam()` | 663 | 3 列成员卡（首字母圆形头像）|
| `renderFinance()` | 710 | 柱状图（年收入）+ 右侧 KPI 列表 |
| `renderRoadmap()` | 753 | 时间轴 + 交替里程碑标签 |
| `renderInvestment()` | 789 | 左侧融资金额 + 右侧资金用途饼图 |
| `renderContact()` | 830 | 致谢语 + 联系信息居中 |
| `renderDefault()` | 858 | 通用卡片降级布局 |

所有 render 函数均接受 `(prs: pptxgen, slide: PptxGenJS.Slide, data: PptSlide)` 参数。

### 3.6 图表类型

- **Doughnut（甜甜圈）**：市场体量（TAM/SAM/SOM）、收入结构、资金用途
- **Bar（柱状）**：财务预测（年收入）
- **Timeline（时间轴）**：路线图里程碑（程序绘制，非图表库）

### 3.7 POST 处理器（Lines 871-925）

```typescript
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. env check
  // 2. formData.get('file')
  // 3. size <= 10MB
  // 4. text = await extractText(file)
  // 5. outline = await generateOutline(text, file.name)
  // 6. if (!outline || outline.slides.length < 3) → 502
  // 7. buf = await buildPptx(outline)
  // 8. return binary response with UTF-8 filename
}
```

---

## 四、前端组件详解：DeckView

```typescript
// app/(app)/outputs/page.tsx  Lines 700-902
// 位于 outputs 页面的第三个 Tab "路演 PPT"
```

### 4.1 状态变量

| 状态 | 类型 | 说明 |
|------|------|------|
| `selectedFile` | `File \| null` | 用户上传的 BP 文件 |
| `genState` | `'idle' \| 'running' \| 'done' \| 'error'` | 生成状态机 |
| `stepLabel` | `string` | 当前进度文案 |
| `downloadHref` | `string` | Blob URL |
| `downloadName` | `string` | 下载文件名 |

### 4.2 进度步骤（模拟延迟）

```typescript
const STEPS = [
  { label: '正在解析文件…',           delay: 0 },
  { label: 'AI 正在分析内容…',        delay: 3000 },
  { label: '正在生成 PPT 幻灯片…',    delay: 20000 },
  { label: '即将完成，正在打包文件…', delay: 40000 },
];
```

### 4.3 生成流程

```typescript
async function handleGenerate() {
  setGenState('running');
  // 启动进度步骤定时器
  const fd = new FormData();
  fd.append('file', selectedFile);
  const res = await fetch('/api/ai/generate-pptx', { method: 'POST', body: fd });
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  setDownloadHref(href);
  setDownloadName(`${selectedFile.name.replace(/\.[^.]+$/, '')}-路演PPT.pptx`);
  setGenState('done');
  // 触发自动下载
}
```

### 4.4 UI 结构

```
DeckView
├── 文件上传区（点击 / 拖拽，接受 .pdf .doc .docx .txt）
├── 已选文件显示（文件名 + 大小）
├── [生成路演 PPT] 按钮
├── 运行中：spinner + stepLabel 文案
├── 完成：✓ 图标 + [下载 PPTX] 按钮
└── 样例预览：mockPitchDeck 7 张幻灯片缩略卡
```

---

## 五、类型定义（lib/types.ts）

```typescript
// Lines 78-82
export interface PitchSlide {
  index:   number;
  title:   Bi;      // { en: string; zh: string }
  bullets: Bi[];
}
```

注：`PitchSlide` 是 mock 数据类型，仅用于前端预览。真实生成使用 route.ts 内定义的 `PptSlide`（含 slide_type 等完整字段）。

---

## 六、多语言相关条目（lib/i18n.ts）

| key | zh | en |
|-----|----|----|
| `out_tab_deck` | 路演 PPT | Pitch Deck |
| `out_deck_title` | 一键生成路演 PPT | Generate Pitch Deck |
| `out_deck_hint` | 上传商业计划书… | Upload your BP... |
| `out_deck_gen_btn` | 生成路演 PPT | Generate Pitch Deck |
| `out_deck_download` | 下载 PPTX | Download PPTX |

---

## 七、依赖库

| 库 | 版本 | 用途 |
|----|------|------|
| `pptxgenjs` | ^4.0.1 | PPTX 文件生成（幻灯片、文本框、图形、图表） |
| `mammoth` | ^1.12.0 | DOCX 文本提取 |
| `pdf-parse` | ^1.1.1 | PDF 文本提取 |
| `recharts` | ^2.13.3 | 前端图表（仅 UI 预览，不参与 PPTX 生成） |

---

## 八、环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `MINIMAX_API_KEY` | ✅ | MiniMax 语言模型认证 |

---

## 九、已知限制与潜在改进点

| 问题 | 当前处理 | 可改进方向 |
|------|----------|-----------|
| 文件文本截断 8000 字 | 直接截断，可能丢失财务/团队信息 | 按章节智能提取关键段落 |
| LLM Prompt 硬编码在 route.ts | 修改需改代码 | 抽成 `/lib/prompts/ppt-agent.ts` |
| 仅支持中文内容 BP | System Prompt 未区分语言 | 添加语言检测，双语 Prompt |
| 幻灯片字体全部 hard-coded | 无主题切换能力 | 抽象 ThemeConfig 接口 |
| 超时 120 秒无进度反馈 | 前端用假进度步骤模拟 | 改用 SSE 或 WebSocket 实时推送 |
| 图表数据全依赖 LLM 生成 | 若 LLM 生成数字不一致则图表错误 | 对数值字段做后验校验 |
| 没有生成失败重试 | 一次失败直接报 502 | 添加最多 2 次重试 |

---

## 十、与研报模块的对比

| 维度 | 研报（generate-full-report） | 路演 PPT（generate-pptx） |
|------|------------------------------|--------------------------|
| LLM | MiniMax（章节）+ DeepSeek（审查/编辑）| 仅 MiniMax |
| 输出格式 | Markdown 文本 | 二进制 PPTX |
| 阶段数 | 6 个阶段（Intake→Search→Writer→Skeptic→Editor→Format）| 2 个阶段（提取→生成）|
| Prompt 位置 | `/lib/prompts/` 独立文件 | 内嵌在 route.ts |
| 字数 | 20 万字符（10 章） | 12-14 张幻灯片 |
| 超时保护 | AbortController 每章 180s | 全局 120s 无章节保护 |
| 错误降级 | Promise.allSettled 批次容错 | 无降级，全失败报 502 |

---

*本文件由 Claude Code 自动生成，用于代码检阅。如需更新，重新运行探索指令。*

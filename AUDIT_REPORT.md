# Sci-Bridge Agent 代码审计报告

> 审计时间：2026-05-18
> 审计范围：研报生成 + 多智能体编排
> 检查文件数：21

## 摘要

- 共发现 **31** 个问题
- 严重（Critical）：**3** 个 — 会导致生产环境崩溃或密钥泄露
- 高（High）：**9** 个 — 会导致功能不可用或体验严重劣化
- 中（Medium）：**12** 个 — 影响质量但不阻塞
- 低（Low）：**7** 个 — 代码风格 / 可维护性建议

**最值得立刻处理的 3 个问题**：

1. **[CRIT-001]** `next.config.mjs` 的 `env` 字段把 MiniMax API Key 硬编码进客户端 bundle，密钥已泄露至浏览器
2. **[CRIT-002]** `generate-full-report` 的 20 分钟超时仅靠 `AbortController`，但实际 HTTP 请求已在 `runChapterPhases` 内部发出，`AbortSignal` 无法传递给 MiniMax/Tavily 的 `fetch`，超时实质无效
3. **[HIGH-001]** `Promise.all`（非 `Promise.allSettled`）在 Phase 5a 的 10 个并行 Skeptic 调用中——单个 fetch 抛 `TypeError`（网络错误）会整体崩溃，`try/catch` 只包了内层但内部 `fetch` 还有 `await res.json()` 未被保护

---

## 问题清单

---

### [CRIT-001] MiniMax API Key 硬编码在 `next.config.mjs` env 字段，暴露至客户端 bundle

- **严重程度**：Critical
- **维度**：安全与密钥
- **文件**：`next.config.mjs:8-10`
- **现象**：`next.config.mjs` 的 `env` 字段会被 Next.js 注入到**客户端 JavaScript bundle** 中（与 `NEXT_PUBLIC_` 前缀等效），任何用户打开 DevTools → Network / Sources 均可读取密钥明文。
- **代码片段**：
```js
env: {
  MINIMAX_API_KEY: 'sk-cp-_d81eoJd0o7icAdi_tt-...',
},
```
- **影响**：密钥已不可撤销地在历史 commit 中存在；任何访问过该部署的用户均可获取并滥用，产生计费风险。
- **建议修复**：立即在 MiniMax 控制台吊销该 Key 并重新生成；删除 `next.config.mjs` 中的 `env` 字段；在 `.env.local`（已在 .gitignore 中）中设置 `MINIMAX_API_KEY=xxx`；服务端 route 通过 `process.env.MINIMAX_API_KEY` 读取即可，无需 `env` 字段。
- **置信度**：高

---

### [CRIT-002] 主流程超时机制实质无效——`AbortController` 无法透传到子 fetch

- **严重程度**：Critical
- **维度**：正确性 Bug / 编排问题
- **文件**：`app/api/ai/generate-full-report/route.ts:54-62`
- **现象**：`setTimeout(() => controller.abort(), 1200000)` 创建了一个 `AbortController`，但其 `signal` 从未传给 `runChapterPhases()`（内部所有 MiniMax/Tavily `fetch` 不携带该 signal）。20 分钟到期后 `controller.abort()` 执行，但没有任何正在进行的 `fetch` 监听它，因此整个请求永远不会因超时而被中止——服务器连接将一直挂起直到部署平台 TCP timeout。
- **代码片段**：
```typescript
const controller = new AbortController();
const tid = setTimeout(() => controller.abort(), 1200000);
let phases: Awaited<ReturnType<typeof runChapterPhases>>;
try {
  phases = await runChapterPhases(summary, rawFileText, name || undefined);
  // ↑ runChapterPhases 内部的 fetch 不携带 controller.signal
} finally {
  clearTimeout(tid);
}
```
- **影响**：请求永久挂起；在 Vercel/Railway 等平台上会被平台层强制断开（通常 30s-300s），返回 502/504，前端用户看到的是平台级错误而非友好提示。
- **建议修复**：向 `runChapterPhases` 传入 `AbortSignal` 参数，并在内部所有 `callMiniMax` / Tavily `fetch` 调用中透传；或改用 `Promise.race([phases, timeout])` 模式。
- **置信度**：高

---

### [CRIT-003] `maxDuration = 1200`（20 分钟）超过所有主流部署平台上限

- **严重程度**：Critical
- **维度**：编排问题
- **文件**：`app/api/ai/generate-full-report/route.ts:8`
- **现象**：Next.js `maxDuration` 在 Vercel Hobby/Pro 最大 60s/300s，在 Railway 默认无限但平台 TCP 超时通常 ≤300s；`1200` 秒的设置在所有托管平台上均会被平台层提前终止，而不是被代码超时逻辑捕获。
- **代码片段**：
```typescript
export const maxDuration = 1200;
```
- **影响**：实际请求在平台层被 Kill 并返回 502，无法触发代码的优雅降级逻辑；用户收到无意义的 502 而非 "请求超时，请重试"。
- **建议修复**：改为流式 SSE 输出（每章完成即推送），或拆分为多个独立 API 调用由前端轮询；若必须保持同步，建议设置 `maxDuration = 300` 并相应缩短内部超时。
- **置信度**：高

---

### [HIGH-001] Phase 5a `Promise.all` 中 `await res.json()` 未被 try/catch 保护

- **严重程度**：High
- **维度**：正确性 Bug
- **文件**：`app/api/ai/generate-full-report/route.ts:70-93`
- **现象**：外层 `try/catch` 捕获了 `fetch` 本身抛出的网络错误，但若 `fetch` 成功而 `res.json()` 因响应体非法 JSON 抛出，该异常会逃逸出 `try` 块（因为 `return null` 只在 `!res.ok` 时执行）。由于使用 `Promise.all`（非 `allSettled`），任何一个 Promise reject 都会导致整个 `perChapterReports` await 失败，进而触发外层 catch 返回 500。
- **代码片段**：
```typescript
const perChapterReports = await Promise.all(
  chapterResults.map(async (ch) => {
    try {
      const res = await fetch(`${origin}/api/ai/skeptic-review`, {...});
      if (!res.ok) {
        console.warn(...);
        return null;
      }
      return await res.json(); // ← 未被 try/catch 包围
    } catch (e) {
      return null;
    }
  }),
);
```
- **影响**：任意一章 Skeptic 返回非 JSON 响应（如被平台截断）→ 整个研报生成失败。
- **建议修复**：将 `return await res.json()` 也纳入同一 try 块，或在 catch 后面显式处理；`Promise.all` 改为 `Promise.allSettled` 后再 `.map(r => r.status === 'fulfilled' ? r.value : null)` 是更健壮的方式。
- **置信度**：高

---

### [HIGH-002] `req.nextUrl.origin` 在自部署（反向代理）环境下可能是 `http://localhost:3006`

- **严重程度**：High
- **维度**：编排问题
- **文件**：`app/api/ai/generate-full-report/route.ts:67`
- **现象**：Phase 5a/5b 的内部 HTTP 调用使用 `req.nextUrl.origin` 作为 base URL。在 Nginx 反代场景下，实际请求到达 Next.js 时 `req.url` 携带的是内网地址（如 `http://localhost:3006`），导致内部 fetch 到 `http://localhost:3006/api/ai/skeptic-review` — 在容器化部署中该地址不可达。
- **代码片段**：
```typescript
const origin = req.nextUrl.origin;
// ...
const res = await fetch(`${origin}/api/ai/skeptic-review`, {...});
```
- **影响**：生产部署中 Phase 5a/5b 全部失败，报告无 Skeptic 审查，但代码静默降级（只有 warning），用户无感知。
- **建议修复**：将 Skeptic 逻辑提取为可直接调用的纯函数（不走 HTTP），或使用 `process.env.INTERNAL_API_URL` 配置内网地址，或在 Next.js 中使用 `import`-style 直接调用 route handler 的函数体。
- **置信度**：高

---

### [HIGH-003] `generate/route.ts` 的 `projectInfo` JSON.parse 无 try/catch

- **严重程度**：High
- **维度**：正确性 Bug
- **文件**：`app/api/ai/generate/route.ts:117`
- **现象**：FormData 路径下，`JSON.parse(piRaw as string)` 和 `JSON.parse(secRaw as string)` 均未被 try/catch 保护。若前端发送的 FormData 中 `projectInfo` 或 `sections` 是非法 JSON（例如被截断），会直接抛出 `SyntaxError`，被最外层 catch 捕获并返回 500 而非 400。
- **代码片段**：
```typescript
projectInfo = JSON.parse(piRaw as string);  // 无 try/catch
sections = JSON.parse(secRaw as string);     // 无 try/catch
```
- **影响**：前端传参错误时用户收到通用 500 错误，无法区分是客户端请求格式错误还是服务端异常。
- **建议修复**：包裹 try/catch，捕获后返回 `{ error: '请求参数格式错误' }` 状态 400。
- **置信度**：高

---

### [HIGH-004] `generate-full-report/route.ts` 的 FormData 路径中 `projectInfo` JSON.parse 同样无 try/catch

- **严重程度**：High
- **维度**：正确性 Bug
- **文件**：`app/api/ai/generate-full-report/route.ts:25`
- **现象**：与 HIGH-003 相同模式，`JSON.parse(piRaw as string)` 无保护。
- **代码片段**：
```typescript
projectInfo = JSON.parse(piRaw as string);
```
- **影响**：同 HIGH-003。
- **建议修复**：同 HIGH-003。
- **置信度**：高

---

### [HIGH-005] `editor/route.ts` 的 `llmClusterTerms` 对 JSON mode 返回值缺失二次 parse 保护

- **严重程度**：High
- **维度**：正确性 Bug
- **文件**：`app/api/ai/editor/route.ts:67-69`
- **现象**：`callDeepSeek` 在 `jsonMode=true` 时已经对 `response_format: json_object` 调用，返回内容理应是合法 JSON，但函数内仍有 `raw.replace(/^```json\s*/i...)` 清洗 + `JSON.parse`。若 DeepSeek 在 json_object 模式下仍返回空字符串（偶发），`JSON.parse('')` 抛出 `SyntaxError`，外层 `catch {}` 吞掉并返回 `[]`——这是预期的降级行为，但是 `callDeepSeek` 自身同时也 strip `<think>` 并 `.trim()`，导致 `raw` 已经是处理后的字符串，而下层还有一次额外的 `replace(/^```json\s*/i, '')` — 两层 strip 逻辑重复，可能在边缘 case 下损坏 JSON。
- **代码片段**：
```typescript
const raw = await callDeepSeek(system, user, true);  // callDeepSeek 已 strip <think> + trim
const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
const parsed = JSON.parse(cleaned);
```
- **影响**：在特殊输出（如 ```` ```json\n{...}\n``` ````）场景下，双重 strip 会把合法内容截断；风险为中-低，但置信度有限。
- **建议修复**：统一 JSON 清洗逻辑到 `safeParseJson`（已在 skeptic-review 中存在），复用即可。
- **置信度**：中

---

### [HIGH-006] `serper.ts` 中 `searchCompetition` 顺序 for 循环调用 Tavily，无并行，阻塞时间成倍叠加

- **严重程度**：High
- **维度**：正确性 Bug / 可观测性
- **文件**：`lib/serper.ts:83-89`
- **现象**：4 个搜索 query 是顺序 await，每个最长 10s，合计最长 40s 阻塞；而 `report-engine.ts` 中的 `runSearchAgent` 已正确使用 `Promise.all` 并行搜索——但 `generate/route.ts` 调用的是 `searchCompetition`（串行版本），慢 4 倍。
- **代码片段**：
```typescript
for (const q of queries) {
  const res = await search(q, 3);  // 顺序 await，每次最长 10s
  ...
  if (all.length >= 9) break;
}
```
- **影响**：`/api/ai/generate`（板块生成）中竞品搜索最长多阻塞 30 秒；前端超时风险提高。
- **建议修复**：改为 `await Promise.all(queries.map(q => search(q, 3)))` + 结果合并去重。
- **置信度**：高

---

### [HIGH-007] `citation-placeholder.ts` 中 CITE_RE 正则使用 Unicode 属性（emoji）但 flag 仅有 `gu`，在某些 Node 版本下可能漏匹配

- **严重程度**：High
- **维度**：正确性 Bug
- **文件**：`lib/citation-placeholder.ts:11`
- **现象**：`/\[(\d+)\][✅🟡⚠️❗]/gu` 中方括号内直接放 emoji 字符。`⚠️` 是两个 Unicode 码点（`U+26A0` + `U+FE0F` variation selector），在字符类 `[...]` 内，JS 引擎将其视为两个独立字符，而实际文本中 `⚠️` 是两个码点的序列，导致该字符类**无法**匹配 `⚠️`（只能匹配 `⚠` 即 `U+26A0` alone）。
- **代码片段**：
```typescript
const CITE_RE = /\[(\d+)\][✅🟡⚠️❗]/gu;
```
- **影响**：低可信度章节的 `[N]⚠️` 角标不会被 mask，LLM 可能直接修改引用数字，导致跳转失效。
- **建议修复**：改写为 `(✅|🟡|⚠️|❗)` 的非字符类形式：`/\[(\d+)\](?:✅|🟡|⚠️|❗)/gu`；同样的问题在 `docx-rendering.ts:31` 的 pattern 中也存在。
- **置信度**：高

---

### [HIGH-008] `hedge-inject.ts` 中 `lowBadgeRe` 变量声明后被 `void` 忽略，实际hedge注入逻辑仅在 `[^cl_xxx]` 阶段工作，Phase 6 renumber 之后调用则完全失效

- **严重程度**：High
- **维度**：编排问题
- **文件**：`lib/hedge-inject.ts:39-44` 及 `app/api/ai/editor/route.ts:144-151`
- **现象**：`injectHedges` 在 `editor/route.ts` Step 6.1 中被调用，此时 `claims` 来自请求体（Phase 5 已评级的 claims），正文是包含 `[^cl_xxx]` 脚注的 Markdown。但在 `generate-full-report/route.ts` 的主流程中，`injectHedges` **从未被调用**——editor route 实质上是一个孤立的可选路由，主流程不走它。结果：所有 hedge 占位符永远不会被注入，`HEDGE_INSTRUCTIONS` 所描述的功能在主流程中实际不存在。
- **代码片段**：
```typescript
// lib/hedge-inject.ts:39-43
const lowBadgeRe = /(\[(\d+)\][⚠️❗])/gu;
// ...
void lowBadgeRe; // unused in this path, kept for reference
```
- **影响**：设计文档描述的"低可信声明自动加免责措辞"功能在主流程中不工作；用户看到的研报没有任何 hedge 标注。
- **建议修复**：在主流程（`generate-full-report` Phase 6 assembly 之前）调用 `injectHedges`；或明确注释说明该功能仅在 `/api/ai/editor` 路由中工作。
- **置信度**：高

---

### [HIGH-009] `extract-text/route.ts` 无文件大小限制，可被用于 DoS

- **严重程度**：High
- **维度**：安全与密钥
- **文件**：`app/api/ai/extract-text/route.ts:1-17`
- **现象**：该 route 直接调用 `extractFileText`，而 `extractFileText` 内部有 50MB 检查；但 `extract-text/route.ts` 本身不做任何鉴权或 rate limit，任意匿名请求都可以上传 50MB 文件并触发 `mammoth`/`pdf-parse` 解析，造成 CPU/内存峰值。
- **代码片段**：
```typescript
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    // 无鉴权，无 rate limit，无额外大小检查
    const result = await extractFileText(file);
```
- **影响**：任何人可并发调用此接口进行 DoS 攻击，耗尽服务器资源。
- **建议修复**：在 route 层增加 `Content-Length` 预检（拒绝 >50MB）；增加基本 Auth 或 IP rate limit；考虑在 `next.config.mjs` 设置 `api.bodyParser.sizeLimit`。
- **置信度**：高

---

### [MED-001] `EvidencePool` 在并行章节组中共享实例，`counter` 为全局累加，但各组并行写入无 mutex 保护

- **严重程度**：Medium
- **维度**：正确性 Bug
- **文件**：`lib/evidence-pool.ts:7-13` / `lib/report-engine.ts`
- **现象**：`EvidencePool` 在 `runChapterPhases` 中被创建一次，并作为同一实例传给所有 5 个并行章节组。`add()` 方法递增 `this.counter` 并写入 `this.items`。在单线程 Node.js 中，JS 的单线程特性确保 Map 操作不会并发——但由于章节组并行（`Promise.allSettled`），各组内章节是**串行**的，ev_id 不会冲突。然而，`toPromptContext()` 在每章写作前被调用，此时 pool 中只有 Phase 2 加入的证据（因为章节写作不调用 `pool.add()`），所以实际不存在 ev_id 冲突。**此问题置信度为中——逻辑上安全，但设计上令人疑惑且未来扩展时有隐患。**
- **影响**：当前无实际 Bug，但若未来章节写作时动态向 pool 添加证据，会出现 ev_id 竞态。
- **建议修复**：在设计注释中明确 EvidencePool 在章节写作阶段为只读；或改为每章写作使用 pool 的只读快照。
- **置信度**：中

---

### [MED-002] `citation-renumber.ts` 中 `orderedEvidenceIds` 数组存在稀疏空洞

- **严重程度**：Medium
- **维度**：正确性 Bug
- **文件**：`lib/citation-renumber.ts:44-46`
- **现象**：`orderedEvidenceIds[index - 1] = evId` 使用下标赋值创建数组，若某些 index 跳跃（如引用从 1 直接到 3），则 `orderedEvidenceIds[1]` 为 `undefined`，产生稀疏数组。后续 `formatReferences` 用 `.map((evId, i) => ...)` 迭代，`evId` 为 `undefined` 时 `evMap.get(undefined)` 返回 `undefined`，生成 "证据未找到" 参考文献条目。
- **代码片段**：
```typescript
const orderedEvidenceIds: string[] = [];
for (const [claimId, { index }] of footnoteOrder) {
  const evId = claim?.evidenceIds?.[0] ?? claimId;
  orderedEvidenceIds[index - 1] = evId;  // ← 可能产生稀疏数组
}
```
- **影响**：参考文献列表出现空洞条目（"证据未找到"），Word 文档中参考文献不完整。
- **建议修复**：改用 `Map<number, string>` 存储，最后按 key 排序生成数组，避免稀疏。
- **置信度**：高

---

### [MED-003] `docx-rendering.ts` 中 `renderInlineRuns` 的 pattern 使用字符类包含多码点 emoji，同 HIGH-007

- **严重程度**：Medium
- **维度**：正确性 Bug
- **文件**：`lib/docx-rendering.ts:31`
- **现象**：`/(\[(\d+)\][✅🟡⚠️❗]?)|([✅🟡⚠️❗])|(\*\*([^*\n]+)\*\*)/g` 中字符类 `[✅🟡⚠️❗]` 包含 `⚠️`（双码点），字符类无法正确匹配。
- **代码片段**：
```typescript
const pattern = /(\[(\d+)\][✅🟡⚠️❗]?)|([✅🟡⚠️❗])|(\*\*([^*\n]+)\*\*)/g;
```
- **影响**：`⚠️` 徽章在 Word 导出中不会被替换为彩色上标文字，而是原样出现（或 emoji 字体缺失显示为方块）。
- **建议修复**：同 HIGH-007，使用 `(✅|🟡|⚠️|❗)` 非字符类形式。
- **置信度**：高

---

### [MED-004] `term-normalize.ts` 的 CJK 提取正则 `[一-鿿]` 覆盖 Unicode Block 不完整

- **严重程度**：Medium
- **维度**：正确性 Bug
- **文件**：`lib/term-normalize.ts:29`
- **现象**：`[一-鿿]{2,6}` 仅覆盖 CJK Unified Ideographs 基本区（U+4E00–U+9FFF），遗漏 CJK Ext A（U+3400–U+4DBF）和 CJK Ext B（U+20000+，需要代理对）。常用汉字范围覆盖良好，但一些罕见字（如研究领域专业术语）可能被遗漏。
- **影响**：对含扩展汉字的专业术语（如某些化学/医学术语），`extractCandidateTerms` 可能漏提，导致归一化不完整；影响轻微。
- **建议修复**：将范围扩展为 `[㐀-鿿]` 或使用 Unicode property escape `\p{Script=Han}`（需 `u` flag）。
- **置信度**：中

---

### [MED-005] `source-tagger.ts` 的 `buildSkepticAppendix` 可信度分布表格含 emoji，在某些 Word 渲染下会崩坏

- **严重程度**：Medium
- **维度**：编排问题 / LLM 调用质量
- **文件**：`lib/source-tagger.ts:23-26`
- **现象**：附录 Markdown 表格标题含 `✅ 高 | 🟡 中 | ⚠️ 低 | ❗ 存疑`，这些 emoji 在 `export-docx/route.ts` 解析表格时，`makeCell` 直接用 `TextRun({text})` 包裹，但 Word 的 `SimSun` / `Times New Roman` 字体不包含这些 emoji，会显示为方块。
- **影响**：Word 文件中附录表格 emoji 显示异常（但并不崩溃）。
- **建议修复**：附录表格中使用纯文字替代（"高可信 / 中可信 / 低可信 / 存疑"），或在 docx 渲染层对表格内容也调用 `renderInlineRuns`。
- **置信度**：高

---

### [MED-006] `skeptic-cross-chapter/route.ts` 每章截取 20 条 claims，对长章节漏检

- **严重程度**：Medium
- **维度**：LLM 调用质量
- **文件**：`app/api/ai/skeptic-cross-chapter/route.ts:64`
- **现象**：`chs.slice(0, 20)` 硬限制每章 20 条 claim 传给跨章矛盾检测。章节 06（应用场景）要求 5000-6000 字并含 8-10 张表格，实际 claim 数量可能超过 50 条，前 20 条很可能不包含最重要的市场规模声明。
- **影响**：跨章矛盾检测覆盖不完整，可能遗漏最关键的数据矛盾。
- **建议修复**：不使用随机截取，而是优先选择 `confidence === 'low' || confidence === 'disputed'` 的 claims（它们更可能含矛盾），或按 claim 文本长度降序选取（较具体的声明矛盾风险更高）。
- **置信度**：高

---

### [MED-007] `editor/route.ts` 的 `llmWeaveDissents` 截取 markdown 前 20000 字，超长报告后半截不处理

- **严重程度**：Medium
- **维度**：LLM 调用质量
- **文件**：`app/api/ai/editor/route.ts:94`
- **现象**：`markdown.substring(0, 20000)` 硬截断，10 章报告总字数通常超过 30000 字，后 30% 章节的 dissent 无法被插入。
- **代码片段**：
```typescript
const user = `## 研报正文\n\n${markdown.substring(0, 20000)}\n\n---\n\n## 需要插入的反方论点\n\n${dissentText}`;
```
- **影响**：第 7-10 章的反方论点（风险评估、结语等）实际不会被 weave 进正文；这是已知设计限制，但未在代码注释或日志中说明。
- **建议修复**：分章节进行 weave（按章传入 body + 该章 dissents），或明确注释此限制并在 `skippedSteps` 中记录章节覆盖率。
- **置信度**：高

---

### [MED-008] `export-docx/route.ts` 表格检测逻辑错误——使用 `lines[i+1].includes('---')` 可能误触发

- **严重程度**：Medium
- **维度**：正确性 Bug
- **文件**：`app/api/ai/export-docx/route.ts:106`
- **现象**：`lines[i + 1].includes('---')` 不区分 Markdown 表格分隔行（`|---|---|`）和水平分隔线（`---`）。若正文中某个以 `|` 开头的行后面紧跟一个独立的 `---` 分隔线（章节分隔），会被错误识别为表格，触发 `makeTable`，但内容不合法，`makeTable` 返回 `null` 并被忽略——数据丢失。
- **代码片段**：
```typescript
if (trimmed.startsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
```
- **影响**：特定格式（`|` 行后跟 `---`）的段落被静默丢弃。
- **建议修复**：改为检测 `lines[i+1].match(/^\|[\s\-:|]+\|/)` 以确认是 Markdown 表格分隔行格式。
- **置信度**：中

---

### [MED-009] `skeptic-review/route.ts` 返回 500 而非友好降级响应

- **严重程度**：Medium
- **维度**：可观测性
- **文件**：`app/api/ai/skeptic-review/route.ts:132-135`
- **现象**：最外层 catch 返回 `{ error: msg }` status 500，调用方（`generate-full-report`）检测到 `!res.ok` 会 warn 并返回 null（降级）。但 500 状态对运维监控而言误报率高（会触发告警）；而实际上 Skeptic 失败是可接受的降级场景，不是服务器崩溃。
- **建议修复**：Skeptic 可接受的失败（如 DeepSeek 返回空）应返回 200 + 空结果（类似 cross-chapter 的做法），而非 500；真正的服务端异常才用 500。
- **置信度**：中

---

### [MED-010] `generate-full-report/route.ts` allReviewedClaims 可能包含重复 claim（fallback 逻辑追加了已有 ID）

- **严重程度**：Medium
- **维度**：正确性 Bug
- **文件**：`app/api/ai/generate-full-report/route.ts:99-105`
- **现象**：fallback 逻辑用 `reviewedClaimIds` Set 防重，但 `allReviewedClaims` 在此之前已通过 `perChapterReports.flatMap` 填充，若某章 Skeptic 返回了 claims（但 `res.ok` 为 false 时已返回 null，所以此路径不会触发）——实际逻辑正确，但读起来令人困惑：`reviewedClaimIds` 是从 `allReviewedClaims` 本身构建的，若 flatMap 后已有重复 claim（Skeptic 对同一 claim 返回两次），Set 无法去重 `allReviewedClaims` 内部已有的重复。
- **影响**：若 Skeptic 返回含重复 id 的 claims 数组，`skepticSummary.total` 会虚高，附录表格重复显示同一 claim。
- **建议修复**：在 flatMap 之后对 `allReviewedClaims` 按 `id` 去重：`Array.from(new Map(claims.map(c => [c.id, c])).values())`。
- **置信度**：中

---

### [MED-011] `next.config.mjs` 中 `experimental.serverComponentsExternalPackages` 在 Next.js 14 中已迁移到 `serverExternalPackages`

- **严重程度**：Medium
- **维度**：可维护性
- **文件**：`next.config.mjs:4`
- **现象**：`experimental.serverComponentsExternalPackages` 在 Next.js 15 中已移至顶层 `serverExternalPackages`；在 Next.js 14.2.x 中该字段仍有效但已被标记为 deprecated，未来升级 Next.js 时将静默失效，导致 pdf-parse/mammoth 等服务端包被客户端 bundle 打包而报错。
- **影响**：升级 Next.js 后服务端包打包失败，需要手动修正。
- **建议修复**：现在改为 `serverExternalPackages: ['pdf-parse', 'mammoth', 'pptxgenjs', 'docx']`（顶层字段），Next.js 14.2 也支持这种写法。
- **置信度**：中

---

### [MED-012] `export-docx/route.ts` 在 `inRefSection=true` 时，`buildRefParagraph` 返回 null 的行后续仍走普通段落渲染，可能重复渲染

- **严重程度**：Medium
- **维度**：正确性 Bug
- **文件**：`app/api/ai/export-docx/route.ts:197-204`
- **现象**：`if (inRefSection)` 块中，若 `buildRefParagraph(trimmed)` 返回 `null`（行不匹配参考文献格式），代码 `continue` 至下一行——但实际代码在 `if (refPara)` 后才 `continue`，若 `refPara` 为 `null`，代码**不会** continue，而是继续执行后面的普通段落逻辑，将该行以首行缩进段落渲染。这是正确的降级，但 `inRefSection` 始终为 true，一些段落（如附录标题）后面的普通文本也会以 indent 渲染，视觉上不一致。
- **影响**：参考文献区域中的非标准格式行会有首行缩进，与参考文献条目不一致。
- **建议修复**：在参考文献区域中对非匹配行也去掉 firstLine indent；或在 `inRefSection` 时用 `refPara ?? new Paragraph({children: renderInlineRuns(trimmed)})` 统一渲染。
- **置信度**：中

---

### [LOW-001] `safeParseJson` / `callDeepSeek` 在多个 route 中重复定义

- **严重程度**：Low
- **维度**：可维护性
- **文件**：`app/api/ai/skeptic-review/route.ts:169` 和 `app/api/ai/editor/route.ts:17`
- **现象**：`safeParseJson` 定义在 skeptic-review，`callDeepSeek` 定义在 editor；skeptic-cross-chapter 又有自己的内联 JSON parse 逻辑（try/catch with `{}.indexOf`）；三处逻辑相似但不同步。
- **建议修复**：提取到 `lib/llm-utils.ts`，导出 `safeParseJson`, `callDeepSeek`, `callMiniMax`。
- **置信度**：高

---

### [LOW-002] 模型名称散落在多处，应集中配置

- **严重程度**：Low
- **维度**：可维护性
- **文件**：多处
- **现象**：`deepseek-v4-flash` 出现 3 次（skeptic-review, skeptic-cross-chapter, editor）；`MiniMax-M2.5-highspeed` 出现 2 次（generate, chat）+ report-engine 中；更换模型需要多处修改，容易遗漏。
- **建议修复**：新建 `lib/llm-config.ts`，导出 `DEEPSEEK_MODEL`, `MINIMAX_MODEL` 常量。
- **置信度**：高

---

### [LOW-003] `chat/route.ts` messages 无长度/条数上限，对话历史无限增长

- **严重程度**：Low
- **维度**：LLM 调用质量
- **文件**：`app/api/ai/chat/route.ts:27`
- **现象**：`messages` 直接全量传给 MiniMax，无条数截断。随对话增长，token 消耗增加并最终触发上下文超限（MiniMax M2.5 支持 ~128k token，但无保护则费用无限增长）。
- **建议修复**：限制 `messages.slice(-30)` 或实现滑动窗口。
- **置信度**：高

---

### [LOW-004] `extractFileText.ts` 对 `.doc`（老格式 Word）支持不完整

- **严重程度**：Low
- **维度**：正确性 Bug
- **文件**：`lib/extractFileText.ts:49`
- **现象**：正则 `/\.(docx?|doc)$/` 匹配 `.doc` 和 `.docx`，但 `mammoth` 仅支持 `.docx` 格式（`.doc` 是旧二进制格式），对 `.doc` 文件 `mammoth.extractRawText` 会抛出错误，被 catch 并返回 warn——功能降级，但用户可能不理解为什么 `.doc` 无法读取。
- **建议修复**：在文件名检查中明确区分 `.doc`（返回"不支持旧版 Word 格式，请转存为 .docx"的 warn）和 `.docx`。
- **置信度**：高

---

### [LOW-005] `generate/route.ts` 中 `parseSections` 对第一个 section 的 fallback 逻辑含义不清晰

- **严重程度**：Low
- **维度**：可维护性
- **文件**：`app/api/ai/generate/route.ts:46-48`
- **现象**：`if (i === 0) result[id] = content.trim()` — 若第一个 section 的标题在 LLM 输出中找不到，整个 content 被归入第一个 section。这可能导致所有内容被误归到 `tech` section，其他 section 为空。
- **建议修复**：改为返回空字符串并记录 warn，或不做 fallback，让调用方决定如何处理缺失 section。
- **置信度**：中

---

### [LOW-006] `source-tagger.ts` 的 `tagSources` 对 body 末尾是否已有换行未做检查，可能产生不对称空行

- **严重程度**：Low
- **维度**：正确性 Bug
- **文件**：`lib/source-tagger.ts:30`
- **现象**：`return body + '\n\n' + defs.join('\n')` 不论 body 末尾是否已有换行，都无条件追加两个换行。若 body 末尾已有 `\n\n`，会产生 4 个换行，在 Markdown 渲染中显示为明显的额外空白。
- **建议修复**：`return body.trimEnd() + '\n\n' + defs.join('\n')`。
- **置信度**：高

---

### [LOW-007] `export-docx/route.ts` `makeTable` 对单行表格（仅有 header 无 data）渲染为只有表头的表格，未跳过

- **严重程度**：Low
- **维度**：正确性 Bug
- **文件**：`app/api/ai/export-docx/route.ts:348-389`
- **现象**：`rows.length < 1` 时返回 null，但若原始 Markdown 表格只有 header 行（因 filter 掉了分隔行后只剩 1 行），`rows.length === 1`，会生成只有一行的 Table，Word 显示为孤立的表头。
- **影响**：LLM 偶尔生成不完整表格时，Word 文件中出现只有列名的空表格。
- **建议修复**：`if (rows.length < 2) return null`。
- **置信度**：高

---

## 维度统计

| 维度 | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| 正确性 Bug | 0 | 4 (H001, H003, H004, H007) | 6 (M002, M003, M004, M008, M010, M012) | 3 (L004, L006, L007) |
| 编排问题 | 2 (C002, C003) | 2 (H002, H008) | 3 (M001, M005, M007) | 0 |
| 安全与密钥 | 1 (C001) | 1 (H009) | 0 | 0 |
| LLM 调用质量 | 0 | 2 (H005, H006) | 2 (M006, M009) | 1 (L003) |
| 可观测性 | 0 | 0 | 1 (M009) | 0 |
| 可维护性 | 0 | 0 | 1 (M011) | 3 (L001, L002, L005) |

---

## 文件覆盖情况

| 文件 | 是否已检查 | 发现问题数 |
|------|-----------|------------|
| `app/api/ai/generate-full-report/route.ts` | ✅ | 6 |
| `app/api/ai/generate/route.ts` | ✅ | 2 |
| `app/api/ai/skeptic-review/route.ts` | ✅ | 2 |
| `app/api/ai/skeptic-cross-chapter/route.ts` | ✅ | 1 |
| `app/api/ai/editor/route.ts` | ✅ | 3 |
| `app/api/ai/export-docx/route.ts` | ✅ | 3 |
| `app/api/ai/chat/route.ts` | ✅ | 1 |
| `app/api/ai/extract-text/route.ts` | ✅ | 1 |
| `lib/evidence-pool.ts` | ✅ | 1 |
| `lib/citation-renumber.ts` | ✅ | 1 |
| `lib/citation-placeholder.ts` | ✅ | 1 |
| `lib/term-normalize.ts` | ✅ | 1 |
| `lib/hedge-inject.ts` | ✅ | 1 |
| `lib/source-tagger.ts` | ✅ | 2 |
| `lib/docx-rendering.ts` | ✅ | 1 |
| `lib/serper.ts` | ✅ | 1 |
| `lib/extractFileText.ts` | ✅ | 1 |
| `lib/types.ts` | ✅ | 0 |
| `lib/report-engine.ts` | ✅ | 0 |
| `next.config.mjs` | ✅ | 2 |
| `package.json` | ✅ | 0 |
| `.gitignore` | ✅ | 0 |

---

## 我没有检查到的地方

- **前端页面代码**（`app/(app)/outputs/page.tsx` 等）：未检查前端是否将 API 响应的 `skepticSummary` 字段展示给用户，或是否有 XSS 风险（`dangerouslySetInnerHTML`）。
- **运行时行为**：由于仅做静态分析，无法确认 MiniMax M2.5-highspeed 的实际 context window 大小（影响 HIGH-008 和 LOW-003 的实际 token 预算计算）。
- **`app/api/ai/generate-pptx/route.ts`**：未在审计范围内，未检查。
- **`app/api/ai/evaluate/route.ts`**：未在审计范围内，未检查。
- **Vercel/Railway 实际 `maxDuration` 上限**：需查阅平台文档确认 CRIT-003 的实际限制值；本报告基于公开文档数据（Vercel Hobby: 60s, Pro: 300s）。
- **`pdf-parse` v2 API 正确性**：`new PDFParse({ data: buf }).getText()` 是否是 v2 的正确调用方式未在本次静态审计中通过文档二次确认，仅基于代码注释判断。
- **`package.json` 依赖安全漏洞**：未运行 `npm audit`，依赖版本的 CVE 情况未检查。

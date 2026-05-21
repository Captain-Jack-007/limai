import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import { getSlidePrompt, buildOutlineSystem, buildOutlineUser } from '@/lib/prompts/ppt-agent';

export const maxDuration = 300;

const MINIMAX_API_URL = 'https://api.minimaxi.com/v1/chat/completions';
const MINIMAX_MODEL = 'MiniMax-M2.5-highspeed';
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 8000;

// ── Theme ──────────────────────────────────────────────────────────────────────
const T = {
  BG: '0B1437',
  CARD: '0F1E4A',
  BORDER: '1E3A6A',
  CYAN: '06B6D4',
  PURPLE: '8B5CF6',
  GOLD: 'F59E0B',
  WHITE: 'FFFFFF',
  GRAY: '94A3B8',
  DARK: '64748B',
  RED: 'EF4444',
  GREEN: '10B981',
} as const;

const W = 13.33; // LAYOUT_WIDE width (inches)
const H = 7.5;   // LAYOUT_WIDE height (inches)

// ── Types ──────────────────────────────────────────────────────────────────────

interface Card { icon?: string; title: string; body: string; stat?: string }
interface Member { name: string; role: string; bio: string }
interface Metric { label: string; value: string; unit?: string }
interface Milestone { quarter: string; title: string; done: boolean }
interface ChartItem { label: string; value: number }

interface PptSlide {
  index: number;
  slide_type: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  body?: string;
  cards?: Card[];
  members?: Member[];
  metrics?: Metric[];
  milestones?: Milestone[];
  chart_values?: ChartItem[];
  ask_amount?: string;
  ask_use?: ChartItem[];
  contact_name?: string;
  contact_email?: string;
  contact_website?: string;
  notes?: string;
}

interface PptOutline {
  project_name: string;
  tagline: string;
  slides: PptSlide[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function stripThinking(s: string) {
  return s.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

function extractJson(s: string): string {
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('AI 未返回 JSON 格式');
  return s.slice(start, end + 1);
}


// ── File text extraction ───────────────────────────────────────────────────────

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (/\.(txt|md|csv)$/.test(name)) return file.text();
  const buf = Buffer.from(await file.arrayBuffer());
  if (name.endsWith('.pdf')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buf);
    if (!result.text?.trim()) throw new Error('PDF 中未检测到可读文字（可能是扫描件）');
    return result.text;
  }
  if (/\.(docx?|doc)$/.test(name)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer: buf });
    return result.value;
  }
  throw new Error(`不支持的文件格式：${file.name.split('.').pop()?.toUpperCase()}`);
}

// ── Two-phase PPT generation ───────────────────────────────────────────────────

const MAX_CONCURRENCY = 4;

interface OutlineSlot {
  index: number;
  slide_type: PptSlide['slide_type'];
  title: string;
  focus: string;
}

interface OutlineSchema {
  project_name: string;
  tagline: string;
  slides: OutlineSlot[];
}

async function callMiniMax(
  systemPrompt: string,
  userContent: string,
  maxTokens: number,
  timeoutMs: number,
  apiKey: string,
): Promise<string> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(tid);
  }
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`MiniMax HTTP ${response.status}: ${err.slice(0, 200)}`);
  }
  const data = await response.json();
  if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax: ${data.base_resp.status_msg}`);
  }
  const raw = data.choices?.[0]?.message?.content ?? '';
  return stripThinking(raw);
}

async function generateOutline(text: string, fileName: string, apiKey: string): Promise<OutlineSchema> {
  const truncated = text.slice(0, MAX_TEXT_CHARS);
  const system = buildOutlineSystem();
  const user = buildOutlineUser(truncated, fileName);
  const raw = await callMiniMax(system, user, 2000, 45000, apiKey);
  return JSON.parse(extractJson(raw)) as OutlineSchema;
}

async function generateSlide(
  entry: OutlineSlot,
  fullText: string,
  projectName: string,
  apiKey: string,
): Promise<PptSlide> {
  const { system, user } = getSlidePrompt(entry.slide_type, {
    index: entry.index,
    slideType: entry.slide_type,
    projectName,
    fullText: fullText.slice(0, MAX_TEXT_CHARS),
    focus: entry.focus,
    title: entry.title,
  });
  const raw = await callMiniMax(system, user, 1500, 60000, apiKey);
  const parsed = JSON.parse(extractJson(raw)) as Partial<PptSlide>;
  return {
    ...parsed,
    index: entry.index,
    slide_type: entry.slide_type,
    title: parsed.title ?? entry.title,
  } as PptSlide;
}

function fallbackSlide(entry: OutlineSlot): PptSlide {
  return {
    index: entry.index,
    slide_type: entry.slide_type,
    title: entry.title,
    body: entry.focus,
  };
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      try {
        results[i] = { status: 'fulfilled', value: await tasks[i]() };
      } catch (err) {
        results[i] = { status: 'rejected', reason: err };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

// ── Shared slide chrome ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addChrome(s: any, idx: number, total: number) {
  // BG
  s.background = { color: T.BG };

  // Top accent bar
  s.addShape('rect', { x: 0, y: 0, w: W, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  // Bottom bar
  s.addShape('rect', { x: 0, y: H - 0.32, w: W, h: 0.32, fill: { color: T.CARD }, line: { color: T.CARD, width: 0 } });

  // Page number
  s.addText(`${idx} / ${total}`, {
    x: W - 1.1, y: H - 0.28, w: 0.9, h: 0.22,
    fontSize: 9, color: T.DARK, align: 'right',
  });
}

// ── Slide renderers ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Slide = any;

function renderCover(s: Slide, slide: PptSlide, outline: PptOutline) {
  s.background = { color: T.BG };
  s.addShape('rect', { x: 0, y: 0, w: W, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  // Large decorative circle top-right
  s.addShape('ellipse', { x: W - 5, y: -2, w: 7, h: 7, fill: { color: T.PURPLE, transparency: 88 }, line: { color: T.PURPLE, width: 0 } });
  s.addShape('ellipse', { x: W - 3.5, y: H - 3, w: 4.5, h: 4.5, fill: { color: T.CYAN, transparency: 92 }, line: { color: T.CYAN, width: 0 } });

  // Tagline badge
  const tl = slide.tagline || outline.tagline;
  s.addShape('rect', { x: 0.7, y: 0.28, w: Math.min(tl.length * 0.14 + 0.4, 3.5), h: 0.35, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 }, rectRadius: 0.05 });
  s.addText(tl, { x: 0.7, y: 0.28, w: 3.5, h: 0.35, fontSize: 11, bold: true, color: T.BG, align: 'center', valign: 'middle' });

  // Main title
  s.addText(slide.title, {
    x: 0.7, y: 1.6, w: W * 0.65, h: 1.9,
    fontSize: 52, bold: true, color: T.WHITE, align: 'left',
    charSpacing: -0.5,
  });

  // Cyan divider line
  s.addShape('rect', { x: 0.7, y: 3.65, w: 3.5, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  // Subtitle
  s.addText(slide.subtitle ?? outline.tagline, {
    x: 0.7, y: 3.85, w: W * 0.65, h: 0.9,
    fontSize: 20, color: T.GRAY, align: 'left',
  });

  // Year bottom-left
  s.addText(new Date().getFullYear().toString(), {
    x: 0.7, y: H - 0.55, w: 1.5, h: 0.35,
    fontSize: 12, color: T.DARK, align: 'left',
  });

  // Decorative small squares
  for (let i = 0; i < 5; i++) {
    s.addShape('rect', {
      x: 0.7 + i * 0.25, y: H - 0.12, w: 0.18, h: 0.06,
      fill: { color: i === 0 ? T.CYAN : T.PURPLE, transparency: i * 15 },
      line: { color: T.CYAN, width: 0 },
    });
  }
}

function renderPainpoints(s: Slide, slide: PptSlide, _outline: PptOutline, idx: number, total: number) {
  addChrome(s, idx, total);

  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  const cards = slide.cards ?? [];
  const cols = Math.min(cards.length, 3);
  const cardW = (W - 1.2 - (cols - 1) * 0.3) / cols;
  const cardH = H - 1.5;
  const startX = 0.6;
  const startY = 1.1;

  cards.slice(0, 3).forEach((card, i) => {
    const x = startX + i * (cardW + 0.3);

    // Card bg
    s.addShape('rect', { x, y: startY, w: cardW, h: cardH, fill: { color: T.CARD }, line: { color: T.BORDER, width: 0.75 }, rectRadius: 0.1 });

    // Top color stripe
    const colors = [T.RED, T.GOLD, T.PURPLE];
    s.addShape('rect', { x, y: startY, w: cardW, h: 0.06, fill: { color: colors[i % 3] }, line: { color: colors[i % 3], width: 0 }, rectRadius: 0.1 });

    // Icon circle
    s.addShape('ellipse', { x: x + cardW / 2 - 0.42, y: startY + 0.22, w: 0.84, h: 0.84, fill: { color: colors[i % 3], transparency: 80 }, line: { color: colors[i % 3], width: 1 } });
    s.addText(card.icon ?? '!', { x: x + cardW / 2 - 0.42, y: startY + 0.22, w: 0.84, h: 0.84, fontSize: 20, bold: true, color: colors[i % 3], align: 'center', valign: 'middle' });

    // Stat number (big)
    if (card.stat) {
      s.addText(card.stat, { x: x + 0.15, y: startY + 1.25, w: cardW - 0.3, h: 0.55, fontSize: 15, bold: true, color: colors[i % 3], align: 'center' });
    }

    // Title
    s.addText(card.title, { x: x + 0.15, y: startY + 1.9, w: cardW - 0.3, h: 0.5, fontSize: 16, bold: true, color: T.WHITE, align: 'center' });

    // Body
    s.addText(card.body, { x: x + 0.2, y: startY + 2.5, w: cardW - 0.4, h: cardH - 2.9, fontSize: 13, color: T.GRAY, align: 'center', valign: 'top' });
  });
}

function renderSolution(s: Slide, slide: PptSlide, _outline: PptOutline, idx: number, total: number) {
  addChrome(s, idx, total);

  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  // Left: body text area
  const leftW = W * 0.42;
  s.addShape('rect', { x: 0.6, y: 1.1, w: leftW, h: H - 1.6, fill: { color: T.CARD }, line: { color: T.BORDER, width: 0.75 }, rectRadius: 0.1 });
  s.addShape('rect', { x: 0.6, y: 1.1, w: 0.06, h: H - 1.6, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 }, rectRadius: 0.1 });

  if (slide.body) {
    s.addText(slide.body, { x: 0.9, y: 1.4, w: leftW - 0.5, h: 2.0, fontSize: 15, color: T.WHITE, valign: 'top' });
  }

  // Decorative geometric element in left panel
  s.addShape('ellipse', { x: 0.8, y: 3.6, w: 1.2, h: 1.2, fill: { color: T.CYAN, transparency: 88 }, line: { color: T.CYAN, width: 1, transparency: 60 } });
  s.addShape('ellipse', { x: 1.3, y: 4.0, w: 0.7, h: 0.7, fill: { color: T.PURPLE, transparency: 75 }, line: { color: T.PURPLE, width: 0 } });

  // Right: feature cards
  const cards = slide.cards ?? [];
  const rightX = 0.6 + leftW + 0.35;
  const rightW = W - rightX - 0.6;
  const cardH = (H - 1.6) / Math.max(cards.length, 1) - 0.15;

  cards.forEach((card, i) => {
    const y = 1.1 + i * (cardH + 0.15);
    s.addShape('rect', { x: rightX, y, w: rightW, h: cardH, fill: { color: T.CARD }, line: { color: T.BORDER, width: 0.75 }, rectRadius: 0.1 });

    // Left number badge
    const colors = [T.CYAN, T.PURPLE, T.GOLD];
    s.addShape('ellipse', { x: rightX + 0.15, y: y + cardH / 2 - 0.25, w: 0.5, h: 0.5, fill: { color: colors[i % 3] }, line: { color: colors[i % 3], width: 0 } });
    s.addText(String(i + 1), { x: rightX + 0.15, y: y + cardH / 2 - 0.25, w: 0.5, h: 0.5, fontSize: 14, bold: true, color: T.BG, align: 'center', valign: 'middle' });

    s.addText(card.title, { x: rightX + 0.85, y: y + 0.08, w: rightW - 1.0, h: 0.35, fontSize: 15, bold: true, color: T.WHITE });
    s.addText(card.body, { x: rightX + 0.85, y: y + 0.42, w: rightW - 1.0, h: cardH - 0.5, fontSize: 12, color: T.GRAY, valign: 'top' });
  });
}

function renderMarket(pptx: InstanceType<typeof PptxGenJS>, s: Slide, slide: PptSlide, idx: number, total: number) {
  addChrome(s, idx, total);
  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  const metrics = slide.metrics ?? [];
  const metricColors = [T.CYAN, T.PURPLE, T.GOLD];
  const cardW = (W * 0.45 - 0.2) / Math.max(metrics.length, 1) - 0.15;

  // Left: stacked metric cards
  metrics.forEach((m, i) => {
    const y = 1.1 + i * ((H - 1.6) / Math.max(metrics.length, 1));
    const mH = (H - 1.6) / Math.max(metrics.length, 1) - 0.2;
    s.addShape('rect', { x: 0.6, y, w: W * 0.45, h: mH, fill: { color: T.CARD }, line: { color: metricColors[i % 3], width: 1 }, rectRadius: 0.1 });
    s.addShape('rect', { x: 0.6, y, w: 0.07, h: mH, fill: { color: metricColors[i % 3] }, line: { color: metricColors[i % 3], width: 0 }, rectRadius: 0.1 });

    s.addText(m.label, { x: 0.9, y: y + 0.12, w: W * 0.45 - 0.5, h: 0.35, fontSize: 13, color: T.GRAY });
    s.addText(m.value, { x: 0.9, y: y + 0.45, w: W * 0.45 - 0.5, h: 0.65, fontSize: 36, bold: true, color: metricColors[i % 3] });
    if (m.unit) s.addText(m.unit, { x: 0.9 + 1.6, y: y + 0.55, w: 1.5, h: 0.4, fontSize: 16, color: T.GRAY });
  });

  // Right: doughnut chart
  const chartData = slide.chart_values ?? [];
  if (chartData.length > 0) {
    const chartX = 0.6 + W * 0.45 + 0.4;
    const chartW = W - chartX - 0.6;

    s.addChart(pptx.ChartType.doughnut, [{ name: 'Market', labels: chartData.map(d => d.label), values: chartData.map(d => d.value) }], {
      x: chartX, y: 1.05, w: chartW, h: H - 1.7,
      dataLabelFontSize: 11,
      dataLabelColor: T.WHITE,
      chartColors: [T.CYAN, T.PURPLE, T.GOLD],
      showLegend: true,
      legendFontSize: 12,
      legendColor: T.GRAY,
      legendPos: 'b',
      holeSize: 55,
    });
  }

}

function renderTraction(s: Slide, slide: PptSlide, idx: number, total: number) {
  addChrome(s, idx, total);
  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  const metrics = slide.metrics ?? [];
  const cols = Math.min(metrics.length, 4);
  const cardW = (W - 1.2 - (cols - 1) * 0.3) / cols;
  const colors = [T.CYAN, T.PURPLE, T.GOLD, T.GREEN];

  metrics.slice(0, 4).forEach((m, i) => {
    const x = 0.6 + i * (cardW + 0.3);
    const y = 1.2;
    const cH = H - 1.8;
    const c = colors[i % 4];

    s.addShape('rect', { x, y, w: cardW, h: cH, fill: { color: T.CARD }, line: { color: c, width: 1 }, rectRadius: 0.12 });

    // Top glow strip
    s.addShape('rect', { x, y, w: cardW, h: 0.08, fill: { color: c }, line: { color: c, width: 0 }, rectRadius: 0.12 });

    // Big number
    const val = m.value + (m.unit ?? '');
    s.addText(val, { x: x + 0.1, y: y + 0.5, w: cardW - 0.2, h: 1.8, fontSize: 38, bold: true, color: c, align: 'center', valign: 'middle' });

    // Label
    s.addText(m.label, { x: x + 0.1, y: y + 2.5, w: cardW - 0.2, h: 0.6, fontSize: 14, color: T.GRAY, align: 'center' });

    // Decorative circle bottom
    s.addShape('ellipse', { x: x + cardW / 2 - 0.8, y: y + cH - 1.2, w: 1.6, h: 1.6, fill: { color: c, transparency: 93 }, line: { color: c, width: 0 } });
  });
}

function renderBusinessModel(pptx: InstanceType<typeof PptxGenJS>, s: Slide, slide: PptSlide, idx: number, total: number) {
  addChrome(s, idx, total);
  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  const cards = slide.cards ?? [];
  const leftW = W * 0.5 - 0.2;
  const cardH = (H - 1.6) / Math.max(cards.length, 1) - 0.15;
  const colors = [T.CYAN, T.PURPLE, T.GOLD];

  cards.forEach((card, i) => {
    const y = 1.1 + i * (cardH + 0.15);
    s.addShape('rect', { x: 0.6, y, w: leftW, h: cardH, fill: { color: T.CARD }, line: { color: T.BORDER, width: 0.75 }, rectRadius: 0.1 });
    s.addShape('rect', { x: 0.6, y, w: 0.07, h: cardH, fill: { color: colors[i % 3] }, line: { color: colors[i % 3], width: 0 }, rectRadius: 0.1 });
    s.addText(card.title, { x: 0.9, y: y + 0.1, w: leftW - 0.5, h: 0.4, fontSize: 15, bold: true, color: T.WHITE });
    s.addText(card.body, { x: 0.9, y: y + 0.48, w: leftW - 0.5, h: cardH - 0.6, fontSize: 12, color: T.GRAY });
  });

  // Right: doughnut
  const chartData = slide.chart_values ?? [];
  const rightX = 0.6 + leftW + 0.4;
  const rightW = W - rightX - 0.6;
  if (chartData.length > 0) {
    s.addChart(pptx.ChartType.doughnut, [{ name: 'Revenue', labels: chartData.map(d => d.label), values: chartData.map(d => d.value) }], {
      x: rightX, y: 1.05, w: rightW, h: H - 1.7,
      dataLabelFontSize: 11,
      dataLabelColor: T.WHITE,
      chartColors: [T.CYAN, T.PURPLE, T.GOLD, T.GREEN],
      showLegend: true,
      legendFontSize: 11,
      legendColor: T.GRAY,
      legendPos: 'b',
      holeSize: 55,
    });
  }
}

function renderCompetition(s: Slide, slide: PptSlide, idx: number, total: number) {
  addChrome(s, idx, total);
  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  const cards = (slide.cards ?? []).slice(0, 4);
  const colGap = 0.3;
  const rowGap = 0.25;
  const cW = (W - 1.2 - colGap) / 2;
  const cH = (H - 1.6 - rowGap) / 2;
  const colors = [T.CYAN, T.GOLD, T.PURPLE, T.GREEN];

  cards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * (cW + colGap);
    const y = 1.1 + row * (cH + rowGap);
    const c = colors[i % 4];

    s.addShape('rect', { x, y, w: cW, h: cH, fill: { color: T.CARD }, line: { color: c, width: 0.75 }, rectRadius: 0.1 });

    // Icon badge top-left
    s.addShape('ellipse', { x: x + 0.2, y: y + 0.18, w: 0.55, h: 0.55, fill: { color: c, transparency: 75 }, line: { color: c, width: 0 } });
    s.addText(card.icon ?? '★', { x: x + 0.2, y: y + 0.18, w: 0.55, h: 0.55, fontSize: 14, color: c, align: 'center', valign: 'middle' });

    s.addText(card.title, { x: x + 0.92, y: y + 0.18, w: cW - 1.1, h: 0.42, fontSize: 15, bold: true, color: T.WHITE, valign: 'middle' });
    s.addText(card.body, { x: x + 0.2, y: y + 0.85, w: cW - 0.4, h: cH - 1.05, fontSize: 12, color: T.GRAY, valign: 'top' });
  });
}

function renderTeam(s: Slide, slide: PptSlide, idx: number, total: number) {
  addChrome(s, idx, total);
  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  const members = slide.members ?? [];
  const cols = Math.min(members.length, 3);
  const cW = (W - 1.2 - (cols - 1) * 0.35) / cols;
  const cH = H - 1.65;
  const colors = [T.CYAN, T.PURPLE, T.GOLD];

  members.slice(0, 3).forEach((m, i) => {
    const x = 0.6 + i * (cW + 0.35);
    const y = 1.15;
    const c = colors[i % 3];

    s.addShape('rect', { x, y, w: cW, h: cH, fill: { color: T.CARD }, line: { color: T.BORDER, width: 0.75 }, rectRadius: 0.12 });

    // Avatar circle with initials
    const initials = m.name.slice(0, 2);
    s.addShape('ellipse', { x: x + cW / 2 - 0.7, y: y + 0.3, w: 1.4, h: 1.4, fill: { color: c, transparency: 20 }, line: { color: c, width: 2 } });
    s.addText(initials, { x: x + cW / 2 - 0.7, y: y + 0.3, w: 1.4, h: 1.4, fontSize: 26, bold: true, color: T.WHITE, align: 'center', valign: 'middle' });

    s.addText(m.name, { x: x + 0.15, y: y + 1.88, w: cW - 0.3, h: 0.45, fontSize: 17, bold: true, color: T.WHITE, align: 'center' });
    s.addText(m.role, { x: x + 0.15, y: y + 2.32, w: cW - 0.3, h: 0.38, fontSize: 12, bold: true, color: c, align: 'center' });

    // Divider
    s.addShape('rect', { x: x + 0.3, y: y + 2.82, w: cW - 0.6, h: 0.04, fill: { color: T.BORDER }, line: { color: T.BORDER, width: 0 } });

    s.addText(m.bio, { x: x + 0.2, y: y + 3.0, w: cW - 0.4, h: cH - 3.2, fontSize: 11.5, color: T.GRAY, align: 'center', valign: 'top' });
  });
}

function renderFinance(pptx: InstanceType<typeof PptxGenJS>, s: Slide, slide: PptSlide, idx: number, total: number) {
  addChrome(s, idx, total);
  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  const chartData = slide.chart_values ?? [];
  if (chartData.length > 0) {
    s.addChart(pptx.ChartType.bar, [{ name: '收入（万元）', labels: chartData.map(d => d.label), values: chartData.map(d => d.value) }], {
      x: 0.6, y: 1.0, w: W * 0.62, h: H - 2.6,
      barDir: 'col',
      chartColors: [T.CYAN],
      dataLabelFontSize: 10,
      dataLabelColor: T.WHITE,
      showValue: true,
      catAxisLabelColor: T.GRAY,
      catAxisLabelFontSize: 11,
      valAxisLabelColor: T.GRAY,
      valAxisLabelFontSize: 10,
    });
  }

  // Right: key metrics
  const metrics = slide.metrics ?? [];
  const rightX = 0.6 + W * 0.62 + 0.4;
  const rightW = W - rightX - 0.6;
  const colors = [T.CYAN, T.GOLD, T.GREEN];

  metrics.forEach((m, i) => {
    const mH = 1.4;
    const y = 1.0 + i * (mH + 0.3);
    s.addShape('rect', { x: rightX, y, w: rightW, h: mH, fill: { color: T.CARD }, line: { color: colors[i % 3], width: 0.75 }, rectRadius: 0.1 });
    s.addText(m.label, { x: rightX + 0.18, y: y + 0.12, w: rightW - 0.36, h: 0.38, fontSize: 12, color: T.GRAY });
    s.addText(m.value + (m.unit ?? ''), { x: rightX + 0.18, y: y + 0.5, w: rightW - 0.36, h: 0.7, fontSize: 26, bold: true, color: colors[i % 3] });
  });

  // Source label
  s.addText('单位：万元人民币', { x: 0.6, y: H - 0.75, w: 3, h: 0.28, fontSize: 10, color: T.DARK });
}

function renderRoadmap(s: Slide, slide: PptSlide, idx: number, total: number) {
  addChrome(s, idx, total);
  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  const milestones = slide.milestones ?? [];
  const n = milestones.length;
  if (n === 0) return;

  const timelineY = H / 2;
  const startX = 0.9;
  const endX = W - 0.9;
  const step = (endX - startX) / Math.max(n - 1, 1);

  // Timeline line
  s.addShape('rect', { x: startX, y: timelineY - 0.04, w: endX - startX, h: 0.08, fill: { color: T.BORDER }, line: { color: T.BORDER, width: 0 } });

  milestones.forEach((m, i) => {
    const cx = startX + i * step;
    const above = i % 2 === 0;
    const c = m.done ? T.CYAN : T.DARK;

    // Node dot
    s.addShape('ellipse', { x: cx - 0.2, y: timelineY - 0.2, w: 0.4, h: 0.4, fill: { color: m.done ? T.CYAN : T.CARD }, line: { color: c, width: 1.5 } });
    if (m.done) {
      s.addText('✓', { x: cx - 0.2, y: timelineY - 0.2, w: 0.4, h: 0.4, fontSize: 10, bold: true, color: T.BG, align: 'center', valign: 'middle' });
    }

    // Connector line
    const connLen = 1.1;
    if (above) {
      s.addShape('rect', { x: cx - 0.015, y: timelineY - connLen, w: 0.03, h: connLen - 0.2, fill: { color: c }, line: { color: c, width: 0 } });
      // Quarter label above connector
      s.addText(m.quarter, { x: cx - 1.0, y: timelineY - connLen - 0.32, w: 2.0, h: 0.28, fontSize: 10, bold: true, color: c, align: 'center' });
      s.addText(m.title, { x: cx - 1.1, y: timelineY - connLen - 0.0, w: 2.2, h: 0.52, fontSize: 11, color: m.done ? T.WHITE : T.GRAY, align: 'center' });
    } else {
      s.addShape('rect', { x: cx - 0.015, y: timelineY + 0.2, w: 0.03, h: connLen - 0.2, fill: { color: c }, line: { color: c, width: 0 } });
      s.addText(m.title, { x: cx - 1.1, y: timelineY + connLen - 0.4, w: 2.2, h: 0.52, fontSize: 11, color: m.done ? T.WHITE : T.GRAY, align: 'center' });
      s.addText(m.quarter, { x: cx - 1.0, y: timelineY + connLen + 0.1, w: 2.0, h: 0.28, fontSize: 10, bold: true, color: c, align: 'center' });
    }
  });
}

function renderInvestment(pptx: InstanceType<typeof PptxGenJS>, s: Slide, slide: PptSlide, idx: number, total: number) {
  addChrome(s, idx, total);
  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.GOLD }, line: { color: T.GOLD, width: 0 } });

  // Left: big ask amount
  const leftW = W * 0.4;
  s.addShape('rect', { x: 0.6, y: 1.1, w: leftW, h: H - 1.65, fill: { color: T.CARD }, line: { color: T.GOLD, width: 1 }, rectRadius: 0.12 });

  s.addText('融资金额', { x: 0.8, y: 1.4, w: leftW - 0.4, h: 0.5, fontSize: 14, color: T.GRAY, align: 'center' });

  const amt = slide.ask_amount ?? '—';
  s.addText(amt, { x: 0.8, y: 1.95, w: leftW - 0.4, h: 1.5, fontSize: 40, bold: true, color: T.GOLD, align: 'center', valign: 'middle' });

  if (slide.body) {
    s.addText(slide.body, { x: 0.8, y: 3.5, w: leftW - 0.4, h: 0.5, fontSize: 14, color: T.GRAY, align: 'center' });
  }

  // Decorative rings
  s.addShape('ellipse', { x: 0.8 + leftW / 2 - 1.2, y: H - 2.2, w: 2.4, h: 2.4, fill: { color: T.GOLD, transparency: 93 }, line: { color: T.GOLD, width: 1, transparency: 70 } });
  s.addShape('ellipse', { x: 0.8 + leftW / 2 - 0.7, y: H - 1.7, w: 1.4, h: 1.4, fill: { color: T.GOLD, transparency: 87 }, line: { color: T.GOLD, width: 0 } });

  // Right: use-of-funds doughnut
  const useData = slide.ask_use ?? [];
  const rightX = 0.6 + leftW + 0.4;
  const rightW = W - rightX - 0.6;
  if (useData.length > 0) {
    s.addChart(pptx.ChartType.doughnut, [{ name: '资金用途', labels: useData.map(d => d.label), values: useData.map(d => d.value) }], {
      x: rightX, y: 1.05, w: rightW, h: H - 1.7,
      chartColors: [T.CYAN, T.PURPLE, T.GOLD, T.GREEN],
      dataLabelFontSize: 11,
      dataLabelColor: T.WHITE,
      showLegend: true,
      legendFontSize: 11,
      legendColor: T.GRAY,
      legendPos: 'b',
      holeSize: 55,
    });
  }
}

function renderContact(s: Slide, slide: PptSlide, outline: PptOutline) {
  s.background = { color: T.BG };
  s.addShape('rect', { x: 0, y: 0, w: W, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  // Decorative circles
  s.addShape('ellipse', { x: -1.5, y: H - 4, w: 6, h: 6, fill: { color: T.CYAN, transparency: 92 }, line: { color: T.CYAN, width: 0 } });
  s.addShape('ellipse', { x: W - 3, y: -2, w: 5, h: 5, fill: { color: T.PURPLE, transparency: 90 }, line: { color: T.PURPLE, width: 0 } });

  s.addText('感谢聆听', { x: 0, y: 1.2, w: W, h: 0.7, fontSize: 16, color: T.GRAY, align: 'center' });
  s.addText(slide.title || outline.project_name, { x: 0, y: 1.9, w: W, h: 1.5, fontSize: 46, bold: true, color: T.WHITE, align: 'center' });

  // Cyan divider
  s.addShape('rect', { x: W / 2 - 1.5, y: 3.55, w: 3, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  if (slide.subtitle) {
    s.addText(slide.subtitle, { x: 0, y: 3.75, w: W, h: 0.6, fontSize: 18, color: T.GRAY, align: 'center' });
  }

  const items = [
    slide.contact_name && `联系人：${slide.contact_name}`,
    slide.contact_email && `Email：${slide.contact_email}`,
    slide.contact_website && `网站：${slide.contact_website}`,
  ].filter(Boolean) as string[];

  items.forEach((item, i) => {
    s.addText(item, { x: 0, y: 4.55 + i * 0.52, w: W, h: 0.45, fontSize: 15, color: T.CYAN, align: 'center' });
  });
}

function renderDefault(s: Slide, slide: PptSlide, idx: number, total: number) {
  addChrome(s, idx, total);
  s.addText(slide.title, { x: 0.6, y: 0.18, w: W - 1.2, h: 0.62, fontSize: 28, bold: true, color: T.WHITE });
  s.addShape('rect', { x: 0.6, y: 0.88, w: 1.2, h: 0.05, fill: { color: T.CYAN }, line: { color: T.CYAN, width: 0 } });

  const cards = slide.cards ?? [];
  if (cards.length > 0) {
    const cardH = (H - 1.5) / Math.max(cards.length, 1) - 0.15;
    const colors = [T.CYAN, T.PURPLE, T.GOLD, T.GREEN];
    cards.forEach((card, i) => {
      const y = 1.1 + i * (cardH + 0.15);
      s.addShape('rect', { x: 0.6, y, w: W - 1.2, h: cardH, fill: { color: T.CARD }, line: { color: T.BORDER, width: 0.75 }, rectRadius: 0.1 });
      s.addShape('rect', { x: 0.6, y, w: 0.07, h: cardH, fill: { color: colors[i % 4] }, line: { color: colors[i % 4], width: 0 }, rectRadius: 0.1 });
      s.addText(card.title, { x: 0.9, y: y + 0.07, w: W - 1.8, h: cardH * 0.45, fontSize: 15, bold: true, color: T.WHITE, valign: 'middle' });
      s.addText(card.body, { x: 0.9, y: y + cardH * 0.45, w: W - 1.8, h: cardH * 0.5, fontSize: 12, color: T.GRAY, valign: 'top' });
    });
  } else if (slide.body) {
    s.addShape('rect', { x: 0.6, y: 1.1, w: W - 1.2, h: H - 1.65, fill: { color: T.CARD }, line: { color: T.BORDER, width: 0.75 }, rectRadius: 0.1 });
    s.addText(slide.body, { x: 0.9, y: 1.35, w: W - 1.8, h: H - 2.1, fontSize: 15, color: T.WHITE, valign: 'top' });
  }
}

// ── PPT builder ────────────────────────────────────────────────────────────────

function buildPptx(outline: PptOutline): PptxGenJS {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = outline.project_name;
  pptx.subject = '路演PPT';
  pptx.author = 'Sci-Bridge Agent';

  const total = outline.slides.length;

  for (const slide of outline.slides) {
    const s = pptx.addSlide();

    switch (slide.slide_type) {
      case 'cover':
        renderCover(s, slide, outline);
        break;
      case 'painpoints':
        renderPainpoints(s, slide, outline, slide.index, total);
        break;
      case 'solution':
        renderSolution(s, slide, outline, slide.index, total);
        break;
      case 'market':
        renderMarket(pptx, s, slide, slide.index, total);
        break;
      case 'traction':
        renderTraction(s, slide, slide.index, total);
        break;
      case 'business_model':
        renderBusinessModel(pptx, s, slide, slide.index, total);
        break;
      case 'competition':
        renderCompetition(s, slide, slide.index, total);
        break;
      case 'team':
        renderTeam(s, slide, slide.index, total);
        break;
      case 'finance':
        renderFinance(pptx, s, slide, slide.index, total);
        break;
      case 'roadmap':
        renderRoadmap(s, slide, slide.index, total);
        break;
      case 'investment':
        renderInvestment(pptx, s, slide, slide.index, total);
        break;
      case 'contact':
        renderContact(s, slide, outline);
        break;
      default:
        renderDefault(s, slide, slide.index, total);
    }

    if (slide.notes) s.addNotes(slide.notes);
  }

  return pptx;
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) return NextResponse.json({ error: '服务配置错误' }, { status: 500 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 });
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: '文件大小不能超过 10MB' }, { status: 400 });
    }

    let text: string;
    try {
      text = await extractText(file);
    } catch (e) {
      return NextResponse.json(
        { error: `文件解析失败：${e instanceof Error ? e.message : '未知错误'}` },
        { status: 400 }
      );
    }
    if (!text.trim()) {
      return NextResponse.json({ error: '文件内容为空，请检查文件后重试' }, { status: 400 });
    }

    // Phase 1: slim structural outline (45 s / 2000 tokens)
    let slimOutline: OutlineSchema;
    try {
      slimOutline = await generateOutline(text, file.name, apiKey);
    } catch (e) {
      return NextResponse.json(
        { error: `AI 分析失败：${e instanceof Error ? e.message : '未知错误'}` },
        { status: 502 }
      );
    }
    if (!slimOutline.slides?.length) {
      return NextResponse.json({ error: 'AI 未生成有效的PPT大纲，请重试' }, { status: 502 });
    }
    console.log('[PPT] Outline done:', slimOutline.slides.length, 'slides');

    // Phase 2: generate each slide in parallel (MAX_CONCURRENCY=4, 60 s each)
    const slideTasks = slimOutline.slides.map((entry) => () =>
      generateSlide(entry, text, slimOutline.project_name, apiKey)
    );
    const settled = await runWithConcurrency(slideTasks, MAX_CONCURRENCY);
    const warnings: number[] = [];
    const slides: PptSlide[] = settled.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      console.warn(`[PPT] Slide ${slimOutline.slides[i].index} (${slimOutline.slides[i].slide_type}) failed:`, r.reason);
      warnings.push(slimOutline.slides[i].index);
      return fallbackSlide(slimOutline.slides[i]);
    });

    const outline: PptOutline = {
      project_name: slimOutline.project_name,
      tagline: slimOutline.tagline,
      slides,
    };

    const pptx = buildPptx(outline);
    const arrayBuffer = (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer;

    const name = outline.project_name.replace(/[\\/:*?"<>|]/g, '') || '路演PPT';
    const encoded = encodeURIComponent(`${name}-路演PPT.pptx`);

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename*=UTF-8''${encoded}`,
        'X-Generation-Warnings': JSON.stringify(warnings),
      },
    });
  } catch (e) {
    console.error('generate-pptx:', e);
    return NextResponse.json({ error: '服务暂时不可用，请稍后重试' }, { status: 500 });
  }
}

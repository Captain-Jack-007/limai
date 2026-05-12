import { NextRequest, NextResponse } from 'next/server';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  LineRuleType,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  BorderStyle,
} from 'docx';

// ── 字号（half-points）─────────────────────────────────────────────────────────
// 三号=16pt=32, 小三=15pt=30, 四号=14pt=28, 小四=12pt=24
const SZ = { title: 32, h1: 30, h2: 28, h3: 24, body: 24, footer: 20 } as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeParagraph(
  text: string,
  opts: {
    font?: string;
    size?: number;
    bold?: boolean;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
    indent?: boolean;
    spacing?: boolean;
    color?: string;
  } = {}
): Paragraph {
  const runs = splitTextRuns(text, opts.font ?? 'SimSun', opts.size ?? SZ.body, opts.bold, opts.color);
  return new Paragraph({
    heading: opts.heading,
    alignment: opts.align ?? AlignmentType.JUSTIFIED,
    indent: opts.indent ? { firstLine: 480 } : undefined,
    spacing: opts.spacing
      ? { line: 360, lineRule: LineRuleType.AUTO, before: 80, after: 80 }
      : { before: 60, after: 60 },
    children: runs,
  });
}

// Split text so Chinese chars use SimSun/SimHei and Latin chars use Times New Roman
function splitTextRuns(
  text: string,
  cnFont: string,
  size: number,
  bold?: boolean,
  color?: string
): TextRun[] {
  if (!text) return [new TextRun({ text: '', size, bold })];

  // Match runs of CJK vs non-CJK
  const segments = text.split(/(?=[^一-鿿　-〿＀-￯])|(?<=[^一-鿿　-〿＀-￯])/);
  const runs: TextRun[] = [];

  for (const seg of segments) {
    if (!seg) continue;
    const isCJK = /[一-鿿　-〿＀-￯]/.test(seg);
    runs.push(
      new TextRun({
        text: seg,
        font: isCJK ? cnFont : 'Times New Roman',
        size,
        bold,
        color,
      })
    );
  }
  return runs.length > 0 ? runs : [new TextRun({ text, font: cnFont, size, bold })];
}

function makeTableFromMd(mdTable: string): Table | null {
  const lines = mdTable.trim().split('\n').filter((l) => l.trim());
  if (lines.length < 2) return null;

  const parseRow = (line: string) =>
    line
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

  const headerCells = parseRow(lines[0]);
  const dataRows = lines.slice(2); // skip separator

  const makeCell = (text: string, isHeader = false): TableCell =>
    new TableCell({
      children: [
        new Paragraph({
          children: splitTextRuns(text, isHeader ? 'SimHei' : 'SimSun', SZ.body, isHeader),
          alignment: AlignmentType.CENTER,
        }),
      ],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      },
    });

  const rows: TableRow[] = [
    new TableRow({ children: headerCells.map((c) => makeCell(c, true)) }),
    ...dataRows.map(
      (row) => new TableRow({ children: parseRow(row).map((c) => makeCell(c)) })
    ),
  ];

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ── Markdown → docx elements ───────────────────────────────────────────────────

function parseMarkdown(md: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table detection (line starts with |)
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      let tableEnd = i;
      while (tableEnd < lines.length && lines[tableEnd].trim().startsWith('|')) {
        tableEnd++;
      }
      const tableMd = lines.slice(i, tableEnd).join('\n');
      const tbl = makeTableFromMd(tableMd);
      if (tbl) elements.push(tbl);
      i = tableEnd;
      continue;
    }

    // H1 - document title
    if (/^# /.test(line)) {
      const text = line.replace(/^# /, '').trim();
      elements.push(
        makeParagraph(text, {
          font: 'SimHei',
          size: SZ.title,
          bold: true,
          align: AlignmentType.CENTER,
          heading: HeadingLevel.TITLE,
          spacing: true,
        })
      );
      i++;
      continue;
    }

    // H2 - chapter headings (第X章)
    if (/^## /.test(line)) {
      const text = line.replace(/^## /, '').trim();
      elements.push(
        makeParagraph(text, {
          font: 'SimHei',
          size: SZ.h1,
          bold: true,
          heading: HeadingLevel.HEADING_1,
          spacing: true,
        })
      );
      i++;
      continue;
    }

    // H3 - section headings (1.1 format)
    if (/^### /.test(line)) {
      const text = line.replace(/^### /, '').trim();
      elements.push(
        makeParagraph(text, {
          font: 'SimHei',
          size: SZ.h2,
          bold: true,
          heading: HeadingLevel.HEADING_2,
          spacing: true,
        })
      );
      i++;
      continue;
    }

    // H4 - sub-section headings (1.1.1 format)
    if (/^#### /.test(line)) {
      const text = line.replace(/^#### /, '').trim();
      elements.push(
        makeParagraph(text, {
          font: 'SimHei',
          size: SZ.h3,
          bold: true,
          heading: HeadingLevel.HEADING_3,
          spacing: true,
        })
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(new Paragraph({ children: [], spacing: { before: 120, after: 120 } }));
      i++;
      continue;
    }

    // Bold line (metadata like **报告日期：...**)
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      const text = line.trim().replace(/^\*\*|\*\*$/g, '');
      elements.push(
        makeParagraph(text, { font: 'SimHei', size: SZ.body, bold: true, spacing: true })
      );
      i++;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph - strip markdown inline formatting
    const text = line
      .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold**
      .replace(/\*([^*]+)\*/g, '$1')       // *italic*
      .replace(/`([^`]+)`/g, '$1')         // `code`
      .trim();

    if (text) {
      elements.push(
        makeParagraph(text, {
          font: 'SimSun',
          size: SZ.body,
          indent: true,
          spacing: true,
        })
      );
    }
    i++;
  }

  return elements;
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    const elements = parseMarkdown(content);

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1800,    // ~3.17cm
                bottom: 1800,
                left: 1800,   // ~3.17cm
                right: 1800,
              },
            },
          },
          children: elements,
        },
      ],
      styles: {
        default: {
          document: {
            run: {
              font: 'SimSun',
              size: SZ.body,
            },
            paragraph: {
              spacing: { line: 360, lineRule: LineRuleType.AUTO },
            },
          },
        },
      },
    });

    const buffer = Buffer.from(await Packer.toBuffer(doc));
    const name = (title || '项目研究报告').replace(/[\\/:*?"<>|]/g, '');
    const encoded = encodeURIComponent(`${name}.docx`);

    return new NextResponse(buffer.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encoded}`,
      },
    });
  } catch (err) {
    console.error('export-docx error:', err);
    return NextResponse.json({ error: 'Word 文档生成失败，请重试' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  AlignmentType,
  Bookmark,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  InternalHyperlink,
  LineRuleType,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { renderInlineRuns, refBookmarkId, chapterBookmarkId } from '@/lib/docx-rendering';

export const maxDuration = 120;

// ── Font sizes (half-points) ───────────────────────────────────────────────────
const SZ = { title: 36, h1: 30, h2: 28, h3: 24, body: 24 } as const;

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { title, content } = (await req.json()) as { title?: string; content?: string };
    if (!content?.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    const elements = parseMarkdown(content);

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: { name: 'Times New Roman', eastAsia: 'SimSun' }, size: SZ.body },
            paragraph: { spacing: { line: 360, lineRule: LineRuleType.AUTO } },
          },
        },
        paragraphStyles: [
          {
            id: 'Hyperlink',
            name: 'Hyperlink',
            basedOn: 'Normal',
            next: 'Normal',
            run: { color: '2858A0', underline: { type: 'single' } },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1800, bottom: 1800, left: 1800, right: 1800 },
            },
          },
          children: elements,
        },
      ],
    });

    const buffer = Buffer.from(await Packer.toBuffer(doc));
    const name = (title || '研报').replace(/[\\/:*?"<>|]/g, '');
    const encoded = encodeURIComponent(`${name}.docx`);

    return new NextResponse(buffer.buffer as ArrayBuffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encoded}`,
      },
    });
  } catch (err: unknown) {
    console.error('export-docx error:', err);
    const msg = err instanceof Error ? err.message : 'Word 文档生成失败';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── Markdown parser ────────────────────────────────────────────────────────────

type DocElement = Paragraph | Table;

function parseMarkdown(md: string): DocElement[] {
  const elements: DocElement[] = [];
  const lines = md.split('\n');
  let i = 0;
  let h1Counter = 0; // for chapter bookmarks
  let inRefSection = false;

  // Prepend TOC after the cover title — we insert it when we see the first H1
  let tocInserted = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── Table ──────────────────────────────────────────────────────────────────
    if (trimmed.startsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      let end = i;
      while (end < lines.length && lines[end].trim().startsWith('|')) end++;
      const tbl = makeTable(lines.slice(i, end).join('\n'));
      if (tbl) elements.push(tbl);
      i = end;
      continue;
    }

    // ── H1 ────────────────────────────────────────────────────────────────────
    if (/^# /.test(line)) {
      const text = line.replace(/^# /, '').trim();
      // Cover title
      elements.push(
        new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 480 },
          children: [
            new TextRun({
              text,
              font: { name: 'Times New Roman', eastAsia: 'SimHei' },
              size: SZ.title,
              bold: true,
            }),
          ],
        }),
      );
      // Insert TOC once after cover title
      if (!tocInserted) {
        elements.push(buildToc());
        elements.push(new Paragraph({ children: [new PageBreak()] }));
        tocInserted = true;
      }
      i++;
      continue;
    }

    // ── H2 (chapter headings) ─────────────────────────────────────────────────
    if (/^## /.test(line)) {
      const text = line.replace(/^## /, '').trim();
      h1Counter++;
      inRefSection = text.includes('参考文献');
      elements.push(buildH2(text, h1Counter));
      i++;
      continue;
    }

    // ── H3 ────────────────────────────────────────────────────────────────────
    if (/^### /.test(line)) {
      const text = line.replace(/^### /, '').trim();
      elements.push(buildH3(text));
      i++;
      continue;
    }

    // ── H4 ────────────────────────────────────────────────────────────────────
    if (/^#### /.test(line)) {
      const text = line.replace(/^#### /, '').trim();
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text,
              font: { name: 'Times New Roman', eastAsia: 'SimHei' },
              size: SZ.h3,
              bold: true,
            }),
          ],
        }),
      );
      i++;
      continue;
    }

    // ── Horizontal rule ────────────────────────────────────────────────────────
    if (/^---+$/.test(trimmed)) {
      elements.push(new Paragraph({ children: [], spacing: { before: 120, after: 120 } }));
      i++;
      continue;
    }

    // ── Empty line ─────────────────────────────────────────────────────────────
    if (!trimmed) {
      i++;
      continue;
    }

    // ── Reference list item: `1. **[TYPE]** title <url>` ─────────────────────
    if (inRefSection) {
      const refPara = buildRefParagraph(trimmed);
      if (refPara) {
        elements.push(refPara);
        i++;
        continue;
      }
    }

    // ── Regular paragraph ──────────────────────────────────────────────────────
    elements.push(
      new Paragraph({
        spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 120 },
        indent: { firstLine: 480 },
        children: renderInlineRuns(trimmed),
      }),
    );
    i++;
  }

  return elements;
}

// ── TOC ───────────────────────────────────────────────────────────────────────

function buildToc(): Paragraph {
  return new Paragraph({
    children: [
      new TableOfContents('目录', {
        hyperlink: true,
        headingStyleRange: '1-3',
      }) as unknown as TextRun,
    ],
  });
}

// ── Heading builders ──────────────────────────────────────────────────────────

function buildH2(text: string, chapterIndex: number): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 240 },
    children: [
      new Bookmark({
        id: chapterBookmarkId(chapterIndex),
        children: [
          new TextRun({
            text,
            font: { name: 'Times New Roman', eastAsia: 'SimHei' },
            size: SZ.h1,
            bold: true,
          }),
        ],
      }),
    ],
  });
}

function buildH3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        font: { name: 'Times New Roman', eastAsia: 'SimHei' },
        size: SZ.h2,
        bold: true,
      }),
    ],
  });
}

// ── Reference paragraph ───────────────────────────────────────────────────────

/**
 * Expected formats (from formatReferences()):
 *   1. **[PAPER]** Title (2024) <https://url>
 *   2. **[NEWS]** Title <https://url>
 *   1. **[PAPER]** Title (2024)   (no URL)
 */
function buildRefParagraph(text: string): Paragraph | null {
  // Must start with a number + dot
  const numMatch = text.match(/^(\d+)\.\s+(.*)$/);
  if (!numMatch) return null;

  const num = Number(numMatch[1]);
  const rest = numMatch[2];

  const children: (TextRun | Bookmark | ExternalHyperlink | InternalHyperlink)[] = [];

  // Number as bookmark anchor
  children.push(
    new Bookmark({
      id: refBookmarkId(num),
      children: [
        new TextRun({ text: `${num}.`, bold: true }),
      ],
    }) as unknown as TextRun,
  );
  children.push(new TextRun({ text: ' ' }));

  // Strip **[TYPE]** prefix
  const typeMatch = rest.match(/^\*\*\[([^\]]+)\]\*\*\s*/);
  if (typeMatch) {
    children.push(new TextRun({ text: `[${typeMatch[1]}] `, bold: true, color: '555555' }));
  }
  const afterType = typeMatch ? rest.slice(typeMatch[0].length) : rest;

  // Extract trailing URL in angle brackets <url>
  const urlMatch = afterType.match(/<(https?:\/\/[^>]+)>\s*$/);
  const mainText = urlMatch ? afterType.slice(0, urlMatch.index).trim() : afterType.trim();
  const url = urlMatch?.[1];

  if (mainText) {
    if (url) {
      // Title is a clickable link
      children.push(
        new ExternalHyperlink({
          link: url,
          children: [new TextRun({ text: mainText, style: 'Hyperlink' })],
        }) as unknown as TextRun,
      );
    } else {
      pushSplitRunsInto(children, mainText);
    }
  }

  return new Paragraph({
    spacing: { after: 80 },
    children: children as unknown as TextRun[],
  });
}

function pushSplitRunsInto(
  acc: (TextRun | Bookmark | ExternalHyperlink | InternalHyperlink)[],
  text: string,
  bold?: boolean,
): void {
  const segments = text.split(/(?=[^一-鿿　-〿＀-￯])|(?<=[^一-鿿　-〿＀-￯])/);
  for (const seg of segments) {
    if (!seg) continue;
    const isCJK = /[一-鿿　-〿＀-￯]/.test(seg);
    acc.push(
      new TextRun({ text: seg, font: isCJK ? 'SimSun' : 'Times New Roman', bold }),
    );
  }
}

// ── Table builder ─────────────────────────────────────────────────────────────

function makeTable(mdTable: string): Table | null {
  const rows = mdTable
    .trim()
    .split('\n')
    .filter((l) => l.trim() && !l.match(/^\|[\s|:-]+\|$/));

  if (rows.length < 1) return null;

  const parseRow = (line: string) =>
    line
      .split('|')
      .map((c) => c.trim())
      .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1); // drop first/last empty

  const makeCell = (text: string, isHeader = false): TableCell =>
    new TableCell({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text,
              font: { name: 'Times New Roman', eastAsia: isHeader ? 'SimHei' : 'SimSun' },
              size: SZ.body,
              bold: isHeader,
            }),
          ],
        }),
      ],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
      },
    });

  const tableRows: TableRow[] = rows.map((row, idx) =>
    new TableRow({ children: parseRow(row).map((c) => makeCell(c, idx === 0)) }),
  );

  return new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

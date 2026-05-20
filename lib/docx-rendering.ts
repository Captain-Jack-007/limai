import { TextRun, InternalHyperlink } from 'docx';

/** Confidence badge → Word rendering style */
const BADGE_STYLES: Record<string, { text: string; color: string }> = {
  '✅': { text: '高可信', color: '22863A' },
  '🟡': { text: '中可信', color: 'B08800' },
  '⚠️': { text: '低可信', color: 'B31D28' },
  '❗': { text: '存疑', color: 'C00000' },
};

export function refBookmarkId(index: number): string {
  return `ref_${index}`;
}

export function chapterBookmarkId(index: number): string {
  return `chapter_${index}`;
}

/**
 * Parse inline text into TextRun / InternalHyperlink elements.
 * Handles:
 *   [N]      → superscript InternalHyperlink → ref_N bookmark
 *   [推断]   → grey superscript, no link
 *   ✅🟡⚠️❗ → coloured superscript text, no emoji
 *   **bold** → bold TextRun
 *   [^cl_xxx] legacy footnotes → plain text (graceful degradation)
 */
export function renderInlineRuns(text: string): (TextRun | InternalHyperlink)[] {
  // Strip legacy [^cl_xxx] footnote markers — render as plain text
  const cleaned = text.replace(/\[\^cl_ch\d+_\d+\]/g, '');

  const runs: (TextRun | InternalHyperlink)[] = [];
  let lastIdx = 0;

  // Match: [N], [推断], badge emoji, **bold**
  const pattern = /(\[(\d+)\](?:✅|🟡|⚠️|❗)?)|(\[推断\])|((?:✅|🟡|⚠️|❗))|(\*\*([^*\n]+)\*\*)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(cleaned)) !== null) {
    // Flush preceding plain text
    if (match.index > lastIdx) {
      pushSplitRuns(runs, cleaned.slice(lastIdx, match.index));
    }

    const numCite = match[2]; // digit inside [N]
    const infer = match[3];   // [推断]
    const badge = match[4];   // lone badge emoji
    const boldText = match[6]; // inside **...**

    if (numCite) {
      // Strip badge suffix from the full match if present
      runs.push(
        new InternalHyperlink({
          anchor: refBookmarkId(Number(numCite)),
          children: [
            new TextRun({
              text: `[${numCite}]`,
              superScript: true,
              color: '2858A0',
              style: 'Hyperlink',
            }),
          ],
        }),
      );
    } else if (infer) {
      runs.push(new TextRun({ text: '[推断]', superScript: true, color: '888888' }));
    } else if (badge && BADGE_STYLES[badge]) {
      const s = BADGE_STYLES[badge];
      runs.push(new TextRun({ text: `(${s.text})`, superScript: true, color: s.color, bold: true }));
    } else if (boldText !== undefined) {
      pushSplitRuns(runs, boldText, true);
    }

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < cleaned.length) {
    pushSplitRuns(runs, cleaned.slice(lastIdx));
  }

  return runs.length > 0 ? runs : [new TextRun({ text: '' })];
}

/** Split a plain string into CJK (SimSun) + Latin (Times New Roman) runs */
function pushSplitRuns(
  acc: (TextRun | InternalHyperlink)[],
  text: string,
  bold?: boolean,
): void {
  if (!text) return;
  const segments = text.split(/(?=[^一-鿿　-〿＀-￯])|(?<=[^一-鿿　-〿＀-￯])/);
  for (const seg of segments) {
    if (!seg) continue;
    const isCJK = /[一-鿿　-〿＀-￯]/.test(seg);
    acc.push(
      new TextRun({
        text: seg,
        font: isCJK ? 'SimSun' : 'Times New Roman',
        bold,
      }),
    );
  }
}

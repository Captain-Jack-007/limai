// Server-only: extract plain text from uploaded files
// pdf-parse / mammoth loaded at runtime via require() to avoid SSR issues

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB per file

export interface ExtractResult {
  fileName: string;
  text: string;
  warn?: string;
}

export async function extractFileText(file: File): Promise<ExtractResult> {
  const name = file.name;
  const lower = name.toLowerCase();

  if (file.size > MAX_FILE_BYTES) {
    return { fileName: name, text: '', warn: `文件 "${name}" 超过 50MB 限制，已跳过` };
  }

  // Plain text formats
  if (/\.(txt|md|csv)$/.test(lower)) {
    return { fileName: name, text: await file.text() };
  }

  // Images — extraction not supported
  if (/\.(png|jpg|jpeg|gif|webp|bmp)$/.test(lower)) {
    return { fileName: name, text: '', warn: `图片文件 "${name}" 内容暂不支持提取，已跳过` };
  }

  const buf = Buffer.from(await file.arrayBuffer());

  // PDF
  if (lower.endsWith('.pdf')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buf);
      if (!result.text?.trim()) {
        return { fileName: name, text: '', warn: `PDF "${name}" 未检测到可读文字（可能是扫描件），已跳过` };
      }
      return { fileName: name, text: result.text };
    } catch (e) {
      return { fileName: name, text: '', warn: `PDF "${name}" 解析失败：${e instanceof Error ? e.message : '未知错误'}` };
    }
  }

  // Word (.doc / .docx)
  if (/\.(docx?|doc)$/.test(lower)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: buf });
      return { fileName: name, text: result.value ?? '' };
    } catch (e) {
      return { fileName: name, text: '', warn: `Word 文件 "${name}" 解析失败：${e instanceof Error ? e.message : '未知错误'}` };
    }
  }

  return { fileName: name, text: '', warn: `不支持的格式 "${name.split('.').pop()?.toUpperCase()}"，已跳过` };
}

export function buildFileContext(results: ExtractResult[]): string {
  const valid = results.filter((r) => r.text.trim());
  if (valid.length === 0) return '';

  const MAX_CHARS_EACH = 15000;
  const parts = valid.map(
    (r) =>
      `【附件：${r.fileName}】\n${r.text.trim().slice(0, MAX_CHARS_EACH)}${
        r.text.length > MAX_CHARS_EACH ? '\n…（内容过长，已截断）' : ''
      }`
  );

  return `\n\n---\n【用户上传的参考资料原文（请以这些内容为主要分析依据）】\n${parts.join('\n\n')}\n---`;
}

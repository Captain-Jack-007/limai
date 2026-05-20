/**
 * Before passing markdown to any LLM rewrite step, replace numeric citations
 * [N]<badge> with {{CITE:N}} so the LLM cannot accidentally alter them.
 * Restore afterward.
 */

export interface MaskResult {
  masked: string;
  /** map from placeholder key → original token */
  placeholderMap: Map<string, string>;
}

const CITE_RE = /\[(\d+)\](?:✅|🟡|⚠️|❗)/gu;

export function maskCitations(markdown: string): MaskResult {
  const placeholderMap = new Map<string, string>();
  const masked = markdown.replace(CITE_RE, (match, num: string) => {
    const key = `{{CITE:${num}}}`;
    placeholderMap.set(key, match);
    return key;
  });
  return { masked, placeholderMap };
}

export function restoreCitations(masked: string, placeholderMap: Map<string, string>): string {
  let result = masked;
  for (const [key, original] of placeholderMap) {
    // Use split/join to avoid regex special chars in key
    result = result.split(key).join(original);
  }
  return result;
}

/**
 * Sanity check: every placeholder must still be present after LLM rewrite.
 * Returns missing keys (if any).
 * When map is empty the check cannot guarantee content integrity — callers
 * should rely on length-ratio protection as a fallback.
 */
export function validatePlaceholders(
  rewritten: string,
  placeholderMap: Map<string, string>,
): string[] {
  if (placeholderMap.size === 0) {
    console.warn('[validatePlaceholders] placeholderMap 为空，占位符校验无法保证内容完整性，依赖长度校验兜底');
    return [];
  }
  const missing: string[] = [];
  for (const key of placeholderMap.keys()) {
    if (!rewritten.includes(key)) missing.push(key);
  }
  return missing;
}

import type { TermCluster } from './types';

/**
 * Apply term clusters to markdown: replace all aliases with the canonical form.
 * Returns the normalized markdown and the count of replacements made.
 */
export function applyTermClusters(
  markdown: string,
  clusters: TermCluster[],
): { markdown: string; replacements: number } {
  let result = markdown;
  let replacements = 0;

  for (const cluster of clusters) {
    for (const alias of cluster.aliases) {
      if (alias === cluster.canonical) continue;
      // Word-boundary aware replacement (handles CJK by falling back to simple replace)
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let re: RegExp;
      try {
        re = new RegExp(`\\b${escaped}\\b`, 'g');
      } catch {
        re = new RegExp(escaped, 'g');
      }
      const before = result;
      result = result.replace(re, cluster.canonical);
      if (result !== before) replacements += 1;
    }
  }

  return { markdown: result, replacements };
}

/**
 * Extract candidate term strings from markdown for LLM clustering.
 * Looks for bold (**term**), inline code (`term`), and CJK noun phrases of 2-6 chars.
 */
export function extractCandidateTerms(markdown: string): string[] {
  const candidates = new Set<string>();

  // Bold terms
  const boldRe = /\*\*([^*\n]{2,30})\*\*/g;
  let m: RegExpExecArray | null;
  while ((m = boldRe.exec(markdown)) !== null) candidates.add(m[1].trim());

  // Inline code
  const codeRe = /`([^`\n]{2,30})`/g;
  while ((m = codeRe.exec(markdown)) !== null) candidates.add(m[1].trim());

  // CJK noun phrases (2-6 CJK chars, possibly with English mixed)
  const cjkRe = /[一-鿿]{2,6}(?:[A-Za-z0-9\-]{0,6}[一-鿿]{0,4})?/g;
  while ((m = cjkRe.exec(markdown)) !== null) {
    const t = m[0].trim();
    if (t.length >= 2) candidates.add(t);
  }

  return Array.from(candidates).slice(0, 200); // cap for LLM prompt size
}

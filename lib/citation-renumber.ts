import type { Claim, EvidenceItem, ConfidenceLevel } from './types';

const CONFIDENCE_BADGE: Record<ConfidenceLevel, string> = {
  high: '✅',
  medium: '🟡',
  low: '⚠️',
  disputed: '❗',
};

export interface RenumberResult {
  markdown: string;
  /** ordered list of ev ids (index+1 = citation number) */
  orderedEvidenceIds: string[];
  citationsRenumbered: number;
}

/**
 * Replaces all [^cl_*] footnotes with sequential [N]<badge> citations.
 *
 * Claims without valid evidence in the pool are downgraded to [推断] and do
 * not appear in the reference list. Citation numbers are assigned per unique
 * evidence item (not per claim), so two claims citing the same source share
 * the same [N].
 */
export function renumberCitations(
  markdown: string,
  claims: Claim[],
  evidence: EvidenceItem[] = [],
): RenumberResult {
  const claimMap = new Map(claims.map((c) => [c.id, c]));
  const evMap = new Map(evidence.map((e) => [e.id, e]));
  const evNumberMap = new Map<string, number>();
  let nextNumber = 1;
  let count = 0;

  const replaced = markdown.replace(/\[\^(cl_[a-z0-9_]+)\]/gi, (_match, id: string) => {
    const claim = claimMap.get(id);
    count += 1;

    // Case 1: claim ID not found in claim list at all
    if (!claim) {
      return ' [推断]';
    }

    // Case 2: ai_inference or no evidenceIds declared
    if (claim.sourceType === 'ai_inference' || claim.evidenceIds.length === 0) {
      const badge = CONFIDENCE_BADGE[claim.confidence ?? 'low'];
      return ` [推断] ${badge}`;
    }

    // Case 3: evidenceIds declared but none exist in the evidence pool
    const validEvIds = claim.evidenceIds.filter((evId) => evMap.has(evId));
    if (validEvIds.length === 0) {
      const badge = CONFIDENCE_BADGE[claim.confidence ?? 'low'];
      return ` [推断] ${badge}`;
    }

    // Case 4: normal — assign sequential numbers per unique evidence item
    const numbers: number[] = [];
    for (const evId of validEvIds) {
      let num = evNumberMap.get(evId);
      if (num === undefined) {
        num = nextNumber;
        nextNumber += 1;
        evNumberMap.set(evId, num);
      }
      numbers.push(num);
    }

    const numStr = numbers.map((n) => `[${n}]`).join('');
    const badge = CONFIDENCE_BADGE[claim.confidence ?? 'low'];
    return ` ${numStr} ${badge}`;
  });

  // Build ordered list sorted by assigned citation number
  const orderedEvidenceIds = Array.from(evNumberMap.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([evId]) => evId);

  return {
    markdown: replaced,
    orderedEvidenceIds,
    citationsRenumbered: count,
  };
}

/**
 * Builds the Markdown reference list section from ordered evidence ids.
 * Only entries that were actually assigned a citation number are included.
 */
export function formatReferences(
  orderedEvidenceIds: string[],
  evidence: EvidenceItem[],
): string {
  // Normal path: use only evidence items that were cited and numbered
  if (orderedEvidenceIds.length > 0) {
    const evMap = new Map(evidence.map((e) => [e.id, e]));
    const lines = orderedEvidenceIds.map((evId, i) => {
      const ev = evMap.get(evId);
      if (!ev) return null;
      const url = ev.url ? ` <${ev.url}>` : '';
      const date = ev.date ? ` (${ev.date})` : '';
      return `${i + 1}. **[${ev.type.toUpperCase()}]** ${ev.title}${date}${url}`;
    });
    const validLines = lines.filter((l): l is string => l !== null);
    if (validLines.length > 0) return '## 参考文献\n\n' + validLines.join('\n');
  }

  // Fallback: no citations were numbered (e.g. all claims were ai_inference or
  // chapter writers used [^ev_NNN] instead of [^cl_chN_NNN]).
  // List the entire evidence pool so readers still get searchable sources.
  const pool = evidence.filter((e) => e.title);
  if (pool.length === 0) return '';
  const lines = pool.map((e, i) => {
    const url = e.url ? ` <${e.url}>` : '';
    const date = e.date ? ` (${e.date})` : '';
    return `${i + 1}. **[${e.type.toUpperCase()}]** ${e.title}${date}${url}`;
  });
  return '## 参考来源\n\n' + lines.join('\n');
}

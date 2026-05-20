import type { Claim, EvidenceItem, SkepticContradiction, SkepticDissent, SkepticReport } from './types';

const BADGE: Record<string, string> = {
  high: '✅ 高可信',
  medium: '🟡 中可信',
  low: '⚠️ 低可信',
  disputed: '❗ 存疑',
};

/**
 * Appends GFM footnote definitions to a chapter body.
 * Called AFTER Skeptic review so claims already have confidence ratings.
 * Does not modify the inline [^cl_xxx] markers — Phase 6 citation-renumber handles those.
 */
export function tagSources(body: string, claims: Claim[], evidence: EvidenceItem[]): string {
  if (claims.length === 0) return body;

  const evMap = new Map(evidence.map((e) => [e.id, e]));

  const defs = claims.map((c) => {
    const badge = BADGE[c.confidence ?? 'low'] ?? '⚠️ 低可信';
    const evTitles = c.evidenceIds
      .map((id) => {
        const ev = evMap.get(id);
        return ev ? `${ev.title}（${ev.type}）` : id;
      })
      .join('；') || '无外部证据（AI 推断）';
    return `[^${c.id}]: ${badge} | ${evTitles}`;
  });

  return body + '\n\n' + defs.join('\n');
}

/**
 * Builds a Markdown appendix summarising the full Skeptic review results.
 * Accepts flat params (contradictions, dissents, unsupportedClaims, claims, summary)
 * so the caller does not need to construct a SkepticReport object.
 */
export function buildSkepticAppendix(
  contradictions: SkepticContradiction[],
  dissents: SkepticDissent[],
  unsupportedClaims: string[],
  claims: Claim[],
  summary: SkepticReport['summary'],
): string {
  const lines: string[] = ['## 附录：可信度审查报告（Skeptic Review）', ''];

  // ── Summary table ──────────────────────────────────────────────────────────
  lines.push(
    '### 声明可信度分布',
    '',
    '| 总计 | ✅ 高 | 🟡 中 | ⚠️ 低 | ❗ 存疑 |',
    '|------|------|------|------|--------|',
    `| ${summary.total} | ${summary.high} | ${summary.medium} | ${summary.low} | ${summary.disputed} |`,
    '',
  );

  // ── Cross-chapter contradictions ───────────────────────────────────────────
  if (contradictions.length > 0) {
    lines.push('### 跨章节矛盾', '', '| 涉及声明 | 矛盾说明 | 严重程度 |', '|----------|----------|----------|');
    for (const ct of contradictions) {
      const ids = ct.claimIds.join(', ');
      const desc = ct.description.replace(/\|/g, '｜');
      const sev = ct.severity === 'high' ? '❗ 高' : ct.severity === 'medium' ? '🟡 中' : '低';
      lines.push(`| ${ids} | ${desc} | ${sev} |`);
    }
    lines.push('');
  }

  // ── Unsupported claims ─────────────────────────────────────────────────────
  if (unsupportedClaims.length > 0) {
    lines.push(
      '### 无证据支撑的声明',
      '',
      '以下声明以确定事实形式表述，但缺乏外部证据支持：',
      '',
    );
    for (const id of unsupportedClaims) {
      const claim = claims.find((c) => c.id === id);
      lines.push(`- **${id}**：${claim?.text ?? '（声明文本未找到）'}`);
    }
    lines.push('');
  }

  // ── Per-claim confidence table ─────────────────────────────────────────────
  if (claims.length > 0) {
    lines.push(
      '### 各声明可信度详情',
      '',
      '| 声明 ID | 可信度 | 评定依据 |',
      '|---------|--------|----------|',
    );
    for (const c of claims) {
      const badge = BADGE[c.confidence ?? 'low'] ?? '⚠️ 低可信';
      const note = (c.skepticNote ?? '').replace(/\|/g, '｜');
      lines.push(`| ${c.id} | ${badge} | ${note} |`);
    }
    lines.push('');
  }

  // ── Dissents ───────────────────────────────────────────────────────────────
  if (dissents.length > 0) {
    lines.push("### 反方论点（Devil's Advocate）", '');
    for (const d of dissents) {
      const evRefs =
        d.counterEvidenceIds && d.counterEvidenceIds.length > 0
          ? `（反方依据：${d.counterEvidenceIds.join(', ')}）`
          : '';
      lines.push(`**针对 ${d.targetClaimId}**${evRefs}`, '', `> ${d.counterArgument}`, '');
    }
  }

  return lines.join('\n');
}

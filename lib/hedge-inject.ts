import type { Claim } from './types';

export const HEDGE_INSTRUCTIONS = `在正文中，你会看到以下占位符，请将其替换为自然流畅的中文表达：
- {{HEDGE:single-source}} → 替换为类似"据单一来源显示，" / "初步数据表明，" / "有报道称，"
- {{HEDGE:disputed}} → 替换为类似"业界对此存在分歧，" / "部分研究认为，但亦有观点指出，" / "数据尚存争议，"
请保持句子流畅，不要生硬插入，可适当调整前后文衔接。`;

/**
 * Insert hedge placeholders directly before low/disputed claim footnotes.
 * The LLM (naturalize step) will later replace them with fluent text.
 */
export function injectHedges(
  markdown: string,
  claims: Claim[],
): { markdown: string; hedgesInjected: number } {
  const lowOrDisputed = new Set(
    claims
      .filter((c) => c.confidence === 'low' || c.confidence === 'disputed')
      .map((c) => c.id),
  );

  let hedgesInjected = 0;

  // Match renumbered citations: [N]✅/🟡/⚠️/❗ preceded by the original footnote id
  // At this stage citations have already been renumbered to [N]<badge>
  // We need to inject hedges before sentences that end with a low/disputed badge
  const lowBadgeRe = /(\[(\d+)\](?:⚠️|❗))/gu;

  // Build a mapping: citation number → claim id (from renumber step)
  // Since we don't have that mapping here, we work on footnote ids before renumber.
  // Strategy: inject before [^cl_chN_NNN] markers that belong to low/disputed claims.
  const footnoteRe = /\[\^(cl_ch\d+_\d+)\]/g;
  const result = markdown.replace(footnoteRe, (match, claimId: string) => {
    if (lowOrDisputed.has(claimId)) {
      const hedgeType = claims.find((c) => c.id === claimId)?.confidence === 'disputed'
        ? 'disputed'
        : 'single-source';
      hedgesInjected += 1;
      return `{{HEDGE:${hedgeType}}}${match}`;
    }
    return match;
  });

  // Also handle already-renumbered badges (⚠️ = low, ❗ = disputed)
  // This path runs if called after renumber. Deduplicate by not double-injecting.
  void lowBadgeRe; // unused in this path, kept for reference

  return { markdown: result, hedgesInjected };
}

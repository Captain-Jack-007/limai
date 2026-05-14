export function buildSearchQueries(intake: Record<string, unknown>): { type: string; query: string }[] {
  const name = (intake.projectName as string) || '';
  const domain = (intake.domain as string) || '';
  const keywords = (intake.competitorKeywords as string[]) || [];

  return [
    { type: 'competition', query: name + ' ' + domain + ' 竞品 竞争对手' },
    { type: 'market', query: name + ' ' + domain + ' 市场规模 TAM' },
    { type: 'policy', query: domain + ' 政策 补贴 国家支持 2024 2025' },
    { type: 'industry', query: domain + ' 产业链 上下游 国产化' },
    ...keywords.slice(0, 3).map((kw: string) => ({ type: 'competition', query: kw + ' company startup' })),
  ];
}

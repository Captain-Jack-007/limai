import { SerperResult } from './serper';
import { EvidenceItem, SourceType } from './types';

export class EvidencePool {
  private items: Map<string, EvidenceItem> = new Map();
  private counter = 0;

  add(raw: Omit<EvidenceItem, 'id'>): string {
    this.counter += 1;
    const id = `ev_${String(this.counter).padStart(3, '0')}`;
    this.items.set(id, { id, ...raw });
    return id;
  }

  addFromSerper(results: SerperResult[]): string[] {
    return results.map((r) =>
      this.add({
        type: inferSourceType(r.link, r.title),
        title: r.title,
        url: r.link,
        snippet: r.snippet,
        date: r.date,
        source: 'serper',
      }),
    );
  }

  get(id: string): EvidenceItem | undefined {
    return this.items.get(id);
  }

  all(): EvidenceItem[] {
    return Array.from(this.items.values());
  }

  /** 注入 prompt 的格式：每条带 ID，方便 LLM 引用 */
  toPromptContext(ids?: string[]): string {
    const target = ids ? ids.map((id) => this.items.get(id)).filter(Boolean) as EvidenceItem[] : this.all();
    return target
      .map(
        (e) =>
          `[${e.id}] (${e.type}${e.date ? `, ${e.date}` : ''}) ${e.title}\n  ${e.snippet}\n  ${e.url ?? ''}`,
      )
      .join('\n\n');
  }
}

function inferSourceType(url: string, title: string): SourceType {
  const u = (url || '').toLowerCase();
  const t = (title || '').toLowerCase();
  if (u.includes('patent') || u.includes('uspto') || u.includes('cnipa') || t.includes('专利')) return 'patent';
  if (u.includes('arxiv') || u.includes('doi.org') || u.includes('semanticscholar') || u.includes('nature.com') || u.includes('sciencedirect')) return 'paper';
  if (u.includes('.gov') || t.includes('政策') || t.includes('规划') || t.includes('白皮书')) return 'policy';
  if (u.includes('crunchbase') || u.includes('linkedin.com/company') || u.includes('pitchbook')) return 'company';
  return 'news';
}

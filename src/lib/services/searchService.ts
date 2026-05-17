import { SearchQuery, SearchResult } from '../../types/modules.js';

export class SearchService {
  static async search(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  static async searchLemmas(lemma: string, languageId?: string): Promise<SearchResult[]> {
    return this.search({
      query: '',
      lemma,
      languageId,
      pageSize: 50,
    });
  }

  static async searchByMorphology(filters: Record<string, string>, languageId?: string): Promise<SearchResult[]> {
    const morphQuery: SearchQuery = {
      query: '',
      languageId,
      morphology: Object.entries(filters).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as any),
      pageSize: 100,
    };
    return this.search(morphQuery);
  }
}

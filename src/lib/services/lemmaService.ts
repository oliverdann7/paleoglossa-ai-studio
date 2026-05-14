import { LemmaEntry, InflectedForm } from '../../types/modules';

export class LemmaService {
  static async getLemma(lemma: string, languageId: string): Promise<LemmaEntry | null> {
    try {
      const response = await fetch(`/api/lemmas/${encodeURIComponent(languageId)}/${encodeURIComponent(lemma)}`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  static async searchLemmas(query: string, languageId: string): Promise<LemmaEntry[]> {
    try {
      const response = await fetch(`/api/lemmas?q=${encodeURIComponent(query)}&lang=${encodeURIComponent(languageId)}`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  static async getParadigm(lemma: string, languageId: string): Promise<InflectedForm[]> {
    try {
      const response = await fetch(`/api/lemmas/${encodeURIComponent(lemma)}/paradigm?lang=${encodeURIComponent(languageId)}`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }
}

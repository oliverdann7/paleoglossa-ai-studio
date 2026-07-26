import { GrammarConcept } from '../../types/modules.js';
import { getApiUrl } from './apiBaseUrl.js';

export class GrammarService {
  static async getConcepts(languageId: string): Promise<GrammarConcept[]> {
    try {
      const response = await fetch(getApiUrl(`/api/grammar/concepts?lang=${encodeURIComponent(languageId)}`));
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  static async getConcept(conceptId: string): Promise<GrammarConcept | null> {
    try {
      const response = await fetch(getApiUrl(`/api/grammar/concepts/${encodeURIComponent(conceptId)}`));
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  static async getPathway(languageId: string, conceptId: string): Promise<GrammarConcept[]> {
    try {
      const response = await fetch(getApiUrl(`/api/grammar/pathway?lang=${encodeURIComponent(languageId)}&concept=${encodeURIComponent(conceptId)}`)
      );
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }
}

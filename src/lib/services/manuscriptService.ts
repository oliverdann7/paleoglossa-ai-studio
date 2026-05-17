import { Manuscript } from '../../types/modules.js';

export class ManuscriptService {
  static async getManuscripts(textId?: string): Promise<Manuscript[]> {
    try {
      const params = textId ? `?textId=${encodeURIComponent(textId)}` : '';
      const response = await fetch(`/api/manuscripts${params}`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  static async getManuscript(manuscriptId: string): Promise<Manuscript | null> {
    try {
      const response = await fetch(`/api/manuscripts/${encodeURIComponent(manuscriptId)}`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }
}

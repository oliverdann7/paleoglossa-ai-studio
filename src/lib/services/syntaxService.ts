import { SyntaxTree } from '../../types/modules';

export class SyntaxService {
  static async getTree(textId: string, sentenceIndex: number): Promise<SyntaxTree | null> {
    try {
      const response = await fetch(`/api/syntax/${encodeURIComponent(textId)}/${sentenceIndex}`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  static async getTreesForText(textId: string): Promise<SyntaxTree[]> {
    try {
      const response = await fetch(`/api/syntax?textId=${encodeURIComponent(textId)}`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  static getRelationLabel(relation: string): string {
    const labels: Record<string, string> = {
      nsubj: 'nominal subject',
      obj: 'object',
      iobj: 'indirect object',
      obl: 'oblique',
      advmod: 'adverbial modifier',
      amod: 'adjectival modifier',
      nmod: 'nominal modifier',
      det: 'determiner',
      conj: 'conjunct',
      cc: 'coordinating conjunction',
      mark: 'marker',
      case: 'case marking',
      cop: 'copula',
      aux: 'auxiliary',
      root: 'root',
      punct: 'punctuation',
    };
    return labels[relation] || relation;
  }
}

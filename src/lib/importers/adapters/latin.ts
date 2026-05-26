import {
  ContentSourceAdapter,
  NormalizedText,
  NormalizedSection,
  ImportValidationResult,
} from '../types.js';
import { validateImport } from '../validate.js';

export const LatinCorpusAdapter: ContentSourceAdapter = {
  id: 'latin-corpus',
  label: 'Latin Open Corpus',
  language: 'lat',
  corpusType: 'text',
  license: 'Varies',
  canFetch: true,
  canImportFile: true,

  async fetchIndex() {
    return [];
  },

  async fetchText() {
    return '';
  },

  async normalize(_raw: any, metadata: any) {
    return {
      text: {
        id: metadata?.id || 'lat-1',
        corpusId: 'LATIN',
        title: metadata?.title || 'Latin Text',
        language: 'lat',
        direction: 'ltr',
      },
      sections: [],
    };
  },

  validate(normalized: {
    text: NormalizedText;
    sections: NormalizedSection[];
  }): ImportValidationResult {
    return validateImport(normalized);
  },
};

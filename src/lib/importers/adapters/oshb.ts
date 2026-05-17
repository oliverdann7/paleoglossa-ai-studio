import { ContentSourceAdapter, NormalizedText, NormalizedSection, ImportValidationResult } from '../types.js';
import { validateImport } from '../validate.js';

export const OshbAdapter: ContentSourceAdapter = {
  id: 'oshb',
  label: 'Open Scriptures Hebrew Bible',
  language: 'hbo',
  corpusType: 'mixed',
  license: 'CC BY 4.0',
  canFetch: true,
  canImportFile: true,
  
  async fetchIndex() {
    // Stub: Returns listing of books from OSHB
    return [
      { id: 'Gen', title: 'Genesis', ref: 'Gen' },
      { id: 'Exod', title: 'Exodus', ref: 'Exod' }
    ];
  },
  
  async fetchText(ref: string) {
    // Stub: Would fetch XML from OSHB GitHub
    return `stub raw XML data for ${ref}`;
  },
  
  async normalize(_raw: any, metadata: any) {
    // Stub: Parse the OSHB XML (OSIS/TEI-like format with word nodes)
    return {
      text: {
        id: metadata?.id || 'stub-id',
        corpusId: 'OSHB',
        title: metadata?.title || 'Stub Title',
        language: 'hbo',
        direction: 'rtl',
        hasMorphology: true
      },
      sections: []
    };
  },
  
  validate(normalized: { text: NormalizedText; sections: NormalizedSection[] }): ImportValidationResult {
    return validateImport(normalized);
  }
};

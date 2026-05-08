import { ContentSourceAdapter, NormalizedText, NormalizedSection, ImportValidationResult } from '../types';
import { validateImport } from '../validate';

export const StepBibleAdapter: ContentSourceAdapter = {
  id: 'stepbible',
  label: 'STEPBible (Lexicon & Morph)',
  language: 'mix', // Greek/Hebrew usually
  corpusType: 'lexicon',
  license: 'CC BY 4.0',
  canFetch: false, // Usually provided as a zip file to import
  canImportFile: true,
  
  async fetchIndex() {
    return [];
  },
  
  async fetchText(_ref: string) {
    throw new Error('STEPBible data is usually imported as a local database file/JSON block, not fetched text-by-text');
  },
  
  async normalize(_raw: any, _metadata: any) {
    // Stub: parses STEPBible TB1Lexicon data and Tyndale morphology
    return {
      text: {
        id: 'lexicon',
        corpusId: 'STEPBible',
        title: 'Lexicon Data',
        language: 'mixed'
      },
      sections: []
    };
  },
  
  validate(normalized: { text: NormalizedText; sections: NormalizedSection[] }): ImportValidationResult {
    return validateImport(normalized);
  }
};

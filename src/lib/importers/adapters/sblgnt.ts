import { ContentSourceAdapter, NormalizedText, NormalizedSection, ImportValidationResult } from '../types';
import { validateImport } from '../validate';

export const SblgntAdapter: ContentSourceAdapter = {
  id: 'sblgnt-morphgnt',
  label: 'SBLGNT / MorphGNT (Greek NT)',
  language: 'grc',
  corpusType: 'mixed', // text + morphology
  license: 'CC BY-SA 3.0',
  canFetch: true,
  canImportFile: true,
  
  async fetchIndex() {
    // Stub: Would fetch https://raw.githubusercontent.com/morphgnt/sblgnt/master/ (if it had an index)
    // For MVP, returning a stub index:
    return [
      { id: 'Mt', title: 'Matthew', ref: '61-Mt' },
      { id: '1Jn', title: '1 John', ref: '62-1Jn' }
    ];
  },
  
  async fetchText(ref: string) {
    // Stub: Would fetch https://raw.githubusercontent.com/morphgnt/sblgnt/master/${ref}-morphgrp.txt
    console.log(`Fetching SBLGNT book via MorphGNT: ${ref}`);
    return `stub raw data for ${ref}`;
  },
  
  async normalize(_raw: any, metadata: any) {
    // Stub: Parse the 7-column MorphGNT TSV/space-separated data
    // Return NormalizedText and NormalizedSection[]
    return {
      text: {
        id: metadata?.id || 'stub-id',
        corpusId: 'SBLGNT',
        title: metadata?.title || 'Stub Title',
        language: 'grc',
        direction: 'ltr',
        hasMorphology: true
      },
      sections: []
    };
  },
  
  validate(normalized: { text: NormalizedText; sections: NormalizedSection[] }): ImportValidationResult {
    return validateImport(normalized);
  }
};

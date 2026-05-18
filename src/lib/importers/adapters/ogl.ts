import {
  ContentSourceAdapter,
  NormalizedText,
  NormalizedSection,
  ImportValidationResult,
} from '../types.js';
import { validateImport } from '../validate.js';

export const OglAdapter: ContentSourceAdapter = {
  id: 'ogl',
  label: 'Open Greek and Latin',
  language: 'grc', // Also latin but grc for now
  corpusType: 'text',
  license: 'CC BY-SA 4.0', // Varying licenses
  canFetch: true,
  canImportFile: true,

  async fetchIndex() {
    // Stub: Fetch CTS API endpoints
    return [];
  },

  async fetchText(ref: string) {
    // Stub: Fetch TEI XML via CTS API
    return `stub raw CTS TEI XML for ${ref}`;
  },

  async normalize(_raw: any, metadata: any) {
    // Stub: parse TEI XML structure
    return {
      text: {
        id: metadata?.id || 'stub-id',
        corpusId: 'OGL',
        title: metadata?.title || 'Stub Title',
        language: 'grc',
        direction: 'ltr',
        hasMorphology: false,
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

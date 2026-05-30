import {
  ContentSourceAdapter,
  NormalizedText,
  NormalizedSection,
  ImportValidationResult,
} from '../types.js';
import { validateImport } from '../validate.js';

class NotImplementedError extends Error {
  constructor(method: string) {
    super(
      `OglAdapter.${method} is not implemented. The Open Greek and Latin (OGL/Perseus CTS) ` +
        `adapter requires a TEI-XML fetcher and parser; see docs/CORPUS_IMPORT_GUIDE.md. ` +
        `Use SBLGNT, OSHB, or the manual paste/file import flows instead.`
    );
  }
}

export const OglAdapter: ContentSourceAdapter = {
  id: 'ogl',
  label: 'Open Greek and Latin (planned)',
  language: 'grc',
  corpusType: 'text',
  license: 'CC BY-SA 4.0',
  canFetch: false,
  canImportFile: false,

  async fetchIndex() {
    throw new NotImplementedError('fetchIndex');
  },

  async fetchText() {
    throw new NotImplementedError('fetchText');
  },

  async normalize() {
    throw new NotImplementedError('normalize');
  },

  validate(normalized: {
    text: NormalizedText;
    sections: NormalizedSection[];
  }): ImportValidationResult {
    return validateImport(normalized);
  },
};

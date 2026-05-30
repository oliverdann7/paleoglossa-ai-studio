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
      `StepBibleAdapter.${method} is not implemented. STEPBible lexicon/morphology ` +
        `requires a local TB1Lexicon + Tyndale-morph file upload pipeline; ` +
        `see docs/CORPUS_IMPORT_GUIDE.md. Greek morphology is already covered by SBLGNT ` +
        `and Hebrew by OSHB — prefer those adapters for end-user imports.`
    );
  }
}

export const StepBibleAdapter: ContentSourceAdapter = {
  id: 'stepbible',
  label: 'STEPBible Lexicon & Morphology (planned)',
  language: 'mix',
  corpusType: 'lexicon',
  license: 'CC BY 4.0',
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

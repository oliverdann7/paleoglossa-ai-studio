import { SourceAttribution } from '../../types/corpus.js';
import type { ScriptDirection } from '../../types/linguistics.js';

export interface NormalizedMorphology {
  partOfSpeech: string;
  person?: string;
  tense?: string;
  voice?: string;
  mood?: string;
  case?: string;
  number?: string;
  gender?: string;
  degree?: string;
  state?: string; // Aramaic/Hebrew
  stem?: string; // Hebrew binyan
}

export interface NormalizedLemma {
  id: string; // e.g., strongs number or custom ID
  form: string;
  gloss: string;
  dictionaryUrl?: string;
}

export interface NormalizedToken {
  id: string; // e.g. "Mt-1-1-1"
  surface: string; // the exact form appearing in text
  normalized: string; // lowercased, stripped of punctuation for matching
  lemma: string; // foreign text lemma
  root?: string; // foreign root
  gloss: string; // english meaning
  morphology: NormalizedMorphology;
  transliteration?: string;
  punctBefore: string;
  punctAfter: string;
}

export interface NormalizedSentence {
  id: string;
  tokens: NormalizedToken[];
  translation?: string;
}

export interface NormalizedSection {
  id: string; // e.g., "Mt-1"
  textId: string;
  sequence: number; // e.g., 1 for Chapter 1
  label: string; // "Chapter 1"
  sentences: NormalizedSentence[];
}

export interface NormalizedText {
  id: string;
  corpusId: string;
  title: string;
  canonicalRef?: string;
  author?: string;
  language: string;
  direction?: ScriptDirection;
  sourceAttributionId?: string;
  hasMorphology?: boolean;
  hasTranslation?: boolean;
  hasTransliteration?: boolean;
  sectionsPreview?: { id: string; label: string }[];
}

export interface NormalizedCorpus {
  id: string;
  title: string;
  description: string;
  language: string;
  sourceAttributionId?: string;
  licenseSummary?: string;
  importStatus?: string;
  attribution?: SourceAttribution[];
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  tokenCount?: number;
  sectionCount?: number;
}

export interface ImportJob {
  id: string;
  adapterId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  logs: string[];
  result?: ImportValidationResult;
}

export interface ContentSourceAdapter {
  id: string;
  label: string;
  language: string;
  corpusType: 'text' | 'morphology' | 'lexicon' | 'translation' | 'mixed';
  license: string;
  canFetch: boolean;
  canImportFile: boolean;

  /** Retrieve list of texts/books available in this source */
  fetchIndex(): Promise<{ id: string; title: string; ref: string }[]>;

  /** Fetch a specific text or section */
  fetchText(ref: string): Promise<any>;

  /** Normalize the raw data returned by fetchText into Paleoglossa types */
  normalize(
    raw: any,
    metadata?: any
  ): Promise<{
    text: NormalizedText;
    sections: NormalizedSection[];
  }>;

  /** Validate the normalized output before saving */
  validate(normalized: {
    text: NormalizedText;
    sections: NormalizedSection[];
  }): ImportValidationResult;
}

export interface SourceAttribution {
  id: string;
  sourceName: string;
  sourceUrl: string;
  dataType: 'text' | 'morphology' | 'lexicon' | 'translation' | 'transliteration' | 'metadata';
  licenseName: string;
  licenseUrl?: string;
  attributionText?: string;
  requiresAttribution: boolean;
  allowsCommercialUse: boolean;
  allowsModification: boolean;
  shareAlike: boolean;
  notes?: string;
}

export interface Morphology {
  partOfSpeech: string;
  person?: string;
  tense?: string;
  voice?: string;
  mood?: string;
  case?: string;
  number?: string;
  gender?: string;
  degree?: string;
  state?: string;
  stem?: string;
  root?: string;
  aspect?: string;
  binyan?: string;
  conjugation?: string;
  declension?: string;
}

export interface Lemma {
  id: string; // e.g., strongs number or custom ID
  form: string;
  gloss: string;
  dictionaryUrl?: string;
}

export interface Root {
  id: string;
  form: string;
}

export interface Token {
  id: string; // e.g. "Mt-1-1-1"
  surface: string; // the exact form appearing in text
  normalized: string; // lowercased, stripped of punctuation for matching
  lemma: string; // foreign text lemma
  root?: string; // foreign root
  gloss: string; // english meaning
  morphology: Morphology;
  transliteration?: string;
  punctBefore: string;
  punctAfter: string;
  /** 0-based index of the syntactic head token; -1 = root (PROIEL/UD style) */
  head?: number;
  /** Universal Dependency relation label (e.g. "nsubj", "obj", "root") */
  deprel?: string;
  /** Treebank source identifier, e.g. "PROIEL", "Gorman", "Pedalion" */
  treebankSource?: string;
}

export interface Sentence {
  id: string;
  tokens: Token[];
  translation?: string; // e.g. ESV, if allowed, or Berean
}

export type SourceStatus = 'complete' | 'partial' | 'excerpt' | 'stub' | 'needs_import';

export interface TextSection {
  id: string;
  textId: string;
  sequence: number;
  label: string;
  sentences: Sentence[];
  nextSectionId?: string;
  previousSectionId?: string;
}

import type { ScriptDirection } from './linguistics.js';

export interface Text {
  id: string;
  corpusId: string;
  title: string;
  canonicalRef?: string;
  author?: string;
  language: string;
  direction?: ScriptDirection;
  level?: string;
  date?: string;
  period?: string;
  genre?: string;
  corpusType?:
    | 'biblical'
    | 'classical'
    | 'patristic'
    | 'inscription'
    | 'manuscript'
    | 'islamicate'
    | 'vocabulary'
    | 'script'
    | 'other';
  sourceAttributionId?: string;
  hasMorphology?: boolean;
  hasTranslation?: boolean;
  hasTransliteration?: boolean;
  hasAudio?: boolean;
  hasSyntax?: boolean;
  sourceStatus?: SourceStatus;
  isComplete?: boolean;
  isSample?: boolean;
  sentenceCount?: number;
  sectionsPreview?: { id: string; label: string }[];
}

export interface Corpus {
  id: string; // e.g. "SBLGNT"
  title: string;
  description: string;
  language: string;
  sourceAttributionId?: string;
  licenseSummary?: string;
  importStatus?: SourceStatus;
  attribution?: SourceAttribution[]; // Kept for backwards compatibility for now if needed? The instructions say "sourceAttributionId", so maybe we maintain a global database of Attributions? For MVP we can just attach it here too alongside.
}

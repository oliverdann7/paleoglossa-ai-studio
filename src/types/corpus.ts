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
  state?: string;      // Aramaic/Hebrew
  stem?: string;       // Hebrew binyan
  root?: string;       // foreign root
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
  surface: string;   // the exact form appearing in text
  normalized: string;// lowercased, stripped of punctuation for matching
  lemma: string;     // foreign text lemma
  root?: string;     // foreign root
  gloss: string;     // english meaning
  morphology: Morphology;
  transliteration?: string;
  punctBefore: string;
  punctAfter: string;
}

export interface Sentence {
  id: string;
  tokens: Token[];
  translation?: string; // e.g. ESV, if allowed, or Berean
}

export interface TextSection {
  id: string; // e.g., "Mt-1"
  textId: string;
  sequence: number; // e.g., 1 for Chapter 1
  label: string; // "Chapter 1"
  sentences: Sentence[];
}

export interface Text {
  id: string; // e.g. "Matthew"
  corpusId: string;
  title: string;
  canonicalRef?: string;
  author?: string;
  language: string; // e.g., "grc"
  direction?: 'ltr' | 'rtl';
  level?: string; // e.g., 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
  sourceAttributionId?: string;
  hasMorphology?: boolean;
  hasTranslation?: boolean;
  hasTransliteration?: boolean;
  sectionsPreview?: { id: string; label: string }[];
}

export interface Corpus {
  id: string; // e.g. "SBLGNT"
  title: string;
  description: string;
  language: string;
  sourceAttributionId?: string;
  licenseSummary?: string;
  importStatus?: string;
  attribution?: SourceAttribution[]; // Kept for backwards compatibility for now if needed? The instructions say "sourceAttributionId", so maybe we maintain a global database of Attributions? For MVP we can just attach it here too alongside.
}

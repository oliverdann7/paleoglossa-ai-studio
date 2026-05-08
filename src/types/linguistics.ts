export type Language = 'grc' | 'grc-koine' | 'hbo' | 'lat' | 'syr' | 'cop';
export type StudyWordState = 'unknown' | 'learning' | 'known';

export interface Morphology {
  partOfSpeech: string;
  case?: string;
  gender?: string;
  number?: string;
  tense?: string;
  voice?: string;
  mood?: string;
  person?: string;
  state?: string;
  stem?: string;
  root?: string;
}

export interface LexicalData {
  lemma: string;
  root?: string;
  transliteration?: string;
  gloss: string;
  expandedDefinition?: string;
}

export interface WordToken {
  id: string;
  surface: string;
  trailingSpace: string;
  language: Language;
  lexicalData?: LexicalData;
  morphology?: Morphology;
}

export interface TextBlock {
  id: string;
  reference?: string;
  tokens: WordToken[];
  translation?: string;
}

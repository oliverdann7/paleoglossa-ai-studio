export interface Morphology {
  part: string;
  type?: string;
  name?: string;
  gender?: string;
  number?: string;
  case?: string;
  tense?: string;
  mood?: string;
  person?: string;
  suffix?: string;
  prefix?: string;
  state?: string;
}

export interface Token {
  id: number;
  text: string;
  lemma: string;
  gloss: string;
  morphology: Morphology;
  language: string;
  status: 'New' | 'Seen Once' | 'Familiar' | 'Known';
}

export interface TextMetadata {
  id: number;
  title: string;
  author: string;
  language: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  era: string;
  image: string;
  knownCoverage?: number;
  unknownLemmas?: number;
  learningWords?: number;
}

export interface Chapter {
  id: number;
  textId: number;
  chapterNumber: number;
  title: string;
  translation: string;
  tokens: Token[];
}

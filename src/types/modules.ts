import { Timestamp } from 'firebase/firestore';

export interface LemmaEntry {
  lemma: string;
  languageId: string;
  gloss: string;
  partOfSpeech: string;
  frequency: number;
  rank: number;
  forms: InflectedForm[];
  cognates: string[];
  etymology?: string;
  semanticDomain?: string[];
}

export interface InflectedForm {
  surface: string;
  features: Record<string, string>;
  frequency: number;
}

export interface GrammarConcept {
  id: string;
  languageId: string;
  name: string;
  category:
    | 'verb'
    | 'noun'
    | 'pronoun'
    | 'adjective'
    | 'adverb'
    | 'preposition'
    | 'conjunction'
    | 'particle'
    | 'syntax'
    | 'phonology';
  difficulty: number;
  prerequisites: string[];
  description: string;
  examples: GrammarExample[];
  relatedConcepts: string[];
}

export interface GrammarExample {
  textId: string;
  sentenceIndex: number;
  tokenIndices: number[];
  gloss: string;
}

export interface SearchQuery {
  query: string;
  languageId?: string;
  lemma?: string;
  morphology?: MorphologyFilter;
  textIds?: string[];
  page?: number;
  pageSize?: number;
}

export interface MorphologyFilter {
  partOfSpeech?: string;
  person?: string;
  tense?: string;
  voice?: string;
  mood?: string;
  case?: string;
  number?: string;
  gender?: string;
}

export interface SearchResult {
  id: string;
  textId: string;
  textTitle: string;
  sentenceIndex: number;
  tokenIndices: number[];
  surface: string;
  lemma: string;
  gloss: string;
  contextBefore: string;
  contextAfter: string;
}

export interface SyntaxTree {
  id: string;
  textId: string;
  sentenceIndex: number;
  tokens: SyntaxTokenData[];
  relations: DependencyRelation[];
  source: 'proiel' | 'gorman' | 'perseus' | 'ai-generated';
}

export interface SyntaxTokenData {
  index: number;
  form: string;
  lemma: string;
  partOfSpeech: string;
  features: Record<string, string>;
}

export interface DependencyRelation {
  head: number;
  dependent: number;
  relation: string;
}

export interface ResearchNotebook {
  id: string;
  userId: string;
  title: string;
  description: string;
  color: string;
  sortOrder: number;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

/** Where the note was created from, for filtering and display. */
export type ResearchNoteSource = 'reader' | 'word-analysis' | 'tutor' | 'manual';

export interface ResearchNote {
  id: string;
  userId: string;
  notebookId?: string;
  /** Language being studied when the note was created */
  languageId?: string;
  textId?: string;
  /** Paragraph / chunk identifier within the text */
  chunkId?: string;
  sentenceRange?: [number, number];
  tokenRange?: [number, number];
  /** Surface token form that triggered the note */
  token?: string;
  /** Dictionary lemma linked to this note */
  lemma?: string;
  /** Grammar tag or construction label (e.g. "dative of reference") */
  grammarTag?: string;
  /** Where the note originated */
  source?: ResearchNoteSource;
  content: string;
  tags: string[];
  visibility: 'private' | 'shared' | 'public';
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface AudioRecording {
  id: string;
  userId: string;
  textId?: string;
  sentenceIndex?: number;
  wordIndex?: number;
  audioUrl: string;
  duration: number;
  recordingType: 'tts' | 'user';
  pronunciationMode?: 'restored' | 'erasmian' | 'modern' | 'reconstructed';
  createdAt: string | Timestamp;
}

export interface Manuscript {
  id: string;
  textId?: string;
  label: string;
  languageId: string;
  dateRange: [number, number];
  images: ManuscriptImage[];
  transcriptions: TranscriptionLayer[];
  apparatus?: VariantReading[];
}

export interface ManuscriptImage {
  url: string;
  label: string;
  pageNumber: number;
  width: number;
  height: number;
}

export interface TranscriptionLayer {
  label: string;
  lines: TranscriptionLine[];
}

export interface TranscriptionLine {
  lineNumber: number;
  text: string;
  imageRegion?: [number, number, number, number];
}

export interface VariantReading {
  passage: string;
  readings: Variant[];
}

export interface Variant {
  manuscripts: string[];
  text: string;
  note?: string;
}

export interface Course {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  languageId: string;
  texts: CourseTextAssignment[];
  isPublic: boolean;
  inviteCode?: string;
  createdAt: string | Timestamp;
}

export interface CourseTextAssignment {
  textId: string;
  order: number;
  week?: number;
  learningObjectives: string;
  /** ISO date string (YYYY-MM-DD). Teacher-set deadline for this text. */
  dueDate?: string;
  /** Teacher-authored reading guide shown to all enrolled students */
  teacherNote?: string;
}

export interface CourseMembership {
  userId: string;
  role: 'student' | 'teacher' | 'assistant';
  progress: Record<string, number>;
  joinedAt: string | Timestamp;
}

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
  context?: {
    textId?: string;
    sentenceIndex?: number;
    lemma?: string;
  };
  createdAt: string | Timestamp;
}

export interface TutorSession {
  id: string;
  userId: string;
  title: string;
  messages: TutorMessage[];
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

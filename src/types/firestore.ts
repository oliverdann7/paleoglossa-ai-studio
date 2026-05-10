import { Timestamp } from 'firebase/firestore';

export enum WordStatus {
  NEW = 'NEW',
  SEEN = 'SEEN',
  LEARNING = 'LEARNING',
  FAMILIAR = 'FAMILIAR',
  KNOWN = 'KNOWN',
  IGNORED = 'IGNORED'
}

export interface SRSData {
  nextReview: string | Timestamp;
  interval: number;
  ease: number;
  step: number;
  lastReviewed: string | Timestamp | null;
}

export interface VocabularyItem {
  id?: string;
  userId: string;
  languageId: string;
  term: string;
  normalizedTerm: string;
  lemma?: string;
  lemmaId?: string;
  transliteration?: string;
  gloss?: string;
  userGloss?: string;
  status: WordStatus;
  sourceTextIds: string[];
  encounterCount: number;
  firstSeenAt: string | Timestamp;
  lastSeenAt: string | Timestamp;
  srs: SRSData;
  notes?: string;
  tags: string[];
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface TextProgress {
  userId: string;
  textId: string;
  lastPosition: number;
  completed: boolean;
  lastReadAt: string | Timestamp;
  sentenceIndex: number;
  sectionId?: string;
}

export interface ImportedText {
  id?: string;
  userId: string;
  title: string;
  languageId: string;
  language?: string; // Compatibility
  content?: string;  // Compatibility
  sourceType: 'paste' | 'file' | 'url' | 'image' | 'pdf';
  rawContent: string;
  processedContent?: string;
  sentences?: string[];
  tokens?: any[];
  stats: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    newWords: number;
    learningWords: number;
    percentKnown?: number;
    percentLearning?: number;
  };
  aiAnalysis?: any;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  visibility: 'private' | 'shared' | 'public';
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: number;
  transliterationMode: 'none' | 'phonetic' | 'roman';
  targetLanguage: string;
  uiLanguage: string;
  showParallelDefault: boolean;
}

export interface ReviewLog {
  userId: string;
  vocabItemId: string;
  timestamp: string | Timestamp;
  previousInterval: number;
  newInterval: number;
  quality: number; // 0-5
}

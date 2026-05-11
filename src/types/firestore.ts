import { Timestamp } from 'firebase/firestore';
import { WordState } from '../lib/constants/wordStates';

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
  status: WordState;
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

export interface ImportedToken {
  text: string;
  lemma?: string;
  normalized?: string;
  type: 'word' | 'punctuation' | 'number' | 'whitespace';
  transliteration?: string;
  gloss?: string;
  pos?: string;
  confidence?: number;
  aiGenerated?: boolean;
}

export interface ImportedSentence {
  tokens: ImportedToken[];
  translation?: string;
}

export interface ImportedText {
  id?: string;
  userId: string;
  title: string;
  languageId: string;
  sourceType: 'paste' | 'file' | 'url' | 'image' | 'pdf';
  rawContent: string;
  processedContent?: string;
  sentences: ImportedSentence[];
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
  theme: 'parchment' | 'sepia' | 'dark';
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

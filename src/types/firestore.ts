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
  /** How the text entered the system */
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
  /** Lifecycle status of the import record */
  status: 'pending' | 'processing' | 'complete' | 'failed';
  /** Quality of linguistic analysis */
  analysisStatus: 'analyzed' | 'raw' | 'needs_ai';
  visibility: 'private' | 'shared' | 'public';
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  authorName?: string;
  authorId?: string;
  forkedFrom?: string;
  publishedAt?: string | Timestamp;
  moderationStatus?: string;
  forkCount?: number;
  originalAuthorId?: string;
  originalAuthorName?: string;
  originalPublicTextId?: string;
}

export interface UserSettings {
  theme: 'parchment' | 'sepia' | 'dark';
  fontSize: number;
  showParallelDefault: boolean;
  dailyGoalWords: number;
  dailyGoalMinutes: number;
  showTranslit: boolean;
  highlightIntensity: 'subtle' | 'normal' | 'strong';
  audioSpeedDefault: number;
  activeLanguages: string[];
  transliterationMode: 'none' | 'phonetic' | 'roman';
  targetLanguage: string;
  uiLanguage: string;
  swipePageMovesToKnown?: boolean;
  activeDictionaries?: string[];
}

export interface ReviewLog {
  userId: string;
  vocabItemId: string;
  timestamp: string | Timestamp;
  previousInterval: number;
  newInterval: number;
  quality: number; // 0-5
}

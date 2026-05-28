import { Timestamp } from 'firebase/firestore';
import { WordState } from '../lib/constants/wordStates.js';

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
  morphology?: Record<string, string>;
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
  status: 'pending' | 'processing' | 'complete' | 'partial' | 'failed';
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
  /** SHA-256 hex of rawContent for duplicate detection */
  contentHash?: string;
  /** Structured quality metadata about linguistic analysis */
  analysisQuality?: {
    level: 'full' | 'partial' | 'raw';
    glossCoverage: number;
    morphologyCoverage: number;
    averageConfidence?: number | null;
    warnings?: string[];
  };
  /** Errors encountered during processing */
  errorLog?: string[];
  /** Number of AI analysis retry attempts */
  retryCount?: number;
  /** Original filename if imported via file upload */
  originalFilename?: string;
}

export interface OnboardingProfile {
  completed: boolean;
  languageId: string;
  level: 'absolute-beginner' | 'knows-alphabet' | 'intermediate' | 'advanced';
  goal: 'biblical' | 'classical' | 'research' | 'vocab' | 'grammar';
  dailyCommitment: number;
}

/**
 * Per-language beginner-hub milestone state.
 * Path: users/{userId}/beginnerProgress/{languageId}
 */
export interface BeginnerProgressDoc {
  scriptOpened: boolean;
  firstTextOpened: boolean;
  firstWordSaved: boolean;
  firstReviewCompleted: boolean;
  updatedAt?: Timestamp;
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
  onboardingProfile?: OnboardingProfile;
}

export interface ReviewLog {
  userId: string;
  vocabItemId: string;
  timestamp: string | Timestamp;
  previousInterval: number;
  newInterval: number;
  quality: number; // 0-5
}

/**
 * Per-concept grammar mastery state.
 * Path: users/{userId}/grammarMastery/{conceptId}
 */
export interface GrammarConceptMastery {
  conceptId: string;
  languageId: string;
  /** 0 = not started, 1 = opened/studied, 2 = quiz attempted, 3 = mastered */
  level: 0 | 1 | 2 | 3;
  quizCorrect: number;
  quizTotal: number;
  lastStudiedAt: string | Timestamp;
  masteredAt?: string | Timestamp | null;
}

export interface DiscussionThread {
  id?: string;
  textId: string;
  languageId: string;
  sentenceIndex: number;
  /** Set for word-level threads; null/undefined for sentence-level */
  tokenIndex?: number | null;
  /** Surface form of the word (display only) */
  wordText?: string;
  /** Lemma for word-level threads */
  lemma?: string;
  /** Short excerpt of the sentence for context */
  sentenceExcerpt?: string;
  commentCount: number;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface DiscussionComment {
  id?: string;
  discussionId: string;
  authorUid: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
  body: string;
  upvoteCount: number;
  /** UIDs who have upvoted */
  upvotedBy?: string[];
  /** Set for replies; absent for top-level comments */
  parentCommentId?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

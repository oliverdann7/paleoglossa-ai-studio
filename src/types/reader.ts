export type ReadingMode = 'scroll' | 'page';
export type SourceKind = 'import' | 'sample' | 'partial' | 'complete';
export type HighlightIntensity = 'subtle' | 'normal' | 'strong';
/** High-level reading environment. Orthogonal to scroll vs. page layout mode. */
export type DisplayMode = 'scholar' | 'focus' | 'morphology' | 'interlinear' | 'parallel';

export interface ReaderToken {
  id: string;
  text: string;
  lemma: string;
  gloss?: string;
  morphology?: string;
  morphologyRaw?: Record<string, string>;
  translit?: string;
  punctBefore?: string;
  punctAfter?: string;
  type?: 'word' | 'punctuation' | 'whitespace';
  normalized?: string;
  pos?: string;
  confidence?: number;
}

export interface ReaderSentence {
  id: string;
  tokens: ReaderToken[];
  translation?: string;
  parallel?: string;
  _displayOffset?: number;
  _cachedText?: string;
}

export interface ReaderChapter {
  id: string;
  title: string;
  sentences: ReaderSentence[];
  translation: string;
}

export interface ReaderAudioState {
  isPlaying: boolean;
  speed: number;
  loopSentence: boolean;
  loopWord: boolean;
  position: { sentenceIdx: number; wordIdx: number };
}

export interface ReaderDisplaySettings {
  mode: ReadingMode;
  displayMode: DisplayMode;
  showTranslit: boolean;
  showParallel: boolean;
  maskKnown: boolean;
  interlinearMode: boolean;
  fontSize: number;
  highlightIntensity: HighlightIntensity;
  swipeMovesToNext: boolean;
}

export interface ReaderNavigationState {
  textId: string | null;
  currentChapterIndex: number;
  currentSentenceIndex: number;
  currentScrollPage: number;
  scrollProgress: number;
}

export interface ReaderState {
  display: ReaderDisplaySettings;
  navigation: ReaderNavigationState;
  audio: ReaderAudioState;
}

export const DEFAULT_READER_DISPLAY: ReaderDisplaySettings = {
  mode: 'scroll',
  displayMode: 'scholar',
  showTranslit: false,
  showParallel: false,
  maskKnown: false,
  interlinearMode: false,
  fontSize: 18,
  highlightIntensity: 'normal',
  swipeMovesToNext: true,
};

export const DEFAULT_READER_NAVIGATION: ReaderNavigationState = {
  textId: null,
  currentChapterIndex: 0,
  currentSentenceIndex: 0,
  currentScrollPage: 0,
  scrollProgress: 0,
};

export const DEFAULT_READER_AUDIO: ReaderAudioState = {
  isPlaying: false,
  speed: 1.0,
  loopSentence: false,
  loopWord: false,
  position: { sentenceIdx: 0, wordIdx: 0 },
};

export const DEFAULT_READER_STATE: ReaderState = {
  display: DEFAULT_READER_DISPLAY,
  navigation: DEFAULT_READER_NAVIGATION,
  audio: DEFAULT_READER_AUDIO,
};

export const STORAGE_KEY_READER = 'paleoglossa_reader_state';

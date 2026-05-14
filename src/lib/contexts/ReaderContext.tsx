import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { ReaderState, ReaderDisplaySettings, ReaderNavigationState, ReaderAudioState, ReadingMode, HighlightIntensity } from '../../types/reader';
import { DEFAULT_READER_STATE, STORAGE_KEY_READER } from '../../types/reader';

const STORAGE_KEY = STORAGE_KEY_READER;

interface ReaderContextValue {
  state: ReaderState;

  // Display settings
  setMode: (mode: ReadingMode) => void;
  setShowTranslit: (v: boolean) => void;
  setShowParallel: (v: boolean) => void;
  setMaskKnown: (v: boolean) => void;
  setInterlinearMode: (v: boolean) => void;
  setFontSize: (size: number) => void;
  setHighlightIntensity: (intensity: HighlightIntensity) => void;
  setSwipeMovesToNext: (v: boolean) => void;
  resetDisplay: () => void;

  // Navigation
  setTextId: (id: string | null) => void;
  setChapterIndex: (index: number) => void;
  setSentenceIndex: (index: number) => void;
  setScrollPage: (page: number) => void;
  setScrollProgress: (progress: number) => void;
  goToNextSentence: (totalSentences: number) => void;
  goToPrevSentence: () => void;
  goToNextChapter: (totalChapters: number) => void;
  goToPrevChapter: (prevChapterSentences: number) => void;
  resetNavigation: () => void;

  // Audio
  togglePlay: () => void;
  setPlayState: (playing: boolean) => void;
  setAudioSpeed: (speed: number) => void;
  toggleLoopSentence: () => void;
  toggleLoopWord: () => void;
  setAudioPosition: (sentenceIdx: number, wordIdx: number) => void;
  advanceAudioWord: (maxWords: number) => void;
  advanceAudioSentence: (maxSentences: number) => void;
  resetAudio: () => void;

  // Bulk
  resetAll: () => void;
}

const ReaderContext = createContext<ReaderContextValue | null>(null);

function loadPersistedState(): ReaderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ReaderState>;
      if (parsed && typeof parsed === 'object') {
        return {
          display: { ...DEFAULT_READER_STATE.display, ...parsed.display },
          navigation: { ...DEFAULT_READER_STATE.navigation, ...parsed.navigation },
          audio: { ...DEFAULT_READER_STATE.audio, ...parsed.audio },
        };
      }
    }
  } catch {
    // Corrupted storage — use defaults
  }
  return DEFAULT_READER_STATE;
}

function persistState(state: ReaderState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function ReaderStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReaderState>(loadPersistedState);

  useEffect(() => {
    persistState(state);
  }, [state]);

  const updateDisplay = useCallback((patch: Partial<ReaderDisplaySettings>) => {
    setState(prev => ({ ...prev, display: { ...prev.display, ...patch } }));
  }, []);

  const updateNavigation = useCallback((patch: Partial<ReaderNavigationState>) => {
    setState(prev => ({ ...prev, navigation: { ...prev.navigation, ...patch } }));
  }, []);

  const updateAudio = useCallback((patch: Partial<ReaderAudioState>) => {
    setState(prev => ({ ...prev, audio: { ...prev.audio, ...patch } }));
  }, []);

  // ── Display actions ──
  const setMode = useCallback((mode: ReadingMode) => updateDisplay({ mode }), [updateDisplay]);
  const setShowTranslit = useCallback((v: boolean) => updateDisplay({ showTranslit: v }), [updateDisplay]);
  const setShowParallel = useCallback((v: boolean) => updateDisplay({ showParallel: v }), [updateDisplay]);
  const setMaskKnown = useCallback((v: boolean) => updateDisplay({ maskKnown: v }), [updateDisplay]);
  const setInterlinearMode = useCallback((v: boolean) => updateDisplay({ interlinearMode: v }), [updateDisplay]);
  const setFontSize = useCallback((size: number) => updateDisplay({ fontSize: size }), [updateDisplay]);
  const setHighlightIntensity = useCallback((v: HighlightIntensity) => updateDisplay({ highlightIntensity: v }), [updateDisplay]);
  const setSwipeMovesToNext = useCallback((v: boolean) => updateDisplay({ swipeMovesToNext: v }), [updateDisplay]);
  const resetDisplay = useCallback(() => setState(prev => ({ ...prev, display: DEFAULT_READER_STATE.display })), []);

  // ── Navigation actions ──
  const setTextId = useCallback((id: string | null) => updateNavigation({ textId: id, currentChapterIndex: 0, currentSentenceIndex: 0, currentScrollPage: 0, scrollProgress: 0 }), [updateNavigation]);
  const setChapterIndex = useCallback((index: number) => updateNavigation({ currentChapterIndex: index, currentScrollPage: 0, currentSentenceIndex: 0 }), [updateNavigation]);
  const setSentenceIndex = useCallback((index: number) => updateNavigation({ currentSentenceIndex: index }), [updateNavigation]);
  const setScrollPage = useCallback((page: number) => updateNavigation({ currentScrollPage: page }), [updateNavigation]);
  const setScrollProgress = useCallback((progress: number) => updateNavigation({ scrollProgress: progress }), [updateNavigation]);

  const goToNextSentence = useCallback((totalSentences: number) => {
    setState(prev => {
      const next = prev.navigation.currentSentenceIndex + 1;
      if (next < totalSentences) {
        return { ...prev, navigation: { ...prev.navigation, currentSentenceIndex: next } };
      }
      return prev;
    });
  }, []);

  const goToPrevSentence = useCallback(() => {
    setState(prev => {
      const next = prev.navigation.currentSentenceIndex - 1;
      if (next >= 0) {
        return { ...prev, navigation: { ...prev.navigation, currentSentenceIndex: next } };
      }
      return prev;
    });
  }, []);

  const goToNextChapter = useCallback((totalChapters: number) => {
    setState(prev => {
      const next = prev.navigation.currentChapterIndex + 1;
      if (next < totalChapters) {
        return { ...prev, navigation: { ...prev.navigation, currentChapterIndex: next, currentSentenceIndex: 0, currentScrollPage: 0 } };
      }
      return prev;
    });
  }, []);

  const goToPrevChapter = useCallback((prevChapterSentences: number) => {
    setState(prev => {
      const next = prev.navigation.currentChapterIndex - 1;
      if (next >= 0) {
        return { ...prev, navigation: { ...prev.navigation, currentChapterIndex: next, currentSentenceIndex: prevChapterSentences - 1, currentScrollPage: 0 } };
      }
      return prev;
    });
  }, []);

  const resetNavigation = useCallback(() => setState(prev => ({ ...prev, navigation: DEFAULT_READER_STATE.navigation })), []);

  // ── Audio actions ──
  const togglePlay = useCallback(() => setState(prev => ({ ...prev, audio: { ...prev.audio, isPlaying: !prev.audio.isPlaying } })), []);
  const setPlayState = useCallback((playing: boolean) => setState(prev => ({ ...prev, audio: { ...prev.audio, isPlaying: playing } })), []);
  const setAudioSpeed = useCallback((speed: number) => updateAudio({ speed }), [updateAudio]);
  const toggleLoopSentence = useCallback(() => setState(prev => ({ ...prev, audio: { ...prev.audio, loopSentence: !prev.audio.loopSentence } })), []);
  const toggleLoopWord = useCallback(() => setState(prev => ({ ...prev, audio: { ...prev.audio, loopWord: !prev.audio.loopWord } })), []);
  const setAudioPosition = useCallback((sentenceIdx: number, wordIdx: number) => updateAudio({ position: { sentenceIdx, wordIdx } }), [updateAudio]);

  const advanceAudioWord = useCallback((maxWords: number) => {
    setState(prev => {
      const nextWord = prev.audio.position.wordIdx + 1;
      if (nextWord < maxWords) {
        return { ...prev, audio: { ...prev.audio, position: { ...prev.audio.position, wordIdx: nextWord } } };
      }
      return prev;
    });
  }, []);

  const advanceAudioSentence = useCallback((maxSentences: number) => {
    setState(prev => {
      const nextSentence = prev.audio.position.sentenceIdx + 1;
      if (nextSentence < maxSentences) {
        return { ...prev, audio: { ...prev.audio, position: { sentenceIdx: nextSentence, wordIdx: 0 } } };
      }
      return { ...prev, audio: { ...prev.audio, isPlaying: false, position: { sentenceIdx: 0, wordIdx: 0 } } };
    });
  }, []);

  const resetAudio = useCallback(() => setState(prev => ({ ...prev, audio: DEFAULT_READER_STATE.audio })), []);

  const resetAll = useCallback(() => setState(DEFAULT_READER_STATE), []);

  return (
    <ReaderContext.Provider value={{
      state,
      setMode, setShowTranslit, setShowParallel, setMaskKnown, setInterlinearMode,
      setFontSize, setHighlightIntensity, setSwipeMovesToNext, resetDisplay,
      setTextId, setChapterIndex, setSentenceIndex, setScrollPage, setScrollProgress,
      goToNextSentence, goToPrevSentence, goToNextChapter, goToPrevChapter, resetNavigation,
      togglePlay, setPlayState, setAudioSpeed, toggleLoopSentence, toggleLoopWord,
      setAudioPosition, advanceAudioWord, advanceAudioSentence, resetAudio,
      resetAll,
    }}>
      {children}
    </ReaderContext.Provider>
  );
}

export function useReaderState(): ReaderContextValue {
  const ctx = useContext(ReaderContext);
  if (!ctx) throw new Error('useReaderState must be used within ReaderStateProvider');
  return ctx;
}

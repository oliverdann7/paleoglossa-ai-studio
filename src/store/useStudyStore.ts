import { useCallback, useSyncExternalStore } from 'react';

type StudyWordState = 'new' | 'seen' | 'learning' | 'familiar' | 'known' | 'ignored';
interface LexicalData {
  lemma?: string;
  gloss?: string;
  morphology?: string;
  [key: string]: unknown;
}

const STORAGE_KEY = 'paleoglossa-study-state';

export interface SrsData {
  state: StudyWordState;
  interval: number;
  ease: number;
  nextReview: number;
  lexicalData?: LexicalData;
}

interface PersistedStudyState {
  wordData: Record<string, SrsData>;
  activeWordId: string | null;
  showTranslation: boolean;
}

export interface StudyStoreSnapshot extends PersistedStudyState {
  setWordState: (lemma: string, state: StudyWordState, lexicalData?: LexicalData) => void;
  processSrsReview: (lemma: string, grade: 'again' | 'hard' | 'good' | 'easy') => void;
  setActiveWord: (id: string | null) => void;
  toggleTranslation: () => void;
  getDueReviews: () => { lemma: string; data: SrsData }[];
}

const defaultState: PersistedStudyState = {
  wordData: {},
  activeWordId: null,
  showTranslation: false,
};

let state: PersistedStudyState = loadState();
const listeners = new Set<() => void>();

function loadState(): PersistedStudyState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState;
    return { ...defaultState, ...JSON.parse(saved) };
  } catch {
    return defaultState;
  }
}

function saveState(nextState: PersistedStudyState) {
  state = nextState;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): StudyStoreSnapshot {
  return {
    ...state,
    setWordState,
    processSrsReview,
    setActiveWord,
    toggleTranslation,
    getDueReviews,
  };
}

function getServerSnapshot(): StudyStoreSnapshot {
  return {
    ...defaultState,
    setWordState,
    processSrsReview,
    setActiveWord,
    toggleTranslation,
    getDueReviews,
  };
}

function setWordState(lemma: string, nextWordState: StudyWordState, lexicalData?: LexicalData) {
  const existing = state.wordData[lemma] || { interval: 0, ease: 2.5, nextReview: Date.now() };
  saveState({
    ...state,
    wordData: {
      ...state.wordData,
      [lemma]: {
        ...existing,
        state: nextWordState,
        lexicalData: lexicalData || existing.lexicalData,
      },
    },
  });
}

function processSrsReview(lemma: string, grade: 'again' | 'hard' | 'good' | 'easy') {
  const item = state.wordData[lemma];
  if (!item) return;

  let { interval, ease } = item;

  if (grade === 'again') {
    interval = 0.5;
    ease = Math.max(1.3, ease - 0.2);
  } else if (grade === 'hard') {
    interval = Math.max(1, interval * 1.2);
    ease = Math.max(1.3, ease - 0.15);
  } else if (grade === 'good') {
    interval = Math.max(1, (interval === 0 ? 1 : interval) * ease);
  } else if (grade === 'easy') {
    interval = Math.max(4, (interval === 0 ? 1 : interval) * ease * 1.3);
    ease += 0.15;
  }

  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
  const promotedState: StudyWordState = grade === 'easy' && interval > 21 ? 'known' : item.state;

  saveState({
    ...state,
    wordData: {
      ...state.wordData,
      [lemma]: { ...item, state: promotedState, interval, ease, nextReview },
    },
  });
}

function setActiveWord(id: string | null) {
  saveState({ ...state, activeWordId: id });
}

function toggleTranslation() {
  saveState({ ...state, showTranslation: !state.showTranslation });
}

function getDueReviews() {
  const now = Date.now();
  return Object.entries(state.wordData)
    .filter(([, data]) => data.state === 'learning' && data.nextReview <= now)
    .map(([lemma, data]) => ({ lemma, data }));
}

export const useStudyStore = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    ...snapshot,
    getDueReviews: useCallback(() => getDueReviews(), []),
  };
};

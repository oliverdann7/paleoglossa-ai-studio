import { describe, it, expect } from 'vitest';

/**
 * Pure logic tests for reader navigation boundary conditions.
 * These mirror the boundary logic used in Reader.tsx handleSwipe,
 * handleMarkPageKnown, handleNextPage, handleNextChapter.
 */

type NavState = {
  currentSentenceIndex: number;
  currentChapterIndex: number;
  currentScrollPage: number;
};

const SENTENCES_PER_PAGE = 30;

function calcTotalPages(sentenceCount: number): number {
  return Math.ceil(sentenceCount / SENTENCES_PER_PAGE);
}

/**
 * Simulates handleMarkPageKnown advance in page mode.
 * Returns the next state, or unchanged if at end.
 */
function advancePageMode(state: NavState, chapters: { sentences: unknown[] }[]): NavState {
  const chapter = chapters[state.currentChapterIndex];
  if (!chapter) return state;
  if (state.currentSentenceIndex < chapter.sentences.length - 1) {
    return { ...state, currentSentenceIndex: state.currentSentenceIndex + 1 };
  } else if (state.currentChapterIndex < chapters.length - 1) {
    return {
      currentSentenceIndex: 0,
      currentChapterIndex: state.currentChapterIndex + 1,
      currentScrollPage: 0,
    };
  }
  return state; // no-op at end
}

/**
 * Simulates handleMarkPageKnown advance in scroll mode.
 * Returns the next state, or unchanged if at end.
 */
function advanceScrollMode(state: NavState, chapters: { sentences: unknown[] }[]): NavState {
  const chapter = chapters[state.currentChapterIndex];
  if (!chapter) return state;
  const totalPages = calcTotalPages(chapter.sentences.length);
  if (state.currentScrollPage < totalPages - 1) {
    return { ...state, currentScrollPage: state.currentScrollPage + 1 };
  } else if (state.currentChapterIndex < chapters.length - 1) {
    return {
      currentSentenceIndex: 0,
      currentChapterIndex: state.currentChapterIndex + 1,
      currentScrollPage: 0,
    };
  }
  return state; // no-op: we are at the last page of the last chapter
}

/**
 * Simulates handleSwipe with swipePageMovesToKnown=false in page mode.
 */
function swipePageMode(state: NavState, chapters: { sentences: unknown[] }[]): NavState {
  const chapter = chapters[state.currentChapterIndex];
  if (!chapter) return state;
  if (state.currentSentenceIndex < chapter.sentences.length - 1) {
    return { ...state, currentSentenceIndex: state.currentSentenceIndex + 1 };
  } else if (state.currentChapterIndex < chapters.length - 1) {
    return {
      currentSentenceIndex: 0,
      currentChapterIndex: state.currentChapterIndex + 1,
      currentScrollPage: 0,
    };
  }
  return state; // no-op: already at the end
}

/**
 * Simulates handleSwipe with swipePageMovesToKnown=false in scroll mode.
 */
function swipeScrollMode(state: NavState, chapters: { sentences: unknown[] }[]): NavState {
  const chapter = chapters[state.currentChapterIndex];
  if (!chapter) return state;
  const totalPages = calcTotalPages(chapter.sentences.length);
  if (state.currentScrollPage < totalPages - 1) {
    return { ...state, currentScrollPage: state.currentScrollPage + 1 };
  } else if (state.currentChapterIndex < chapters.length - 1) {
    return {
      currentSentenceIndex: 0,
      currentChapterIndex: state.currentChapterIndex + 1,
      currentScrollPage: 0,
    };
  }
  return state; // no-op: already at the end
}

/**
 * Simulates handleNextPage (scroll mode, no chapter transition).
 */
function nextScrollPage(state: NavState, chapters: { sentences: unknown[] }[]): NavState {
  const chapter = chapters[state.currentChapterIndex];
  if (!chapter) return state;
  const totalPages = calcTotalPages(chapter.sentences.length);
  const next = Math.min(state.currentScrollPage + 1, totalPages - 1);
  return { ...state, currentScrollPage: next };
}

/**
 * Simulates handleNextChapter.
 */
function nextChapter(state: NavState, chapters: unknown[]): NavState {
  if (state.currentChapterIndex < chapters.length - 1) {
    return {
      currentSentenceIndex: 0,
      currentChapterIndex: state.currentChapterIndex + 1,
      currentScrollPage: 0,
    };
  }
  return state;
}

// Build test data
const makeChapter = (sentenceCount: number) => ({
  sentences: Array.from({ length: sentenceCount }, (_, i) => ({ id: `s${i}` })),
});

const TWO_CHAPTERS = [makeChapter(50), makeChapter(40)];
const ONE_CHAPTER = [makeChapter(25)];

describe('navigation boundaries — advancePageMode (handleMarkPageKnown page-mode)', () => {
  it('advances within a chapter', () => {
    const state: NavState = {
      currentSentenceIndex: 0,
      currentChapterIndex: 0,
      currentScrollPage: 0,
    };
    const next = advancePageMode(state, TWO_CHAPTERS);
    expect(next.currentSentenceIndex).toBe(1);
    expect(next.currentChapterIndex).toBe(0);
  });

  it('advances to next chapter on last sentence', () => {
    const state: NavState = {
      currentSentenceIndex: 49,
      currentChapterIndex: 0,
      currentScrollPage: 0,
    };
    const next = advancePageMode(state, TWO_CHAPTERS);
    expect(next.currentChapterIndex).toBe(1);
    expect(next.currentSentenceIndex).toBe(0);
  });

  it('does not advance past the last sentence of last chapter', () => {
    const state: NavState = {
      currentSentenceIndex: 39,
      currentChapterIndex: 1,
      currentScrollPage: 0,
    };
    const next = advancePageMode(state, TWO_CHAPTERS);
    expect(next.currentSentenceIndex).toBe(39);
    expect(next.currentChapterIndex).toBe(1);
  });

  it('no-ops when at the absolute end', () => {
    const state: NavState = {
      currentSentenceIndex: 24,
      currentChapterIndex: 0,
      currentScrollPage: 0,
    };
    const next = advancePageMode(state, ONE_CHAPTER);
    expect(next).toEqual(state);
  });
});

describe('navigation boundaries — advanceScrollMode (handleMarkPageKnown scroll-mode)', () => {
  it('advances scroll page within chapter', () => {
    const state: NavState = {
      currentSentenceIndex: 0,
      currentChapterIndex: 0,
      currentScrollPage: 0,
    };
    const next = advanceScrollMode(state, TWO_CHAPTERS);
    expect(next.currentScrollPage).toBe(1);
  });

  it('advances to next chapter on last scroll page', () => {
    const totalPages = calcTotalPages(50); // chapter 0 has 50 sentences → 2 pages
    const state: NavState = {
      currentSentenceIndex: 0,
      currentChapterIndex: 0,
      currentScrollPage: totalPages - 1,
    };
    const next = advanceScrollMode(state, TWO_CHAPTERS);
    expect(next.currentChapterIndex).toBe(1);
    expect(next.currentScrollPage).toBe(0);
  });

  it('does not advance past the last scroll page of the last chapter', () => {
    const totalPages = calcTotalPages(40); // chapter 1 has 40 sentences → 2 pages
    const state: NavState = {
      currentSentenceIndex: 0,
      currentChapterIndex: 1,
      currentScrollPage: totalPages - 1,
    };
    const next = advanceScrollMode(state, TWO_CHAPTERS);
    expect(next.currentChapterIndex).toBe(1);
    expect(next.currentScrollPage).toBe(totalPages - 1);
  });
});

describe('navigation boundaries — handleSwipe with swipePageMovesToKnown=false', () => {
  it('swipe-page-mode advances sentence within chapter', () => {
    const state: NavState = {
      currentSentenceIndex: 0,
      currentChapterIndex: 0,
      currentScrollPage: 0,
    };
    const next = swipePageMode(state, TWO_CHAPTERS);
    expect(next.currentSentenceIndex).toBe(1);
  });

  it('swipe-page-mode advances chapter on last sentence', () => {
    const state: NavState = {
      currentSentenceIndex: 49,
      currentChapterIndex: 0,
      currentScrollPage: 0,
    };
    const next = swipePageMode(state, TWO_CHAPTERS);
    expect(next.currentChapterIndex).toBe(1);
  });

  it('swipe-page-mode does not advance past end', () => {
    const state: NavState = {
      currentSentenceIndex: 39,
      currentChapterIndex: 1,
      currentScrollPage: 0,
    };
    const next = swipePageMode(state, TWO_CHAPTERS);
    expect(next).toEqual(state);
  });

  it('swipe-scroll-mode advances scroll page within chapter', () => {
    const state: NavState = {
      currentSentenceIndex: 0,
      currentChapterIndex: 0,
      currentScrollPage: 0,
    };
    const next = swipeScrollMode(state, TWO_CHAPTERS);
    expect(next.currentScrollPage).toBe(1);
  });

  it('swipe-scroll-mode advances chapter on last page', () => {
    const totalPages = calcTotalPages(50);
    const state: NavState = {
      currentSentenceIndex: 0,
      currentChapterIndex: 0,
      currentScrollPage: totalPages - 1,
    };
    const next = swipeScrollMode(state, TWO_CHAPTERS);
    expect(next.currentChapterIndex).toBe(1);
    expect(next.currentScrollPage).toBe(0);
  });

  it('swipe-scroll-mode does not advance past end', () => {
    const totalPages = calcTotalPages(40);
    const state: NavState = {
      currentSentenceIndex: 0,
      currentChapterIndex: 1,
      currentScrollPage: totalPages - 1,
    };
    const next = swipeScrollMode(state, TWO_CHAPTERS);
    expect(next).toEqual(state);
  });
});

describe('navigation boundaries — handleNextPage / handleNextChapter', () => {
  it('nextScrollPage clamps at totalPages - 1', () => {
    const state: NavState = {
      currentSentenceIndex: 0,
      currentChapterIndex: 0,
      currentScrollPage: 0,
    };
    const totalPages = calcTotalPages(25);
    // Advance all the way
    let s = state;
    for (let i = 0; i < totalPages + 5; i++) {
      s = nextScrollPage(s, ONE_CHAPTER);
    }
    expect(s.currentScrollPage).toBe(totalPages - 1);
    expect(s.currentChapterIndex).toBe(0);
  });

  it('nextChapter does not advance past last chapter', () => {
    const state: NavState = {
      currentSentenceIndex: 0,
      currentChapterIndex: 1,
      currentScrollPage: 0,
    };
    const next = nextChapter(state, TWO_CHAPTERS);
    expect(next.currentChapterIndex).toBe(1);
  });

  it('nextChapter advances within range', () => {
    const state: NavState = {
      currentSentenceIndex: 5,
      currentChapterIndex: 0,
      currentScrollPage: 0,
    };
    const next = nextChapter(state, TWO_CHAPTERS);
    expect(next.currentChapterIndex).toBe(1);
    expect(next.currentSentenceIndex).toBe(0);
  });
});

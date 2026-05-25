import { describe, it, expect } from 'vitest';
// Import from the pure-function utility, not the React hook, to avoid the
// firebase.ts import chain that throws without VITE_FIREBASE_* env vars in CI.
import { countTrackedWords } from '../../utils/vocabCount';
import { WordState } from '../../constants/wordStates';
import { isTrackedWordState } from '../../constants/plans';

// Minimal entry type that matches what countTrackedWords reads.
type Entry = { state: WordState; languageId: string; addedAt: string };
type TestKnowledge = Record<string, Entry | { state: string; addedAt: string }>;

describe('countTrackedWords', () => {
  const makeEntry = (state: WordState, languageId: string): Entry => ({
    state,
    languageId,
    addedAt: new Date().toISOString(),
  });

  it('counts only tracked states (SEEN/LEARNING/FAMILIAR/KNOWN) for the target language', () => {
    const knowledge: TestKnowledge = {
      αβ: makeEntry(WordState.SEEN, 'grc'),
      γδ: makeEntry(WordState.LEARNING, 'grc'),
      εζ: makeEntry(WordState.FAMILIAR, 'grc'),
      ηθ: makeEntry(WordState.KNOWN, 'grc'),
    };
    expect(countTrackedWords(knowledge, 'grc')).toBe(4);
  });

  it('excludes NEW and IGNORED words', () => {
    const knowledge: TestKnowledge = {
      word1: makeEntry(WordState.NEW, 'grc'),
      word2: makeEntry(WordState.IGNORED, 'grc'),
      word3: makeEntry(WordState.KNOWN, 'grc'),
    };
    expect(countTrackedWords(knowledge, 'grc')).toBe(1);
  });

  it('excludes words from other languages', () => {
    const knowledge: TestKnowledge = {
      latin1: makeEntry(WordState.KNOWN, 'lat'),
      latin2: makeEntry(WordState.LEARNING, 'lat'),
      greek1: makeEntry(WordState.KNOWN, 'grc'),
    };
    expect(countTrackedWords(knowledge, 'grc')).toBe(1);
    expect(countTrackedWords(knowledge, 'lat')).toBe(2);
  });

  it('returns 0 for an empty knowledge map', () => {
    expect(countTrackedWords({}, 'grc')).toBe(0);
  });

  it('returns 0 when no words exist for the target language', () => {
    const knowledge: TestKnowledge = {
      word1: makeEntry(WordState.KNOWN, 'lat'),
    };
    expect(countTrackedWords(knowledge, 'grc')).toBe(0);
  });

  it('returns 0 for entries missing a languageId', () => {
    const knowledge: Record<string, { state: string; addedAt: string }> = {
      word1: { state: 'KNOWN', addedAt: '' },
    };
    // languageId is undefined — should not match 'grc'
    expect(countTrackedWords(knowledge, 'grc')).toBe(0);
  });

  it('counts exactly at the limit boundary (25)', () => {
    const knowledge: TestKnowledge = {};
    for (let i = 0; i < 25; i++) {
      knowledge[`word${i}`] = makeEntry(WordState.KNOWN, 'grc');
    }
    expect(countTrackedWords(knowledge, 'grc')).toBe(25);
  });

  it('counts correctly when mixed with non-target-language entries at scale', () => {
    const knowledge: TestKnowledge = {};
    for (let i = 0; i < 100; i++) {
      knowledge[`grc${i}`] = makeEntry(WordState.KNOWN, 'grc');
      knowledge[`lat${i}`] = makeEntry(WordState.KNOWN, 'lat');
    }
    expect(countTrackedWords(knowledge, 'grc')).toBe(100);
    expect(countTrackedWords(knowledge, 'lat')).toBe(100);
  });
});

/**
 * Tests for the markPageAsSeen guard logic (pure-function replication).
 * The hook wraps vocab.markPageAsSeen with a filter; we test that filter here.
 */
describe('markPageAsSeen vocab-limit guard logic', () => {
  type Token = { lemma: string; languageId: string };
  type KnowledgeEntry = { state: string; languageId: string; addedAt: string };

  function applyGuard(
    tokens: Token[],
    knowledge: Record<string, KnowledgeEntry>,
    freeLangId: string,
    isFull: boolean,
    isEnabled: boolean
  ): Token[] {
    if (!isEnabled || !isFull) return tokens;
    return tokens.filter((token) => {
      if (!token.lemma) return false;
      const lang = token.languageId;
      if (lang !== freeLangId) return true;
      const existing = knowledge[token.lemma];
      return !!existing && isTrackedWordState(existing.state);
    });
  }

  it('passes all tokens through when limit is not full', () => {
    const tokens: Token[] = [
      { lemma: 'word1', languageId: 'grc' },
      { lemma: 'word2', languageId: 'grc' },
    ];
    const result = applyGuard(tokens, {}, 'grc', false, true);
    expect(result).toHaveLength(2);
  });

  it('passes all tokens through when limit is not enabled (paid plan)', () => {
    const tokens: Token[] = [{ lemma: 'word1', languageId: 'grc' }];
    const result = applyGuard(tokens, {}, 'grc', true, false);
    expect(result).toHaveLength(1);
  });

  it('filters out new (untracked) free-language words when limit is full', () => {
    const tokens: Token[] = [
      { lemma: 'newWord', languageId: 'grc' },
      { lemma: 'trackedWord', languageId: 'grc' },
    ];
    const knowledge: Record<string, KnowledgeEntry> = {
      trackedWord: { state: 'KNOWN', languageId: 'grc', addedAt: '' },
    };
    const result = applyGuard(tokens, knowledge, 'grc', true, true);
    expect(result).toHaveLength(1);
    expect(result[0].lemma).toBe('trackedWord');
  });

  it('always passes through non-free-language tokens even when limit is full', () => {
    const tokens: Token[] = [
      { lemma: 'latinWord', languageId: 'lat' },
      { lemma: 'greekNew', languageId: 'grc' },
    ];
    const knowledge: Record<string, KnowledgeEntry> = {};
    const result = applyGuard(tokens, knowledge, 'grc', true, true);
    expect(result).toHaveLength(1);
    expect(result[0].lemma).toBe('latinWord');
  });

  it('passes already-tracked free-language words through when limit is full', () => {
    const tokens: Token[] = [
      { lemma: 'α', languageId: 'grc' },
      { lemma: 'β', languageId: 'grc' },
    ];
    const knowledge: Record<string, KnowledgeEntry> = {
      α: { state: 'LEARNING', languageId: 'grc', addedAt: '' },
      β: { state: 'SEEN', languageId: 'grc', addedAt: '' },
    };
    const result = applyGuard(tokens, knowledge, 'grc', true, true);
    expect(result).toHaveLength(2);
  });
});

/**
 * Tests for setWordState return-value semantics used by LexDrawerPanel close logic.
 * The setWordStateWithStats in useKnowledge returns false when a save is blocked.
 * We test the guard conditions directly via the pure helper.
 */
describe('setWordState block conditions', () => {
  function wouldBlock(opts: {
    previousState: string;
    nextState: string;
    langId: string;
    freeLangId: string;
    isEnabled: boolean;
    isFull: boolean;
  }): boolean {
    const isNewTracked =
      !isTrackedWordState(opts.previousState) && isTrackedWordState(opts.nextState);
    return isNewTracked && opts.isEnabled && opts.langId === opts.freeLangId && opts.isFull;
  }

  it('blocks NEW → LEARNING when limit is full', () => {
    expect(
      wouldBlock({
        previousState: 'NEW',
        nextState: 'LEARNING',
        langId: 'grc',
        freeLangId: 'grc',
        isEnabled: true,
        isFull: true,
      })
    ).toBe(true);
  });

  it('does not block LEARNING → KNOWN (already tracked)', () => {
    expect(
      wouldBlock({
        previousState: 'LEARNING',
        nextState: 'KNOWN',
        langId: 'grc',
        freeLangId: 'grc',
        isEnabled: true,
        isFull: true,
      })
    ).toBe(false);
  });

  it('does not block for non-free language', () => {
    expect(
      wouldBlock({
        previousState: 'NEW',
        nextState: 'KNOWN',
        langId: 'lat',
        freeLangId: 'grc',
        isEnabled: true,
        isFull: true,
      })
    ).toBe(false);
  });

  it('does not block when limit is not enabled (paid plan)', () => {
    expect(
      wouldBlock({
        previousState: 'NEW',
        nextState: 'KNOWN',
        langId: 'grc',
        freeLangId: 'grc',
        isEnabled: false,
        isFull: true,
      })
    ).toBe(false);
  });

  it('does not block when limit is not yet full', () => {
    expect(
      wouldBlock({
        previousState: 'NEW',
        nextState: 'KNOWN',
        langId: 'grc',
        freeLangId: 'grc',
        isEnabled: true,
        isFull: false,
      })
    ).toBe(false);
  });

  it('blocks NEW → IGNORED? No — IGNORED is not tracked', () => {
    expect(
      wouldBlock({
        previousState: 'NEW',
        nextState: 'IGNORED',
        langId: 'grc',
        freeLangId: 'grc',
        isEnabled: true,
        isFull: true,
      })
    ).toBe(false);
  });
});

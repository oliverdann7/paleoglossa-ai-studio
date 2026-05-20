import { describe, it, expect } from 'vitest';
// Import from the pure-function utility, not the React hook, to avoid the
// firebase.ts import chain that throws without VITE_FIREBASE_* env vars in CI.
import { countTrackedWords } from '../../utils/vocabCount';
import { WordState } from '../../constants/wordStates';

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

  it('counts exactly at the limit boundary (200)', () => {
    const knowledge: TestKnowledge = {};
    for (let i = 0; i < 200; i++) {
      knowledge[`word${i}`] = makeEntry(WordState.KNOWN, 'grc');
    }
    expect(countTrackedWords(knowledge, 'grc')).toBe(200);
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

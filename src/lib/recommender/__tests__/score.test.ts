import { describe, it, expect } from 'vitest';
import {
  scoreText,
  recommendNext,
  type LearnerState,
  type TextVocabProfile,
} from '../score.js';

function makeProfile(
  textId: string,
  lemmaCounts: Record<string, number>,
  overrides: Partial<TextVocabProfile> = {}
): TextVocabProfile {
  const totalTokens = Object.values(lemmaCounts).reduce((sum, n) => sum + n, 0);
  const uniqueLemmas = Object.keys(lemmaCounts).length;
  return { textId, lemmaCounts, totalTokens, uniqueLemmas, ...overrides };
}

function knownSet(lemmas: string[]): LearnerState {
  return { knownLemmas: new Set(lemmas) };
}

describe('scoreText', () => {
  it('scores a text at the target comprehension above one that is too easy', () => {
    // Target: 93%. Build a 100-token text and vary how much is known.
    const at93 = makeProfile('at93', {
      ...Object.fromEntries(Array.from({ length: 93 }, (_, i) => [`k${i}`, 1])),
      ...Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`n${i}`, 1])),
    });
    const tooEasy = makeProfile('tooEasy', {
      ...Object.fromEntries(Array.from({ length: 99 }, (_, i) => [`k${i}`, 1])),
      n0: 1,
    });
    const learner = knownSet([
      ...Array.from({ length: 99 }, (_, i) => `k${i}`),
    ]);

    const a = scoreText(at93, learner);
    const e = scoreText(tooEasy, learner);

    expect(a.comprehension).toBeCloseTo(0.93, 2);
    expect(e.comprehension).toBeCloseTo(0.99, 2);
    expect(a.score).toBeGreaterThan(e.score);
  });

  it('scores a 93% text above a 60% text', () => {
    const at93 = makeProfile('at93', {
      ...Object.fromEntries(Array.from({ length: 93 }, (_, i) => [`k${i}`, 1])),
      ...Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`n${i}`, 1])),
    });
    const at60 = makeProfile('at60', {
      ...Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`k${i}`, 1])),
      ...Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`n${i}`, 1])),
    });
    const learner = knownSet(Array.from({ length: 93 }, (_, i) => `k${i}`));

    const a = scoreText(at93, learner);
    const b = scoreText(at60, learner);
    expect(a.score).toBeGreaterThan(b.score);
  });

  it('counts new lemmas as distinct unknown types, not token instances', () => {
    const p = makeProfile('p', { known: 5, unknownA: 3, unknownB: 1 });
    const learner = knownSet(['known']);
    const s = scoreText(p, learner);
    expect(s.newLemmas).toBe(2);
    expect(s.comprehension).toBeCloseTo(5 / 9, 5);
  });

  it('returns zero for an empty profile', () => {
    const s = scoreText(makeProfile('empty', {}), knownSet([]));
    expect(s).toEqual({ textId: 'empty', comprehension: 0, newLemmas: 0, score: 0 });
  });
});

describe('recommendNext', () => {
  const profiles: TextVocabProfile[] = [
    makeProfile('too-hard', {
      ...Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`k${i}`, 1])),
      ...Object.fromEntries(Array.from({ length: 70 }, (_, i) => [`n${i}`, 1])),
    }),
    makeProfile('just-right', {
      ...Object.fromEntries(Array.from({ length: 90 }, (_, i) => [`k${i}`, 1])),
      ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`n${i}`, 1])),
    }),
    makeProfile('almost-mastered', {
      ...Object.fromEntries(Array.from({ length: 98 }, (_, i) => [`k${i}`, 1])),
      ...Object.fromEntries(Array.from({ length: 2 }, (_, i) => [`n${i}`, 1])),
    }),
    makeProfile('already-read', {
      ...Object.fromEntries(Array.from({ length: 90 }, (_, i) => [`k${i}`, 1])),
      ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`m${i}`, 1])),
    }),
  ];
  const learner = knownSet(Array.from({ length: 99 }, (_, i) => `k${i}`));

  it('puts the i+1 text first', () => {
    const results = recommendNext(profiles, learner, { readTextIds: new Set(['already-read']) });
    expect(results[0]?.textId).toBe('just-right');
  });

  it('filters out texts below 60% comprehension', () => {
    const results = recommendNext(profiles, learner);
    expect(results.find((r) => r.textId === 'too-hard')).toBeUndefined();
  });

  it('respects readTextIds', () => {
    const results = recommendNext(profiles, learner, {
      readTextIds: new Set(['just-right', 'almost-mastered']),
    });
    expect(results.find((r) => r.textId === 'just-right')).toBeUndefined();
    expect(results.find((r) => r.textId === 'almost-mastered')).toBeUndefined();
  });

  it('honors limit', () => {
    expect(recommendNext(profiles, learner, { limit: 1 }).length).toBeLessThanOrEqual(1);
  });

  it('returns an empty list for cold-start (no known lemmas)', () => {
    const cold = knownSet([]);
    const results = recommendNext(profiles, cold);
    // Every text scores below the 0.6 floor.
    expect(results).toEqual([]);
  });

  it('filters by languageId when set', () => {
    const greek = makeProfile('greek', { logos: 50, theos: 50 }, { languageId: 'grc' });
    const latin = makeProfile('latin', { logos: 50, theos: 50 }, { languageId: 'lat' });
    const l: LearnerState = { knownLemmas: new Set(['logos', 'theos']), languageId: 'grc' };
    const results = recommendNext([greek, latin], l);
    expect(results.find((r) => r.textId === 'latin')).toBeUndefined();
  });
});

/**
 * Achievement triggers — context helpers and the unlock rules they feed.
 * Firestore is mocked; each test uses its own user id because confirmed
 * unlocks are remembered per user for the life of the module.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetDoc, mockSetDoc } = vi.hoisted(() => ({
  mockGetDoc: vi.fn(),
  mockSetDoc: vi.fn(),
}));

vi.mock('../../firebase.js', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: unknown, ...path: string[]) => ({ _path: path.join('/') })),
  collection: vi.fn(),
  getDocs: vi.fn(),
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
}));

import {
  ACHIEVEMENTS,
  POLYGLOT_WORDS_PER_LANGUAGE,
  checkAndUnlock,
  countTextsRead,
  wordKnownContext,
} from '../achievementService';
import { WordState } from '../../constants/wordStates';
import { vocabKey } from '../../vocabulary/identity';

type Entry = { state: WordState; languageId?: string };

function knownWords(languageId: string, count: number, state = WordState.KNOWN) {
  const map: Record<string, Entry> = {};
  for (let i = 0; i < count; i++) {
    map[vocabKey(`word${i}`, languageId)] = { state, languageId };
  }
  return map;
}

beforeEach(() => {
  mockGetDoc.mockReset().mockResolvedValue({ exists: () => false });
  mockSetDoc.mockReset().mockResolvedValue(undefined);
});

describe('wordKnownContext', () => {
  it('counts KNOWN words across every language and ignores other states', () => {
    const knowledge = {
      ...knownWords('grc', 3),
      ...knownWords('lat', 2),
      ...knownWords('heb', 4, WordState.FAMILIAR),
    };
    expect(wordKnownContext(knowledge).totalKnown).toBe(5);
  });

  it('adds the word being marked known, which the map does not hold yet', () => {
    const knowledge = knownWords('grc', 999);
    expect(wordKnownContext(knowledge).totalKnown).toBe(999);
    expect(
      wordKnownContext(knowledge, [{ lemma: 'λόγος', languageId: 'grc' }]).totalKnown
    ).toBe(1000);
  });

  it('does not count a newly known word twice when the map already has it', () => {
    const knowledge = knownWords('grc', 10);
    expect(wordKnownContext(knowledge, [{ lemma: 'word3', languageId: 'grc' }]).totalKnown).toBe(
      10
    );
  });

  it('treats the same spelling in two languages as two words', () => {
    const ctx = wordKnownContext({}, [
      { lemma: 'in', languageId: 'lat' },
      { lemma: 'in', languageId: 'got' },
    ]);
    expect(ctx.totalKnown).toBe(2);
  });

  it('counts a language only once it holds 50 known words', () => {
    const knowledge = {
      ...knownWords('grc', POLYGLOT_WORDS_PER_LANGUAGE),
      ...knownWords('lat', POLYGLOT_WORDS_PER_LANGUAGE),
      ...knownWords('heb', POLYGLOT_WORDS_PER_LANGUAGE - 1),
    };
    expect(wordKnownContext(knowledge).languageCount).toBe(2);
    expect(
      wordKnownContext(knowledge, [{ lemma: 'שלום', languageId: 'heb' }]).languageCount
    ).toBe(3);
  });

  it('does not count 50 words spread thinly over five languages', () => {
    const knowledge = {
      ...knownWords('grc', 10),
      ...knownWords('lat', 10),
      ...knownWords('heb', 10),
      ...knownWords('san', 10),
      ...knownWords('got', 10),
    };
    expect(wordKnownContext(knowledge)).toEqual({ totalKnown: 50, languageCount: 0 });
  });

  it('never counts the "unknown" language as a language', () => {
    const knowledge = knownWords('unknown', 80);
    expect(wordKnownContext(knowledge)).toEqual({ totalKnown: 80, languageCount: 0 });
  });

  it('reads the language from the key when the entry does not carry one', () => {
    const knowledge: Record<string, Entry> = {};
    for (let i = 0; i < 50; i++) {
      knowledge[vocabKey(`verbum${i}`, 'lat')] = { state: WordState.KNOWN };
    }
    expect(wordKnownContext(knowledge).languageCount).toBe(1);
  });
});

describe('countTextsRead', () => {
  it('counts texts marked completed or read past 95%', () => {
    expect(
      countTextsRead([
        { textId: 'a', completed: true, lastPosition: 10 },
        { textId: 'b', completed: false, lastPosition: 97 },
        { textId: 'c', completed: false, lastPosition: 40 },
        { textId: 'd' },
      ])
    ).toBe(2);
  });

  it('includes the text finished just now, without double counting it', () => {
    const progress = [{ textId: 'a', completed: true }];
    expect(countTextsRead(progress, 'b')).toBe(2);
    expect(countTextsRead(progress, 'a')).toBe(1);
  });
});

describe('checkAndUnlock', () => {
  const unlockedIds = () =>
    mockSetDoc.mock.calls.map(([ref]) => (ref as { _path: string })._path.split('/').pop());

  it('has a catalog entry for every achievement it can unlock', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    for (const id of [
      'codex_mille',
      'polyglottos',
      'philoponos',
      'bibliophilos',
      'mnemon',
      'palimpsestus',
    ]) {
      expect(ids).toContain(id);
    }
  });

  it.each([
    ['word_known', { totalKnown: 1000, languageCount: 0 }, ['codex_mille']],
    ['word_known', { totalKnown: 250, languageCount: 5 }, ['polyglottos']],
    ['word_known', { totalKnown: 999, languageCount: 4 }, []],
    ['read_session', { minutes: 60, textsRead: 0 }, ['philoponos']],
    ['read_session', { minutes: 12, textsRead: 5 }, ['bibliophilos']],
    ['read_session', { minutes: 59, textsRead: 4 }, []],
    ['streak_updated', { streak: 10 }, ['mnemon']],
    ['streak_updated', { streak: 9 }, []],
    ['word_reviewed', { reviewCount: 5 }, ['palimpsestus']],
    ['word_reviewed', { reviewCount: 4 }, []],
  ] as const)('%s %o unlocks %o', async (trigger, ctx, expected) => {
    const userId = `user-${trigger}-${JSON.stringify(ctx)}`;
    const result = await checkAndUnlock(userId, trigger, ctx);
    expect(result).toEqual(expected);
    expect(unlockedIds()).toEqual(expected);
  });

  it('does nothing without a signed-in user', async () => {
    expect(await checkAndUnlock('', 'streak_updated', { streak: 30 })).toEqual([]);
    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  it('does not unlock twice, and stops reading Firestore once an unlock is confirmed', async () => {
    expect(await checkAndUnlock('repeat-user', 'streak_updated', { streak: 10 })).toEqual(['mnemon']);
    expect(await checkAndUnlock('repeat-user', 'streak_updated', { streak: 11 })).toEqual([]);
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    expect(mockGetDoc).toHaveBeenCalledTimes(1);
  });
});

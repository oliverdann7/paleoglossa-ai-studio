/**
 * useKnowledge → `word_known` achievement check (Codex Mille, Polyglottos)
 * when a word is marked known, one at a time or a page at a time.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const { mockCheckAndUnlock, auth, vocab } = vi.hoisted(() => ({
  mockCheckAndUnlock: vi.fn(),
  auth: { user: { uid: 'user-1' } as { uid: string } | null },
  vocab: {
    knowledge: {} as Record<string, { state: string; languageId: string; addedAt: string }>,
    setWordState: vi.fn(),
    markPageAsSeen: vi.fn(),
  },
}));

vi.mock('../../firebase.js', () => ({ db: {} }));
vi.mock('../useAuth.js', () => ({ useAuth: () => ({ user: auth.user }) }));
vi.mock('../useVocabulary.js', async () => {
  const { vocabKey } = await import('../../vocabulary/identity.js');
  return {
    useVocabulary: () => ({
      knowledge: vocab.knowledge,
      knowledgeVersion: 0,
      getWordInfo: (lemma: string, lang?: string | null) =>
        vocab.knowledge[vocabKey(lemma, lang)] ?? { state: 'NEW', addedAt: '' },
      setWordState: vocab.setWordState,
      markPageAsSeen: vocab.markPageAsSeen,
      isLoading: false,
      error: null,
    }),
  };
});
vi.mock('../useStats.js', () => ({
  useStats: () => ({
    stats: { totalKnown: 0 },
    updateStatsState: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));
vi.mock('../useReadingProgress.js', () => ({ useReadingProgress: () => ({}) }));
vi.mock('../useVocabLimit.js', () => ({
  useVocabLimit: () => ({ languageId: 'grc', count: 0, limit: 200, isFull: false, isEnabled: false }),
}));
vi.mock('../../contexts/VocabLimitContext.js', () => ({ usePublishVocabLimit: () => vi.fn() }));
vi.mock('../useToast.js', () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../analytics.js', () => ({ trackEvent: vi.fn(), ANALYTICS_EVENTS: {} }));
vi.mock('../../services/milestoneService.js', () => ({ checkKnownWordMilestone: () => null }));
vi.mock('../../services/importService.js', () => ({
  ImportService: { getImports: vi.fn().mockResolvedValue([]) },
}));
vi.mock('../../services/achievementService.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/achievementService.js')>()),
  checkAndUnlock: mockCheckAndUnlock,
}));

import { useKnowledge } from '../useKnowledge';
import { WordState } from '../../constants/wordStates';
import { vocabKey } from '../../vocabulary/identity';

function seed(languageId: string, count: number, state: WordState = WordState.KNOWN) {
  for (let i = 0; i < count; i++) {
    vocab.knowledge[vocabKey(`w${i}`, languageId)] = { state, languageId, addedAt: '' };
  }
}

async function renderKnowledge() {
  const hook = renderHook(() => useKnowledge('grc'));
  await act(async () => {}); // let the imports load settle
  return hook;
}

beforeEach(() => {
  auth.user = { uid: 'user-1' };
  vocab.knowledge = {};
  vocab.setWordState.mockReset();
  vocab.markPageAsSeen.mockReset();
  mockCheckAndUnlock.mockReset().mockResolvedValue([]);
});

describe('useKnowledge → word_known', () => {
  it('counts every language plus the word just marked known', async () => {
    seed('grc', 600);
    seed('lat', 399);
    const { result } = await renderKnowledge();

    act(() => {
      result.current.setWordState('λόγος', WordState.KNOWN, 'grc');
    });

    expect(mockCheckAndUnlock).toHaveBeenCalledWith('user-1', 'word_known', {
      totalKnown: 1000,
      languageCount: 2,
    });
  });

  it('reports the fifth language reaching 50 known words', async () => {
    for (const lang of ['grc', 'lat', 'heb', 'san']) seed(lang, 50);
    seed('got', 49);
    const { result } = await renderKnowledge();

    act(() => {
      result.current.setWordState('guþ', WordState.KNOWN, 'got');
    });

    expect(mockCheckAndUnlock).toHaveBeenCalledWith('user-1', 'word_known', {
      totalKnown: 250,
      languageCount: 5,
    });
  });

  it('does not check for other states or for a word that was already known', async () => {
    seed('grc', 3);
    const { result } = await renderKnowledge();

    act(() => {
      result.current.setWordState('λόγος', WordState.LEARNING, 'grc');
      result.current.setWordState('w1', WordState.KNOWN, 'grc');
    });

    expect(mockCheckAndUnlock).not.toHaveBeenCalled();
  });

  it('checks once for a page marked known, counting only words that were new', async () => {
    seed('grc', 10);
    seed('lat', 1, WordState.LEARNING);
    const { result } = await renderKnowledge();

    act(() => {
      result.current.markPageAsSeen([
        { lemma: 'ἀρχή', languageId: 'grc' },
        { lemma: 'θεός', languageId: 'grc' },
        { lemma: 'w0', languageId: 'grc' }, // already known
        { lemma: 'w0', languageId: 'lat' }, // being learned — left alone
      ]);
    });

    expect(mockCheckAndUnlock).toHaveBeenCalledTimes(1);
    expect(mockCheckAndUnlock).toHaveBeenCalledWith('user-1', 'word_known', {
      totalKnown: 12,
      languageCount: 0,
    });
  });

  it('never checks for a guest', async () => {
    auth.user = null;
    const { result } = await renderKnowledge();

    act(() => {
      result.current.setWordState('λόγος', WordState.KNOWN, 'grc');
      result.current.markPageAsSeen([{ lemma: 'ἀρχή', languageId: 'grc' }]);
    });

    expect(vocab.setWordState).toHaveBeenCalled();
    expect(mockCheckAndUnlock).not.toHaveBeenCalled();
  });
});

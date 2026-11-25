/**
 * ReviewService.logReview → `word_reviewed` achievement check (Palimpsestus).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCount, mockCommit, mockCheckAndUnlock, mockWhere } = vi.hoisted(() => ({
  mockCount: vi.fn(),
  mockCommit: vi.fn(),
  mockCheckAndUnlock: vi.fn(),
  mockWhere: vi.fn((...args: unknown[]) => ({ _where: args })),
}));

vi.mock('../../firebase.js', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db: unknown, path: string) => ({ _path: path })),
  doc: vi.fn(() => ({})),
  query: vi.fn((...args: unknown[]) => args),
  where: mockWhere,
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => 'ts'),
  writeBatch: vi.fn(() => ({ update: vi.fn(), set: vi.fn(), commit: mockCommit })),
  getCountFromServer: mockCount,
}));
vi.mock('../../sync/syncStatus.js', () => ({
  markPendingWrite: vi.fn(),
  markWriteSuccess: vi.fn(),
  markWriteFailure: vi.fn(),
}));
vi.mock('../../errors/persistenceReporter.js', () => ({ reportPersistenceError: vi.fn() }));
vi.mock('../../hooks/useBeginnerProgress.js', () => ({ recordMilestone: vi.fn() }));
vi.mock('../achievementService.js', () => ({ checkAndUnlock: mockCheckAndUnlock }));

import { ReviewService, type ReviewItem } from '../reviewService';
import { vocabDocId } from '../../vocabulary/identity';

const item = {
  id: vocabDocId('λόγος', 'grc'),
  term: 'λόγος',
  languageId: 'grc',
  status: 'LEARNING',
  srs: { interval: 1, ease: 2.5, step: 1, lastReviewed: null, nextReview: new Date().toISOString() },
} as ReviewItem;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  mockCommit.mockReset().mockResolvedValue(undefined);
  mockCheckAndUnlock.mockReset().mockResolvedValue([]);
  mockCount.mockReset();
  mockWhere.mockClear();
});

describe('logReview → word_reviewed', () => {
  it('passes the number of logged reviews of this word to the achievement check', async () => {
    mockCount.mockResolvedValue({ data: () => ({ count: 3 }) });
    await ReviewService.logReview('user-a', item, 'GOOD', 1200);
    await flush();

    expect(mockWhere).toHaveBeenCalledWith('vocabItemId', '==', item.id);
    expect(mockCheckAndUnlock).toHaveBeenCalledWith('user-a', 'word_reviewed', { reviewCount: 3 });
  });

  it('stops counting for a user once a word has reached five reviews', async () => {
    mockCount.mockResolvedValue({ data: () => ({ count: 5 }) });
    await ReviewService.logReview('user-b', item, 'GOOD', 900);
    await flush();
    expect(mockCheckAndUnlock).toHaveBeenCalledWith('user-b', 'word_reviewed', { reviewCount: 5 });

    await ReviewService.logReview('user-b', item, 'GOOD', 900);
    await flush();
    expect(mockCount).toHaveBeenCalledTimes(1);
    expect(mockCheckAndUnlock).toHaveBeenCalledTimes(1);
  });

  it('never lets a failed count break the review', async () => {
    mockCount.mockRejectedValue(new Error('offline'));
    await expect(ReviewService.logReview('user-c', item, 'AGAIN', 500)).resolves.toBeDefined();
    await flush();
    expect(mockCheckAndUnlock).not.toHaveBeenCalled();
  });

  it('does not check when the review itself failed to save', async () => {
    mockCommit.mockRejectedValue(new Error('denied'));
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(ReviewService.logReview('user-d', item, 'GOOD', 500)).rejects.toThrow('denied');
    await flush();
    expect(mockCount).not.toHaveBeenCalled();
    logged.mockRestore();
  });
});

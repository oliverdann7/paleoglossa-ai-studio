import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../firebase.js', () => ({
  db: {},
}));

vi.mock('../../sync/syncStatus.js', () => ({
  markPendingWrite: vi.fn(),
  markWriteSuccess: vi.fn(),
  markWriteFailure: vi.fn(),
}));

vi.mock('../../constants/wordStates.js', () => ({
  WordState: { NEW: 'NEW', SEEN: 'SEEN', LEARNING: 'LEARNING', KNOWN: 'KNOWN', IGNORED: 'IGNORED' },
  normalizeWordState: (s: any) => s,
}));

vi.mock('../../constants/storage.js', () => ({
  STORAGE_KEYS: { KNOWLEDGE: 'paleoglossa_knowledge' },
}));

vi.mock('../../utils.js', () => ({
  normalizeTimestamp: (v: any) => v,
}));

vi.mock('../../utils/lemmaUtils.js', () => ({
  normalizeLemmaKey: (s: string) => s.toLowerCase(),
}));

vi.mock('../../errors/persistenceReporter.js', () => ({
  reportPersistenceError: vi.fn(),
}));

// Track batch commit calls.
const mockBatchCommit = vi.fn();
const mockBatchSet = vi.fn();
const mockBatchUpdate = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: any, path: string, id: string) => ({ path, id })),
  collection: vi.fn(),
  getDocs: vi.fn(async () => ({ forEach: vi.fn() })),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
  writeBatch: vi.fn(() => ({
    set: mockBatchSet,
    update: mockBatchUpdate,
    commit: mockBatchCommit,
  })),
  increment: vi.fn((n: number) => ({ _type: 'increment', n })),
  arrayUnion: vi.fn((...items: any[]) => ({ _type: 'arrayUnion', items })),
}));

// ── Import under test ─────────────────────────────────────────────────────────

import {
  getPendingVocabularyWriteCount,
  hasPendingVocabularyWrites,
  subscribeToVocabularyQueueStatus,
  VocabularyService,
} from '../vocabularyService.js';
import { markPendingWrite, markWriteSuccess, markWriteFailure } from '../../sync/syncStatus.js';

beforeEach(async () => {
  mockBatchCommit.mockResolvedValue(undefined);
  // Drain any queue state left by previous tests, then clear mock counters.
  await VocabularyService.flushPendingWrites();
  vi.clearAllMocks();
  mockBatchCommit.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllTimers();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('vocabulary write queue', () => {
  it('starts empty', () => {
    expect(getPendingVocabularyWriteCount()).toBe(0);
    expect(hasPendingVocabularyWrites()).toBe(false);
  });

  it('enqueue increases pending count and calls markPendingWrite', async () => {
    await VocabularyService.setWordState('user1', 'λόγος', 'KNOWN' as any, 'grc');
    expect(getPendingVocabularyWriteCount()).toBe(1);
    expect(hasPendingVocabularyWrites()).toBe(true);
    expect(markPendingWrite).toHaveBeenCalledTimes(1);
  });

  it('enqueuing the same term twice merges payloads without double-counting pending', async () => {
    await VocabularyService.setWordState('user1', 'λόγος', 'SEEN' as any, 'grc');
    await VocabularyService.setWordState('user1', 'λόγος', 'KNOWN' as any, 'grc');
    // Only one queue entry; markPendingWrite called once for the first enqueue.
    expect(getPendingVocabularyWriteCount()).toBe(1);
    expect(markPendingWrite).toHaveBeenCalledTimes(1);
  });

  it('flush clears queue and calls markWriteSuccess on success', async () => {
    await VocabularyService.setWordState('user1', 'λόγος', 'KNOWN' as any, 'grc');
    expect(getPendingVocabularyWriteCount()).toBe(1);

    await VocabularyService.flushPendingWrites();

    expect(getPendingVocabularyWriteCount()).toBe(0);
    expect(hasPendingVocabularyWrites()).toBe(false);
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    expect(markWriteSuccess).toHaveBeenCalledTimes(1);
    expect(markWriteFailure).not.toHaveBeenCalled();
  });

  it('flush on empty queue is a no-op', async () => {
    await VocabularyService.flushPendingWrites();
    expect(mockBatchCommit).not.toHaveBeenCalled();
  });

  it('failed batch commit calls markWriteFailure and does not mark success', async () => {
    mockBatchCommit.mockRejectedValueOnce(new Error('permission-denied'));

    await VocabularyService.setWordState('user1', 'λόγος', 'KNOWN' as any, 'grc');
    await VocabularyService.flushPendingWrites();

    expect(markWriteFailure).toHaveBeenCalledWith(expect.stringContaining('permission-denied'));
    expect(markWriteSuccess).not.toHaveBeenCalled();
  });

  it('drops terminal (permission-denied) failures instead of re-queueing', async () => {
    mockBatchCommit.mockRejectedValueOnce(new Error('permission-denied'));

    await VocabularyService.setWordState('user1', 'λόγος', 'KNOWN' as any, 'grc');
    await VocabularyService.flushPendingWrites();

    // Not retryable → not preserved in the queue.
    expect(getPendingVocabularyWriteCount()).toBe(0);
  });

  it('re-queues transient (unavailable) failures and drains them on a later flush', async () => {
    mockBatchCommit.mockRejectedValueOnce(new Error('unavailable'));

    await VocabularyService.setWordState('user1', 'λόγος', 'KNOWN' as any, 'grc');
    await VocabularyService.flushPendingWrites();

    // Transient failure → entry preserved for retry rather than silently dropped.
    expect(markWriteFailure).toHaveBeenCalled();
    expect(getPendingVocabularyWriteCount()).toBe(1);

    // A subsequent flush (backoff retry / lifecycle flush) succeeds and drains it.
    mockBatchCommit.mockResolvedValue(undefined);
    await VocabularyService.flushPendingWrites();

    expect(getPendingVocabularyWriteCount()).toBe(0);
    expect(markWriteSuccess).toHaveBeenCalled();
  });

  it('concurrent flush calls share the same in-flight promise', async () => {
    await VocabularyService.setWordState('user1', 'α', 'KNOWN' as any, 'grc');

    let resolveCommit!: () => void;
    mockBatchCommit.mockReturnValue(new Promise<void>((res) => (resolveCommit = res)));

    const p1 = VocabularyService.flushPendingWrites();
    const p2 = VocabularyService.flushPendingWrites();

    resolveCommit();
    await Promise.all([p1, p2]);

    // Only one batch.commit despite two flush calls.
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it('subscribeToVocabularyQueueStatus receives immediate snapshot and change events', async () => {
    const counts: number[] = [];
    const unsub = subscribeToVocabularyQueueStatus((n) => counts.push(n));

    expect(counts).toEqual([0]); // immediate snapshot

    await VocabularyService.setWordState('user1', 'β', 'KNOWN' as any, 'grc');
    expect(counts).toContain(1);

    await VocabularyService.flushPendingWrites();
    expect(counts[counts.length - 1]).toBe(0);

    unsub();

    // After unsub, further changes do not call the listener.
    const before = counts.length;
    await VocabularyService.setWordState('user1', 'γ', 'KNOWN' as any, 'grc');
    await VocabularyService.flushPendingWrites();
    expect(counts.length).toBe(before);
  });

  it('chunks large queues into batches of 500', async () => {
    const writes = 501;
    for (let i = 0; i < writes; i++) {
      await VocabularyService.setWordState('user1', `word${i}`, 'KNOWN' as any, 'grc');
    }
    expect(getPendingVocabularyWriteCount()).toBe(writes);

    await VocabularyService.flushPendingWrites();

    // 501 ops → 2 batches (500 + 1).
    expect(mockBatchCommit).toHaveBeenCalledTimes(2);
    expect(getPendingVocabularyWriteCount()).toBe(0);
  });
});

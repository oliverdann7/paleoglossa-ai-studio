/**
 * Service-level persistence tests — mocked Firestore.
 *
 * Two concerns:
 * 1. Demo/guest mode (userId === null): services must use localStorage and
 *    never call Firestore APIs.
 * 2. Authenticated mode (userId set): services must write to the correct
 *    Firestore paths with the expected payload shape.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Hoisted mocks (must be declared before vi.mock factories are executed) ────

const {
  mockSetDoc,
  mockUpdateDoc,
  mockGetDoc,
  mockGetDocs,
  mockDoc,
  mockBatchCommit,
  mockBatchSet,
  mockBatchUpdate,
} = vi.hoisted(() => ({
  mockSetDoc: vi.fn().mockResolvedValue(undefined),
  mockUpdateDoc: vi.fn().mockResolvedValue(undefined),
  mockGetDoc: vi.fn().mockResolvedValue({ exists: () => false, data: () => undefined }),
  mockGetDocs: vi.fn().mockResolvedValue({ forEach: vi.fn() }),
  mockDoc: vi.fn((_db: any, ...pathParts: string[]) => ({ _path: pathParts.join('/') })),
  mockBatchCommit: vi.fn().mockResolvedValue(undefined),
  mockBatchSet: vi.fn(),
  mockBatchUpdate: vi.fn(),
}));

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../../firebase.js', () => ({ db: {} }));
vi.mock('../../sync/syncStatus.js', () => ({
  markPendingWrite: vi.fn(),
  markWriteSuccess: vi.fn(),
  markWriteFailure: vi.fn(),
}));
vi.mock('../../constants/wordStates.js', () => ({
  WordState: {
    NEW: 'NEW',
    SEEN: 'SEEN',
    LEARNING: 'LEARNING',
    KNOWN: 'KNOWN',
    IGNORED: 'IGNORED',
  },
  normalizeWordState: (s: any) => s,
}));
vi.mock('../../constants/storage.js', () => ({
  STORAGE_KEYS: {
    KNOWLEDGE: 'paleoglossa_knowledge',
    IMPORTS: 'paleoglossa_imports',
    STATS: 'paleoglossa_stats',
    READING_PROGRESS_PREFIX: 'paleoglossa_rp_',
    RECENT_PROGRESS: 'paleoglossa_recent_progress',
  },
}));
vi.mock('../../utils.js', () => ({ normalizeTimestamp: (v: any) => v }));
vi.mock('../../utils/lemmaUtils.js', () => ({
  normalizeLemmaKey: (s: string) => s.toLowerCase(),
}));
vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  collection: vi.fn((_db: any, path: string) => ({ _path: path })),
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
  writeBatch: vi.fn(() => ({
    set: mockBatchSet,
    update: mockBatchUpdate,
    commit: mockBatchCommit,
  })),
  increment: vi.fn((n: number) => ({ _type: 'increment', n })),
  arrayUnion: vi.fn((...items: any[]) => ({ _type: 'arrayUnion', items })),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

// ── Import services under test ────────────────────────────────────────────────

import { VocabularyService } from '../vocabularyService.js';
import { StatsService } from '../statsService.js';
import { ImportService } from '../importService.js';

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.clearAllMocks();
  mockBatchCommit.mockResolvedValue(undefined);
  mockSetDoc.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Section 1: Demo / guest mode (userId === null) ────────────────────────────

describe('demo/guest mode — userId null', () => {
  describe('VocabularyService', () => {
    it('setWordState writes to localStorage, not Firestore', async () => {
      await VocabularyService.setWordState(null, 'λόγος', 'KNOWN' as any, 'grc');

      const stored = JSON.parse(localStorage.getItem('paleoglossa_knowledge') ?? '{}');
      const entry = Object.values(stored).find((v: any) => v.state === 'KNOWN');
      expect(entry).toBeDefined();
      expect(mockDoc).not.toHaveBeenCalled();
      expect(mockBatchCommit).not.toHaveBeenCalled();
    });

    it('getVocabulary reads from localStorage, not Firestore', async () => {
      localStorage.setItem(
        'paleoglossa_knowledge',
        JSON.stringify({ λόγος: { state: 'KNOWN', languageId: 'grc', addedAt: '2024-01-01' } })
      );
      const result = await VocabularyService.getVocabulary(null);
      expect(Object.keys(result).length).toBeGreaterThan(0);
      expect(mockGetDocs).not.toHaveBeenCalled();
    });

    it('returns empty map when localStorage is empty', async () => {
      const result = await VocabularyService.getVocabulary(null);
      expect(result).toEqual({});
      expect(mockGetDocs).not.toHaveBeenCalled();
    });
  });

  describe('ImportService', () => {
    it('saveImport writes to localStorage, not Firestore', async () => {
      await ImportService.saveImport(null, {
        title: 'Test text',
        languageId: 'grc',
        sourceType: 'paste',
        visibility: 'private',
        rawContent: 'some raw content',
      });

      const stored = JSON.parse(localStorage.getItem('paleoglossa_imports') ?? '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].title).toBe('Test text');
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('getImports reads from localStorage, not Firestore', async () => {
      localStorage.setItem(
        'paleoglossa_imports',
        JSON.stringify([{ id: 'imp1', title: 'Iliad' }])
      );
      const result = await ImportService.getImports(null);
      expect(result.length).toBe(1);
      expect(mockGetDocs).not.toHaveBeenCalled();
    });
  });

  describe('StatsService', () => {
    it('setTextProgress writes to localStorage, not Firestore', async () => {
      await StatsService.setTextProgress(null, {
        textId: 'text1',
        lastPosition: 42,
        completed: false,
        lastReadAt: new Date().toISOString(),
      });

      const stored = localStorage.getItem('paleoglossa_rp_text1');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.textId).toBe('text1');
      expect(parsed.lastPosition).toBe(42);
      expect(mockSetDoc).not.toHaveBeenCalled();
    });
  });
});

// ── Section 2: Authenticated mode — correct Firestore paths & payload ─────────

describe('authenticated mode — correct Firestore paths', () => {
  describe('VocabularyService.setWordState', () => {
    it('writes to users/{uid}/vocabulary/{termId}', async () => {
      await VocabularyService.setWordState('user1', 'λόγος', 'KNOWN' as any, 'grc');

      // Advance past the 2-second debounce and let the async flush settle.
      await vi.runAllTimersAsync();

      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(),
        'users/user1/vocabulary',
        expect.any(String)
      );
      expect(mockBatchCommit).toHaveBeenCalledTimes(1);

      // Verify payload shape via batch.set call.
      const setCall = mockBatchSet.mock.calls[0];
      expect(setCall).toBeDefined();
      const payload = setCall[1];
      expect(payload.term).toBe('λόγος');
      expect(payload.status).toBe('KNOWN');
      expect(payload.languageId).toBe('grc');
    });

    it('normalizes the term key to lowercase', async () => {
      await VocabularyService.setWordState('user1', 'LOGOS', 'SEEN' as any, 'grc');
      await vi.runAllTimersAsync();

      const setCall = mockBatchSet.mock.calls[0];
      const payload = setCall[1];
      expect(payload.normalizedTerm).toBe('logos');
    });
  });

  describe('StatsService.setTextProgress', () => {
    it('writes to users/{uid}/readingProgress/{textId}', async () => {
      await StatsService.setTextProgress('user1', {
        textId: 'genesis',
        lastPosition: 10,
        completed: false,
        lastReadAt: new Date().toISOString(),
      });

      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(),
        'users/user1/readingProgress',
        'genesis'
      );
      expect(mockSetDoc).toHaveBeenCalledTimes(1);

      const [, payload] = mockSetDoc.mock.calls[0];
      expect(payload.textId).toBe('genesis');
      expect(payload.lastPosition).toBe(10);
    });
  });

  describe('ImportService.saveImport', () => {
    it('writes to users/{uid}/imports/{importId}', async () => {
      await ImportService.saveImport('user1', {
        id: 'imp42',
        title: 'Thucydides',
        languageId: 'grc',
        sourceType: 'paste',
        visibility: 'private',
        rawContent: 'raw text content here',
      });

      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(),
        'users/user1/imports',
        'imp42'
      );
      expect(mockSetDoc).toHaveBeenCalledTimes(1);

      const [, payload] = mockSetDoc.mock.calls[0];
      expect(payload.title).toBe('Thucydides');
      expect(payload.languageId).toBe('grc');
    });

    it('throws on empty rawContent', async () => {
      await expect(
        ImportService.saveImport('user1', {
          title: 'Empty',
          languageId: 'grc',
          rawContent: '',
        })
      ).rejects.toThrow('Cannot save empty text');
    });
  });
});

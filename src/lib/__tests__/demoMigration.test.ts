import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkForDemoData, discardDemoData } from '../hooks/useDemoMigration.js';
import { STORAGE_KEYS } from '../constants/storage.js';

vi.mock('../firebase.js', () => ({
  auth: { currentUser: null, onAuthStateChanged: () => () => {} },
  db: {},
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

vi.mock('lucide-react', () => {
  const Icn = () => null;
  return {
    CheckCircle2: Icn,
    AlertCircle: Icn,
    Loader2: Icn,
    Database: Icn,
    Trash2: Icn,
  };
});

// ── Migration safety: services must throw on failure, preserving localStorage ──

describe('migration safety — services throw on failure, discardDemoData is not called', () => {
  it('VocabularyService.migrateLocalStorage throws when Firestore write fails and preserves localStorage', async () => {
    const { VocabularyService } = await import('../services/vocabularyService.js');
    const key = STORAGE_KEYS.KNOWLEDGE;
    localStorage.setItem(key, JSON.stringify({ μῆνιν: { state: 'KNOWN', languageId: 'grc' } }));

    // Spy on setWordState to simulate a Firestore failure
    vi.spyOn(VocabularyService, 'setWordState').mockRejectedValueOnce(
      new Error('Firestore unavailable')
    );

    await expect(VocabularyService.migrateLocalStorage('user1')).rejects.toThrow();
    // Local data must still be present
    expect(localStorage.getItem(key)).not.toBeNull();

    vi.restoreAllMocks();
  });

  it('ImportService.migrateLocalStorage throws when Firestore write fails and preserves localStorage', async () => {
    const { ImportService } = await import('../services/importService.js');
    const key = STORAGE_KEYS.IMPORTS;
    localStorage.setItem(key, JSON.stringify([{ id: '1', title: 'Demo text', sentences: [] }]));

    vi.spyOn(ImportService, 'saveImport').mockRejectedValueOnce(new Error('Firestore unavailable'));

    await expect(ImportService.migrateLocalStorage('user1')).rejects.toThrow();
    expect(localStorage.getItem(key)).not.toBeNull();

    vi.restoreAllMocks();
  });

  it('SettingsService.migrateLocalStorage throws when Firestore write fails and preserves localStorage', async () => {
    const { SettingsService } = await import('../services/settingsService.js');
    const key = STORAGE_KEYS.SETTINGS;
    localStorage.setItem(key, JSON.stringify({ theme: 'dark' }));

    vi.spyOn(SettingsService, 'saveSettings').mockRejectedValueOnce(
      new Error('Firestore unavailable')
    );

    await expect(SettingsService.migrateLocalStorage('user1')).rejects.toThrow();
    expect(localStorage.getItem(key)).not.toBeNull();

    vi.restoreAllMocks();
  });

  it('StatsService.migrateLocalStorage throws when Firestore write fails and preserves localStorage', async () => {
    const { StatsService } = await import('../services/statsService.js');
    const key = STORAGE_KEYS.STATS;
    localStorage.setItem(key, JSON.stringify({ totalKnown: 5 }));

    vi.spyOn(StatsService, 'updateStats').mockRejectedValueOnce(new Error('Firestore unavailable'));

    await expect(StatsService.migrateLocalStorage('user1')).rejects.toThrow();
    expect(localStorage.getItem(key)).not.toBeNull();

    vi.restoreAllMocks();
  });

  it('StatsService.migrateLocalReadingProgress throws when any item fails and preserves that item in localStorage', async () => {
    const { StatsService } = await import('../services/statsService.js');
    const progressKey = `${STORAGE_KEYS.READING_PROGRESS_PREFIX}text-failing`;
    localStorage.setItem(progressKey, JSON.stringify({ lastSentence: 3 }));

    vi.spyOn(StatsService, 'setTextProgress').mockRejectedValueOnce(
      new Error('Firestore unavailable')
    );

    await expect(StatsService.migrateLocalReadingProgress('user1')).rejects.toThrow();
    // Failed item must still be in localStorage
    expect(localStorage.getItem(progressKey)).not.toBeNull();

    vi.restoreAllMocks();
  });
});

beforeEach(() => {
  localStorage.clear();
});

describe('checkForDemoData', () => {
  it('returns all false when no demo data exists', () => {
    const result = checkForDemoData();
    expect(result.hasVocabulary).toBe(false);
    expect(result.hasImports).toBe(false);
    expect(result.hasStats).toBe(false);
    expect(result.hasSettings).toBe(false);
    expect(result.hasReadingProgress).toBe(false);
    expect(result.total).toBe(0);
  });

  it('detects vocabulary data', () => {
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify({ word1: { state: 'known' } }));
    const result = checkForDemoData();
    expect(result.hasVocabulary).toBe(true);
    expect(result.total).toBe(1);
  });

  it('detects imports', () => {
    localStorage.setItem(STORAGE_KEYS.IMPORTS, JSON.stringify([{ id: '1', title: 'test' }]));
    const result = checkForDemoData();
    expect(result.hasImports).toBe(true);
    expect(result.total).toBe(1);
  });

  it('detects stats', () => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify({ totalKnown: 10 }));
    const result = checkForDemoData();
    expect(result.hasStats).toBe(true);
    expect(result.total).toBe(1);
  });

  it('detects settings', () => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ theme: 'dark' }));
    const result = checkForDemoData();
    expect(result.hasSettings).toBe(true);
    expect(result.total).toBe(1);
  });

  it('detects reading progress', () => {
    localStorage.setItem(
      `${STORAGE_KEYS.READING_PROGRESS_PREFIX}text123`,
      JSON.stringify({ lastPosition: 50 })
    );
    const result = checkForDemoData();
    expect(result.hasReadingProgress).toBe(true);
    expect(result.total).toBe(1);
  });

  it('counts multiple data types', () => {
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, '{}');
    localStorage.setItem(STORAGE_KEYS.STATS, '{}');
    localStorage.setItem(STORAGE_KEYS.SETTINGS, '{}');
    const result = checkForDemoData();
    expect(result.total).toBe(3);
  });
});

describe('discardDemoData', () => {
  it('removes all demo data from localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, 'data');
    localStorage.setItem(STORAGE_KEYS.IMPORTS, 'data');
    localStorage.setItem(STORAGE_KEYS.STATS, 'data');
    localStorage.setItem(STORAGE_KEYS.SETTINGS, 'data');
    localStorage.setItem('paleoglossa_demo_mode', 'true');
    localStorage.setItem(`${STORAGE_KEYS.READING_PROGRESS_PREFIX}text1`, 'data');
    localStorage.setItem(`${STORAGE_KEYS.READING_PROGRESS_PREFIX}text2`, 'data');
    localStorage.setItem(STORAGE_KEYS.RECENT_PROGRESS, 'data');
    localStorage.setItem('unrelated_key', 'should-stay');

    discardDemoData();

    expect(localStorage.getItem(STORAGE_KEYS.KNOWLEDGE)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.IMPORTS)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.STATS)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeNull();
    expect(localStorage.getItem('paleoglossa_demo_mode')).toBeNull();
    expect(localStorage.getItem(`${STORAGE_KEYS.READING_PROGRESS_PREFIX}text1`)).toBeNull();
    expect(localStorage.getItem(`${STORAGE_KEYS.READING_PROGRESS_PREFIX}text2`)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.RECENT_PROGRESS)).toBeNull();

    // unrelated keys preserved
    expect(localStorage.getItem('unrelated_key')).toBe('should-stay');
  });

  it('does not throw when no demo data exists', () => {
    expect(() => discardDemoData()).not.toThrow();
  });
});

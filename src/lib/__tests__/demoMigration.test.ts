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

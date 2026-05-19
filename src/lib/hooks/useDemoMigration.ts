import { useState, useCallback } from 'react';
import { useAuth } from './useAuth.js';
import { VocabularyService } from '../services/vocabularyService.js';
import { ImportService } from '../services/importService.js';
import { StatsService } from '../services/statsService.js';
import { SettingsService } from '../services/settingsService.js';
import { STORAGE_KEYS } from '../constants/storage.js';

export interface DemoDataSummary {
  hasVocabulary: boolean;
  hasImports: boolean;
  hasStats: boolean;
  hasSettings: boolean;
  hasReadingProgress: boolean;
  total: number;
}

export type MigrationChoice = 'migrate' | 'keep-local' | 'discard';

export type MigrationPhase = 'idle' | 'prompt' | 'migrating' | 'success' | 'error' | 'discarding';

export function checkForDemoData(): DemoDataSummary {
  const hasVocabulary = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE) !== null;
  const hasImports = localStorage.getItem(STORAGE_KEYS.IMPORTS) !== null;
  const hasStats = localStorage.getItem(STORAGE_KEYS.STATS) !== null;
  const hasSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS) !== null;
  let hasReadingProgress = false;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEYS.READING_PROGRESS_PREFIX)) {
      hasReadingProgress = true;
      break;
    }
  }
  const total = [hasVocabulary, hasImports, hasStats, hasSettings, hasReadingProgress].filter(
    Boolean
  ).length;
  return { hasVocabulary, hasImports, hasStats, hasSettings, hasReadingProgress, total };
}

export function discardDemoData(): void {
  localStorage.removeItem(STORAGE_KEYS.KNOWLEDGE);
  localStorage.removeItem(STORAGE_KEYS.IMPORTS);
  localStorage.removeItem(STORAGE_KEYS.STATS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem('paleoglossa_demo_mode');
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEYS.READING_PROGRESS_PREFIX)) {
      toRemove.push(key);
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem(STORAGE_KEYS.RECENT_PROGRESS);
}

interface DemoMigrationState {
  phase: MigrationPhase;
  summary: DemoDataSummary | null;
  error: string | null;
  results: Record<string, number | boolean> | null;
}

function initState(): DemoMigrationState {
  return { phase: 'idle', summary: null, error: null, results: null };
}

export function useDemoMigration() {
  const { user } = useAuth();
  const userId = user ? user.uid : null;
  const [state, setState] = useState<DemoMigrationState>(initState);

  const check = useCallback(() => {
    if (!userId) return;
    const s = checkForDemoData();
    if (s.total > 0) {
      setState({ phase: 'prompt', summary: s, error: null, results: null });
    }
  }, [userId]);

  // Auto-check on mount when user is available
  // Uses lazy initialization pattern to avoid set-state-in-effect lint
  const [hasAutoChecked, setHasAutoChecked] = useState(false);
  if (!hasAutoChecked && userId && state.phase === 'idle') {
    const s = checkForDemoData();
    if (s.total > 0) {
      setState({ phase: 'prompt', summary: s, error: null, results: null });
    }
    setHasAutoChecked(true);
  }

  const runMigration = useCallback(
    async (choice: MigrationChoice) => {
      if (!userId) return;
      if (choice === 'keep-local') {
        setState(initState());
        return;
      }
      if (choice === 'discard') {
        setState({ phase: 'discarding', summary: null, error: null, results: null });
        discardDemoData();
        setState(initState());
        return;
      }
      setState({ phase: 'migrating', summary: null, error: null, results: null });
      const migrationResults: Record<string, number | boolean> = {};
      try {
        const vocabCount = await VocabularyService.migrateLocalStorage(userId);
        migrationResults.vocabulary = vocabCount;
        const importCount = await ImportService.migrateLocalStorage(userId);
        migrationResults.imports = importCount;
        const statsResult = await StatsService.migrateLocalStorage(userId);
        migrationResults.stats = statsResult !== null;
        const progressCount = await StatsService.migrateLocalReadingProgress(userId);
        migrationResults.readingProgress = progressCount;
        const settingsResult = await SettingsService.migrateLocalStorage(userId);
        migrationResults.settings = settingsResult;
        discardDemoData();
        setState({ phase: 'success', summary: null, error: null, results: migrationResults });
      } catch (e: any) {
        setState({
          phase: 'error',
          summary: null,
          error: e.message || 'Migration failed',
          results: null,
        });
      }
    },
    [userId]
  );

  const reset = useCallback(() => {
    setState(initState());
  }, []);

  return { ...state, runMigration, check, reset };
}

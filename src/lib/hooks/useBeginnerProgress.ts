import { useState, useCallback } from 'react';

const STORAGE_KEY = 'paleoglossa_beginner_progress';

export interface BeginnerProgress {
  scriptOpened: boolean;
  firstTextOpened: boolean;
  firstWordSaved: boolean;
  firstReviewCompleted: boolean;
}

export type BeginnerMilestone = keyof BeginnerProgress;

const DEFAULT_PROGRESS: BeginnerProgress = {
  scriptOpened: false,
  firstTextOpened: false,
  firstWordSaved: false,
  firstReviewCompleted: false,
};

function loadAll(): Record<string, BeginnerProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, BeginnerProgress>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function useBeginnerProgress() {
  const [progressMap, setProgressMap] = useState<Record<string, BeginnerProgress>>(loadAll);

  const getProgress = useCallback(
    (languageId: string): BeginnerProgress => {
      return { ...DEFAULT_PROGRESS, ...(progressMap[languageId] || {}) };
    },
    [progressMap]
  );

  const markMilestone = useCallback((languageId: string, milestone: BeginnerMilestone) => {
    setProgressMap((prev) => {
      const current = { ...DEFAULT_PROGRESS, ...(prev[languageId] || {}) };
      current[milestone] = true;
      const next = { ...prev, [languageId]: current };
      saveAll(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback((languageId?: string) => {
    setProgressMap((prev) => {
      if (languageId) {
        const next = { ...prev };
        delete next[languageId];
        saveAll(next);
        return next;
      }
      saveAll({});
      return {};
    });
  }, []);

  return { getProgress, markMilestone, resetProgress, progressMap };
}

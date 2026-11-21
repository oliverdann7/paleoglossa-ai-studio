import { useCallback, useState } from 'react';
import { STORAGE_KEYS } from '../constants/storage.js';

type Goals = Record<string, string>;

function readGoals(): Goals {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READING_GOALS);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Goals) : {};
  } catch {
    return {};
  }
}

/** The pathway destination a learner has chosen for a language (text ID), kept on this device. */
export function getReadingGoal(languageId: string | undefined | null): string | null {
  return (languageId && readGoals()[languageId]) || null;
}

/**
 * The chosen pathway destination for one language, with a setter.
 * Stored per device; it is a preference, not study data.
 */
export function useReadingGoal(languageId: string | undefined | null) {
  const [goals, setGoals] = useState<Goals>(readGoals);
  const setGoal = useCallback(
    (textId: string) => {
      if (!languageId) return;
      const next = { ...readGoals(), [languageId]: textId };
      try {
        localStorage.setItem(STORAGE_KEYS.READING_GOALS, JSON.stringify(next));
      } catch {
        // Storage unavailable: the choice still holds for this session.
      }
      setGoals(next);
    },
    [languageId]
  );
  return { goalTextId: (languageId && goals[languageId]) || null, setGoal };
}

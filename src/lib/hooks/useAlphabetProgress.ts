import { useCallback, useSyncExternalStore } from 'react';

/**
 * Per-language alphabet-course progress (completed lesson ids), stored in
 * localStorage. Mirrors the module-level-store pattern of
 * `useBeginnerProgress` so non-React callers can record completions too.
 * Deliberately local-only: alphabet drills are cheap to redo on a new
 * device, so this does not sync to Firestore.
 */

const STORAGE_KEY = 'paleoglossa_alphabet_progress';

type ProgressMap = Record<string, string[]>; // langId -> completed lesson ids
type Listener = () => void;

let progressMap: ProgressMap = loadFromStorage();
const listeners = new Set<Listener>();

function loadFromStorage(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const map: ProgressMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (Array.isArray(v)) map[k] = v.filter((x): x is string => typeof x === 'string');
    }
    return map;
  } catch {
    return {};
  }
}

function saveToStorage(map: ProgressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota exceeded or unavailable — silently ignore
  }
}

function notify() {
  for (const fn of listeners) fn();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ProgressMap {
  return progressMap;
}

/** Record a completed alphabet lesson. Idempotent. */
export function recordAlphabetLesson(langId: string, lessonId: string): void {
  if (!langId || !lessonId) return;
  const current = progressMap[langId] ?? [];
  if (current.includes(lessonId)) return;
  progressMap = { ...progressMap, [langId]: [...current, lessonId] };
  saveToStorage(progressMap);
  notify();
}

/** Read-only snapshot for non-React callers. */
export function getCompletedAlphabetLessons(langId: string): string[] {
  return progressMap[langId] ?? [];
}

/** Test-only: reset module-level state. */
export function __resetAlphabetProgressForTests(): void {
  progressMap = loadFromStorage();
  listeners.clear();
}

export function useAlphabetProgress() {
  const map = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const getCompleted = useCallback((langId: string): string[] => map[langId] ?? [], [map]);

  const markLessonComplete = useCallback((langId: string, lessonId: string) => {
    recordAlphabetLesson(langId, lessonId);
  }, []);

  const resetCourse = useCallback((langId: string) => {
    if (!(langId in progressMap)) return;
    const next = { ...progressMap };
    delete next[langId];
    progressMap = next;
    saveToStorage(progressMap);
    notify();
  }, []);

  return { getCompleted, markLessonComplete, resetCourse };
}

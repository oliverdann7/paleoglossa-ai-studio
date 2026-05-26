import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from './useAuth.js';

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

// ── Module-level store ──────────────────────────────────────────────────────
// Kept outside React so non-component callers (services, etc.) can record
// milestones via `recordMilestone` without going through a hook.

type ProgressMap = Record<string, BeginnerProgress>;
type Listener = () => void;

let progressMap: ProgressMap = loadFromStorage();
let currentUid: string | null = null;
const listeners = new Set<Listener>();

function loadFromStorage(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as ProgressMap;
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

function progressForLanguage(map: ProgressMap, languageId: string): BeginnerProgress {
  return { ...DEFAULT_PROGRESS, ...(map[languageId] || {}) };
}

function mergeProgress(
  a: BeginnerProgress | undefined,
  b: BeginnerProgress | undefined
): BeginnerProgress {
  const result: BeginnerProgress = { ...DEFAULT_PROGRESS };
  for (const key of Object.keys(DEFAULT_PROGRESS) as BeginnerMilestone[]) {
    result[key] = Boolean(a?.[key]) || Boolean(b?.[key]);
  }
  return result;
}

// ── Firestore sync ───────────────────────────────────────────────────────────

const COLLECTION = 'beginnerProgress';

function languageDocRef(firestore: Firestore, uid: string, languageId: string) {
  return doc(firestore, 'users', uid, COLLECTION, languageId);
}

async function fetchAllFromFirestore(uid: string): Promise<ProgressMap> {
  // We don't list — we only ever need to merge per language as it changes,
  // and the BeginnerHub component triggers an initial fetch via its useEffect.
  // For bulk load we read one doc per known language id present in localStorage
  // or already in the store. This keeps reads minimal.
  const map: ProgressMap = {};
  const knownIds = Array.from(
    new Set([...Object.keys(progressMap), ...Object.keys(loadFromStorage())])
  );
  await Promise.all(
    knownIds.map(async (langId) => {
      try {
        const snap = await getDoc(languageDocRef(db, uid, langId));
        if (snap.exists()) {
          const data = snap.data();
          map[langId] = {
            scriptOpened: !!data.scriptOpened,
            firstTextOpened: !!data.firstTextOpened,
            firstWordSaved: !!data.firstWordSaved,
            firstReviewCompleted: !!data.firstReviewCompleted,
          };
        }
      } catch {
        // ignore individual failures — keep local
      }
    })
  );
  return map;
}

async function writeLanguageToFirestore(
  uid: string,
  languageId: string,
  progress: BeginnerProgress
) {
  try {
    await setDoc(
      languageDocRef(db, uid, languageId),
      { ...progress, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch {
    // best-effort — localStorage remains the source of truth offline
  }
}

// ── Public API: non-React callers ────────────────────────────────────────────

/**
 * Record a beginner milestone for a language. Idempotent — repeated calls for
 * an already-set milestone are a no-op and skip Firestore writes.
 * Safe to call from anywhere (services, hooks, components).
 */
export function recordMilestone(languageId: string, milestone: BeginnerMilestone): void {
  if (!languageId) return;
  const current = progressForLanguage(progressMap, languageId);
  if (current[milestone]) return;

  const next: BeginnerProgress = { ...current, [milestone]: true };
  progressMap = { ...progressMap, [languageId]: next };
  saveToStorage(progressMap);
  notify();

  if (currentUid) {
    void writeLanguageToFirestore(currentUid, languageId, next);
  }
}

/** Read-only snapshot for non-React callers. */
export function getProgressFor(languageId: string): BeginnerProgress {
  return progressForLanguage(progressMap, languageId);
}

/**
 * Called by useBeginnerProgress when auth state changes. Merges any local
 * progress with Firestore and writes the union back. Idempotent.
 */
async function hydrateFromFirestore(uid: string): Promise<void> {
  currentUid = uid;
  const remote = await fetchAllFromFirestore(uid);
  const merged: ProgressMap = {};
  const allIds = new Set([...Object.keys(progressMap), ...Object.keys(remote)]);
  let changed = false;
  for (const id of allIds) {
    const m = mergeProgress(progressMap[id], remote[id]);
    merged[id] = m;
    if (JSON.stringify(m) !== JSON.stringify(progressMap[id])) changed = true;
  }
  if (changed) {
    progressMap = merged;
    saveToStorage(progressMap);
    notify();
  }
  // Push any locally-set milestones missing from remote.
  await Promise.all(
    Object.entries(merged).map(([langId, progress]) => {
      const remoteEntry = remote[langId];
      const needsPush =
        !remoteEntry ||
        (Object.keys(progress) as BeginnerMilestone[]).some(
          (k) => progress[k] && !remoteEntry[k]
        );
      return needsPush ? writeLanguageToFirestore(uid, langId, progress) : Promise.resolve();
    })
  );
}

function resetCurrentUser() {
  currentUid = null;
}

/**
 * Test-only: reset module-level state (in-memory map, current user, listeners).
 * Do not call from production code.
 */
export function __resetBeginnerProgressForTests(): void {
  progressMap = loadFromStorage();
  currentUid = null;
  listeners.clear();
}

// ── React hook ───────────────────────────────────────────────────────────────

export function useBeginnerProgress() {
  const { user } = useAuth();
  const map = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (user?.uid) {
      void hydrateFromFirestore(user.uid);
    } else {
      resetCurrentUser();
    }
  }, [user?.uid]);

  const getProgress = useCallback(
    (languageId: string): BeginnerProgress => progressForLanguage(map, languageId),
    [map]
  );

  const markMilestone = useCallback(
    (languageId: string, milestone: BeginnerMilestone) => {
      recordMilestone(languageId, milestone);
    },
    []
  );

  const resetProgress = useCallback((languageId?: string) => {
    if (languageId) {
      const next = { ...progressMap };
      delete next[languageId];
      progressMap = next;
    } else {
      progressMap = {};
    }
    saveToStorage(progressMap);
    notify();
  }, []);

  return { getProgress, markMilestone, resetProgress, progressMap: map };
}

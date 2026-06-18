import type { Rating } from '../srs/sm2.js';
import type { ReviewCard } from './reviewCardFactory.js';

/**
 * Session resume (roadmap § 11, 2.5).
 *
 * An in-progress review session is mirrored to sessionStorage so a reload or a
 * mobile tab eviction mid-review can be recovered instead of lost. The snapshot
 * is cleared when the session finishes or a fresh one starts.
 */

export const SESSION_KEY = 'paleoglossa_review_session';
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 6; // 6h — older snapshots are stale

export interface SavedReviewSession {
  v: 1;
  languageId: string;
  queue: ReviewCard[];
  currentCardIndex: number;
  sessionResults: { lemma: string; rating: Rating; responseMs: number }[];
  savedAt: number;
}

/**
 * Returns a resumable snapshot for the given language, or null when none is
 * valid (missing, malformed, stale, wrong language, or already finished).
 *
 * `now` is injectable for deterministic testing.
 */
export function readSavedSession(
  activeLanguageId: string,
  now: number = Date.now()
): SavedReviewSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SavedReviewSession;
    if (s?.v !== 1 || !Array.isArray(s.queue) || s.queue.length === 0) return null;
    if (typeof s.savedAt !== 'number' || now - s.savedAt > SESSION_MAX_AGE_MS) return null;
    if (s.languageId !== activeLanguageId) return null;
    // Index at/past the end means there's nothing left to resume.
    if (typeof s.currentCardIndex !== 'number' || s.currentCardIndex >= s.queue.length) return null;
    return s;
  } catch {
    return null;
  }
}

/** Persists the live session. Best-effort — quota/serialization errors are swallowed. */
export function writeSavedSession(
  session: Omit<SavedReviewSession, 'v' | 'savedAt'>,
  now: number = Date.now()
): void {
  try {
    const payload: SavedReviewSession = { v: 1, savedAt: now, ...session };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function clearSavedSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

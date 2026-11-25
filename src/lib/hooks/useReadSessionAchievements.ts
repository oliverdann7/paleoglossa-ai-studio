import { useCallback, useEffect, useRef } from 'react';
import { StatsService } from '../services/statsService.js';
import { checkAndUnlock, countTextsRead } from '../services/achievementService.js';

/** Philoponos threshold — mirrors the `read_session` case in achievementService. */
export const LONG_SESSION_MINUTES = 60;

const MINUTE_MS = 60_000;

/**
 * Fires the `read_session` achievement check from the Reader, for signed-in
 * users only (pass `userId = null` for guests).
 *
 * A session is one stay in the Reader: minutes are counted while the tab is
 * visible and carry across texts opened without leaving. The check runs when
 * the session reaches an hour and each time a text is read to its end.
 */
export function useReadSessionAchievements(
  userId: string | null,
  textId: string | undefined,
  finished: boolean
): void {
  const minutesRef = useRef(0);
  const finishedTextsRef = useRef<Set<string>>(new Set());

  const fire = useCallback(
    (justFinished?: string) => {
      if (!userId) return;
      const minutes = minutesRef.current;
      // Every language: "5 different texts" is not scoped to the active one.
      StatsService.getAllProgress(userId)
        .then((progress) =>
          checkAndUnlock(userId, 'read_session', {
            minutes,
            textsRead: countTextsRead(progress, justFinished),
          })
        )
        .catch(() => undefined);
    },
    [userId]
  );

  useEffect(() => {
    if (!userId) return;
    minutesRef.current = 0;
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      minutesRef.current += 1;
      if (minutesRef.current === LONG_SESSION_MINUTES) fire();
    }, MINUTE_MS);
    return () => clearInterval(timer);
  }, [userId, fire]);

  useEffect(() => {
    if (!userId || !textId || !finished) return;
    if (finishedTextsRef.current.has(textId)) return;
    finishedTextsRef.current.add(textId);
    fire(textId);
  }, [userId, textId, finished, fire]);
}

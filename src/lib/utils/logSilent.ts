/**
 * Log a non-fatal background failure that was previously swallowed by an empty
 * `.catch(() => {})`. The app continues — these are fire-and-forget side effects
 * (XP awards, progress sync, analytics, cosmetic playback) — but the error is no
 * longer invisible, so production issues can be diagnosed.
 *
 * Usage: `somePromise.catch((e) => logSilentFailure('Review.awardXP', e))`
 */
export function logSilentFailure(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[silent] ${context}:`, message);
}

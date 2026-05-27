import type { BeginnerProgress } from '../hooks/useBeginnerProgress.js';

export type DailyPathItemId = 'script' | 'reading' | 'review';

export interface DailyPathItem {
  id: DailyPathItemId;
  /** Rough minutes estimate shown to the user. */
  estimatedMinutes: number;
  /** True when the user has already completed this step. */
  isComplete: boolean;
  /** Route to navigate to when the user clicks Start. */
  link: string;
  /** ID of the corpus text to read (reading items only). */
  textId?: string;
  /** Number of SRS cards due (review items only). */
  dueCount?: number;
}

export interface DailyPathInput {
  /** Primary language the user is studying. */
  languageId: string;
  /** Resolved tier id (e.g. 'know-nothing', 'know-alphabet'). */
  tierId: string;
  /** Whether this language has a Script Lab dataset. */
  hasScriptLearning: boolean;
  /** Beginner-hub milestone state for this language. */
  progress: BeginnerProgress;
  /** Recommended beginner text ID (null when none available). */
  textId: string | null;
  /** Number of SRS cards due today (including overdue). */
  dueCount: number;
  /**
   * Target study time per day in minutes (from onboardingProfile).
   * Used to scale the reading-time estimate. Defaults to 10.
   */
  dailyCommitment: number;
}

/**
 * Builds an ordered queue of up to three daily study steps for the given
 * language. Pure function — no side effects, testable without mocks.
 *
 * Order: script drill → reading bite → review.
 * Each item is only included when it is applicable and actionable:
 *  - Script: if the language has a Script Lab dataset AND the user is a
 *    complete beginner (know-nothing tier) OR hasn't opened it yet.
 *  - Reading: if a beginner text is available for the language.
 *  - Review: if there are SRS cards due today.
 */
export function computeDailyPath(input: DailyPathInput): DailyPathItem[] {
  const { languageId, tierId, hasScriptLearning, progress, textId, dueCount, dailyCommitment } =
    input;

  const items: DailyPathItem[] = [];

  // ── Script drill ─────────────────────────────────────────────────────────
  // Show for absolute beginners and for anyone who hasn't opened it yet.
  // Once opened, it still shows (as complete) for know-nothing tier so the
  // milestone is visible; it drops off for higher tiers.
  const scriptApplicable =
    hasScriptLearning && (tierId === 'know-nothing' || !progress.scriptOpened);
  if (scriptApplicable) {
    items.push({
      id: 'script',
      estimatedMinutes: 5,
      isComplete: progress.scriptOpened,
      link: `/app/script-lab?lang=${languageId}`,
    });
  }

  // ── Reading bite ─────────────────────────────────────────────────────────
  // Always recommended when there is a beginner text. The estimated time
  // scales proportionally with dailyCommitment, clamped to [5, 20] minutes.
  if (textId) {
    const readingMinutes = Math.max(5, Math.min(20, Math.floor(dailyCommitment * 0.5)));
    items.push({
      id: 'reading',
      estimatedMinutes: readingMinutes,
      isComplete: progress.firstTextOpened,
      link: `/app/reader/${textId}`,
      textId,
    });
  }

  // ── Review ────────────────────────────────────────────────────────────────
  // Only shown when the queue is non-empty. Rough throughput: ~6 cards/min.
  if (dueCount > 0) {
    const reviewMinutes = Math.max(5, Math.min(30, Math.ceil(dueCount / 6)));
    items.push({
      id: 'review',
      estimatedMinutes: reviewMinutes,
      isComplete: false, // completion is tracked by the Review page
      link: '/app/review',
      dueCount,
    });
  }

  return items;
}

/** Sum of estimated minutes across all items. */
export function totalEstimatedMinutes(items: DailyPathItem[]): number {
  return items.reduce((sum, item) => sum + item.estimatedMinutes, 0);
}

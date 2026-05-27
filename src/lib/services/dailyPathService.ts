export interface DailyPathItem {
  type: 'script' | 'reading' | 'review';
  title: string;
  description: string;
  estimatedMinutes: number;
  link: string;
  done: boolean;
}

export interface DailyPathInput {
  languageId: string;
  languageName: string;
  writingSystem: string;
  hasScriptLearning: boolean;
  dailyCommitment: number;
  tierId: string;
  scriptOpened: boolean;
  dueReviewCount: number;
  recommendedTextId: string | null;
  recommendedTextTitle: string | null;
  readToday: boolean;
}

const SCRIPT_MINUTES = 3;
const SECS_PER_CARD = 30;
const MAX_REVIEW_FRACTION = 0.4;

export function buildDailyPath(input: DailyPathInput): DailyPathItem[] {
  const {
    languageId,
    languageName,
    writingSystem,
    hasScriptLearning,
    dailyCommitment,
    scriptOpened,
    dueReviewCount,
    recommendedTextId,
    recommendedTextTitle,
    readToday,
  } = input;

  if (!languageId) return [];

  const commitment = Math.max(5, dailyCommitment);
  const items: DailyPathItem[] = [];
  let remaining = commitment;

  // ── 1. Script drill — first visit only ─────────────────────────────────
  if (hasScriptLearning && !scriptOpened && remaining > 0) {
    const est = Math.min(SCRIPT_MINUTES, remaining);
    items.push({
      type: 'script',
      title: `Learn the ${writingSystem}`,
      description: `Practice signs and reading for ${languageName}`,
      estimatedMinutes: est,
      link: `/app/language/${languageId}/script-lab`,
      done: false,
    });
    remaining -= est;
  }

  // Reserve time for reviews before sizing the reading bite.
  const reviewMinutes =
    dueReviewCount > 0
      ? Math.max(1, Math.min(
          Math.ceil((dueReviewCount * SECS_PER_CARD) / 60),
          Math.floor(commitment * MAX_REVIEW_FRACTION)
        ))
      : 0;

  // ── 2. Reading bite ─────────────────────────────────────────────────────
  if (recommendedTextId && remaining > 0) {
    const readMinutes = Math.max(1, remaining - reviewMinutes);
    items.push({
      type: 'reading',
      title: recommendedTextTitle ?? 'Read a text',
      description: `Continue reading in ${languageName}`,
      estimatedMinutes: readMinutes,
      link: `/app/reader/${recommendedTextId}`,
      done: readToday,
    });
  }

  // ── 3. Review cards due ─────────────────────────────────────────────────
  if (dueReviewCount > 0) {
    items.push({
      type: 'review',
      title: `${dueReviewCount} card${dueReviewCount === 1 ? '' : 's'} due`,
      description: 'Quick SRS review session',
      estimatedMinutes: reviewMinutes,
      link: '/app/review',
      done: false,
    });
  }

  return items;
}

/** Returns true when lastReadAt ISO string is from today (local time). */
export function isReadToday(lastReadAt: string | null | undefined): boolean {
  if (!lastReadAt) return false;
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  return lastReadAt.startsWith(today);
}

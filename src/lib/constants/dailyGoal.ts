/**
 * Daily-goal mapping (roadmap § 11, 1.3): the minutes commitment a user picks
 * during onboarding (5/10/20/60) becomes the word goal they are measured on.
 *
 * ~5 words/min is a deliberately conservative pace for ancient-language
 * reading with lookups — the goal should be reachable on a normal day.
 */
export const GOAL_WORDS_PER_MINUTE = 5;

export const MIN_DAILY_GOAL_WORDS = 25;
export const MAX_DAILY_GOAL_WORDS = 300;

export function commitmentToDailyGoalWords(dailyCommitmentMinutes: number | undefined): number {
  if (!dailyCommitmentMinutes || dailyCommitmentMinutes <= 0) return 50;
  const words = Math.round(dailyCommitmentMinutes * GOAL_WORDS_PER_MINUTE);
  return Math.min(MAX_DAILY_GOAL_WORDS, Math.max(MIN_DAILY_GOAL_WORDS, words));
}

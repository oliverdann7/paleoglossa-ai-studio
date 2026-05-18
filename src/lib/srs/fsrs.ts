/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm Implementation
 * Based on the algorithm by Open Spaced Repetition
 * Reference: https://github.com/open-spaced-repetition/fsrs
 */

export interface FSRSState {
  // Memory state
  stability: number; // Stability of memory (in days)
  difficulty: number; // Difficulty factor (0- infinity, default 1)

  // Scheduling
  interval: number; // Interval in days
  dueDate: Date; // Next due date
  repetitions: number; // Number of successful reviews

  // Legacy fields for compatibility
  ease: number;
  step: number;
  lastReviewed: string | null;
  nextReview: string;
}

export type FSRRating = 'again' | 'hard' | 'good' | 'easy';

// Helper function
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Calculate next FSRS state given a rating
 */
export function calculateFSRS(
  rating: FSRRating,
  state: FSRSState,
  now: Date = new Date()
): FSRSState {
  const R = 0.9; // Desired retention

  let newStability: number;
  let newDifficulty: number;
  let newRepetitions: number;
  let newInterval: number;

  if (rating === 'again') {
    // Reset on failure
    newStability = 1;
    newDifficulty = Math.min(10, state.difficulty + 1);
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // First review - rating is not 'again'
    if (state.repetitions === 0) {
      newStability = rating === 'easy' ? 4 : rating === 'good' ? 2 : 1;
      newDifficulty = 5;
      newRepetitions = 1;
      newInterval = 1;
    } else {
      // Calculate new stability based on previous stability and rating
      const S = state.stability;

      // Hard decreases stability, Easy increases
      if (rating === 'hard') {
        newStability = S * (1 + Math.exp(-0.1)) * 0.8;
      } else if (rating === 'good') {
        newStability = S * (1 + Math.exp(-0.1));
      } else {
        // easy
        newStability = S * (1 + Math.exp(-0.1)) * 1.3;
      }

      // Difficulty adjustment
      const grade = rating === 'hard' ? 2 : rating === 'good' ? 3 : 4;
      const difficultyChange = (3 - grade) / 18;
      newDifficulty = clamp(state.difficulty + difficultyChange, 1, 10);

      newRepetitions = state.repetitions + 1;

      // Calculate interval based on stability
      if (newRepetitions === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(state.interval * (newStability / state.stability) * R);
      }

      // Apply rating modifiers
      if (rating === 'easy') {
        newInterval = Math.round(newInterval * 1.3);
      } else if (rating === 'hard') {
        newInterval = Math.round(newInterval * 0.8);
      }

      // Cap interval at reasonable max (1 year)
      newInterval = Math.min(newInterval, 365);
    }
  }

  // Calculate next due date
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + newInterval);

  return {
    stability: newStability,
    difficulty: newDifficulty,
    interval: newInterval,
    dueDate,
    repetitions: newRepetitions,
    ease: 2.5 - (newDifficulty - 5) * 0.1,
    step: 0,
    lastReviewed: now.toISOString(),
    nextReview: dueDate.toISOString(),
  };
}

/**
 * Get initial FSRS state for a new card
 */
export function getInitialFSRSState(): FSRSState {
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 1); // Due tomorrow

  return {
    stability: 1,
    difficulty: 5,
    interval: 0,
    dueDate,
    repetitions: 0,
    ease: 2.5,
    step: 0,
    lastReviewed: null,
    nextReview: dueDate.toISOString(),
  };
}

/**
 * Check if a card is due for review
 */
export function isDue(state: FSRSState, now: Date = new Date()): boolean {
  return now >= state.dueDate;
}

/**
 * Get ease description for UI
 */
export function getEaseDescription(rating: FSRRating): string {
  switch (rating) {
    case 'again':
      return 'Again (< 1m)';
    case 'hard':
      return 'Hard (1d)';
    case 'good':
      return 'Good (3d+)';
    case 'easy':
      return 'Easy (7d+)';
  }
}

/**
 * Get next interval preview for each rating
 */
export function getIntervalPreviews(state: FSRSState): Record<FSRRating, string> {
  const againState = calculateFSRS('again', state);
  const hardState = calculateFSRS('hard', state);
  const goodState = calculateFSRS('good', state);
  const easyState = calculateFSRS('easy', state);

  return {
    again: formatInterval(againState.interval),
    hard: formatInterval(hardState.interval),
    good: formatInterval(goodState.interval),
    easy: formatInterval(easyState.interval),
  };
}

function formatInterval(days: number): string {
  if (days < 1) return '< 1d';
  if (days === 1) return '1d';
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}yr`;
}

// Export type for backwards compatibility
export type Rating = FSRRating;

/**
 * SuperMemo-2 (SM-2) algorithm implementation.
 */

export interface SRSState {
  interval: number; // in days
  ease: number;
  step: number; // consecutive correct reviews
  lastReviewed: string | null;
  nextReview: string;
}

export type Rating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export const SM2_BASE_EASE = 2.5;
export const SM2_MIN_EASE = 1.3;
export const SM2_MAX_EASE = 3.0;
export const SM2_MAX_INTERVAL = 365;

export function calculateSM2(
  rating: Rating,
  state: SRSState | null,
  now: Date = new Date()
): SRSState {
  const currentState = state || {
    interval: 0,
    ease: SM2_BASE_EASE,
    step: 0,
    lastReviewed: null,
    nextReview: now.toISOString(),
  };

  let { interval, ease, step } = currentState;

  // Mapping rating to quality (0-5 scale in original SM-2)
  // 5: EASY
  // 4: GOOD
  // 3: HARD
  // 0-2: AGAIN (failed)
  let quality = 0;
  switch (rating) {
    case 'EASY':
      quality = 5;
      break;
    case 'GOOD':
      quality = 4;
      break;
    case 'HARD':
      quality = 3;
      break;
    case 'AGAIN':
      quality = 0;
      break;
  }

  // Calculate new Ease Factor
  // Ease = Ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (quality >= 3) {
    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    ease = Math.max(SM2_MIN_EASE, ease - 0.2);
  }

  if (ease < SM2_MIN_EASE) ease = SM2_MIN_EASE;
  if (ease > SM2_MAX_EASE) ease = SM2_MAX_EASE;

  // Calculate new Interval
  if (quality < 3) {
    interval = 1;
    step = 0;
  } else {
    step += 1;
    if (step === 1) {
      interval = 1;
    } else if (step === 2) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * ease);
    }
  }

  // Adjust for EASY
  if (rating === 'EASY' && step > 1) {
    interval = Math.ceil(interval * 1.3);
  }

  if (interval > SM2_MAX_INTERVAL) {
    interval = SM2_MAX_INTERVAL;
  }

  // Use UTC-based date math to avoid timezone edge cases
  const nextReviewDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + interval)
  );

  return {
    interval,
    ease,
    step,
    lastReviewed: now.toISOString(),
    nextReview: nextReviewDate.toISOString(),
  };
}

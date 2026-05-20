/**
 * FSRS-5 (Free Spaced Repetition Scheduler v5)
 * Reference: https://github.com/open-spaced-repetition/fsrs5-spec
 *
 * Default parameters are the FSRS-5 community defaults trained on 20M+ reviews.
 */

// ─── Parameters ──────────────────────────────────────────────────────────────

const W: readonly number[] = [
  0.40255, // w0  — initial stability for Again
  1.18385, // w1  — initial stability for Hard
  3.17305, // w2  — initial stability for Good
  15.6905, // w3  — initial stability for Easy
  7.1949,  // w4  — initial difficulty offset
  0.5345,  // w5  — difficulty scaling exponent
  1.4604,  // w6  — difficulty change per rating step
  0.0046,  // w7  — mean-reversion weight
  1.54575, // w8  — stability growth exponent (ln base)
  0.1192,  // w9  — stability decay exponent
  1.01925, // w10 — retrievability influence on growth
  1.9395,  // w11 — stability after forget multiplier
  0.11,    // w12 — difficulty penalty on relearning
  0.29605, // w13 — interval influence on relearning
  2.2698,  // w14 — retrievability influence on relearning
  0.2315,  // w15 — Hard penalty on stability growth
  2.9898,  // w16 — Easy bonus on stability growth
  0.51,    // w17 — short-term stability modifier
  0.0,     // w18 — reserved
];

/** Desired retention rate (90 %). Drives interval calculation. */
const DESIRED_RETENTION = 0.9;

/** Forgetting-curve parameters: R(t, S) = (1 + FACTOR · t/S)^DECAY */
const DECAY = -0.5;
const FACTOR = 19 / 81; // ≈ 0.2346

// ─── Public types ─────────────────────────────────────────────────────────────

export interface FSRSState {
  stability: number;   // S — estimated memory stability (days)
  difficulty: number;  // D — card difficulty [1, 10]
  interval: number;    // scheduled interval in days
  dueDate: Date;
  repetitions: number; // total successful reviews
  // Legacy fields kept for SM-2 compatibility in reviewService.ts
  ease: number;
  step: number;
  lastReviewed: string | null;
  nextReview: string;
}

export type FSRRating = 'again' | 'hard' | 'good' | 'easy';
export type Rating = FSRRating;

// ─── Core math ────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Retrievability given elapsed days and stability. */
function retrievability(t: number, S: number): number {
  return Math.pow(1 + FACTOR * (t / S), DECAY);
}

/** Initial difficulty from the first rating (r = 1..4). */
function initialDifficulty(r: number): number {
  return clamp(W[4] - Math.exp(W[5] * (r - 1)) + 1, 1, 10);
}

/** Difficulty adjustment after a subsequent review. */
function nextDifficulty(D: number, r: number): number {
  const delta = W[6] * (r - 3);
  const D0_easy = initialDifficulty(4);
  // Mean-reversion toward easy-difficulty to prevent drift
  const raw = D - delta;
  const meanReverted = W[7] * D0_easy + (1 - W[7]) * raw;
  return clamp(meanReverted, 1, 10);
}

/** Stability growth after a successful recall. */
function stabilityAfterRecall(D: number, S: number, R: number, r: number): number {
  const hardPenalty = r === 2 ? W[15] : 1;
  const easyBonus = r === 4 ? W[16] : 1;
  const growth =
    Math.exp(W[8]) *
    (11 - D) *
    Math.pow(S, -W[9]) *
    (Math.exp(W[10] * (1 - R)) - 1) *
    hardPenalty *
    easyBonus;
  return S * (growth + 1);
}

/** Stability after a lapse (Again rating). */
function stabilityAfterForgetting(D: number, S: number, R: number): number {
  return (
    W[11] *
    Math.pow(D, -W[12]) *
    (Math.pow(S + 1, W[13]) - 1) *
    Math.exp(W[14] * (1 - R))
  );
}

/** Next interval in days targeting DESIRED_RETENTION. */
function nextInterval(S: number): number {
  // Derived by solving R(I, S) = DESIRED_RETENTION
  const raw = (S / FACTOR) * (Math.pow(DESIRED_RETENTION, 1 / DECAY) - 1);
  return clamp(Math.round(raw), 1, 365);
}

// ─── Main API ─────────────────────────────────────────────────────────────────

const RATING_INDEX: Record<FSRRating, number> = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4,
};

export function calculateFSRS(
  rating: FSRRating,
  state: FSRSState,
  now: Date = new Date()
): FSRSState {
  const r = RATING_INDEX[rating];
  const isNew = state.repetitions === 0;

  let S: number;
  let D: number;
  let reps: number;
  let interval: number;

  if (isNew) {
    // First review — stability and difficulty come from initial formulas
    S = W[r - 1]; // w0–w3 are initial stabilities per rating
    D = initialDifficulty(r);
    reps = rating === 'again' ? 0 : 1;
    interval = rating === 'again' ? 1 : nextInterval(S);
  } else if (rating === 'again') {
    // Lapse: stability drops, difficulty increases
    const elapsed = Math.max(
      1,
      Math.round((now.getTime() - new Date(state.lastReviewed ?? now).getTime()) / 86_400_000)
    );
    const R = retrievability(elapsed, state.stability);
    S = stabilityAfterForgetting(state.difficulty, state.stability, R);
    D = nextDifficulty(state.difficulty, r);
    reps = 0;
    interval = 1;
  } else {
    // Recall: stability grows, difficulty adjusts
    const elapsed = Math.max(
      1,
      Math.round((now.getTime() - new Date(state.lastReviewed ?? now).getTime()) / 86_400_000)
    );
    const R = retrievability(elapsed, state.stability);
    S = stabilityAfterRecall(state.difficulty, state.stability, R, r);
    D = nextDifficulty(state.difficulty, r);
    reps = state.repetitions + 1;
    interval = nextInterval(S);
  }

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + interval);

  return {
    stability: Math.max(S, 0.1),
    difficulty: D,
    interval,
    dueDate,
    repetitions: reps,
    // Legacy fields
    ease: clamp(2.5 + (5 - D) * 0.1, 1.3, 3.0),
    step: reps,
    lastReviewed: now.toISOString(),
    nextReview: dueDate.toISOString(),
  };
}

export function getInitialFSRSState(): FSRSState {
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 1);
  return {
    stability: W[2], // Good initial stability
    difficulty: initialDifficulty(3), // Good initial difficulty
    interval: 0,
    dueDate,
    repetitions: 0,
    ease: 2.5,
    step: 0,
    lastReviewed: null,
    nextReview: dueDate.toISOString(),
  };
}

export function isDue(state: FSRSState, now: Date = new Date()): boolean {
  return now >= state.dueDate;
}

/** Preview next intervals for each rating without mutating state. */
export function getIntervalPreviews(state: FSRSState): Record<FSRRating, string> {
  const now = new Date();
  return {
    again: formatInterval(calculateFSRS('again', state, now).interval),
    hard: formatInterval(calculateFSRS('hard', state, now).interval),
    good: formatInterval(calculateFSRS('good', state, now).interval),
    easy: formatInterval(calculateFSRS('easy', state, now).interval),
  };
}

function formatInterval(days: number): string {
  if (days < 1) return '< 1d';
  if (days === 1) return '1d';
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}yr`;
}

export function getEaseDescription(rating: FSRRating): string {
  switch (rating) {
    case 'again': return 'Again (< 1m)';
    case 'hard':  return 'Hard (shorter)';
    case 'good':  return 'Good';
    case 'easy':  return 'Easy (longer)';
  }
}

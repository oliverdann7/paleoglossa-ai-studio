import type { KnowledgeMap } from './vocabularyService.js';
import { WordState } from '../constants/wordStates.js';

export interface ForecastDay {
  date: string;    // YYYY-MM-DD local
  label: string;   // 'Today', 'Tomorrow', 'Mon', …
  count: number;
  isToday: boolean;
  isPast: boolean;
}

/** Word states that remain in the active SRS queue. */
const ACTIVE_STATES = new Set<string>([
  WordState.SEEN,
  WordState.LEARNING,
  WordState.FAMILIAR,
]);

/**
 * Buckets SRS-active words by their nextReview date into a `days`-day window
 * starting from today (local timezone). Cards due before today appear in the
 * "Today" bucket (overdue). Cards due after the window are ignored.
 *
 * Pure function — no side effects, testable without mocks.
 */
export function computeReviewForecast(
  knowledge: KnowledgeMap,
  days = 7,
  nowOverride?: Date
): ForecastDay[] {
  const now = nowOverride ?? new Date();
  const todayStr = toLocalDateStr(now);

  // Build label map for the window
  const window: ForecastDay[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = toLocalDateStr(d);
    window.push({
      date: dateStr,
      label: dayLabel(d, i),
      count: 0,
      isToday: i === 0,
      isPast: false,
    });
  }

  const windowEnd = window[window.length - 1].date;

  for (const info of Object.values(knowledge)) {
    if (!ACTIVE_STATES.has(info.state)) continue;
    const nextReview = info.srs?.nextReview;
    if (!nextReview) continue;

    // nextReview may be an ISO string or a Firebase Timestamp-like object
    const reviewDate =
      typeof nextReview === 'string'
        ? new Date(nextReview)
        : (nextReview as { toDate(): Date }).toDate();
    const reviewDateStr = toLocalDateStr(reviewDate);

    // Overdue → treat as today
    const effectiveDate = reviewDateStr < todayStr ? todayStr : reviewDateStr;
    if (effectiveDate > windowEnd) continue;

    const idx = window.findIndex((d) => d.date === effectiveDate);
    if (idx !== -1) window[idx].count++;
  }

  return window;
}

/** Totals cards due today (including overdue). */
export function countDueToday(knowledge: KnowledgeMap, nowOverride?: Date): number {
  const forecast = computeReviewForecast(knowledge, 1, nowOverride);
  return forecast[0]?.count ?? 0;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayLabel(d: Date, offsetFromToday: number): string {
  if (offsetFromToday === 0) return 'Today';
  if (offsetFromToday === 1) return 'Tomorrow';
  return SHORT_DAYS[d.getDay()];
}

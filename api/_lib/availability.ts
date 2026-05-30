/**
 * Pure slot-resolver helpers for the tutor marketplace.
 *
 * Inputs are UTC. The caller (HTTP route) is responsible for translating
 * tutor-local-time inputs from the client into UTC before storage, and for
 * formatting the resulting UTC ISO strings back to the client.
 */

export interface SlotRange {
  /** Minutes from 00:00 UTC. */
  startMin: number;
  /** Exclusive end, minutes from 00:00 UTC. */
  endMin: number;
}

export interface RecurringWeek {
  /** Index 0..6 (Sunday..Saturday) → list of UTC minute ranges. */
  byWeekday: Record<number, SlotRange[]>;
}

export interface AvailabilityException {
  /** ISO date YYYY-MM-DD (UTC calendar). */
  date: string;
  blocks: SlotRange[];
  extraSlots: SlotRange[];
}

export interface BusyInterval {
  /** UTC ms epoch. */
  startMs: number;
  /** UTC ms epoch (exclusive). */
  endMs: number;
}

const MS_PER_MIN = 60_000;
const MS_PER_DAY = 24 * 60 * MS_PER_MIN;

function utcDateKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function utcMidnight(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Subtract `removes` from `bases`. Both are minute ranges, sorted. */
function subtractRanges(bases: SlotRange[], removes: SlotRange[]): SlotRange[] {
  let result: SlotRange[] = bases.map((r) => ({ ...r }));
  for (const cut of removes) {
    const next: SlotRange[] = [];
    for (const r of result) {
      if (cut.endMin <= r.startMin || cut.startMin >= r.endMin) {
        next.push(r);
        continue;
      }
      if (cut.startMin > r.startMin) next.push({ startMin: r.startMin, endMin: cut.startMin });
      if (cut.endMin < r.endMin) next.push({ startMin: cut.endMin, endMin: r.endMin });
    }
    result = next;
  }
  return result;
}

function mergeRanges(ranges: SlotRange[]): SlotRange[] {
  const sorted = [...ranges].sort((a, b) => a.startMin - b.startMin);
  const out: SlotRange[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r.startMin <= last.endMin) {
      last.endMin = Math.max(last.endMin, r.endMin);
    } else {
      out.push({ ...r });
    }
  }
  return out;
}

/**
 * Resolve concrete free slots between `fromMs` and `toMs` (UTC) for a tutor
 * with given recurring availability, date-keyed exceptions, and already-booked
 * busy intervals. Slot length is `durationMin`; slots are anchored on
 * 15-minute boundaries inside each free window.
 */
export function resolveAvailableSlots(opts: {
  fromMs: number;
  toMs: number;
  durationMin: number;
  recurring: RecurringWeek;
  exceptionsByDate: Record<string, AvailabilityException>;
  busy: BusyInterval[];
  stepMin?: number;
}): { startMs: number; endMs: number }[] {
  const { fromMs, toMs, durationMin, recurring, exceptionsByDate, busy } = opts;
  const stepMin = opts.stepMin ?? 15;
  if (toMs <= fromMs || durationMin <= 0) return [];

  // 1. Expand recurring + exceptions into per-day minute ranges.
  const days: { dayStartMs: number; ranges: SlotRange[] }[] = [];
  for (
    let dayStart = utcMidnight(fromMs);
    dayStart < toMs;
    dayStart += MS_PER_DAY
  ) {
    const weekday = new Date(dayStart).getUTCDay();
    const base = mergeRanges(recurring.byWeekday[weekday] || []);
    const exc = exceptionsByDate[utcDateKey(dayStart)];
    let ranges = base;
    if (exc) {
      ranges = mergeRanges([...subtractRanges(ranges, exc.blocks), ...exc.extraSlots]);
    }
    days.push({ dayStartMs: dayStart, ranges });
  }

  // 2. Convert per-day ranges into absolute UTC ms windows.
  const windows: { startMs: number; endMs: number }[] = [];
  for (const { dayStartMs, ranges } of days) {
    for (const r of ranges) {
      windows.push({
        startMs: dayStartMs + r.startMin * MS_PER_MIN,
        endMs: dayStartMs + r.endMin * MS_PER_MIN,
      });
    }
  }

  // 3. Subtract busy intervals.
  const sortedBusy = [...busy].sort((a, b) => a.startMs - b.startMs);
  const freeWindows: { startMs: number; endMs: number }[] = [];
  for (const w of windows) {
    let cursor = w.startMs;
    for (const b of sortedBusy) {
      if (b.endMs <= cursor || b.startMs >= w.endMs) continue;
      if (b.startMs > cursor) freeWindows.push({ startMs: cursor, endMs: b.startMs });
      cursor = Math.max(cursor, b.endMs);
      if (cursor >= w.endMs) break;
    }
    if (cursor < w.endMs) freeWindows.push({ startMs: cursor, endMs: w.endMs });
  }

  // 4. Slice into fixed-duration slots on the step grid, clamped to [fromMs, toMs].
  const slots: { startMs: number; endMs: number }[] = [];
  const stepMs = stepMin * MS_PER_MIN;
  const durMs = durationMin * MS_PER_MIN;
  for (const w of freeWindows) {
    const winStart = Math.max(w.startMs, fromMs);
    const winEnd = Math.min(w.endMs, toMs);
    const firstStart = Math.ceil(winStart / stepMs) * stepMs;
    for (let s = firstStart; s + durMs <= winEnd; s += stepMs) {
      slots.push({ startMs: s, endMs: s + durMs });
    }
  }
  return slots;
}

/** Calculates platform fee in cents using basis-points. */
export function calculatePlatformFeeCents(priceCents: number, feeBps: number): number {
  if (priceCents <= 0 || feeBps <= 0) return 0;
  return Math.floor((priceCents * feeBps) / 10_000);
}

/** Price for a lesson of `durationMin` at `hourlyRateCents` (rounded to nearest cent). */
export function calculateLessonPriceCents(hourlyRateCents: number, durationMin: number): number {
  return Math.round((hourlyRateCents * durationMin) / 60);
}

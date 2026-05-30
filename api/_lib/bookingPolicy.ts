/**
 * Pure helpers for the marketplace booking state machine + refund policy.
 * Unit-tested; do not import server-only modules from here.
 */

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled_by_learner'
  | 'cancelled_by_tutor'
  | 'no_show'
  | 'refunded'
  | 'disputed';

const ALLOWED: Record<BookingStatus, BookingStatus[]> = {
  pending_payment: ['confirmed', 'cancelled_by_learner', 'refunded'],
  confirmed: ['completed', 'cancelled_by_learner', 'cancelled_by_tutor', 'no_show', 'disputed'],
  completed: ['disputed', 'refunded'],
  cancelled_by_learner: ['refunded'],
  cancelled_by_tutor: ['refunded'],
  no_show: ['refunded'],
  refunded: [],
  disputed: ['refunded', 'completed'],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return ALLOWED[from].includes(to);
}

/**
 * Refund decision for a learner-initiated cancellation.
 * Window is in hours; if cancellation is ≥ window before start → full refund.
 */
export function learnerCancelRefund(opts: {
  startMs: number;
  nowMs: number;
  priceCents: number;
  windowHours: number;
}): { refundCents: number; reason: 'within_window' | 'outside_window' } {
  const hoursToStart = (opts.startMs - opts.nowMs) / (60 * 60 * 1000);
  if (hoursToStart >= opts.windowHours) {
    return { refundCents: opts.priceCents, reason: 'outside_window' };
  }
  return { refundCents: 0, reason: 'within_window' };
}

/** Tutor cancellations always full-refund. */
export function tutorCancelRefund(priceCents: number): { refundCents: number } {
  return { refundCents: priceCents };
}

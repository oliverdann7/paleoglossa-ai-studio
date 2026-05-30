/**
 * Tutor marketplace constants.
 * See docs / plan: marketplace is a separate billing surface from subscription.
 */

export const MARKETPLACE_PLATFORM_FEE_BPS = 1500; // 15.00%

export const MARKETPLACE_MIN_HOURLY_CENTS = 500; // $5/hr
export const MARKETPLACE_MAX_HOURLY_CENTS = 30000; // $300/hr

export const MARKETPLACE_LESSON_DURATIONS_MIN = [30, 60, 90] as const;
export type LessonDurationMin = (typeof MARKETPLACE_LESSON_DURATIONS_MIN)[number];

/** Hours before lesson start within which the learner forfeits the refund. */
export const MARKETPLACE_LEARNER_REFUND_WINDOW_HOURS = 24;

/** Slot hold (minutes) while learner completes payment. */
export const MARKETPLACE_SLOT_HOLD_MINUTES = 15;

/** Hours after lesson end before tutor transfer is released. */
export const MARKETPLACE_PAYOUT_HOLD_HOURS = 24;

export type UserRole = 'learner' | 'tutor' | 'admin';

export type StripeConnectStatus = 'none' | 'pending' | 'verified' | 'restricted';

export type TutorVerificationStatus = 'pending' | 'approved' | 'rejected';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled_by_learner'
  | 'cancelled_by_tutor'
  | 'no_show'
  | 'refunded'
  | 'disputed';

export type ProficiencyLevel = 'native' | 'fluent' | 'advanced';

export type CredentialType = 'degree' | 'certification' | 'publication' | 'experience';

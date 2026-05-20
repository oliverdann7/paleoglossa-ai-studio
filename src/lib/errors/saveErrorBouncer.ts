import { classifyFirestoreError, FirestoreErrorCategory } from './firestoreErrors.js';

export type ErrorCategory =
  | 'vocabulary'
  | 'import'
  | 'stats'
  | 'settings'
  | 'reading'
  | 'profile'
  | 'review';

interface BounceEntry {
  lastReportedAt: number;
  message: string;
}

const THROTTLE_MS: Record<ErrorCategory, number> = {
  vocabulary: 8000,
  import: 30000,
  stats: 15000,
  settings: 30000,
  reading: 15000,
  profile: 30000,
  review: 15000,
};

const recentErrors = new Map<ErrorCategory, BounceEntry>();

export interface BounceResult {
  suppressed: boolean;
  info: FirestoreErrorCategory;
}

export function shouldSuppressError(category: ErrorCategory): boolean {
  const entry = recentErrors.get(category);
  if (!entry) return false;
  const elapsed = Date.now() - entry.lastReportedAt;
  return elapsed < THROTTLE_MS[category];
}

export function getLastErrorMessage(category: ErrorCategory): string | null {
  const entry = recentErrors.get(category);
  return entry?.message ?? null;
}

export function reportBouncedError(category: ErrorCategory, error: unknown): BounceResult {
  const info = classifyFirestoreError(error);

  if (shouldSuppressError(category)) {
    const entry = recentErrors.get(category)!;
    return {
      suppressed: true,
      info: {
        ...info,
        userMessage: entry.message || 'Cloud sync failed. Your recent changes may not be saved.',
      },
    };
  }

  recentErrors.set(category, {
    lastReportedAt: Date.now(),
    message: info.userMessage,
  });

  return { suppressed: false, info };
}

export function clearRecentErrors(category?: ErrorCategory): void {
  if (category) {
    recentErrors.delete(category);
  } else {
    recentErrors.clear();
  }
}

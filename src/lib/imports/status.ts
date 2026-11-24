/**
 * What state a user import is really in, and what can be done about it.
 *
 * The stored record has two fields that overlap (`status`, `analysisStatus`)
 * and one failure it cannot record itself: an analysis interrupted by closing
 * the tab stays "processing" for ever. This reads all of it into one phase.
 *
 * Pure module.
 */
/**
 * True for the ID of a user import. New imports are `imp_<timestamp>`; older
 * records and forks used `imp-` and `import-`.
 */
export function isImportId(textId: string | null | undefined): boolean {
  return !!textId && /^(imp[_-]|import-)/.test(textId);
}

export type ImportPhase =
  /** Linguistic analysis succeeded. */
  | 'analyzed'
  /** Saved and readable, but only split into words: no lemmas, glosses or morphology. */
  | 'unanalyzed'
  /** Analysis is running now. */
  | 'analyzing'
  /** Marked as running, but nothing has been heard from it for too long. */
  | 'stalled'
  /** Analysis failed and left nothing to read. */
  | 'failed';

export interface ImportStatusView {
  phase: ImportPhase;
  /** Analysis can be run (again) on the saved text. */
  canRetry: boolean;
  /** There are sentences to read. */
  canOpen: boolean;
  /** The most recent recorded error, if any. */
  lastError?: string;
}

/** An analysis takes seconds to a few minutes; beyond this it is not coming back. */
export const STALLED_AFTER_MS = 5 * 60_000;

interface ImportLike {
  status?: string;
  analysisStatus?: string;
  sentences?: unknown[];
  errorLog?: string[];
  updatedAt?: unknown;
  createdAt?: unknown;
}

/** Milliseconds from an ISO string, a Firestore Timestamp or its plain form. */
function toMillis(value: unknown): number | null {
  if (typeof value === 'string' || typeof value === 'number') {
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? null : ms;
  }
  if (value && typeof value === 'object') {
    const v = value as { toMillis?: () => number; seconds?: number };
    if (typeof v.toMillis === 'function') return v.toMillis();
    if (typeof v.seconds === 'number') return v.seconds * 1000;
  }
  return null;
}

export function describeImport(item: ImportLike, now: number = Date.now()): ImportStatusView {
  const canOpen = (item.sentences?.length ?? 0) > 0;
  const lastError = item.errorLog?.length ? item.errorLog[item.errorLog.length - 1] : undefined;

  if (item.status === 'processing' || item.status === 'pending') {
    const since = toMillis(item.updatedAt) ?? toMillis(item.createdAt);
    const stalled = since === null || now - since > STALLED_AFTER_MS;
    return stalled
      ? { phase: 'stalled', canRetry: true, canOpen, lastError }
      : { phase: 'analyzing', canRetry: false, canOpen: false, lastError };
  }
  if (item.status === 'failed' || !canOpen) {
    return { phase: 'failed', canRetry: true, canOpen, lastError };
  }
  if (item.status === 'partial' || item.analysisStatus !== 'analyzed') {
    return { phase: 'unanalyzed', canRetry: true, canOpen, lastError };
  }
  return { phase: 'analyzed', canRetry: false, canOpen, lastError };
}

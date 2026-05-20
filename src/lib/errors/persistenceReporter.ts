import { classifyFirestoreError, FirestoreErrorCategory } from './firestoreErrors.js';
import { reportBouncedError, ErrorCategory, BounceResult } from './saveErrorBouncer.js';
import { markWriteFailure } from '../sync/syncStatus.js';
import { auth } from '../firebase.js';

export interface PersistenceErrorContext {
  operation: string;
  path?: string;
  userId?: string | null;
  dataPreservedLocally: boolean;
  category: ErrorCategory;
}

export interface PersistenceErrorInfo {
  category: ErrorCategory;
  operation: string;
  path?: string;
  userId?: string | null;
  dataPreservedLocally: boolean;
  classification: FirestoreErrorCategory;
  suppressed: boolean;
}

type ErrorListener = (info: PersistenceErrorInfo) => void;
const listeners = new Set<ErrorListener>();

export function onPersistenceError(listener: ErrorListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function reportPersistenceError(
  error: unknown,
  context: PersistenceErrorContext
): PersistenceErrorInfo {
  const classified = classifyFirestoreError(error);
  const bounceResult: BounceResult = reportBouncedError(context.category, error);
  const currentUser = auth.currentUser;
  const userId = context.userId ?? currentUser?.uid ?? null;
  const email = currentUser?.email ?? null;

  const info: PersistenceErrorInfo = {
    category: context.category,
    operation: context.operation,
    path: context.path,
    userId,
    dataPreservedLocally: context.dataPreservedLocally,
    classification: bounceResult.info,
    suppressed: bounceResult.suppressed,
  };

  console.error(
    `[Persistence] ${context.operation} failed` +
      (bounceResult.suppressed ? ' (suppressed toast)' : ''),
    {
      error: classified.technical,
      code: classified.code,
      userId,
      email,
      path: context.path,
      dataPreservedLocally: context.dataPreservedLocally,
    }
  );

  if (!bounceResult.suppressed) {
    markWriteFailure(classified.technical);
  }

  listeners.forEach((l) => l(info));

  return info;
}

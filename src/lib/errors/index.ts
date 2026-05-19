export { classifyFirestoreError } from './firestoreErrors.js';
export type { FirestoreErrorCategory } from './firestoreErrors.js';
export { reportPersistenceError, onPersistenceError } from './persistenceReporter.js';
export type { PersistenceErrorContext, PersistenceErrorInfo } from './persistenceReporter.js';
export { shouldSuppressError, reportBouncedError, clearRecentErrors } from './saveErrorBouncer.js';
export type { ErrorCategory, BounceResult } from './saveErrorBouncer.js';

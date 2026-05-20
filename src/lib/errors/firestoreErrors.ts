export interface FirestoreErrorCategory {
  code: string;
  userMessage: string;
  retryable: boolean;
  technical: string;
}

const FIREBASE_ERROR_CODES: Record<string, Omit<FirestoreErrorCategory, 'technical'>> = {
  'permission-denied': {
    code: 'PERMISSION_DENIED',
    userMessage: 'Permission denied. Please sign out and sign in again.',
    retryable: false,
  },
  unauthenticated: {
    code: 'UNAUTHENTICATED',
    userMessage: 'Authentication failed. Please sign out and sign in again.',
    retryable: true,
  },
  unavailable: {
    code: 'UNAVAILABLE',
    userMessage: 'You appear offline. Changes will remain on this device until sync is restored.',
    retryable: true,
  },
  'not-found': {
    code: 'NOT_FOUND',
    userMessage: 'Data not found. It may have been deleted.',
    retryable: false,
  },
  'resource-exhausted': {
    code: 'RESOURCE_EXHAUSTED',
    userMessage: 'Quota or rate limit reached. Try again later.',
    retryable: true,
  },
  'invalid-argument': {
    code: 'INVALID_ARGUMENT',
    userMessage: 'Could not save to cloud.',
    retryable: true,
  },
  'failed-precondition': {
    code: 'FAILED_PRECONDITION',
    userMessage: 'Could not save to cloud.',
    retryable: true,
  },
  aborted: {
    code: 'ABORTED',
    userMessage: 'Operation was aborted. Try again.',
    retryable: true,
  },
  'out-of-range': {
    code: 'OUT_OF_RANGE',
    userMessage: 'Could not save to cloud.',
    retryable: false,
  },
  'data-loss': {
    code: 'DATA_LOSS',
    userMessage: 'Data may have been lost. Contact support.',
    retryable: false,
  },
  internal: {
    code: 'INTERNAL',
    userMessage: 'Firebase is misconfigured. Contact support.',
    retryable: true,
  },
};

const ERROR_MSG_PATTERNS: { pattern: RegExp; code: string }[] = [
  { pattern: /permission.denied/i, code: 'permission-denied' },
  { pattern: /unauthenticated/i, code: 'unauthenticated' },
  { pattern: /unavailable|offline|network/i, code: 'unavailable' },
  { pattern: /not.found/i, code: 'not-found' },
  { pattern: /resource.exhausted|quota|rate.limit|too.many/i, code: 'resource-exhausted' },
  { pattern: /invalid.argument/i, code: 'invalid-argument' },
  { pattern: /failed.precondition/i, code: 'failed-precondition' },
  { pattern: /aborted/i, code: 'aborted' },
  { pattern: /out.of.range/i, code: 'out-of-range' },
  { pattern: /data.loss/i, code: 'data-loss' },
  { pattern: /internal/i, code: 'internal' },
];

function detectFirebaseCode(error: unknown): string {
  const err = error as Record<string, unknown>;
  if (typeof err.code === 'string' && FIREBASE_ERROR_CODES[err.code]) {
    return err.code;
  }
  const msg = error instanceof Error ? error.message : String(error);
  for (const { pattern, code } of ERROR_MSG_PATTERNS) {
    if (pattern.test(msg)) return code;
  }
  return 'unknown';
}

export function classifyFirestoreError(error: unknown): FirestoreErrorCategory {
  const fbCode = detectFirebaseCode(error);
  const classification = FIREBASE_ERROR_CODES[fbCode] ?? {
    code: 'UNKNOWN',
    userMessage: 'Could not save to cloud.',
    retryable: true,
  };
  const technical = error instanceof Error ? error.message : String(error);
  return { ...classification, technical };
}

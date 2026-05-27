import * as Sentry from '@sentry/node';

let initialized = false;

export function initServerSentry() {
  if (initialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
  initialized = true;
}

export function captureServerException(err: unknown) {
  try {
    Sentry.captureException(err);
  } catch {
    /* non-blocking */
  }
}

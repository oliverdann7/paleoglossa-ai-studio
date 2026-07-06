import * as Sentry from '@sentry/node';

let initialized = false;

export function initServerSentry() {
  if (initialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  // Sentry.init throws on a malformed DSN, and this runs at module init —
  // monitoring must never be able to take down the whole API function.
  try {
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
    });
    initialized = true;
  } catch (err) {
    console.error('[sentry] init failed — continuing without error monitoring:', err);
  }
}

export function captureServerException(err: unknown) {
  try {
    Sentry.captureException(err);
  } catch {
    /* non-blocking */
  }
}

import * as Sentry from '@sentry/react';
import { privacyService } from './services/privacyService.js';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: privacyService.isErrorReportingEnabled() ? 0.1 : 0,
    integrations: [Sentry.browserTracingIntegration()],
  });
}

export function setErrorReportingEnabled(enabled: boolean) {
  privacyService.setErrorReportingEnabled(enabled);
  // Sentry requires reload to truly disable/enable integrations.
  // For now, simple client-side config update or just reload.
  // Given the complexity of re-initializing Sentry, we'll reload.
  window.location.reload();
}

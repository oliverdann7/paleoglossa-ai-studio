
import { isCapacitor } from '../platform.js';

const ANALYTICS_STORAGE_KEY = 'paleoglossa_analytics_enabled';
const SENTRY_STORAGE_KEY = 'paleoglossa_sentry_enabled';

export const privacyService = {
  isAnalyticsEnabled: () => {
    if (import.meta.env.DEV) return false;
    const val = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    // Default: Web = true, Native = false
    if (val !== null) return val === 'true';
    return !isCapacitor();
  },
  setAnalyticsEnabled: (enabled: boolean) => {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, enabled.toString());
  },
  isErrorReportingEnabled: () => {
    if (import.meta.env.DEV) return false;
    const val = localStorage.getItem(SENTRY_STORAGE_KEY);
    // Default: Web = true, Native = false
    if (val !== null) return val === 'true';
    return !isCapacitor();
  },
  setErrorReportingEnabled: (enabled: boolean) => {
    localStorage.setItem(SENTRY_STORAGE_KEY, enabled.toString());
  },
};

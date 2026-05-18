import posthog from 'posthog-js';
import { privacyService } from './services/privacyService.js';

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_API_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';
  if (!key) return;

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage',
  });

  if (!privacyService.isAnalyticsEnabled()) {
    posthog.opt_out_capturing();
  }
}

export function optInAnalytics() {
  posthog.opt_in_capturing();
  privacyService.setAnalyticsEnabled(true);
}

export function optOutAnalytics() {
  posthog.opt_out_capturing();
  posthog.reset();
  privacyService.setAnalyticsEnabled(false);
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!privacyService.isAnalyticsEnabled()) return;
  try {
    posthog.capture(event, properties);
  } catch {
    /* analytics non-blocking */
  }
}

export function identifyAnalytics(userId: string, traits?: Record<string, unknown>) {
  if (!privacyService.isAnalyticsEnabled()) return;
  try {
    posthog.identify(userId, traits);
  } catch {
    /* analytics non-blocking */
  }
}

export function resetAnalytics() {
  try {
    posthog.reset();
  } catch {
    /* analytics non-blocking */
  }
}

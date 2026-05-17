import posthog from "posthog-js";

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_API_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://eu.i.posthog.com";
  if (!key) return;

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage",
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing();
    },
  });
}

export function track(event: string, properties?: Record<string, unknown>) {
  try {
    posthog.capture(event, properties);
  } catch {
    /* analytics non-blocking */
  }
}

export function identifyAnalytics(userId: string, traits?: Record<string, unknown>) {
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

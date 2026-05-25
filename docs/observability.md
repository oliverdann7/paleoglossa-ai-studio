# Production Observability

## Overview

Paleoglossa uses two observability tools:

- **PostHog** (self-hosted or EU cloud) — product analytics: user behavior events, funnels, page views
- **Sentry** (client-side) — error monitoring and crash reporting

Both are **fully optional**. The app works when env vars are absent. In dev mode (`MODE=development`) analytics and error reporting are automatically disabled.

---

## Event Tracking Architecture

All event tracking goes through the centralized `src/lib/analytics.ts` module. **No direct PostHog calls** are scattered in UI code.

### Core module

| Export | Purpose |
|--------|---------|
| `ANALYTICS_EVENTS` | String constants for all event names |
| `trackEvent(event, props?)` | Single safe entry point for PostHog events |
| `sanitizeEventProperties(props)` | Strips unsafe fields from event payloads |
| `initAnalytics()` | Initializes PostHog — no-op if key missing |
| `identifyAnalytics(userId, traits?)` | Identifies user — no-op if analytics disabled |
| `resetAnalytics()` | Resets PostHog identity |
| `optInAnalytics()` / `optOutAnalytics()` | Toggle analytics consent |

### Usage pattern

```ts
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';

trackEvent(ANALYTICS_EVENTS.READER_OPENED, {
  languageId: 'grc',
  textId: 'plato-apology',
  wordCount: 420,
  knownPercent: 23,
});
```

---

## Tracked Events

### Core learning loop events

| Event | Trigger | Safe Properties |
|-------|---------|-----------------|
| `reader_opened` | Reader page loads with text | `languageId`, `textId`, `sourceKind`, `analysisStatus`, `wordCount`, `knownPercent` |
| `word_clicked` | User clicks a word token | `languageId`, `lemmaLength`, `hasGloss`, `hasMorphology`, `currentState`, `textId` |
| `word_gloss_saved` | User edits their gloss input | `languageId`, `lemmaLength`, `glossLength`, `textId` |
| `word_state_changed` | User changes word state (via buttons, context menu, or Add-to-Review) | `languageId`, `fromState`, `toState`, `lemmaLength`, `textId` |
| `review_started` | User starts a review session | `languageId`, `cardCount`, `textFilterActive` |
| `review_completed` | User completes all cards in session | `languageId`, `cardsReviewed`, `correctCount`, `accuracyPercent`, `durationMs` |
| `import_started` | User clicks "Analyze & Import" | `languageId`, `sourceType` |
| `import_completed` | AI analysis or fallback finishes | `languageId`, `sourceType`, `totalWords`, `uniqueWords`, `analysisStatus`, `durationMs` |
| `ai_gloss_cache_hit` | Server cache returns a cached AI gloss | `languageId`, `cacheType` |
| `ai_gloss_cache_miss` | Server cache has no entry | `languageId`, `cacheType` |
| `ai_gloss_generated` | AI successfully/fails to generate a gloss | `languageId`, `generationType`, `success` |

---

## Privacy Rules

### Never track these fields

The `sanitizeEventProperties` function strips any property whose key matches:

- `fullText`, `rawText`, `rawContent`
- `sentenceText`, `content`
- `notes`, `userNotes`, `researchNote`, `privateNotes`
- `aiPrompt`, `aiResponse`, `explanation`, `translation`
- `gloss`, `userGloss`
- `manuscriptContent`
- `body`, `password`, `token`, `secret`, `apiKey`, `authorization`
- Any key starting with `raw` or `user_`
- Any string value longer than 500 characters

### Summary

- **Do** track: `languageId`, `textId` (if public), `sourceKind`, `wordCount`, `analysisStatus`, `counts`, `duration`, state categories, cache hit/miss, route/page
- **Do not** track: Ancient text content, imported private text, user notes, raw AI prompts/responses, manuscript content, personally sensitive free-text

---

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `VITE_POSTHOG_API_KEY` | No | — | PostHog project API key |
| `VITE_POSTHOG_HOST` | No | `https://eu.i.posthog.com` | PostHog instance URL |
| `VITE_SENTRY_DSN` | No | — | Sentry DSN for client error reporting |

When `VITE_POSTHOG_API_KEY` is absent, `initAnalytics()` silently returns without initializing PostHog. All `trackEvent` calls check `privacyService.isAnalyticsEnabled()` and are no-ops when disabled.

---

## Local / Dev Behavior

- In `import.meta.env.DEV === true`, `privacyService.isAnalyticsEnabled()` returns `false`
- `initSentry()` returns early (no-op) when `VITE_SENTRY_DSN` is absent
- `trackEvent` is always a no-op when analytics is disabled, regardless of event name
- The `sanitizeEventProperties` function runs on all event properties before sending

---

## Server Observability

### Files

| File | Purpose |
|------|---------|
| `api/_lib/observability.ts` | Correlation ID middleware, safe error shape, route error wrapper |

### Correlation ID

Every HTTP request gets a unique `X-Correlation-Id` header. If the client sends one, it's reused. Otherwise, a server-generated ID is assigned. Available on `req.correlationId`.

### Safe Error Shape

```ts
interface SafeErrorShape {
  message: string;
  code: string;
  correlationId?: string;
  status?: number;
  details?: Record<string, unknown>;
}
```

The `toSafeError()` function extracts safe fields from thrown values — never raw stack traces, never sensitive body content.

### Route Error Wrapper

`wrapRouteError(handler)` catches async errors and returns a structured JSON response with `correlationId`, `error`, and `code`. Logs the error server-side but never exposes stack traces to the client.

---

## CI / Build

- No production analytics env vars are required for `npm run build` or `npm run dev`
- CI workflows (`ci.yml`, `deploy.yml`) do not set PostHog or Sentry vars — the app skips them automatically
- `npm run config:check` treats `VITE_POSTHOG_API_KEY` and `VITE_SENTRY_DSN` as warnings, not critical failures

---

## Testing

- `src/lib/__tests__/analytics.test.ts` covers:
  - `sanitizeEventProperties` strips known unsafe fields
  - `sanitizeEventProperties` strips long string values
  - `sanitizeEventProperties` preserves safe fields
  - `trackEvent` is a no-op when PostHog is not configured (PostHog not initialized)

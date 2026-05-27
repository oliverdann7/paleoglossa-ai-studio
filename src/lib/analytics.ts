import posthog from 'posthog-js';
import { privacyService } from './services/privacyService.js';

// ─── Event Names ───────────────────────────────────────────────────────────────

export const ANALYTICS_EVENTS = {
  // Funnel events
  SIGNUP_COMPLETED: 'signup_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  FIRST_TEXT_OPENED: 'first_text_opened',
  FIRST_WORD_SAVED: 'first_word_saved',
  // Reader events
  READER_OPENED: 'reader_opened',
  WORD_CLICKED: 'word_clicked',
  WORD_GLOSS_SAVED: 'word_gloss_saved',
  WORD_STATE_CHANGED: 'word_state_changed',
  REVIEW_STARTED: 'review_started',
  REVIEW_COMPLETED: 'review_completed',
  IMPORT_STARTED: 'import_started',
  IMPORT_COMPLETED: 'import_completed',
  AI_GLOSS_CACHE_HIT: 'ai_gloss_cache_hit',
  AI_GLOSS_CACHE_MISS: 'ai_gloss_cache_miss',
  AI_GLOSS_GENERATED: 'ai_gloss_generated',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

// ─── Safe Event Properties ────────────────────────────────────────────────────

export interface ReaderOpenedProps {
  languageId: string;
  textId?: string;
  sourceKind?: 'import' | 'sample' | 'partial' | 'complete';
  analysisStatus?: string;
  wordCount?: number;
  knownPercent?: number | null;
}

export interface WordClickedProps {
  languageId: string;
  lemmaLength?: number;
  hasGloss?: boolean;
  hasMorphology?: boolean;
  currentState?: string;
  textId?: string;
}

export interface WordGlossSavedProps {
  languageId: string;
  lemmaLength?: number;
  glossLength?: number;
  textId?: string;
}

export interface WordStateChangedProps {
  languageId: string;
  fromState?: string;
  toState: string;
  lemmaLength?: number;
  textId?: string;
}

export interface ReviewStartedProps {
  languageId: string;
  cardCount: number;
  textFilterActive?: boolean;
}

export interface ReviewCompletedProps {
  languageId: string;
  cardsReviewed: number;
  correctCount: number;
  accuracyPercent: number;
  durationMs: number;
}

export interface ImportStartedProps {
  languageId: string;
  sourceType: string;
}

export interface ImportCompletedProps {
  languageId: string;
  sourceType: string;
  totalWords: number;
  uniqueWords: number;
  analysisStatus: string;
  durationMs: number;
}

export interface AiGlossCacheHitProps {
  languageId: string;
  cacheType: string;
}

export interface AiGlossCacheMissProps {
  languageId: string;
  cacheType: string;
}

export interface AiGlossGeneratedProps {
  languageId: string;
  generationType: string;
  success: boolean;
}

export type AnalyticsEventProps =
  | ReaderOpenedProps
  | WordClickedProps
  | WordGlossSavedProps
  | WordStateChangedProps
  | ReviewStartedProps
  | ReviewCompletedProps
  | ImportStartedProps
  | ImportCompletedProps
  | AiGlossCacheHitProps
  | AiGlossCacheMissProps
  | AiGlossGeneratedProps;

// ─── Unsafe field names that must never be tracked ─────────────────────────────

const UNSAFE_FIELD_NAMES = new Set([
  'fulltext',
  'rawtext',
  'rawcontent',
  'sentencetext',
  'content',
  'notes',
  'usernotes',
  'researchnote',
  'privatenotes',
  'aiprompt',
  'airesponse',
  'explanation',
  'translation',
  'gloss',
  'usergloss',
  'manuscriptcontent',
  'body',
  'password',
  'token',
  'secret',
  'apikey',
  'authorization',
]);

function isUnsafeKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (UNSAFE_FIELD_NAMES.has(lower)) return true;
  if (lower.startsWith('raw') || lower.startsWith('user_')) return true;
  return false;
}

export function sanitizeEventProperties(
  properties: Record<string, unknown>
): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (isUnsafeKey(key)) continue;
    if (typeof value === 'string' && value.length > 500) continue;
    safe[key] = value;
  }
  return safe;
}

// ─── Initialization ───────────────────────────────────────────────────────────

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_API_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';
  if (!key) return;

  const hasConsent = privacyService.isAnalyticsEnabled();
  posthog.init(key, {
    api_host: host,
    capture_pageview: hasConsent,
    capture_pageleave: hasConsent,
    persistence: 'localStorage',
    opt_out_capturing_by_default: !hasConsent,
  });
}

// ─── Safe tracked events ──────────────────────────────────────────────────────

export function trackEvent(
  event: AnalyticsEventName,
  properties?: Record<string, unknown>
) {
  if (!privacyService.isAnalyticsEnabled()) return;
  try {
    const safeProps = properties ? sanitizeEventProperties(properties) : {};
    posthog.capture(event, safeProps);
  } catch {
    /* analytics non-blocking */
  }
}

// ─── Identity ──────────────────────────────────────────────────────────────────

export function identifyAnalytics(userId: string, traits?: Record<string, unknown>) {
  if (!privacyService.isAnalyticsEnabled()) return;
  try {
    const safeTraits = traits ? sanitizeEventProperties(traits) : undefined;
    posthog.identify(userId, safeTraits);
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

// ─── Privacy opt-in/out (backward compat) ──────────────────────────────────────

export function optInAnalytics() {
  posthog.opt_in_capturing();
  privacyService.setAnalyticsEnabled(true);
}

export function optOutAnalytics() {
  posthog.opt_out_capturing();
  posthog.reset();
  privacyService.setAnalyticsEnabled(false);
}

// ─── Legacy track (backward compat) ────────────────────────────────────────────

export function track(event: string, properties?: Record<string, unknown>) {
  trackEvent(event as AnalyticsEventName, properties);
}

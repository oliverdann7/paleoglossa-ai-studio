/**
 * Consent for sending user content to the third-party AI provider.
 *
 * The AI features (word explanations, tutor, sentence analysis, OCR import,
 * pronunciation feedback) send what the user submits to Google Gemini via our
 * API. App Store guideline 5.1.2(i) requires that to be disclosed and
 * explicitly permitted before it happens, so in the native apps the first AI
 * request opens a one-time dialog (see `AiConsentDialog`) and waits for the
 * answer. On the web, AI processing is covered by the privacy policy and is
 * on unless the user turns it off in Settings.
 *
 * Every request to `/api/ai/*` must pass through `ensureAiConsent()` — use
 * `apiFetch` or `aiFetch`, never a bare `fetch(getApiUrl('/api/ai/…'))`
 * (enforced by `aiConsentDiscipline.test.ts`).
 */
import { isCapacitor } from '../platform.js';
import { getApiUrl } from './apiBaseUrl.js';

const STORAGE_KEY = 'paleoglossa_ai_consent';

export type AiConsentState = 'granted' | 'declined' | 'unset';

export class AiConsentDeclinedError extends Error {
  code = 'AI_CONSENT_DECLINED';
  constructor() {
    super('AI features are turned off. You can turn them on in Settings → Privacy.');
    this.name = 'AiConsentDeclinedError';
  }
}

function readStored(): AiConsentState {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === 'granted' || val === 'declined' ? val : 'unset';
  } catch {
    return 'unset';
  }
}

/** The user's recorded choice; `unset` until they have answered. */
export function getAiConsent(): AiConsentState {
  return readStored();
}

/** Whether AI requests may be sent right now without asking. */
export function isAiProcessingAllowed(): boolean {
  const state = readStored();
  if (state === 'unset') return !isCapacitor();
  return state === 'granted';
}

export function setAiConsent(granted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'declined');
  } catch {
    /* storage unavailable — the choice lasts for this session only */
  }
}

// ── Prompt plumbing: one pending question shared by all concurrent callers ──

let pending: Promise<boolean> | null = null;
let resolvePending: ((granted: boolean) => void) | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

/** For `useSyncExternalStore`: is the consent dialog currently requested? */
export function subscribeAiConsentPrompt(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function isAiConsentPromptOpen(): boolean {
  return pending !== null;
}

/** Called by the dialog with the user's answer. */
export function answerAiConsentPrompt(granted: boolean): void {
  setAiConsent(granted);
  const resolve = resolvePending;
  pending = null;
  resolvePending = null;
  notify();
  resolve?.(granted);
}

/**
 * Resolves when AI processing is permitted; rejects with
 * `AiConsentDeclinedError` when the user has said no. Asks at most once —
 * a declined user is not prompted again (they can opt in from Settings).
 */
export async function ensureAiConsent(): Promise<void> {
  const state = readStored();
  if (state === 'granted') return;
  if (state === 'declined') throw new AiConsentDeclinedError();
  if (!isCapacitor()) return;

  if (!pending) {
    pending = new Promise<boolean>((resolve) => {
      resolvePending = resolve;
    });
    notify();
  }
  if (!(await pending)) throw new AiConsentDeclinedError();
}

/** `fetch` for `/api/ai/*` paths: waits for consent, then resolves the URL. */
export async function aiFetch(path: string, init?: RequestInit): Promise<Response> {
  await ensureAiConsent();
  return fetch(getApiUrl(path), init);
}
